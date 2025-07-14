
import { FastifyRequest, FastifyReply } from "fastify"
import {userType} from "../types/userTypes"
import { UserService } from "../service/userService";

const userService = new UserService();


export async function loginUser(
    request : FastifyRequest<{Body: Pick<userType, "email" | "senha">}>,
    reply: FastifyReply

) {
;
  try {  
    const {email, senha} = request.body
    const user = await userService.login(email, senha)
    return reply.send({message: "logado com sucesso", user})
    
  } catch (error) {
    return reply.status(401).send({ message: error });
  }
}

export async function registerUser(
    request : FastifyRequest<{Body: Pick<userType, "name" | "email" | "senha" | "cep" | "tel" | "dateBirth"  >}>,
    reply: FastifyReply
) {
  try {
    const data = request.body;
    const user = await userService.register(data);
    return reply.send({ message: "Usuário registrado com sucesso", user });
  } catch (error : any) {
    if (error.code   === "ER_DUP_ENTRY") {
      // Código MySQL para entrada duplicada (unique constraint)
      reply.code(400).send({ error: "Este email já está cadastrado." });
    return reply.status(400).send({ message: error });
  }
}
}