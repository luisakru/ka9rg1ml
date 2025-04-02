import express from "express";
import { logger } from "./utils/utils";
import { WEBHOOK_PORT } from "./config";
import webhookRoutes from "./routes/webhookRoutes";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";

export const webhookApp = express();

webhookApp.use(loggerMiddleware);

webhookApp.use(express.json());

webhookApp.post("/", webhookRoutes);

webhookApp.use(function (_req, _res, next) {
    next(new Error('Method is not allowed.'))
})
webhookApp.use(errorMiddleware);

webhookApp.listen(WEBHOOK_PORT, () => logger.info(`Webhook server running on port ${WEBHOOK_PORT}...`));
