import { FastifyRequest, FastifyReply } from "fastify";
import { OccurrenceService } from "../service/reportService";
import { OccurrenceDTO } from "../types/userTypes";
// import { OccurrenceEntity } from "../entities/userEntities";

const reportService = new OccurrenceService();

function getUserIdFromCookie(request: FastifyRequest): number | null {
    const id = request.cookies.userId;
    return id ? parseInt(id) : null;
}

export async function registerOccurrence(
    request: FastifyRequest<{ Body: OccurrenceDTO }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        const occurrence = await reportService.registerOccurrence(userId, request.body);
         if (!occurrence) {
            return reply.status(404).send({ message: "Relatório não encontrado" })};
        return reply.status(201).send({
            success: true,
            message: "Relatório registrado com sucesso",
            data: {
                id: occurrence.id_report,
                content: occurrence.content_report,
                coordenadas: occurrence.coordenadas,
                created_at: occurrence.created_at,
            }
        });
    } catch (error) {
        return reply.status(400).send({ 
            success: false,
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function deleteOccurrence(
    request: FastifyRequest<{ Params: { reportId: number } }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    const reportId = Number(request.params.reportId);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        const success = await reportService.deleteOccurrence(reportId, userId);
        
        if (!success) {
            return reply.status(404).send({
                success: false,
                message: "occurrence não encontrado"
            });
        }

        return reply.send({
            success: true,
            message: "occurrence deletado com sucesso"
        });
    } catch (error) {
        return reply.status(400).send({
            success: false,
            message: error instanceof Error ? error.message : "Erro ao deletar occurrence"
        });
    }
}

export async function getOccurrence(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
) {
    try {
        const occurrence = await reportService.findOccurrenceById(Number(request.params.id));
        if (!occurrence) return reply.status(404).send({ message: "Relatório não encontrado" });
        
        return reply.send({
            success: true,
            data: {
                id: occurrence.id_report,
                content: occurrence.content_report,
                coordenadas: occurrence.coordenadas,
                created_at: occurrence.created_at,
                user: occurrence.user ? { id: occurrence.user.id_user, name: occurrence.user.name } : null,
                type: occurrence.type ? { id: occurrence.type.id_type_report, name: occurrence.type.name_type_report } : null,
            }
        });
    } catch (error) {
        return reply.status(400).send({ 
            success: false,
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function getOccurrenceByNeighborhood(
  request: FastifyRequest<{ Params: { NeighborhoodId: string } }>, 
  reply: FastifyReply
) {
  try {
    const id = Number(request.params.NeighborhoodId);
    if (isNaN(id)) {
      return reply.status(400).send({ 
        success: false,
        message: "ID do bairro deve ser um número válido" 
      });
    }

    const reports = await reportService.findOccurrenceByNeighborhood(id);
    
    if (reports.length === 0) {
      return reply.status(404).send({ 
        success: false,
        message: "Nenhum relatório encontrado para este bairro",
        data: []
      });
    }
    
    return reply.send({
      success: true,
      count: reports.length,
      data: reports.map(r => ({
        id: r.id_report,
        content: r.content_report,
        coordenadas: r.coordenadas,
        created_at: r.created_at,
        user: r.user ? { id: r.user.id_user, name: r.user.name } : null,
        type: r.type ? { id: r.type.id_type_report, name: r.type.name_type_report } : null,
      }))
    });
    
  } catch (error) {
    return reply.status(500).send({ 
      success: false,
      message: error instanceof Error ? error.message : "Erro interno do servidor" 
    });
  }
}
