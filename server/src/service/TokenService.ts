// import TokenRepository from '../repositories/tokenRepositories';
// import { VerificationTokenEntity } from '../entities/TokenEntities';

// class TokenService {
//   private emailRepo: TokenRepository;

//   constructor() {
//     this.emailRepo = new TokenRepository();
//   }

//   async find(email: string, type: string) {
//     try {
//       const token = await this.emailRepo.findVerificationTokenByEmailAndType(email, type);

//       return token;
//     } catch (error) {
//       throw error;
//     }
//   }

//   async register(token: Partial<VerificationTokenEntity>) {
//     try {
//       const newToken = new VerificationTokenEntity();
//       Object.assign(newToken, token);

//       await this.emailRepo.saveVerificationToken(newToken);
//     } catch (error) {
//       throw error;
//     }
//   }

//   async delete(email: string, type: string) {
//     try {
//       await this.emailRepo.deleteToken(email, type);
//     } catch (error) {
//       throw error;
//     }
//   }

//   async update(email: string, type: string) {
//     try {
//       await this.emailRepo.updateToken(email, type);
//     } catch (error) {
//       throw error;
//     }
//   }
// }

// const tokenService = new TokenService();
// export default tokenService;
