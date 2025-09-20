// import { AppDataSource } from '../db/data-source';
// import { VerificationTokenEntity } from '../entities/TokenEntities';

// class TokenRepository {
//   private verificationTokenRepo = AppDataSource.getRepository(VerificationTokenEntity);

//   async saveVerificationToken(token: VerificationTokenEntity): Promise<void> {
//     try {
//       await this.verificationTokenRepo.save(token);
//     } catch (error) {
//       throw new Error(`Erro ao salvar token de verificação: ${String(error)}`);
//     }
//   }

//   async findVerificationTokenByEmailAndType(
//     email: string,
//     type: string
//   ): Promise<VerificationTokenEntity | null> {
//     try {
//       const token = await this.verificationTokenRepo.findOneBy({
//         emailUser: email,
//         tokenType: type,
//       });

//       return token;
//     } catch (error) {
//       throw new Error(`Erro ao buscar token de verificação: ${String(error)}`);
//     }
//   }

//   async deleteToken(email: string, type: string): Promise<void> {
//     try {
//       await this.verificationTokenRepo.delete({ emailUser: email, tokenType: type });
//     } catch (error) {
//       throw new Error(`Erro ao excluir token do usuário ${email}: ${String(error)}`);
//     }
//   }

//   async updateToken(email: string, type: string) {
//     try {
//       const token = await this.findVerificationTokenByEmailAndType(email, type);

//       if (token) {
//         const now = new Date();
//         await this.verificationTokenRepo.update(token?.idToken, { used: true, consumedAt: now });
//       }
//     } catch (error) {
//       throw new Error(`Erro ao atualizar estado do token de verificação: ${String(error)}`);
//     }
//   }
// }

// export default TokenRepository;
