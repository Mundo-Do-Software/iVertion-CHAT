import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignService from "../services/CampaignServices/CreateCampaignService";
import ListCampaignService from "../services/CampaignServices/ListCampaignService";
import DeleteCampaignService from "../services/CampaignServices/DeleteCampaignService";
import UpdateCampaignService from "../services/CampaignServices/UpdateCampaignService";
import StartCampaignService from "../services/CampaignServices/StartCampaignService";
import CancelCampaignService from "../services/CampaignServices/CancelCampaignService";

interface CampaignData {
  name: string;
  start: string;
  end: string;
  message1: string;
  message2: string;
  message3: string;
  mediaUrl: string;
  userId: string;
  sessionId: string;
  delay: string;
  tenantId: string;
}
/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Cria uma nova campanha
 *     tags: [Campaigns]
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
 *               - start
 *               - message1
 *               - userId
 *               - sessionId
 *               - tenantId
 *             properties:
 *               name:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               message1:
 *                 type: string
 *               message2:
 *                 type: string
 *               message3:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *                 format: uri
 *               userId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               delay:
 *                 type: string
 *               tenantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campanha criada com sucesso
 *       403:
 *         description: Sem permissão para criar a campanha
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const medias = req.files as Express.Multer.File[];
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const campaign: CampaignData = {
    ...req.body,
    userId: req.user.id,
    tenantId
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    start: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string().required(),
    message3: Yup.string().required(),
    userId: Yup.string().required(),
    sessionId: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(campaign);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newCampaign = await CreateCampaignService({
    campaign,
    medias
  });

  return res.status(200).json(newCampaign);
};
/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Lista todas as campanhas
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de campanhas obtida com sucesso
 *       403:
 *         description: Sem permissão para acessar as campanhas
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const tags = await ListCampaignService({
    tenantId
  });
  return res.status(200).json(tags);
};
/**
 * @swagger
 * /campaigns/{campaignId}:
 *   put:
 *     summary: Atualiza uma campanha específica
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CampaignData'
 *     responses:
 *       200:
 *         description: Campanha atualizada com sucesso
 *       403:
 *         description: Sem permissão para atualizar a campanha
 *       404:
 *         description: Campanha não encontrada
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const medias = req.files as Express.Multer.File[];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const campaignData: CampaignData = {
    ...req.body,
    userId: req.user.id,
    tenantId
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    start: Yup.string().required(),
    message1: Yup.string().required(),
    message2: Yup.string().required(),
    message3: Yup.string().required(),
    mediaUrl: Yup.string().required(),
    userId: Yup.string().required(),
    sessionId: Yup.string().required(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate(campaignData);
  } catch (error) {
    throw new AppError(error.message);
  }

  const { campaignId } = req.params;
  const campaignObj = await UpdateCampaignService({
    campaignData,
    medias,
    campaignId,
    tenantId
  });

  return res.status(200).json(campaignObj);
};
/**
 * @swagger
 * /campaigns/{campaignId}:
 *   delete:
 *     summary: Deleta uma campanha específica
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha a ser deletada
 *     responses:
 *       200:
 *         description: Campanha deletada com sucesso
 *       403:
 *         description: Sem permissão para deletar a campanha
 *       404:
 *         description: Campanha não encontrada
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await DeleteCampaignService({ id: campaignId, tenantId });
  return res.status(200).json({ message: "Campaign deleted" });
};
/**
 * @swagger
 * /campaigns/start/{campaignId}:
 *   post:
 *     summary: Inicia uma campanha
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha a ser iniciada
 *     responses:
 *       200:
 *         description: Campanha iniciada com sucesso
 *       403:
 *         description: Sem permissão para iniciar campanhas
 *       404:
 *         description: Campanha não encontrada
 */
export const startCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await StartCampaignService({
    campaignId,
    tenantId,
    options: {
      delay: 2000
    }
  });

  return res.status(200).json({ message: "Campaign started" });
};
/**
 * @swagger
 * /campaigns/cancel/{campaignId}:
 *   post:
 *     summary: Cancela uma campanha
 *     tags: [Campaigns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha a ser cancelada
 *     responses:
 *       200:
 *         description: Campanha cancelada com sucesso
 *       403:
 *         description: Sem permissão para cancelar campanhas
 *       404:
 *         description: Campanha não encontrada
 */
export const cancelCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await CancelCampaignService({
    campaignId,
    tenantId
  });

  return res.status(200).json({ message: "Campaign canceled" });
};
