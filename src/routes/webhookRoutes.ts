import { Router } from "express";
import { handleWebhookEvent } from "../controller/webhookController";

const router = Router();

router.post('/', handleWebhookEvent);

export default router;