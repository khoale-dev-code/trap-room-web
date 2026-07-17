
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import {
  clearAdminDemoData,
  getAdminDemoStatus,
  seedAdminDemoData,
} from "../services/adminDemo.service.js";

const clearMode =
  process.argv.includes("--clear");

try {
  await connectDatabase();

  const result = clearMode
    ? await clearAdminDemoData()
    : await seedAdminDemoData();

  console.log(
    clearMode
      ? "Admin demo data removed."
      : "Admin demo data seeded."
  );

  console.log(
    JSON.stringify(
      clearMode
        ? result
        : {
            status: await getAdminDemoStatus(),
          },
      null,
      2
    )
  );
} catch (error) {
  console.error(
    "[admin-demo]",
    error
  );

  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(
    () => null
  );
}
