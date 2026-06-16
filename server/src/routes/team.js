import { Router } from "express";
import { all, insert, remove } from "../db.js";
import { requireAuth } from "../auth.js";
import { asyncHandler, HttpError, uid } from "../util.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (_req, res) => {
  res.json(all("team"));
}));

router.post("/", asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name?.trim()) throw new HttpError(400, "Member name is required");
  const record = { color: "#475569", role: "", email: "", ...body, id: uid("t") };
  insert("team", record);
  res.status(201).json(record);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const ok = remove("team", req.params.id);
  if (!ok) throw new HttpError(404, "Team member not found");
  res.json({ id: req.params.id });
}));

export default router;
