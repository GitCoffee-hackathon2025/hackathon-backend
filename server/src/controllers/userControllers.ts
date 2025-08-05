
import { FastifyRequest, FastifyReply } from "fastify"
import { UserType } from "../types/userTypes"
import { UserService } from "../service/userService";
import { ReportType } from "../types/userTypes";
import { UpdateUserBody } from "../types/userTypes";
import { UpdateUserParams } from "../types/userTypes";
import { ReportDTO } from "../types/userTypes";
import { ReviewDTO } from "../types/userTypes";
import { ReportCommentDTO, ReviewCommentDTO } from "../types/userTypes";
const userService = new UserService();

export async function registerReport(
  request: FastifyRequest<{ Params: { id: number }, Body: ReportDTO }>,
  reply: FastifyReply
) {
  try {
    const dataReport = request.body;
    const userId = request.params.id;
    await userService.registerReport(userId, dataReport);
    return reply.status(201).send();
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}

export async function registerReportComment(
  request: FastifyRequest<{ Params: { reportId: number }, Body: ReportCommentDTO }>,
  reply: FastifyReply
) {
  try {
    const dataReportComment = request.body;
    const reportId = request.params.reportId;
  
    const userId = request.session.userId

    await userService.registerReportComment(userId, reportId, dataReportComment);

    return reply.status(201).send({ message: "Comentário registrado com sucesso." });
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}

export async function registerReviewComment(
  request: FastifyRequest<{ Params: { reportId: number }, Body: ReviewCommentDTO }>,
  reply: FastifyReply
) {
  try {
    const dataReportComment = request.body;
    const reportId = request.params.reportId;
  
    const userId = request.session.userId

    await userService.registerReportComment(userId, reportId, dataReviewComment);

    return reply.status(201).send({ message: "Comentário registrado com sucesso." });
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}


export async function registerReview(
  request: FastifyRequest<{ Params: { id: number }, Body: ReviewDTO }>,
  reply: FastifyReply
) {
  try {
    const dataReview = request.body;
    const userId = request.params.id;
    await userService.registerReview(userId, dataReview);
    return reply.status(201).send();
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}

export async function loginUser(
  request: FastifyRequest<{ Body: Pick<UserType, "email" | "password"> }>,
  reply: FastifyReply

) {
  ;
  try {
    const { email, password } = request.body
    const user = await userService.login(email, password)
    return reply.send({ message: "logado com sucesso", user })

  } catch (error) {
    return reply.status(401).send({ message: error });
  }
}

export async function registerUser(
  request: FastifyRequest<{ Body: Pick<UserType, "name" | "email" | "password" | "cep" | "tel" | "dateBirth"> }>,
  reply: FastifyReply
) {
  try {
    const data = request.body;
    const user = await userService.register(data);
    return reply.send({ message: "Usuário registrado com sucesso", user });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      // Código MySQL para entrada duplicada (unique constraint)
      reply.code(400).send({ error: "Este email já está cadastrado." });
      return reply.status(400).send({ message: error });
    }
  }
}
export async function updateUser(
  request: FastifyRequest<{
    Params: UpdateUserParams;
    Body: Partial<UpdateUserBody>;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const updateData = request.body;
    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      return reply.status(400).send({
        success: false,
        message: "ID inválido",
      });
    }
    const updatedUser = await userService.update(numericId, updateData);
    return reply.send({
      success: true,
      message: "Usuário atualizado com sucesso",
      data: updatedUser
    });
  } catch (error: any) {
    return reply.status(400).send({
      success: false,
      message: error.message || "Erro ao atualizar usuário"
    });
  }
}