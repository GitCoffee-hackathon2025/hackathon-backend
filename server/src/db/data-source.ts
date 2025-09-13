import { DataSource } from 'typeorm';

import UserEntity from '../entities/UserEntity';
import Token from '../entities/token';
import { OccurrenceEntity, TypeOccurrenceEntity } from '../entities/OccurrenceEntities';
// import { TokenEntity, VerificationTokenEntity } from '../entities/TokenEntities';

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
  entities: [
    UserEntity,
    Token,
    OccurrenceEntity,
    TypeOccurrenceEntity,
    // TokenEntity,
    // VerificationTokenEntity,
  ],
  migrations: [],
  subscribers: [],
});
