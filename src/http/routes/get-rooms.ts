import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { db } from '../../config/db/connection.ts';
import { schema } from '../../config/db/schemas/index.ts';

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', async () => {
    const result = await db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        description: schema.rooms.description,
        createdAt: schema.rooms.createdAt,
      })
      .from(schema.rooms)
      .orderBy(schema.rooms.createdAt);

    return result;
  });
};
