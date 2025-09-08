// repositories/sessionRepositories.ts
import { AppDataSource } from '../db/data-source';
import { UserSessionEntity } from '../entities/userEntities';

export class SessionRepository {
  private repo = AppDataSource.getRepository(UserSessionEntity);

  async save(session: Partial<UserSessionEntity>): Promise<UserSessionEntity> {
    try {
      return await this.repo.save(session);
    } catch (error) {
      throw new Error(`Erro ao cadastrar sessão de usuário: ${String(error)}`);
    }
  }

  async findBySessionId(sessionId: string): Promise<UserSessionEntity | null> {
    return await this.repo.findOne({ where: { sessionId } });
  }

  async invalidate(sessionId: string): Promise<void> {
    await this.repo.update({ sessionId }, { active: false });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.repo.update({ userId }, { active: false });
  }
}
