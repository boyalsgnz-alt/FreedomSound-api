import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

export default async () => {
  try {
    dotenv.config({ path: '.env.test' });

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    const dbName = process.env.MYSQL_ROOT_DBNAME;
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\``,
    );

    await connection.end();
  } catch (err) {
    console.error('globalSetup failed:', err);
    throw err;
  }
};
