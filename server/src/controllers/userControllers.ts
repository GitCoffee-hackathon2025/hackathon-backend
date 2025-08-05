import { FastifyRequest, FastifyReply } from "fastify"
import { UserType, ReportDTO, ReviewDTO, ReportCommentDTO, ReviewCommentDTO, UpdateUserBody, UpdateUserParams } from "../types/userTypes"
import { UserService } from "../service/userService"

const userService = new UserService();

function getUserIdFromCookie(request: FastifyRequest, reply: FastifyReply): number | null {
  const id = request.cookies.userId;
  if (!id) {
    reply.status(401).send({ message: "Usuário não autenticado" });
    return null;
  }
  return parseInt(id);
}

export async function loginUser(
  request: FastifyRequest<{ Body: Pick<UserType, "email" | "password"> }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;
    const user = await userService.login(email, password);

    // Criar cookie
    reply.setCookie('userId', user.id_user.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return reply.send({ message: "Logado com sucesso", user });
  } catch (error) {
    return reply.status(401).send({ message: "Credenciais inválidas" });
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
      return reply.code(400).send({ error: "Este email já está cadastrado." });
    }
    return reply.status(400).send({ message: "Erro ao registrar usuário" });
  }
}


export async function registerReport(
  request: FastifyRequest<{ Body: ReportDTO }>,
  reply: FastifyReply
) {
  const userId = getUserIdFromCookie(request, reply);
  if (userId === null) return;

  try {
    await userService.registerReport(userId, request.body);
    return reply.status(201).send();
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}

export async function registerReview(
  request: FastifyRequest<{ Body: ReviewDTO }>,
  reply: FastifyReply
) {
  const userId = getUserIdFromCookie(request, reply);
  if (userId === null) return;

  try {
    await userService.registerReview(userId, request.body);
    return reply.status(201).send();
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}

export async function registerReportComment(
  request: FastifyRequest<{ Params: { reportId: number }, Body: ReportCommentDTO }>,
  reply: FastifyReply
) {
  const userId = getUserIdFromCookie(request, reply);
  if (userId === null) return;

  try {
    const reportId = request.params.reportId;
    await userService.registerReportComment(userId, reportId, request.body);
    return reply.status(201).send({ message: "Comentário registrado com sucesso." });
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}


export async function registerReviewComment(
  request: FastifyRequest<{ Params: { reportId: number }, Body: ReviewCommentDTO }>,
  reply: FastifyReply
) {
  const userId = getUserIdFromCookie(request, reply);
  if (userId === null) return;

  try {
    const reportId = request.params.reportId;
    await userService.registerReviewComment(userId, reportId, request.body);
    return reply.status(201).send({ message: "Comentário registrado com sucesso." });
  } catch (error) {
    return reply.status(400).send({ message: error instanceof Error ? error.message : "Erro desconhecido" });
  }
}


export async function updateUser(
  request: FastifyRequest<{ Params: UpdateUserParams; Body: Partial<UpdateUserBody>; }>,
  reply: FastifyReply
) {
  const userId = getUserIdFromCookie(request, reply);
  if (userId === null) return;

  try {
    const updateData = request.body;
    const updatedUser = await userService.update(userId, updateData);
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
