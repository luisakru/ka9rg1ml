import { Router } from "express";
import { createToken } from "../controller/tokenController";

const router = Router();

router.get('/get-token/:role', createToken);

export default router;