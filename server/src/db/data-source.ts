import { DataSource } from 'typeorm';
import {
  UserEntity,
  OccurrenceEntity,
  TypeOccurrenceEntity,
  TokenEntity,
  VerificationTokenEntity,
} from '../entities/userEntities'; // Ajuste o caminho conforme necessário
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.HOST,
  port: 3306,
  username: process.env.USER,
  password: process.env.PASSWORD,
  database: 'hackathon',
  synchronize: true,
  logging: true,
  entities: [UserEntity, OccurrenceEntity, TypeOccurrenceEntity, TokenEntity, VerificationTokenEntity],
  migrations: [],
  subscribers: [],
});
