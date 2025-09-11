// src/utils/responseHandler.ts
import { FastifyReply } from 'fastify';
import { InputErro } from '../types/userTypes';

export class ResponseHandler {
  static success(
    reply: FastifyReply,
    data: any,
    message = 'Operação realizada com sucesso',
    statusCode = 200
  ) {
    return reply.status(statusCode).send({
      success: true,
      message,
      data,
    });
  }

  static error(
    reply: FastifyReply,
    message = 'Erro interno no servidor',
    statusCode = 500,
    inputErro?: InputErro
  ) {
    return reply.status(statusCode).send({
      success: false,
      message,
      inputErro,
    });
  }

  static errorInEmail(
    reply: FastifyReply,
    message: 'Email obrigatório.' | 'Email inválido para cadastro.' | 'Este email ja esta em uso.',
    statusCode = 400
  ) {
    return this.error(reply, message, statusCode, ['EMAIL']);
  }

  static errorInCode(
    reply: FastifyReply,
    message: 'Código inválido.' | 'Código expirado.',
    statusCode = 400
  ) {
    return this.error(reply, message, statusCode, ['CODE']);
  }

  static unauthorized(reply: FastifyReply) {
    return this.error(reply, 'Sem autorização', 401, undefined);
  }

  static invalidCredentials(reply: FastifyReply) {
    return this.error(reply, 'Credenciais inválidas', 400, ['PASSWORD', 'EMAIL']);
  }
}
