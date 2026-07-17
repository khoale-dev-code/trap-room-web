
import { api } from "../../../../lib/api.js";

export function listCategories() {
  return api.categories.list();
}

export function createCategory(payload) {
  return api.categories.create(payload);
}

export function updateCategory(id, payload) {
  return api.categories.update(id, payload);
}

export function removeCategory(id) {
  return api.categories.remove(id);
}

export function reorderCategories(ids) {
  return api.categories.reorder(ids);
}
