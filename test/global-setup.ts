import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

export default async () => {
  dotenv.config({ path: '.env.test' });

  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    // pas de "database" ici
  });

  const dbName = process.env.DATABASE_NAME;
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

  await connection.end();
};
