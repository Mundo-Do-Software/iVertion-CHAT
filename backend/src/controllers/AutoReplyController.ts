import * as Yup from "yup";
import { Request, Response } from "express";

import CreateAutoReplyService from "../services/AutoReplyServices/CreateAutoReplyService";
import AppError from "../errors/AppError";
import ListAutoReplyService from "../services/AutoReplyServices/ListAutoReplyService";
import UpdateAutoReplyService from "../services/AutoReplyServices/UpdateAutoReplyService";
import DeleteAutoReplyService from "../services/AutoReplyServices/DeleteAutoReplyService";

interface AutoReplyData {
  name: string;
  action: number;
  userId: number;
  isActive: boolean;
  celularTeste?: string;
  tenantId: number | string;
}

/**
 * @swagger
 * /auto-reply:
 *   post:
 *     summary: Cria uma nova resposta automática
 *     tags: [AutoReply]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - action
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da resposta automática
 *               action:
 *                 type: number
 *                 description: Código de ação da resposta automática
 *               userId:
 *                 type: number
 *                 description: ID do usuário que cria a resposta automática
 *               isActive:
 *                 type: boolean
 *                 description: Status da ativação da resposta automática
 *               celularTeste:
 *                 type: string
 *                 description: Número de celular para teste (opcional)
 *     responses:
 *       200:
 *         description: Resposta automática criada com sucesso
 *       400:
 *         description: Erro na validação dos dados de entrada
 *       403:
 *         description: Sem permissão para criar respostas automáticas
 */

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newAutoReply: AutoReplyData = { ...req.body, tenantId };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    action: Yup.number().required(),
    tenantId: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(newAutoReply);
  } catch (error) {
    throw new AppError(error.message);
  }

  const autoReply = await CreateAutoReplyService(newAutoReply);

  return res.status(200).json(autoReply);
};
/**
 * @swagger
 * /auto-reply:
 *   get:
 *     summary: Lista todas as respostas automáticas do tenant
 *     tags: [AutoReply]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de respostas automáticas obtida com sucesso
 *       403:
 *         description: Sem permissão para acessar as respostas automáticas
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const autoReply = await ListAutoReplyService({ tenantId });
  return res.status(200).json(autoReply);
};
/**
 * @swagger
 * /auto-reply/{autoReplyId}:
 *   put:
 *     summary: Atualiza uma resposta automática específica
 *     tags: [AutoReply]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: autoReplyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da resposta automática a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - action
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da resposta automática
 *               action:
 *                 type: number
 *                 description: Código de ação da resposta automática
 *               userId:
 *                 type: number
 *                 description: ID do usuário que atualiza a resposta automática
 *               isActive:
 *                 type: boolean
 *                 description: Status da ativação da resposta automática
 *     responses:
 *       200:
 *         description: Resposta automática atualizada com sucesso
 *       400:
 *         description: Erro na validação dos dados de entrada
 *       403:
 *         description: Sem permissão para atualizar a resposta automática
 *       404:
 *         description: Resposta automática não encontrada
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  const autoReplyData: AutoReplyData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    action: Yup.number().required(),
    userId: Yup.number().required()
  });

  try {
    await schema.validate(autoReplyData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { autoReplyId } = req.params;
  const autoReply = await UpdateAutoReplyService({
    autoReplyData,
    autoReplyId,
    tenantId
  });

  return res.status(200).json(autoReply);
};
/**
 * @swagger
 * /auto-reply/{autoReplyId}:
 *   delete:
 *     summary: Deleta uma resposta automática específica
 *     tags: [AutoReply]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: autoReplyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da resposta automática a ser deletada
 *     responses:
 *       200:
 *         description: Resposta automática deletada com sucesso
 *       403:
 *         description: Sem permissão para deletar a resposta automática
 *       404:
 *         description: Resposta automática não encontrada
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  const { autoReplyId } = req.params;

  await DeleteAutoReplyService({ id: autoReplyId, tenantId });
  return res.status(200).json({ message: "Auto reply deleted" });
};
