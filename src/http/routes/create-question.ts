import { and, eq, sql } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../config/db/connection.ts';
import { schema } from '../../config/db/schemas/index.ts';
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts';

export const createQuestionsInRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/room/:roomId/question',
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

      const embeddings = generateEmbeddings(question);

      const embeddingsAsStrings = `[${(await embeddings).join(',')}]`;

      const chunks = await db
        .select({
          id: schema.audioChuncks.id,
          transcription: schema.audioChuncks.transcription,
          similarity: sql<number>`1 - (${schema.audioChuncks.embeddings} <=> ${embeddingsAsStrings}::vector)`,
        })
        .from(schema.audioChuncks)
        .where(
          and(
            eq(schema.audioChuncks.roomId, roomId),
            sql`1-(${schema.audioChuncks.embeddings} <=> ${embeddingsAsStrings}::vector) > 0.7`
          )
        )
        .orderBy(
          sql`${schema.audioChuncks.embeddings} <=> ${embeddingsAsStrings}::vector`
        )
        .limit(3);

      let answer: string | null = null;

      if (chunks.length > 0) {
        const transcriptions = chunks.map((chunk) => chunk.transcription);

        answer = await generateAnswer(question, transcriptions);
      }
      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
          answer,
        })
        .returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error('Failed to create question');
      }

      return reply
        .status(201)
        .send({ questionId: insertedQuestion.id, answer });
    }
  );
};
