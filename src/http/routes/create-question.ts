import { eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../config/db/connection.ts';
import { schema } from '../../config/db/schemas/index.ts';

export const createQuestionsInRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1, 'Question is required'),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;

      // Validate that the room exists
      const roomExists = await db
        .select()
        .from(schema.rooms)
        .where(eq(schema.rooms.id, roomId));

      if (roomExists.length === 0) {
        return reply.status(404).send({ error: 'Room not found' });
      }

      const { question } = request.body;

      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
        })
        .returning();

      if (!result[0]) {
        throw new Error('Failed to create question');
      }

      return reply.status(201).send({ questionId: result[0].id });
    }
  );
};
