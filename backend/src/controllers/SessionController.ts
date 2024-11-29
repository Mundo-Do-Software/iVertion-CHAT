import { Request, Response } from "express";
import axios from "axios";
import AppError from "../errors/AppError";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import { getIO } from "../libs/socket";
import User from "../models/User";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de acesso JWT
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profile:
 *                       type: string
 *                 refreshToken:
 *                   type: string
 *                   description: Token de atualização JWT
 *       403:
 *         description: Login falhou
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  const io = getIO();

  const { email, password } = req.body;

  const { token, user, refreshToken, usuariosOnline } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(res, refreshToken);

  const params = {
    token,
    username: user.name,
    email: user.email,
    profile: user.profile,
    status: user.status,
    userId: user.id,
    tenantId: user.tenantId,
    queues: user.queues,
    usuariosOnline,
    configs: user.configs
  };

  io.emit(`${params.tenantId}:users`, {
    action: "update",
    data: {
      username: params.username,
      email: params.email,
      isOnline: true,
      lastLogin: new Date()
    }
  });

  return res.status(200).json(params);
};
/**
 * @swagger
 * /auth/refresh_token:
 *   post:
 *     summary: Atualiza o token de acesso do usuário
 *     tags: [Auth]
 *     cookies:
 *       jrt:
 *         schema:
 *           type: string
 *           description: Refresh token JWT armazenado como cookie
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Novo token de acesso JWT
 *       401:
 *         description: Token expirado ou inválido
 */
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { newToken, refreshToken } = await RefreshTokenService(token);

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken });
};
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Desconecta um usuário e atualiza o status para offline
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID do usuário que está fazendo logout
 *     responses:
 *       200:
 *         description: Logout bem-sucedido
 *       404:
 *         description: Usuário não encontrado
 */
export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.body;
  if (!userId) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }
  const io = getIO();

  const userLogout = await User.findByPk(userId);

  if (userLogout) {
    userLogout.update({ isOnline: false, lastLogout: new Date() });
  }

  io.emit(`${userLogout?.tenantId}:users`, {
    action: "update",
    data: {
      username: userLogout?.name,
      email: userLogout?.email,
      isOnline: false,
      lastLogout: new Date()
    }
  });

  // SendRefreshToken(res, refreshToken);

  return res.json({ message: "USER_LOGOUT" });
};
