import { AppDataSource } from '../db/data-source';
import { OccurrenceEntity, TypeOccurrenceEntity } from '../entities/userEntities';

export class OccurrenceRepository {
  private reportRepo = AppDataSource.getRepository(OccurrenceEntity);
  private typeOccurrenceRepo = AppDataSource.getRepository(TypeOccurrenceEntity);

  async findTypeOccurrenceById(id: number): Promise<TypeOccurrenceEntity | null> {
    return this.typeOccurrenceRepo.findOneBy({ id_type_report: id });
  }

  async saveOccurrence(occurrence: OccurrenceEntity): Promise<OccurrenceEntity | null> {
    return this.reportRepo.save(occurrence);
  }

  async findOccurrenceById(id: number): Promise<OccurrenceEntity | null> {
    return this.reportRepo.findOne({
      where: { id_report: id },
      relations: ['user', 'type', 'comments'], // se quiser trazer junto
      select: [
        'id_report',
        'content_report',
        'coordenadas',
        'created_at',
        'id_neighborhood',
        'user',
        'type',
        // "comments"
      ],
    });
  }

  async deleteOccurrence(id: number): Promise<boolean> {
    const result: any = await this.reportRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findOccurrencesByNeighborhood(id: number, limit: number = 3): Promise<OccurrenceEntity[]> {
    return this.reportRepo
      .createQueryBuilder('occurrence')
      .leftJoinAndSelect('occurrence.user', 'user')
      .leftJoinAndSelect('occurrence.type', 'type')
      .where('occurrence.id_neighborhood = :id', { id })
      .orderBy('occurrence.created_at', 'DESC')
      .take(limit)
      .select([
        'occurrence.id_report',
        'occurrence.content_report',
        'occurrence.coordenadas',
        'occurrence.created_at',
        'occurrence.id_neighborhood',
        'user.id_user',
        'user.name',
        'type.id_type_report',
        'type.name_type_report',
      ])
      .getMany();
  }
}
