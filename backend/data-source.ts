import 'dotenv/config';
import { DataSource } from 'typeorm';

console.log('using database: ', process.env.DATABASE_URL);

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
