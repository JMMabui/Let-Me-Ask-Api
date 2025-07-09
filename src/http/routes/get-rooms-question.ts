import { desc, eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../config/db/connection.ts';
import { schema } from '../../config/db/schemas/index.ts';

export const getRoomQuestionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomsId/questions',
    {
      schema: {
        params: z.object({
          roomsId: z.string(),
        }),
      },
    },
    async (request) => {
      const { roomsId } = request.params;

      const result = await db
        .select({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
          createdAt: schema.questions.createdAt,
        })
        .from(schema.questions)
        .where(eq(schema.questions.roomId, roomsId))
        .orderBy(desc(schema.questions.createdAt));

      return result;
    }
  );
};
