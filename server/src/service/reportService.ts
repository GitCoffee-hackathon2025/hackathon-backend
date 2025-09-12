import { OccurrenceRepository } from "../repositories/reportsRepositories";
import { UserRepository } from "../repositories/userRepositories";
import { OccurrenceEntity } from "../entities/userEntities";
import { OccurrenceDTO } from "../types/userTypes";

export class OccurrenceService {
    private reportRepo: OccurrenceRepository;
    private userRepo: UserRepository;

    constructor() {
        this.reportRepo = new OccurrenceRepository();
        this.userRepo = new UserRepository();
    }

    async registerOccurrence(userId: number, dataOccurrence: OccurrenceDTO) {
        const user = await this.userRepo.findById(userId);
        const typeOccurrence = await this.reportRepo.findTypeOccurrenceById(dataOccurrence.id_type_report);
        
        if (!typeOccurrence) throw new Error("Tipo de relatório não encontrado");
        if (!user) throw new Error("Usuário não encontrado");

        const occurrence = new OccurrenceEntity();
        Object.assign(occurrence, dataOccurrence);
        occurrence.type = typeOccurrence;
        occurrence.user = user;

        const saved = await this.reportRepo.saveOccurrence(occurrence);
        return saved;
    }

    async findOccurrenceById(id: number) {
        return this.reportRepo.findOccurrenceById(id);
    }

    async deleteOccurrence(reportId: number, userId: number): Promise<boolean> {
        const occurrence = await this.reportRepo.findOccurrenceById(reportId);
        
        if (!occurrence) throw new Error("occurrence não encontrado");
        if (occurrence.user.id_user !== userId) {
            throw new Error("Você não tem permissão para deletar este occurrence");
        }

        return this.reportRepo.deleteOccurrence(reportId);
    }

    async findOccurrenceByNeighborhood(id: number) {
        return this.reportRepo.findOccurrencesByNeighborhood(id, 3);
    }
}
