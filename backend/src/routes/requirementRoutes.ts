import { Router } from "express";
import {
  createRequirement,
  getRequirements,
} from "../controllers/requirementController";

const router = Router();

router.get("/", getRequirements);
router.post("/", createRequirement);

export default router;
