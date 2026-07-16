// test/utils/clear-db.ts
import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

  for (const entity of entities) {
    await dataSource.query(`TRUNCATE TABLE \`${entity.tableName}\`;`);
  }

  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
}

export async function debugDb(dataSource: DataSource) {
  const test = await dataSource.query("SELECT * FROM track");
  console.log(test);
}
