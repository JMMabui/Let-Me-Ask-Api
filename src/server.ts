import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env.ts';
import { createQuestionsInRoute } from './http/routes/create-question.ts';
import { createRoomsRoute } from './http/routes/create-room.ts';
import { getRoomsRoute } from './http/routes/get-rooms.ts';
import { getRoomQuestionsRoute } from './http/routes/get-rooms-question.ts';

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
app.register(fastifyCors, {
  origin: 'http://localhost:5173',
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return { status: 'OK' };
});

app.register(getRoomsRoute);
app.register(createRoomsRoute);
app.register(getRoomQuestionsRoute);
app.register(createQuestionsInRoute);

app.listen({ port: env.PORT }).then(() => {
  app.log.info(`HTTP server running on http://localhost:${env.PORT}`);
});
