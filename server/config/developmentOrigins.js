
export function isPrivateDevelopmentOrigin(origin) {
  if (
    process.env.NODE_ENV === "production" ||
    !origin
  ) {
    return false;
  }

  try {
    const url = new URL(origin);
    const port = url.port || (
      url.protocol === "https:" ? "443" : "80"
    );

    if (!["5173", "4173"].includes(port)) {
      return false;
    }

    const host = url.hostname;

    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^10\.(?:\d{1,3}\.){2}\d{1,3}$/.test(host) ||
      /^192\.168\.(?:\d{1,3}\.)\d{1,3}$/.test(host) ||
      /^172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3}\.)\d{1,3}$/.test(host)
    );
  } catch {
    return false;
  }
}
