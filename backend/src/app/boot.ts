import { Application } from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../config/swaggerConfig';
import database from "./database";
import modules from "./modules";
import expressSetup from "./express";
import bullMQ from "./bull";
import waitForPostgresConnection from "./awaitPostgresConnection";

export default async function bootstrap(app: Application): Promise<void> {
  await waitForPostgresConnection();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  await expressSetup(app);
  await database(app);
  await modules(app);
  await bullMQ(app);
}
