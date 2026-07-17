
import net from "node:net";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4000;
const DEFAULT_TIMEOUT_MS = 12000;
const RETRY_DELAY_MS = 120;

export default function apiReadinessPlugin(options = {}) {
  const host = options.host || DEFAULT_HOST;
  const port = Number(options.port || DEFAULT_PORT);
  const timeoutMs = Number(
    options.timeoutMs || DEFAULT_TIMEOUT_MS
  );

  let sharedWait = null;

  async function waitUntilReady() {
    if (!sharedWait) {
      sharedWait = waitForTcp({
        host,
        port,
        timeoutMs,
      }).finally(() => {
        sharedWait = null;
      });
    }

    return sharedWait;
  }

  return {
    name: "trap-api-readiness",
    configureServer(server) {
      server.middlewares.use(
        async (request, response, next) => {
          const url = String(
            request.url || ""
          );

          if (!url.startsWith("/api/")) {
            next();
            return;
          }

          const ready =
            await waitUntilReady();

          if (ready) {
            next();
            return;
          }

          response.statusCode = 503;
          response.setHeader(
            "Content-Type",
            "application/json; charset=utf-8"
          );
          response.setHeader(
            "Retry-After",
            "1"
          );

          response.end(
            JSON.stringify({
              ok: false,
              message:
                "API is restarting. Please retry in a moment.",
            })
          );
        }
      );
    },
  };
}

function waitForTcp({
  host,
  port,
  timeoutMs,
}) {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    function attempt() {
      const socket = net.createConnection({
        host,
        port,
      });

      let settled = false;

      function finish(value) {
        if (settled) {
          return;
        }

        settled = true;
        socket.destroy();
        resolve(value);
      }

      socket.setTimeout(500);

      socket.once("connect", () => {
        finish(true);
      });

      socket.once("timeout", retry);
      socket.once("error", retry);

      function retry() {
        if (settled) {
          return;
        }

        settled = true;
        socket.destroy();

        if (
          Date.now() - startedAt >=
          timeoutMs
        ) {
          resolve(false);
          return;
        }

        setTimeout(
          attempt,
          RETRY_DELAY_MS
        );
      }
    }

    attempt();
  });
}
