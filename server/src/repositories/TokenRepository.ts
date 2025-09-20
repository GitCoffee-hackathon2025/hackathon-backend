// Tipagens
import { type TokenTable } from '../templates/tokenTemplates';

// Banco
import { AppDataSource } from '../db/data-source';
import Token from '../entities/TokenEntity';

class TokenRepository {
  private repo = AppDataSource.getRepository(Token);

  public async save(token: Token, expires: number): Promise<Token> {
    token.expires_at = new Date(Date.now() + expires * 1000);
    return this.repo.save(token);
  }

  public async findByJti(jti: string): Promise<TokenTable | null> {
    const found = await this.repo
      .createQueryBuilder('token')
      .leftJoin('token.user', 'user')
      .select([
        'token.id_token AS id_token',
        'token.jti AS jti',
        'token.type AS type',
        'token.browser AS browser',
        'user.id_user AS user_id',
      ])
      .where('token.jti = :jti', { jti })
      .getRawOne<TokenTable>();

    return found ?? null;
  }

  public async findByUserId(userId: number): Promise<Token[]> {
    return this.repo.find({
      where: { user: { id_user: userId } },
      select: {
        id_token: true,
        jti: true,
        type: true,
        browser: true,
      },
    });
  }

  public async findTokenId(type: string, userId: number, browser: string): Promise<number | null> {
    const token = await this.repo.findOne({
      where: {
        type,
        browser,
        user: { id_user: userId },
      },
      select: ['id_token'],
    });

    return token?.id_token || null;
  }

  public async delete(id: number): Promise<boolean> {
    return ((await this.repo.delete(id)).affected ?? 0) > 0;
  }
public async deleteAllByUserId(userId: number): Promise<boolean> {
  try {
    console.log(`🗑️ Deletando tokens do usuário: ${userId}`);
    
    // ✅ Use o nome da coluna foreign key (provavelmente 'user_id')
    const result = await this.repo
      .createQueryBuilder()
      .delete()
       .where('id_user = :userId', { userId }) // ← Nome da coluna FK na tabela Token
      .execute();

    console.log(`✅ ${result.affected} tokens deletados para o usuário ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar tokens:', error);
    return false;
  }
}
}

export default TokenRepository;
