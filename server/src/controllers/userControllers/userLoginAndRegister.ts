
import { FastifyRequest, FastifyReply } from "fastify"
import {userType} from "../../types/user/userTypes"

export function loginUser(
    request : FastifyRequest<{Body: Pick<userType, "email" | "senha">}>,
    reply: FastifyReply

) {
  const {email, senha} = request.body;

  console.log('usario tentatando com login' + email)

  return reply.send({message : "Logado com sucesso"})
}

export function registerUser(
    request : FastifyRequest<{Body: Pick<userType, "name" | "email" | "senha" | "cep" | "tel" | "dateBirth"  >}>,
    reply: FastifyReply
) {
  const {name, email, senha, cep, tel, dateBirth} = request.body;
  // Logica com Banco de Dados
}