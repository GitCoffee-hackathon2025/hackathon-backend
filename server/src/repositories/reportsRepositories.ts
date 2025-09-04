

import { AppDataSource } from "../db/data-source";
import { ReportEntity, TypeReportEntity, ReportCommentEntity } from '../entities/userEntities';

export class ReportRepository {
    private reportRepo = AppDataSource.getRepository(ReportEntity);
    private typeReportRepo = AppDataSource.getRepository(TypeReportEntity);
    private reportCommentRepo = AppDataSource.getRepository(ReportCommentEntity);

    async findTypeReportById(id: number): Promise<TypeReportEntity | null> {
        return this.typeReportRepo.findOneBy({ id_type_report: id });
    }

    async saveReport(report: ReportEntity): Promise<ReportEntity | null> {
        return this.reportRepo.save(report);
    }

 

    async findReportById(id: number): Promise<ReportEntity | null> {
        return this.reportRepo.findOneBy({ id_report: id });
    }
       
    async deleteReport(id: number): Promise<boolean> {
        // Primeiro deleta os comentários associados
        await this.reportCommentRepo.delete({ report: { id_report: id } });
        
        const result: any = await this.reportRepo.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async findReportsByNeighborhood(id: number, limit: number = 3) {
  return this.reportRepo
    .createQueryBuilder("report")
    .leftJoinAndSelect("report.user", "user")
    .leftJoinAndSelect("report.type", "type") // aqui é "type", não "typeReport"
    .where("report.id_neighborhood = :id", { id })
    .orderBy("report.id_report", "DESC")
    .take(limit)
    .select([
      "report.id_report",
      "report.content_report",
      "report.id_neighborhood",
      "user.id_user",
      "user.name",
      "type.id_type_report",
      "type.name_type_report"
    ])
    .getMany();
}
}