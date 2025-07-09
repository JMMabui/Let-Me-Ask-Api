import { count, eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { db } from '../../config/db/connection.ts';
import { schema } from '../../config/db/schemas/index.ts';

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    const result = await db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        createdAt: schema.rooms.createdAt,
        questionsCount: count(schema.questions.id),
      })
      .from(schema.rooms)
      .leftJoin(schema.questions, eq(schema.rooms.id, schema.questions.roomId))
      .groupBy(schema.rooms.id, schema.rooms.name)
      .orderBy(schema.rooms.createdAt);

    return result;
  });
};
