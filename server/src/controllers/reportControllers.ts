import { FastifyRequest, FastifyReply } from "fastify";
import { ReportService } from "../service/reportService";
import { ReportDTO } from "../types/userTypes";
// import { ReportEntity } from "../entities/userEntities";

const reportService = new ReportService();

function getUserIdFromCookie(request: FastifyRequest): number | null {
    const id = request.cookies.userId;
    return id ? parseInt(id) : null;
}

export async function registerReport(
    request: FastifyRequest<{ Body: ReportDTO }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        const report = await reportService.registerReport(userId, request.body);
         if (!report) {
            return reply.status(404).send({ message: "Relatório não encontrado" })};
        return reply.status(201).send({
            success: true,
            message: "Relatório registrado com sucesso",
            data: {
                id: report.id_report,
                content: report.content_report,
                coordenadas: report.coordenadas,
                created_at: report.created_at,
            }
        });
    } catch (error) {
        return reply.status(400).send({ 
            success: false,
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function deleteReport(
    request: FastifyRequest<{ Params: { reportId: number } }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    const reportId = Number(request.params.reportId);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        const success = await reportService.deleteReport(reportId, userId);
        
        if (!success) {
            return reply.status(404).send({
                success: false,
                message: "Report não encontrado"
            });
        }

        return reply.send({
            success: true,
            message: "Report deletado com sucesso"
        });
    } catch (error) {
        return reply.status(400).send({
            success: false,
            message: error instanceof Error ? error.message : "Erro ao deletar report"
        });
    }
}

export async function getReport(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
) {
    try {
        const report = await reportService.findReportById(Number(request.params.id));
        if (!report) return reply.status(404).send({ message: "Relatório não encontrado" });
        
        return reply.send({
            success: true,
            data: {
                id: report.id_report,
                content: report.content_report,
                coordenadas: report.coordenadas,
                created_at: report.created_at,
                user: report.user ? { id: report.user.id_user, name: report.user.name } : null,
                type: report.type ? { id: report.type.id_type_report, name: report.type.name_type_report } : null,
            }
        });
    } catch (error) {
        return reply.status(400).send({ 
            success: false,
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function getReportByNeighborhood(
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

    const reports = await reportService.findReportByNeighborhood(id);
    
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
