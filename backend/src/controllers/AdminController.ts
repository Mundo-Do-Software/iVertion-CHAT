import { Request, Response } from "express";
import { number } from "yup";
import { getIO } from "../libs/socket";
import AdminListChatFlowService from "../services/AdminServices/AdminListChatFlowService";
import AdminListSettingsService from "../services/AdminServices/AdminListSettingsService";
import AdminListTenantsService from "../services/AdminServices/AdminListTenantsService";
import AdminListUsersService from "../services/AdminServices/AdminListUsersService";
import AdminListChannelsService from "../services/AdminServices/AdminListChannelsService";
import AdminUpdateUserService from "../services/AdminServices/AdminUpdateUserService";
import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import AppError from "../errors/AppError";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import AdminCreateUserService from "../services/AdminServices/AdminCreateUserService";
import AdminUpdateTenantService from "../services/AdminServices/AdminUpdateTenentService";
import AdminCreateTenantService from "../services/AdminServices/AdminCreateTenantService";
import AdminDeleteTenantService from "../services/AdminServices/AdminDeleteTenantService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexQuerySettings = {
  tenantId?: string | number;
};

interface ChannelData {
  name: string;
  status?: string;
  isActive?: string;
  tokenTelegram?: string;
  instagramUser?: string;
  instagramKey?: string;
  type: "waba" | "instagram" | "telegram" | "whatsapp";
  wabaBSP?: string;
  tokenAPI?: string;
  tenantId: string | number;
}
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista todos os usuários administrativos
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários administrativos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do usuário
 *                   name:
 *                     type: string
 *                     description: Nome do usuário
 */
export const indexUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { users, count, hasMore } = await AdminListUsersService({
    searchParam,
    pageNumber
  });
  return res.status(200).json({ users, count, hasMore });
};
/**
 * @swagger
 * /admin/users/{userId}:
 *   put:
 *     summary: Atualiza um usuário administrativo
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData = req.body;
  const { userId } = req.params;

  const user = await AdminUpdateUserService({ userData, userId });

  const io = getIO();
  if (user) {
    io.emit(`${user.tenantId}:user`, {
      action: "update",
      user
    });
  }

  return res.status(200).json(user);
};

/**
 * @swagger
 * /admin/tenants:
 *   get:
 *     summary: Lista todos os inquilinos
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de inquilinos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 */
export const indexTenants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenants = await AdminListTenantsService();
  return res.status(200).json(tenants);
};
/**
 * @swagger
 * /admin/tenantsUpdate/{tenantId}:
 *   put:
 *     summary: Atualiza um inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inquilino a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantUpdate'
 *     responses:
 *       200:
 *         description: Inquilino atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Inquilino não encontrado
 */
export const updateTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenantData = req.body;
  const { tenantId } = req.params;

  const tenant = await AdminUpdateTenantService({ tenantData, tenantId });

  return res.status(200).json(tenant);
};
/**
 * @swagger
 * /admin/tenants:
 *   post:
 *     summary: Cria um novo inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantCreate'
 *     responses:
 *       201:
 *         description: Inquilino criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
export const createTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenantData = req.body;

  const tenant = await AdminCreateTenantService({ tenantData });

  return res.status(201).json(tenant);
};
/**
 * @swagger
 * /admin/tenants/{tenantId}:
 *   delete:
 *     summary: Exclui um inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inquilino a ser excluído
 *     responses:
 *       204:
 *         description: Inquilino excluído com sucesso
 *       404:
 *         description: Inquilino não encontrado
 */
export const deleteTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;

  await AdminDeleteTenantService({ tenantId });

  return res.status(204).send();
};
/**
 * @swagger
 * /admin/chatflow/{tenantId}:
 *   get:
 *     summary: Obtém o fluxo de chat para um inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inquilino
 *     responses:
 *       200:
 *         description: Fluxo de chat obtido com sucesso
 *       404:
 *         description: Inquilino não encontrado
 */
export const indexChatFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  const chatFlow = await AdminListChatFlowService({ tenantId });
  return res.status(200).json(chatFlow);
};
/**
 * @swagger
 * /admin/settings/{tenantId}:
 *   get:
 *     summary: Lista as configurações para um inquilino específico
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do inquilino para o qual as configurações são solicitadas
 *     responses:
 *       200:
 *         description: Configurações obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Identificador da configuração
 *                 key:
 *                   type: string
 *                   description: Chave da configuração
 *                 value:
 *                   type: string
 *                   description: Valor da configuração
 *                 tenantId:
 *                   type: string
 *                   description: ID do inquilino associado à configuração
 *       404:
 *         description: Inquilino não encontrado
 */
export const indexSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params as IndexQuerySettings;
  const settings = await AdminListSettingsService(tenantId);

  return res.status(200).json(settings);
};
/**
 * @swagger
 * /admin/settings/{tenantId}:
 *   put:
 *     summary: Atualiza configurações para um inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inquilino
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SettingUpdate'
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso
 *       404:
 *         description: Configurações não encontradas
 */
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  const { value, key } = req.body;

  const setting = await UpdateSettingService({
    key,
    value,
    tenantId
  });

  const io = getIO();
  io.emit(`${tenantId}:settings`, {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};
/**
 * @swagger
 * /admin/channels:
 *   get:
 *     summary: Lista todos os canais para um inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do inquilino
 *     responses:
 *       200:
 *         description: Lista de canais retornada com sucesso
 */
export const indexChannels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.query as any;
  const channels = await AdminListChannelsService({ tenantId });
  return res.status(200).json(channels);
};
/**
 * @swagger
 * /admin/channels:
 *   post:
 *     summary: Cria um novo canal
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChannelCreate'
 *     responses:
 *       200:
 *         description: Canal criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
export const storeChannel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    name,
    tenantId,
    tokenTelegram,
    instagramUser,
    instagramKey,
    type,
    wabaBSP,
    tokenAPI
  } = req.body;

  const data: ChannelData = {
    name,
    status: "DISCONNECTED",
    tenantId,
    tokenTelegram,
    instagramUser,
    instagramKey,
    type,
    wabaBSP,
    tokenAPI
  };

  const channels = await CreateWhatsAppService(data);
  return res.status(200).json(channels);
};
/**
 * @swagger
 * /admin/userTenants:
 *   post:
 *     summary: Cria um novo usuário para um inquilino
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserTenantCreate'
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou e-mail já registrado
 */
export const storeUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { tenantId, email, password, name, profile } = req.body;

    const user = await AdminCreateUserService({
      email,
      password,
      name,
      profile,
      tenantId
    });

    const io = getIO();
    io.emit(`${tenantId}:user`, {
      action: "create",
      user
    });

    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError && error.message === "ERR_EMAIL_ALREADY_REGISTERED") {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
};

