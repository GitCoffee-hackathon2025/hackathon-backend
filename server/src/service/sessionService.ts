// service/sessionService.ts
import crypto from 'crypto';
import { SessionRepository } from '../repositories/sessionRepositories';
import { UserSessionEntity } from '../entities/userEntities';

export class SessionService {
  private repo = new SessionRepository();
  private ABS_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 7; // ex: 7 dias

  async create(userId: number, fingerprint?: string) {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ABS_TIMEOUT_MS);

    const session: Partial<UserSessionEntity> = {
      sessionId,
      userId,
      createdAt: now,
      expiresAt,
      fingerprint,
      active: true,
    };
    return await this.repo.save(session);
  }

  async findValid(sessionId: string, fingerprint?: string) {
    const s = await this.repo.findBySessionId(sessionId);
    if (!s || !s.active) return null;
    if (s.expiresAt && s.expiresAt.getTime() < Date.now()) return null;
    if (s.fingerprint && fingerprint && s.fingerprint !== fingerprint) return null;
    return s;
  }

  async invalidate(sessionId: string) {
    await this.repo.invalidate(sessionId);
  }
}
