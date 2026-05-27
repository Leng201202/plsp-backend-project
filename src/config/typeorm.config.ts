import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  autoLoadEntities: true,
  synchronize: true,//need to be false in production
};