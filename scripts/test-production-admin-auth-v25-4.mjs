const rawUrl =
  process.env.AUTH_TEST_URL ||
  process.argv[2] ||
  "";

const username =
  process.env.AUTH_TEST_USERNAME ||
  "";

const password =
  process.env.AUTH_TEST_PASSWORD ||
  "";

if (
  !rawUrl ||
  !username ||
  !password
) {
  console.error(
    [
      "Missing auth test values.",
      "",
      "PowerShell:",
      '$env:AUTH_TEST_URL="https://YOUR-DOMAIN"',
      '$env:AUTH_TEST_USERNAME="admin"',
      '$env:AUTH_TEST_PASSWORD="YOUR_PASSWORD"',
      "node scripts/test-production-admin-auth-v25-4.mjs",
    ].join("\n")
  );

  process.exit(1);
}

const baseUrl =
  rawUrl.replace(/\/+$/, "");

const cookieJar = new Map();

function storeCookies(response) {
  const header =
    response.headers.get(
      "set-cookie"
    );

  if (!header) {
    return;
  }

  for (
    const part of
    header.split(/,(?=[^;,]+=)/)
  ) {
    const pair =
      part.split(";")[0];

    const separator =
      pair.indexOf("=");

    if (separator < 1) {
      continue;
    }

    cookieJar.set(
      pair
        .slice(0, separator)
        .trim(),
      pair
        .slice(separator + 1)
        .trim()
    );
  }
}

function cookieHeader() {
  return [
    ...cookieJar.entries(),
  ]
    .map(
      ([name, value]) =>
        `${name}=${value}`
    )
    .join("; ");
}

async function readResponse(
  response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response
      .json()
      .catch(() => ({}));
  }

  return response
    .text()
    .catch(() => "");
}

async function run() {
  const loginStarted =
    Date.now();

  const loginResponse =
    await fetch(
      `${baseUrl}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept:
            "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        redirect: "manual",
      }
    );

  const loginBody =
    await readResponse(
      loginResponse
    );

  storeCookies(
    loginResponse
  );

  console.log(
    `LOGIN HTTP ${loginResponse.status} (${Date.now() - loginStarted} ms)`
  );

  console.log(
    JSON.stringify(
      loginBody,
      null,
      2
    )
  );

  if (!loginResponse.ok) {
    process.exit(1);
  }

  if (!cookieJar.size) {
    console.error(
      "Login returned 200 but no Set-Cookie header was received."
    );
    process.exit(1);
  }

  const meResponse =
    await fetch(
      `${baseUrl}/api/auth/me`,
      {
        headers: {
          Accept:
            "application/json",
          Cookie:
            cookieHeader(),
        },
      }
    );

  const meBody =
    await readResponse(
      meResponse
    );

  console.log(
    `ME HTTP ${meResponse.status}`
  );

  console.log(
    JSON.stringify(
      meBody,
      null,
      2
    )
  );

  if (!meResponse.ok) {
    process.exit(1);
  }

  console.log(
    "Production Admin authentication test passed."
  );
}

run().catch((error) => {
  console.error(
    "Authentication test failed:",
    error.message
  );
  process.exit(1);
});
