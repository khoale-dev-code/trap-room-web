import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import postRoutes from "./routes/post.routes.js";
import productRoutes from "./routes/product.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import publicStoreRoutes from "./routes/publicStore.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import toppingRoutes from "./routes/topping.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import localizationRoutes from "./routes/localization.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import shopHoursRoutes from "./routes/shopHours.routes.js";
import adminDemoRoutes from "./routes/adminDemo.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import workShiftRoutes from "./routes/workShift.routes.js";
import adminTranslationsRoutes from "./routes/adminTranslations.routes.js";
import homepageMediaRoutes from "./routes/homepageMedia.routes.js";
import apiCompatibilityRoutes from "./routes/apiCompatibility.routes.js";
import { isPrivateDevelopmentOrigin } from "./config/developmentOrigins.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || (env.clientOrigins.includes(origin) || isPrivateDevelopmentOrigin(origin))) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin is not allowed: ${origin}`)
      );
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "4mb",
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "trap-room-api",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-demo", adminDemoRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/shop/homepage-media", homepageMediaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", apiCompatibilityRoutes);
app.use("/api/products", productRoutes);
app.use("/api/toppings", toppingRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public-store", publicStoreRoutes);
app.use("/api/localization", localizationRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/shop-hours", shopHoursRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/work-shifts", workShiftRoutes);
app.use("/api/translations-admin", adminTranslationsRoutes);

if (env.nodeEnv === "production") {
  const dist = path.resolve(__dirname, "../dist");
  app.use(express.static(dist));

  app.get("*", (req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("[api]", error);

  const status = Number(
    error.statusCode ||
      (error.name === "ValidationError" ? 400 : 500)
  );

  res.status(status).json({
    message:
      status >= 500
        ? "The server encountered an error. Please try again."
        : error.message,
  });
});

async function bootstrap() {
  await connectDatabase();

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`[api] running on http://localhost:${env.port}`);
    console.log(
      `[api] client origin: ${env.clientOrigins.join(", ")}`
    );
  });
}

bootstrap().catch((error) => {
  console.error("[api] startup failed:", error.message);
  process.exit(1);
});

export default app;
