import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  ...(process.env.DB_SOCKET_PATH
    ? { socketPath: process.env.DB_SOCKET_PATH }
    : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306) }),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,

  autoLoadEntities: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, //need to be false in production
};