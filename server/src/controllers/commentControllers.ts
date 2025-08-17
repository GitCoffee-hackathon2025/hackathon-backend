import { FastifyRequest, FastifyReply } from "fastify";
import { CommentService } from "../service/commentService";
import { ReportCommentDTO, ReviewCommentDTO } from "../types/userTypes";

const commentService = new CommentService();

function getUserIdFromCookie(request: FastifyRequest): number | null {
    const id = request.cookies.userId;
    return id ? parseInt(id) : null;
}

export async function registerReportComment(
    request: FastifyRequest<{ Params: { reportId: number }, Body: ReportCommentDTO }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        await commentService.registerReportComment(
            userId, 
            Number(request.params.reportId), 
            request.body
        );
        return reply.status(201).send({ message: "Comentário registrado com sucesso." });
    } catch (error) {
        return reply.status(400).send({ 
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function registerReviewComment(
    request: FastifyRequest<{ Params: { reviewId: number }, Body: ReviewCommentDTO }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        await commentService.registerReviewComment(
            userId, 
            Number(request.params.reviewId), 
            request.body
        );
        return reply.status(201).send({ message: "Comentário registrado com sucesso." });
    } catch (error) {
        return reply.status(400).send({ 
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}