// Tipagens
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { RequestBody } from '../types/requestBodyTypes';
import { OccurrenceDTO } from '../types/userTypes';

import { occurrenceTemplate } from '../templates/occurrenceTemplates';

// Retorno do erro
import SendError from './../errors/SendError';
import FormatError from '../errors/FormatError';

// Segurança
import { authentic } from './AuthController';
import CryptoManager from '../security/crypto/CryptoManager';
import checksFieldExistence from './utils/checksFieldExistence';

// Funções
import occurrenceService from '../services/OccurrenceService';

class OccurrenceController {
  public static async register(
    request: FastifyRequest<{ Body: RequestBody }>,
    reply: FastifyReply
  ) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const userId = 3;

      const occurrenceData = decoded.data as OccurrenceDTO;
     

      // Chama o service
      const occurrence = await occurrenceService.register(userId, occurrenceData);
      if (!occurrence) throw new FormatError(404, 'Relatório não encontrado');

      const data = {
        id: occurrence.id_occurrence,
        content: occurrence.content_occurrence,
        coordenadas: occurrence.coordenadas,
        created_at: occurrence.created_at,
        date_occurrence: occurrence.date_occurrence,
      };

      return reply.status(201).send(
        await CryptoManager.encode(
          {
            success: true,
            message: 'Relatório registrado com sucesso',
            data,
          },
          aes
        )
      );
    } catch (error) {
      return SendError(error, reply);
    }
  }

  public static async get(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      const occurrence = await occurrenceService.findById(Number(request.params.id));

      if (!occurrence) throw new FormatError(404, 'Relatório não encontrado');

      return reply.status(200).send({
        success: true,
        data: {
          id: occurrence.id_occurrence,
          content: occurrence.content_occurrence,
          coordenadas: occurrence.coordenadas,
          created_at: occurrence.created_at,
          user: occurrence.user
            ? { id: occurrence.user.id_user, name: occurrence.user.name }
            : null,
          type: occurrence.type
            ? { id: occurrence.type.id_type_occurrence, name: occurrence.type.name_type_occurrence }
            : null,
        },
      });
    } catch (error) {
      return SendError(error, reply);
    }
  }

  public static async getByNeighborhood(
    request: FastifyRequest<{ Params: { NeighborhoodId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = Number(request.params.NeighborhoodId);
      if (isNaN(id)) throw new FormatError(400, 'ID do bairro deve ser um número válido');

      const occurrences = await occurrenceService.findByNeighborhood(id);

      if (occurrences.length === 0)
        throw new FormatError(404, 'Nenhum relatório encontrado para este bairro');

      return reply.status(200).send({
        success: true,
        count: occurrences.length,
        data: occurrences.map((r) => ({
          id: r.id_occurrence,
          content: r.content_occurrence,
          coordenadas: r.coordenadas,
          created_at: r.created_at,
          user: r.user ? { id: r.user.id_user, name: r.user.name } : null,
          type: r.type
            ? { id: r.type.id_type_occurrence, name: r.type.name_type_occurrence }
            : null,
        })),
      });
    } catch (error) {
      return SendError(error, reply);
    }
  }

  public static async delete(request: FastifyRequest<{ Body: RequestBody }>, reply: FastifyReply) {
    try {
      const { decoded, aes } = await CryptoManager.decode(request.body);

      const userId = await authentic(request.headers.authorization, decoded.browser!);

      const occurrenceId = Number(decoded.data.occurrenceId);
      await occurrenceService.delete(occurrenceId, userId);

      return reply
        .status(200)
        .send(
          await CryptoManager.encode(
            { success: true, message: 'Ocorrência deletado com sucesso' },
            aes
          )
        );
    } catch (error) {
      return SendError(error, reply);
    }
  }

  // public static async delete(
  //   request: FastifyRequest<{ Params: { occurrenceId: number } }>,
  //   reply: FastifyReply
  // ) {
  //   const userId = getUserIdFromCookie(request);
  //   if (!userId) return reply.status(401).send({ message: 'Não autorizado' });
  //   const occurrenceId = Number(request.params.occurrenceId);

  //   try {
  //     await occurrenceService.delete(occurrenceId, userId);

  //     return reply.status(200).send({
  //       message: 'Ocorrência deletado com sucesso',
  //     });
  //   } catch (error) {
  //     SendError(error, reply);
  //   }
  // }
}

export default OccurrenceController;
