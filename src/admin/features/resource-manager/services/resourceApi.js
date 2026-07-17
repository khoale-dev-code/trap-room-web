
import { api } from "../../../../lib/api.js";

function getResourceApi(config) {
  const resourceApi = api?.[config?.api];

  if (!resourceApi) {
    throw new Error(`Unknown API resource: ${config?.api || "undefined"}`);
  }

  return resourceApi;
}

export function listResources(config) {
  return getResourceApi(config).list();
}

export function createResource(config, payload) {
  return getResourceApi(config).create(payload);
}

export function updateResource(config, id, payload) {
  return getResourceApi(config).update(id, payload);
}

export function removeResource(config, id) {
  return getResourceApi(config).remove(id);
}

export function listResourceCategories() {
  return api.categories.list();
}

export async function uploadResourceMedia(files) {
  if (!files.length) {
    return { media: [] };
  }

  if (typeof api.upload === "function") {
    return api.upload(files);
  }

  if (typeof api.uploadMedia === "function") {
    return api.uploadMedia(files);
  }

  throw new Error("Media upload API is unavailable.");
}
