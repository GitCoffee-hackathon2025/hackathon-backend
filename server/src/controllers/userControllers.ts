
import { FastifyRequest, FastifyReply } from "fastify"
import { UserType} from "../types/userTypes"
import { UserService } from "../service/userService";
import { UpdateUserBody } from "../types/userTypes";
import { UpdateUserParams } from "../types/userTypes";
import { UserEntity } from "../entities/userEntities";


const userService = new UserService();


export async function loginUser(
    request : FastifyRequest<{Body: Pick<UserType, "email" | "password">}>,
    reply: FastifyReply

) {
;
  try {  
    const {email, password} = request.body
    const user = await userService.login(email, password)
    return reply.send({message: "logado com sucesso", user})
    
  } catch (error) {
    return reply.status(401).send({ message: error });
  }
}

export async function registerUser(
    request : FastifyRequest<{Body: Pick<UserType, "name" | "email" | "password" | "cep" | "tel" | "dateBirth"  >}>,
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
export async function updateUser(
    request: FastifyRequest<{
        Params: UpdateUserParams;
        Body: Partial<UserEntity>;
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