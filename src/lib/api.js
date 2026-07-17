import { notifyDataChanged } from "./dataSync.js";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function makeQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

async function request(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const isFormData = options.body instanceof FormData;

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      cache: method === "GET" ? "no-store" : "default",
      ...options,
      method,
      headers: isFormData
        ? options.headers
        : {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
    });
  } catch {
    throw new Error("Unable to connect to the API server on port 4000.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        (typeof data === "string" && data) ||
        "The request could not be completed."
    );

    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  const mutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  const affectsPublicData =
    mutation &&
    !path.startsWith("/auth/") &&
    path !== "/upload";

  if (affectsPublicData) {
    notifyDataChanged({ path, method });
  }

    /* TRAP_JOURNAL_MUTATION_SYNC */
  const isMutation =
    !["GET", "HEAD", "OPTIONS"].includes(method);

  if (
    isMutation &&
    !String(path).startsWith("/auth/") &&
    String(path) !== "/upload"
  ) {
    const resource =
      String(path).startsWith("/posts")
        ? "posts"
        : "all";

    notifyDataChanged({
      resource,
      path: String(path),
      method,
      timestamp: Date.now(),
    });
  }

return data;
}

function crud(path) {
  return {
    list(params = {}) {
      const query = makeQuery(params);
      return request(`${path}${query ? `?${query}` : ""}`);
    },

    create(payload) {
      return request(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    update(id, payload) {
      return request(`${path}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    remove(id) {
      return request(`${path}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

export const api = {
  
  uploadMedia(files = []) {
    const list = Array.from(files || []).filter(Boolean);

    if (!list.length) {
      return Promise.reject(
        new Error("Please select at least one file to upload.")
      );
    }

    const formData = new FormData();

    list.forEach((file) => {
      formData.append(
        "files",
        file,
        file?.name || "upload"
      );
    });

    return request("/upload", {
      method: "POST",
      body: formData,
    });
  },

request,

  auth: {
    login(payload) {
      return request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    logout() {
      return request("/auth/logout", { method: "POST" });
    },

    me() {
      return request("/auth/me");
    },
  },

  getPublicStore() {
    return request(`/public-store?t=${Date.now()}`);
  },

  getSummary() {
    return request(`/admin/summary?t=${Date.now()}`);
  },

  getShop() {
    return request(`/shop?t=${Date.now()}`);
  },

  updateShop(payload) {
    return request("/shop", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  upload(files) {
    const body = new FormData();

    Array.from(files || []).forEach((file) => {
      body.append("files", file);
    });

    return request("/upload", {
      method: "POST",
      body,
    });
  },

  categories: {
    ...crud("/categories"),
    reorder(ids) {
      return request("/categories/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids }),
      });
    },
  },

  products: {
    ...crud("/products"),
    reorder(ids) {
      return request("/products/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids }),
      });
    },
  },

  toppings: crud("/toppings"),
  posts: crud("/posts"),
  promotions: crud("/promotions"),
  gallery: crud("/gallery"),

  reservations: {
    ...crud("/reservations"),
    createAdmin(payload) {
      return request("/reservations/admin", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
};
