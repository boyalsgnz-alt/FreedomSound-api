// test/global-teardown.ts
import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

export default async () => {
  // dotenv.config({ path: '.env.test' });
  //
  // const connection = await mysql.createConnection({
  //   host: process.env.MYSQL_HOST,
  //   port: Number(process.env.MYSQL_PORT),
  //   user: process.env.MYSQL_USER,
  //   password: process.env.MYSQL_PASSWORD,
  // });
  //
  // const dbName = process.env.MYSQL_ROOT_DBNAME;
  // await connection.query(`DROP DATABASE \`${dbName}\``);
  //
  // await connection.end();
};
