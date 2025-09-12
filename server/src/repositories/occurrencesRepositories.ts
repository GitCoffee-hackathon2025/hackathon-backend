import { AppDataSource } from '../db/data-source';
import { OccurrenceEntity, TypeOccurrenceEntity } from '../entities/userEntities';

class OccurrenceRepository {
  private repo = AppDataSource.getRepository(OccurrenceEntity);
  private typeRepo = AppDataSource.getRepository(TypeOccurrenceEntity);

  async findTypeById(id: number): Promise<TypeOccurrenceEntity | null> {
    return this.typeRepo.findOneBy({ id_type_occurrence: id });
  }

  async save(occurrence: OccurrenceEntity): Promise<OccurrenceEntity | null> {
    return this.repo.save(occurrence);
  }

  async findById(id: number): Promise<OccurrenceEntity | null> {
    return this.repo.findOne({
      where: { id_occurrence: id },
      relations: ['user', 'type', 'comments'], // se quiser trazer junto
      select: [
        'id_occurrence',
        'content_occurrence',
        'coordenadas',
        'created_at',
        'id_neighborhood',
        'user',
        'type',
        // "comments"
      ],
    });
  }

  async findByNeighborhood(id: number, limit: number = 3): Promise<OccurrenceEntity[]> {
    return this.repo
      .createQueryBuilder('occurrence')
      .leftJoinAndSelect('occurrence.user', 'user')
      .leftJoinAndSelect('occurrence.type', 'type')
      .where('occurrence.id_neighborhood = :id', { id })
      .orderBy('occurrence.created_at', 'DESC')
      .take(limit)
      .select([
        'occurrence.id_occurrence',
        'occurrence.content_occurrence',
        'occurrence.coordenadas',
        'occurrence.created_at',
        'occurrence.id_neighborhood',
        'user.id_user',
        'user.name',
        'type.id_type_occurrence',
        'type.name_type_occurrence',
      ])
      .getMany();
  }

  async delete(id: number): Promise<boolean> {
    const result: any = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default OccurrenceRepository;
