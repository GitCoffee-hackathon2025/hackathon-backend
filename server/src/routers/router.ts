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
 
  fastify.post('/auth', /*useValidates(true),*/ UserControllers.get);
  fastify.post('/auth/register', UserControllers.register);
  fastify.put('/auth', useValidates(true), UserControllers.update);


  // Tokens
  fastify.post('/auth/send-registration-code', AuthController.sendEmailForRegister);
  fastify.post('/auth/verify-registration-code', AuthController.verifyRegistrationCode);
  fastify.post('/auth/login',  AuthController.login);
  fastify.put('/auth/tokens'/* , useValidates(true) */, AuthController.recover);
  fastify.post('/auth/send-recovery-code', AuthController.sendPasswordRecoveryCode);
fastify.post('/auth/verify-recovery-code', AuthController.verifyPasswordRecoveryCode);
fastify.post('/auth/reset-password', AuthController.resetPassword);

  // Mails
  fastify.post('/auth/mail/email', useValidates(true), AuthController.sendMailChangeEmail);
  fastify.post('/auth/mail/password', useValidates(true), AuthController.sendMailPassword);


  // Occurrences
  fastify.get('/occurrences/coordenates', OccurrenceController.getAllOccurrencesCoordenades);
  fastify.post('/occurrences/register', OccurrenceController.register);
  fastify.get('/occurrences/:id', OccurrenceController.get)
  fastify.get('/occurrences/user/:id', OccurrenceController.getOccorrences)
  fastify.get('/occurrences/neighborhood/:NeighborhoodId', OccurrenceController.getByNeighborhood);
  fastify.delete('/occurrences', useValidates(true), OccurrenceController.delete);
}


const userRoutersPlugin = fp(userRouters);
export default userRoutersPlugin;


