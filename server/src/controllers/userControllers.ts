import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../service/userService";
import { UserType, UpdateUserBody, UpdateUserParams } from "../types/userTypes";

const userService = new UserService();

function getUserIdFromCookie(request: FastifyRequest): number | null {
    const id = request.cookies.userId;
    return id ? parseInt(id) : null;
}

export async function loginUser(
    request: FastifyRequest<{ Body: Pick<UserType, "email" | "password"> }>,
    reply: FastifyReply
) {
    try {
        const { email, password } = request.body;
        const user = await userService.login(email, password);

        reply.setCookie('userId', user.id_user.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
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
        const user = await userService.register(request.body);
        return reply.status(201).send({ message: "Usuário registrado com sucesso", user });
    } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
            return reply.status(400).send({ error: "Este email já está cadastrado." });
        }
        return reply.status(400).send({ message: "Erro ao registrar usuário" });
    }
}

export async function updateUser(
    request: FastifyRequest<{ Params: UpdateUserParams; Body: Partial<UpdateUserBody> }>,
    reply: FastifyReply
) {
    const userId = getUserIdFromCookie(request);
    if (!userId) return reply.status(401).send({ message: "Não autorizado" });

    try {
        const updatedUser = await userService.update(userId, request.body);
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