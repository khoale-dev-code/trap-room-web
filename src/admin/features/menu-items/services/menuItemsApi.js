
import { api } from "../../../../lib/api.js";

export function listMenuItems() {
  return api.products.list();
}

export function listMenuCategories() {
  return api.categories.list();
}

export function createMenuItem(payload) {
  return api.products.create(payload);
}

export function updateMenuItem(id, payload) {
  return api.products.update(id, payload);
}

export function removeMenuItem(id) {
  return api.products.remove(id);
}

export async function uploadMenuItemMedia(files) {
  if (!files.length) {
    return { media: [] };
  }

  if (typeof api.upload === "function") {
    return api.upload(files);
  }

  if (typeof api.uploadMedia === "function") {
    return api.uploadMedia(files);
  }

  const error = new Error("Media upload API is unavailable.");
  error.code = "UPLOAD_API_UNAVAILABLE";
  throw error;
}
