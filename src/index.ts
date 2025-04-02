import express from "express";
import customerRoutes from "./routes/customerRoutes";
import tokenRoutes from "./routes/tokenRoutes";
import { logger } from "./utils/utils";
import { API_PORT } from "./config";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";

export const app = express();

app.use(express.json());

app.use(loggerMiddleware);

app.use(tokenRoutes);
app.use(customerRoutes);

app.use(function (_req, _res, next) {
    next(new Error('Method is not allowed.'))
})
app.use(errorMiddleware);

app.listen(API_PORT, () => logger.info(`Server running on port ${API_PORT}...`));
