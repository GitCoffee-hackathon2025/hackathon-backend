import { type FastifyInstance } from 'fastify';
import jsonwebtoken from '@fastify/jwt';

class TokenHandler {
  private jwt!: FastifyInstance['jwt'];

  private _init: boolean = false;

  public async init(register: FastifyInstance['register']) {
    if (this._init) return false;
    this._init = true;

    

    return true;
  }
}
