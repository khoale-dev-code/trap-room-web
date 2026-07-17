import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

function configureNodeDns() {
  const dnsServers = String(process.env.DNS_SERVERS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (dnsServers.length === 0) {
    return;
  }

  dns.setServers(dnsServers);

  console.log(
    `[dns] Node DNS servers: ${dns.getServers().join(", ")}`
  );
}

export async function connectDatabase() {
  configureNodeDns();

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== "production",
    serverSelectionTimeoutMS: 15000,
  });

  console.log(
    `[db] MongoDB connected: ${mongoose.connection.name}`
  );
}