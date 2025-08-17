import { FastifyRequest, FastifyReply } from "fastify";
import { ReportService } from "../service/reportService";
import { ReportDTO } from "../types/userTypes";

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
        await reportService.registerReport(userId, request.body);
        return reply.status(201).send();
    } catch (error) {
        return reply.status(400).send({ 
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
        const success = await reportService.deleteReport(
            reportId,
            userId
        );
        
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
        return reply.send(report);
    } catch (error) {
        return reply.status(400).send({ 
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}