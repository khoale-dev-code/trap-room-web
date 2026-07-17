
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath =
  path.join(root, "server/index.js");

const source =
  fs.readFileSync(
    indexPath,
    "utf8"
  );

const mounts = [
  ...source.matchAll(
    /app\.use\(\s*["']([^"']+)["']/g
  ),
].map((match) => match[1]);

console.log(
  JSON.stringify(
    {
      compatibilityMounted:
        source.includes(
          'app.use("/api", apiCompatibilityRoutes);'
        ),
      mountedApiPaths:
        mounts.filter(
          (value) =>
            value.startsWith("/api")
        ),
      fixedAliases: [
        "/api/menu-items",
        "/api/extras",
        "/api/journal-posts",
        "/api/products/:id",
      ],
    },
    null,
    2
  )
);
