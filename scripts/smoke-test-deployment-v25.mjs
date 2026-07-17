const rawBaseUrl =
  process.env.API_BASE_URL ||
  process.argv[2] ||
  "";

if (!rawBaseUrl) {
  console.error(
    "Usage: npm run deploy:smoke -- https://YOUR-RAILWAY-DOMAIN.up.railway.app"
  );
  process.exit(1);
}

const baseUrl =
  rawBaseUrl.replace(/\/+$/, "");

const checks = [
  {
    name: "Railway health",
    url: `${baseUrl}/api/health`,
    validate(data) {
      return data?.ok === true;
    },
  },
  {
    name: "Public store",
    url: `${baseUrl}/api/public-store`,
    validate(data) {
      return Boolean(
        data &&
        typeof data === "object"
      );
    },
  },
];

let failed = false;

for (const check of checks) {
  try {
    const started = Date.now();

    const response = await fetch(
      check.url,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data =
      await response
        .json()
        .catch(() => null);

    const elapsed =
      Date.now() - started;

    if (
      !response.ok ||
      !check.validate(data)
    ) {
      failed = true;
      console.error(
        `FAIL ${check.name}: HTTP ${response.status} (${elapsed} ms)`
      );
      continue;
    }

    console.log(
      `PASS ${check.name}: HTTP ${response.status} (${elapsed} ms)`
    );
  } catch (error) {
    failed = true;
    console.error(
      `FAIL ${check.name}: ${error.message}`
    );
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  "Deployment smoke test passed."
);
