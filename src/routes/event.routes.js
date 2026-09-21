import { Router } from "express";
import { requireApiKey } from "../middlewares/apikey.middleware.js";

const router = Router();

// Lets a producer confirm its key works
router.get("/whoami", requireApiKey, (req, res) => {
  res.status(200).json({ producer: req.producer });
});

export default router;