// import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";

import CreateCampaignContactsService from "../services/CampaignContactsServices/CreateCampaignContactsService";
import ListCampaignContactsService from "../services/CampaignContactsServices/ListCampaignContactsService";
import DeleteCampaignContactsService from "../services/CampaignContactsServices/DeleteCampaignContactsService";
import DeleteAllCampaignContactsService from "../services/CampaignContactsServices/DeleteAllCampaignContactsService";
/**
 * @swagger
 * /campaign/{campaignId}/contacts:
 *   post:
 *     summary: Adiciona contatos a uma campanha
 *     tags: [Campaign Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha para adicionar contatos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 contactId:
 *                   type: string
 *                   description: ID do contato
 *     responses:
 *       200:
 *         description: Contatos adicionados à campanha com sucesso
 *       403:
 *         description: Sem permissão para adicionar contatos à campanha
 */

export const store = async (req: Request, res: Response): Promise<Response> => {
  // const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const contacts = [...req.body];
  const { campaignId } = req.params;

  const cc = await CreateCampaignContactsService({
    campaignContacts: contacts,
    campaignId
  });

  return res.status(200).json(cc);
};
/**
 * @swagger
 * /campaign/{campaignId}/contacts:
 *   get:
 *     summary: Lista todos os contatos de uma campanha
 *     tags: [Campaign Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha cujos contatos serão listados
 *     responses:
 *       200:
 *         description: Lista de contatos da campanha obtida com sucesso
 *       403:
 *         description: Sem permissão para visualizar os contatos da campanha
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { campaignId } = req.params;
  const tags = await ListCampaignContactsService({
    campaignId,
    tenantId
    // eslint-disable-next-line eqeqeq
  });
  return res.status(200).json(tags);
};

// export const update = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { tenantId } = req.user;

//   if (req.user.profile !== "admin") {
//     throw new AppError("ERR_NO_PERMISSION", 403);
//   }
//   const tagData: TagData = { ...req.body, userId: req.user.id, tenantId };

//   const schema = Yup.object().shape({
//     tag: Yup.string().required(),
//     color: Yup.string().required(),
//     isActive: Yup.boolean().required(),
//     userId: Yup.number().required()
//   });

//   try {
//     await schema.validate(tagData);
//   } catch (error) {
//     throw new AppError(error.message);
//   }

//   const { tagId } = req.params;
//   const tagObj = await UpdateTagService({
//     tagData,
//     tagId
//   });

//   return res.status(200).json(tagObj);
// };
/**
 * @swagger
 * /campaign/{campaignId}/contacts/{contactId}:
 *   delete:
 *     summary: Remove um contato específico de uma campanha
 *     tags: [Campaign Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha da qual o contato será removido
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato a ser removido da campanha
 *     responses:
 *       200:
 *         description: Contato removido da campanha com sucesso
 *       403:
 *         description: Sem permissão para remover contatos da campanha
 *       404:
 *         description: Contato ou campanha não encontrado
 */
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId, contactId } = req.params;

  await DeleteCampaignContactsService({ campaignId, contactId, tenantId });
  return res.status(200).json({ message: "Campagin Contact deleted" });
};
/**
 * @swagger
 * /campaign/{campaignId}/contacts/all:
 *   delete:
 *     summary: Remove todos os contatos de uma campanha
 *     tags: [Campaign Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha da qual todos os contatos serão removidos
 *     responses:
 *       200:
 *         description: Todos os contatos removidos da campanha com sucesso
 *       403:
 *         description: Sem permissão para remover contatos da campanha
 *       404:
 *         description: Campanha não encontrada
 */
export const removeAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  const { campaignId } = req.params;

  await DeleteAllCampaignContactsService({ campaignId, tenantId });
  return res.status(200).json({ message: "Campagin Contacts deleted" });
};
