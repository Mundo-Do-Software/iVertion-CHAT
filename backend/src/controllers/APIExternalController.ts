import * as Yup from "yup";
import { Request, Response } from "express";

import AppError from "../errors/AppError";
import ApiConfig from "../models/ApiConfig";
import Queue from "../libs/Queue";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { getWbot } from "../libs/wbot";

interface MessageDataRequest {
  apiId: string;
  sessionId: number;
  body: string;
  number: string;
  media?: Express.Multer.File | string;
  externalKey: string;
  tenantId: number;
}
/**
 * @swagger
 * /api/message/{apiId}:
 *   post:
 *     summary: Envia uma mensagem através de uma API configurada
 *     tags: [Messaging API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração da API que será usada para enviar a mensagem
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *                 description: Conteúdo da mensagem
 *                 required: true
 *               number:
 *                 type: string
 *                 description: Número de destino
 *                 required: true
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de mídia a ser enviado (opcional)
 *               externalKey:
 *                 type: string
 *                 description: Chave externa para identificação da mensagem
 *                 required: true
 *     responses:
 *       200:
 *         description: Mensagem adicionada à fila de envio
 *       400:
 *         description: Dados de entrada inválidos
 *       403:
 *         description: Sem permissão para enviar a mensagem com o API ID fornecido
 */

export const sendMessageAPI = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;
  const media = req.file as Express.Multer.File;

  // eslint-disable-next-line eqeqeq
  // if (!apiIdParam || apiId != apiIdParam) {
  //   throw new AppError("ERR_APIID_NO_PERMISSION", 403);
  // }

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId
    }
  });

  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const newMessage: MessageDataRequest = {
    ...req.body,
    apiId,
    sessionId,
    tenantId,
    apiConfig: APIConfig,
    media
  };

  const schema = Yup.object().shape({
    apiId: Yup.string(),
    sessionId: Yup.number(),
    body: Yup.string().required(),
    number: Yup.string().required(),
    mediaUrl:
      Yup.string().url().nullable() ||
      Yup.object().shape({
        destination: Yup.string().required(),
        encoding: Yup.string().required(),
        fieldname: Yup.string().required(),
        filename: Yup.string().required(),
        mimetype: Yup.string().required(),
        originalname: Yup.string().required(),
        path: Yup.string().required(),
        size: Yup.number().required()
      }),
    externalKey: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newMessage);
  } catch (error) {
    throw new AppError(error.message);
  }

  Queue.add("SendMessageAPI", newMessage);

  return res.status(200).json({ message: "Message add queue" });
};
/**
 * @swagger
 * /api/session/{apiId}:
 *   get:
 *     summary: Inicia uma sessão de WhatsApp para uma configuração de API específica
 *     tags: [Messaging API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração da API cuja sessão será iniciada
 *     responses:
 *       200:
 *         description: Sessão iniciada com sucesso ou já conectada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status da conexão
 *                 sessionId:
 *                   type: number
 *                   description: ID da sessão ativa
 *                 tenantId:
 *                   type: number
 *                   description: ID do inquilino ao qual a sessão pertence
 *       403:
 *         description: Sem permissão para iniciar a sessão com o API ID fornecido
 *       404:
 *         description: Configuração de API não encontrada
 */

export const startSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId, sessionId } = req.APIAuth;
  const { apiId } = req.params;

  const APIConfig = await ApiConfig.findOne({
    where: {
      id: apiId,
      tenantId
    }
  });

  if (APIConfig?.sessionId !== sessionId) {
    throw new AppError("ERR_SESSION_NOT_AUTH_TOKEN", 403);
  }

  const whatsapp = await ShowWhatsAppService({
    id: APIConfig.sessionId,
    tenantId: APIConfig.tenantId,
    isInternal: true
  });
  try {
    const wbot = getWbot(APIConfig.sessionId);
    const isConnectStatus = (await wbot.getState()) === "CONNECTED";
    if (!isConnectStatus) {
      throw new Error("Necessário iniciar sessão");
    }
  } catch (error) {
    StartWhatsAppSession(whatsapp);
  }

  return res.status(200).json(whatsapp);
};
