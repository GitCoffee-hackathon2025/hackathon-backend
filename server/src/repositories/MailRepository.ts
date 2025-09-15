import { AppDataSource } from '../db/data-source';
import MailEntity from '../entities/MailEntity';

class VerificationRepository {
  private repo = AppDataSource.getRepository(MailEntity);

  public async save(verification: MailEntity, expires: number): Promise<MailEntity> {
    verification.expires_at = new Date(Date.now() + expires * 1000);
    return this.repo.save(verification);
  }

  public async findByUserIdAndType(userId: number, type: string): Promise<MailEntity | null> {
    return this.repo.findOne({
      where: { user: { id_user: userId }, type },
      select: ['id_mail', 'random'],
    });
  }

  public async findByUserId(userId: number): Promise<MailEntity[]> {
    return this.repo.find({
      where: { user: { id_user: userId } },
      select: {
        id_mail: true,
        random: true,
        type: true,
      },
    });
  }

  public async delete(id: number): Promise<boolean> {
    return ((await this.repo.delete(id)).affected ?? 0) > 0;
  }

  public async deleteAllByUserId(userId: number): Promise<boolean> {
    return (
      ((
        await this.repo.createQueryBuilder().delete().where('id_user = :v', { v: userId }).execute()
      ).affected ?? 0) > 0
    );
  }
}

export default VerificationRepository;
