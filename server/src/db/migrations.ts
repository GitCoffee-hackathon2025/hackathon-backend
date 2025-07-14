import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "../models/userModels"; 

export const AppDataSource = new DataSource({
  type: "mysql",      
  host: "localhost",
  port: 5432,                
  username: "?",
  password: "?",
  database: "?",
  synchronize: false,       
  logging: false,            
  entities: [UserEntity],    
  migrations: ["src/migrations/*.ts"], 
  subscribers: [],          
});
