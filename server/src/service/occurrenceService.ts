import { OccurrenceRepository } from "../repositories/occurrencesRepositories";
import { UserRepository } from "../repositories/userRepositories";
import { OccurrenceEntity } from "../entities/userEntities";
import { OccurrenceDTO } from "../types/userTypes";

export class OccurrenceService {
    private occurrenceRepo: OccurrenceRepository;
    private userRepo: UserRepository;

    constructor() {
        this.occurrenceRepo = new OccurrenceRepository();
        this.userRepo = new UserRepository();
    }

    async registerOccurrence(userId: number, dataOccurrence: OccurrenceDTO) {
        const user = await this.userRepo.findById(userId);
        const typeOccurrence = await this.occurrenceRepo.findTypeOccurrenceById(dataOccurrence.id_type_occurrence);
        
        if (!typeOccurrence) throw new Error("Tipo de relatório não encontrado");
        if (!user) throw new Error("Usuário não encontrado");

        const occurrence = new OccurrenceEntity();
        Object.assign(occurrence, dataOccurrence);
        occurrence.type = typeOccurrence;
        occurrence.user = user;

        const saved = await this.occurrenceRepo.saveOccurrence(occurrence);
        return saved;
    }

    async findOccurrenceById(id: number) {
        return this.occurrenceRepo.findOccurrenceById(id);
    }

    async deleteOccurrence(occurrenceId: number, userId: number): Promise<boolean> {
        const occurrence = await this.occurrenceRepo.findOccurrenceById(occurrenceId);
        
        if (!occurrence) throw new Error("occurrence não encontrado");
        if (occurrence.user.id_user !== userId) {
            throw new Error("Você não tem permissão para deletar este occurrence");
        }

        return this.occurrenceRepo.deleteOccurrence(occurrenceId);
    }

    async findOccurrenceByNeighborhood(id: number) {
        return this.occurrenceRepo.findOccurrencesByNeighborhood(id, 3);
    }
}
