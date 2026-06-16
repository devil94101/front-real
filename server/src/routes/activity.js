import { Router } from "express";
import { all } from "../db.js";
import { requireAuth } from "../auth.js";
import { asyncHandler } from "../util.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (_req, res) => {
  res.json(all("activity"));
}));

export default router;
