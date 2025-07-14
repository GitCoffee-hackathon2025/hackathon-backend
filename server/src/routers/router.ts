import fastify from "fastify";
import { FastifyInstance } from "fastify";
import {loginUser, registerUser} from "../controllers/userControllers"
export async function userRouters(app: FastifyInstance){
    app.get('/login', loginUser)
    app.post('/register', registerUser)
}


