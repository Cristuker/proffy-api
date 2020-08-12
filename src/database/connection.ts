import knex from 'knex';
import { resolve } from 'path';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: resolve(__dirname, 'database.sqlite'),
  },
  useNullAsDefault: true, // Ultilizar nulo para campos não preenchidos
});

export default db;
