import { DataSource } from 'typeorm';

import UserEntity from '../entities/UserEntity';
import TokenEntity from '../entities/TokenEntity';
import MailEntity from '../entities/MailEntity';
import { OccurrenceEntity, TypeOccurrenceEntity } from '../entities/OccurrenceEntities';

import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.HOST,
  port: 3306,
  username: 'aluno',
  password: 'aluno',
  database: 'hackathon',
  synchronize: true,
  logging: true,
  entities: [
    UserEntity,
    TokenEntity,
    MailEntity,
    OccurrenceEntity,
    TypeOccurrenceEntity,
    // TokenEntity,
    // VerificationTokenEntity,
  ],
  migrations: [],
  subscribers: [],
});
