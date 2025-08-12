import { FastifyRequest, FastifyReply } from "fastify";
import { ReviewService } from "../service/reviewService";
import { ReviewDTO } from "../types/userTypes";

const reviewService = new ReviewService();

function getUserIdFromCookie(request: FastifyRequest): number | null {
    const id = request.cookies.userId;
    return id ? parseInt(id) : null;
}

export async function registerReview(
    request: FastifyRequest<{ Body: ReviewDTO }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        await reviewService.registerReview(userId, request.body);
        return reply.status(201).send();
    } catch (error) {
        return reply.status(400).send({ 
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function getReview(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
) {
    try {
        const review = await reviewService.findReviewById(Number(request.params.id));
        if (!review) return reply.status(404).send({ message: "Avaliação não encontrada" });
        return reply.send(review);
    } catch (error) {
        return reply.status(400).send({ 
            message: error instanceof Error ? error.message : "Erro desconhecido" 
        });
    }
}

export async function deleteReview(
    request: FastifyRequest<{ Params: { reviewId: number } }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    const reviewId = Number(request.params.reviewId)
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        const success = await reviewService.deleteReview(
            reviewId,
            userId
        );
        
        if (!success) {
            return reply.status(404).send({
                success: false,
                message: "Review não encontrada"
            });
        }

        return reply.send({
            success: true,
            message: "Review deletada com sucesso"
        });
    } catch (error) {
        return reply.status(400).send({
            success: false,
            message: error instanceof Error ? error.message : "Erro ao deletar review"
        });
    }
}