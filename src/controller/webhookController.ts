import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/utils";
import { processHubspotEvent } from "../services/webhookService";
import { HubspotEvent } from "../types/HubspotEvent";

export const handleWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
    const events = req.body as unknown as HubspotEvent[];

    try {
        await Promise.all(events.map(event => processHubspotEvent(event)));

        res.sendStatus(200);
        return;
    } catch (error) {
        logger.error("Error processing webhook events", error);
        next(error);
        return;
    }
}