import { ReportRepository } from "../repositories/reportsRepositories";
import { UserRepository } from "../repositories/userRepositories";
import { ReportEntity } from "../entities/userEntities";
import { ReportDTO } from "../types/userTypes";

export class ReportService {
    private reportRepo: ReportRepository;
    private userRepo: UserRepository;

    constructor() {
        this.reportRepo = new ReportRepository();
        this.userRepo = new UserRepository();
    }

    async registerReport(userId: number, dataReport: ReportDTO) {
        const user = await this.userRepo.findById(userId);
        const typeReport = await this.reportRepo.findTypeReportById(dataReport.id_type_report);
        
        if (!typeReport) throw new Error("Tipo de relatório não encontrado");
        if (!user) throw new Error("Usuário não encontrado");

        const report = new ReportEntity();
        Object.assign(report, dataReport);
        report.type = typeReport;
        report.user = user;

        return this.reportRepo.saveReport(report);
    }

    async findReportById(id: number) {
        return this.reportRepo.findReportById(id);
    }

        async deleteReport(reportId: number, userId: number): Promise<boolean> {
        const report = await this.reportRepo.findReportById(reportId);
        
        if (!report) throw new Error("Report não encontrado");
        if (report.user.id_user !== userId) {
            throw new Error("Você não tem permissão para deletar este report");
        }

  
        return this.reportRepo.deleteReport(reportId);
    }
    async findReportByNeighborhood(id : number){
        return this.reportRepo.findReportByNeighborhood(id);
    }
    

}