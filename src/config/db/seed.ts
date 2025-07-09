import { reset, seed } from 'drizzle-seed';

import { db, sql } from './connection.ts';
import { schema } from './schemas/index.ts';

await reset(db, schema);

await seed(db, schema).refine((result) => {
  return {
    rooms: {
      count: 20,
      columns: { name: result.companyName(), description: result.loremIpsum() },
      with: {
        questions: 5,
      },
    },
  };
});

await sql.end();

// biome-ignore lint/suspicious/noConsole: used only for dev
console.log('Database seeded successfully');
