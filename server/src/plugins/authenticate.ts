import { FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { SessionService } from '../service/sessionService';
import { ResponseHandler } from '../utils/requisitionsResposnses';

const sessionService = new SessionService();

export async function authenticateSession(request: FastifyRequest, reply: FastifyReply) {
  try {
    const sessionId = request.cookies.session_id;

    if (!sessionId) {
      return ResponseHandler.unauthorized(reply);
    }

    const userAgent = (request.headers['user-agent'] ?? '') as string;
    const ip = (request.ip ?? '') as string;
    const fingerprint = crypto
      .createHash('sha256')
      .update(userAgent + '|' + ip)
      .digest('hex');

    const session = await sessionService.findValid(sessionId, fingerprint);

    if (!session) {
      return ResponseHandler.unauthorized(reply);
    }

    (request.body as any).userId = session.userId;

    return;
  } catch (err: any) {
    return ResponseHandler.error(reply, undefined, undefined, undefined);
  }
}
