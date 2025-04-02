import { Router } from "express";
import { postCustomer, getCustomer, putCustomer } from "../controller/customerController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.post("/", authMiddleware, roleMiddleware(['admin']), postCustomer);
router.get("/:email", authMiddleware, roleMiddleware(['admin', 'user']), getCustomer);
router.put("/:email", authMiddleware, roleMiddleware(['admin']), putCustomer);

export default router;