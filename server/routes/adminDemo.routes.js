
import express from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  clearAdminDemoData,
  getAdminDemoStatus,
  seedAdminDemoData,
} from "../services/adminDemo.service.js";

const router = express.Router();

router.get(
  "/status",
  requireAdmin,
  async (req, res, next) => {
    try {
      res.set("Cache-Control", "no-store");

      return res.json({
        ok: true,
        status: await getAdminDemoStatus(),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  "/seed",
  requireAdmin,
  async (req, res, next) => {
    try {
      const status = await seedAdminDemoData();

      res.set("Cache-Control", "no-store");

      return res.status(201).json({
        ok: true,
        message:
          "Admin training data is ready.",
        status,
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.delete(
  "/",
  requireAdmin,
  async (req, res, next) => {
    try {
      const result =
        await clearAdminDemoData();

      res.set("Cache-Control", "no-store");

      return res.json({
        ...result,
        message:
          "Admin training data was removed.",
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
