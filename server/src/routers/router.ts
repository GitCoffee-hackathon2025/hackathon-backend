import fp from 'fastify-plugin';
import { type FastifyInstance, type FastifyPluginOptions } from 'fastify';
import { type RequestBody } from '../types/requestBodyTypes';


import validateOfFormatBody from '../middlewares/validateOfFormatBody';
import validateOfHeaderBody from '../middlewares/validateOfBody';
import validateOfToken from '../middlewares/validateOfToken';


import PublicKeyController from '../controllers/CryptoController';
import UserControllers from '../controllers/UserController';
import OccurrenceController from '../controllers/OccurrenceController';
import AuthController from '../controllers/AuthController';


const validates = [validateOfFormatBody, validateOfHeaderBody];


function useValidates(auth: boolean = false) {
  return { preHandler: auth ? [...validates, validateOfToken] : validates };
}


async function userRouters(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Public key
  fastify.get('/connect/get', PublicKeyController);


  // User
 
  fastify.post('/auth', useValidates(true), UserControllers.get);
  fastify.post('/auth/register', UserControllers.register);
  fastify.put('/auth', useValidates(true), UserControllers.update);


  // Tokens
  fastify.post('/auth/send-registration-code', AuthController.sendEmailForRegister);
  fastify.post('/auth/verify-registration-code', AuthController.verifyRegistrationCode);
  fastify.post('/auth/tokens', useValidates(), AuthController.login);
  fastify.put('/auth/tokens', useValidates(true), AuthController.recover);


  // Mails
  fastify.post('/auth/mail/email', useValidates(true), AuthController.sendMailChangeEmail);
  fastify.post('/auth/mail/password', useValidates(true), AuthController.sendMailPassword);


  // Occurrences
  fastify.post('/occurrences/register', useValidates(true), OccurrenceController.register);
  fastify.get('/occurrences', OccurrenceController.get);
  fastify.get('/occurrences/neighborhood', OccurrenceController.getByNeighborhood);
  fastify.delete('/occurrences', useValidates(true), OccurrenceController.delete);
}


const userRoutersPlugin = fp(userRouters);
export default userRoutersPlugin;


