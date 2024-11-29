import * as Yup from "yup";
import { Request, Response } from "express";

import CreateApiConfigService from "../services/ApiConfigServices/CreateApiConfigService";
import ListApiConfigService from "../services/ApiConfigServices/ListApiConfigService";
import AppError from "../errors/AppError";
import UpdateApiConfigService from "../services/ApiConfigServices/UpdateApiConfigService";
import DeleteApiConfigService from "../services/ApiConfigServices/DeleteApiConfigService";
import RenewApiConfigTokenService from "../services/ApiConfigServices/RenewApiConfigTokenService";

interface ApiData {
  name: string;
  sessionId: string | number;
  urlServiceStatus?: string;
  urlMessageStatus?: string;
  userId: string | number;
  tenantId: string | number;
  authToken?: string;
  isActive?: boolean;
}

interface RenewData {
  sessionId: string | number;
  userId: string | number;
  tenantId: string | number;
}

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Cria uma nova configuração de API
 *     tags: [API Config]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiData'
 *     responses:
 *       200:
 *         description: Configuração de API criada com sucesso
 *       403:
 *         description: Sem permissão para executar esta ação
 *       400:
 *         description: Erro de validação dos dados de entrada
 */

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, id } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const newApi: ApiData = { ...req.body, userId: id, tenantId };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    sessionId: Yup.number().required(),
    urlServiceStatus: Yup.string().url().nullable(),
    urlMessageStatus: Yup.string().url().nullable(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(newApi);
  } catch (error) {
    throw new AppError(error.message);
  }

  const api = await CreateApiConfigService(newApi);

  return res.status(200).json(api);
};
/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Lista todas as configurações de API para um tenant
 *     tags: [API Config]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de configurações de API obtida com sucesso
 *       403:
 *         description: Sem permissão para visualizar as configurações
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const apis = await ListApiConfigService({ tenantId });
  return res.status(200).json(apis);
};
/**
 * @swagger
 * /api/config/{apiId}:
 *   put:
 *     summary: Atualiza uma configuração de API
 *     tags: [API Config]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração de API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiData'
 *     responses:
 *       200:
 *         description: Configuração de API atualizada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       403:
 *         description: Sem permissão para executar esta ação
 *       404:
 *         description: Configuração de API não encontrada
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId, id } = req.user;
  const { apiId } = req.params;

  const apiData: ApiData = { ...req.body, userId: id, tenantId };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    sessionId: Yup.number().required(),
    urlServiceStatus: Yup.string().url().nullable(),
    urlMessageStatus: Yup.string().url().nullable(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required(),
    isActive: Yup.boolean().required()
  });

  try {
    await schema.validate(apiData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const api = await UpdateApiConfigService({
    apiData,
    apiId,
    tenantId
  });

  return res.status(200).json(api);
};
/**
 * @swagger
 * /api/config/{apiId}:
 *   delete:
 *     summary: Remove uma configuração de API
 *     tags: [API Config]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração de API a ser removida
 *     responses:
 *       200:
 *         description: Configuração de API removida com sucesso
 *       403:
 *         description: Sem permissão para executar esta ação
 *       404:
 *         description: Configuração de API não encontrada
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { tenantId } = req.user;
  const { apiId } = req.params;

  await DeleteApiConfigService({ apiId, tenantId });
  return res.status(200).json({ message: "API Config Deleted" });
};
/**
 * @swagger
 * /api/config/renew/{apiId}:
 *   post:
 *     summary: Renova o token para uma configuração de API
 *     tags: [API Config]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da configuração de API cujo token será renovado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenewData'
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       403:
 *         description: Sem permissão para executar esta ação
 *       404:
 *         description: Configuração de API não encontrada
 */
export const renewTokenApi = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { tenantId, id } = req.user;
  const { apiId } = req.params;

  const api: RenewData = { ...req.body, userId: id, tenantId };

  const schema = Yup.object().shape({
    sessionId: Yup.number().required(),
    userId: Yup.number().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(api);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newApi = await RenewApiConfigTokenService({
    apiId,
    userId: api.userId,
    sessionId: api.sessionId,
    tenantId: api.tenantId
  });

  return res.status(200).json(newApi);
};
