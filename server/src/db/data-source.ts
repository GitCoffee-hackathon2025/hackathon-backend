import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "../entities/userEntities"; 

export const AppDataSource = new DataSource({
  type: "mysql",      
  host: "localhost",
  port: 3306,                
  username: "root",
  password: "**********",
  database: "hackathon",
  synchronize: true,       
  logging: false,            
  entities: [UserEntity],    
  migrations: ["src/migrations/*.ts"], 
  subscribers: [],          
});

