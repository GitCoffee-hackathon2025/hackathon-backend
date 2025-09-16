import { type FastifyRequest, type FastifyReply } from 'fastify';
import occurrenceService from '../services/OccurrenceService';
import { OccurrenceDTO } from '../types/userTypes';

import getUserIdFromCookie from './getUserIdFromCookie';
import CryptoManager from '../security/crypto/CryptoManager';
// Retorno do erro
import SendError from './../errors/SendError';
import { RequestBody } from '../types/requestBodyTypes';

class OccurrenceControllers {
   public static async register(
    request: any,
    reply: any
  ) {
    console.log('=== Chegou requisição no backend ===');
    console.log('Body recebido:', request.body);

    const userId = 1; // simulando cookie
    if (!userId) {
      console.warn('Usuário não autorizado');
      return reply.status(401).send({ message: 'Não autorizado' });
    }

    try {
      console.log('Tentando decodificar o body com CryptoManager...');
      let decoded, aes;
      try {
        ({ decoded, aes } = await CryptoManager.decode(request.body));
        console.log('Decode OK:', decoded);
      } catch (decodeErr) {
        console.error('Falha no decode:', decodeErr);
        return reply.status(400).send({
          success: false,
          message: decodeErr instanceof Error ? decodeErr.message : 'Erro desconhecido no decode',
        });
      }

      const occurrenceData = decoded.data as OccurrenceDTO;
      console.log('Dados da ocorrência decodificados:', occurrenceData);

      console.log('Chamando occurrenceService.register...');
      const occurrence = await occurrenceService.register(userId, occurrenceData);
      console.log('Occurrence registrada:', occurrence);

      if (!occurrence) {
        console.warn('Relatório não encontrado após salvar');
        return reply.status(404).send({ message: 'Relatório não encontrado' });
      }

      console.log('Codificando resposta com CryptoManager...');
      const encodedResponse = await CryptoManager.encode({
        success: true,
        message: 'Relatório registrado com sucesso',
        data: {
          id: occurrence.id_occurrence,
          content: occurrence.content_occurrence,
          coordenadas: occurrence.coordenadas,
          created_at: occurrence.created_at,
          date_occurrence: occurrence.date_occurrence,
        },
      }, aes);

      console.log('Resposta codificada pronta para envio:', encodedResponse);

      return reply.status(201).send(encodedResponse);
    } catch (error) {
      console.error('Erro inesperado no register:', error);
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  public static async getAllOccurrencesCoordenades(
   request: FastifyRequest,
   reply: FastifyReply
 ) {
   try {
     const occurrences = await occurrenceService.getAllOccurrencesCoordenades();
     if (!occurrences) return reply.status(404).send({ message: 'Não foi encontrado ocorrências' });


     return reply.send({
       success: true,
       count: occurrences.length,
       data: occurrences,
     });
   } catch (error) {
     SendError(error, reply);
   }
 }


  public static async get(
    request: FastifyRequest<{ Params: { id: number }}>,
    reply: FastifyReply
  ) {
    try {
      const occurrence = await occurrenceService.findById(Number(request.params.id));
 


      if (!occurrence) return reply.status(404).send({ message: 'Relatório não encontrado' });

      return reply.send({
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
      SendError(error, reply);
      // return reply.status(400).send({
      //   success: false,
      //   message: error instanceof Error ? error.message : 'Erro desconhecido',
      // });
    }
  }

  public static async getByNeighborhood(
    request: FastifyRequest<{ Params: { NeighborhoodId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const id = Number(request.params.NeighborhoodId);
      if (isNaN(id)) {
        return reply.status(400).send({
          success: false,
          message: 'ID do bairro deve ser um número válido',
        });
      }

      const occurrences = await occurrenceService.findByNeighborhood(id);

      if (occurrences.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'Nenhum relatório encontrado para este bairro',
          data: [],
        });
      }

      return reply.send({
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
      return reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  public static async delete(
    request: FastifyRequest<{ Params: { occurrenceId: number } }>,
    reply: FastifyReply
  ) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: 'Não autorizado' });
    const occurrenceId = Number(request.params.occurrenceId);

    try {
      await occurrenceService.delete(occurrenceId, userId);

      return reply.status(200).send({
        message: 'Ocorrência deletado com sucesso',
      });
    } catch (error) {
      SendError(error, reply);
    }
  }
}

export default OccurrenceControllers;
