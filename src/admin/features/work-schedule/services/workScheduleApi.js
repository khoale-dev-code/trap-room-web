
import { api } from "../../../../lib/api.js";

export async function fetchEmployees() {
  return api.request(`/employees?t=${Date.now()}`);
}

export async function fetchWorkShifts(from, to) {
  try {
    return await api.request(
      `/work-shifts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
        to
      )}&t=${Date.now()}`
    );
  } catch {
    return api.request(`/work-shifts?t=${Date.now()}`);
  }
}

export function createWorkShift(payload) {
  return api.request("/work-shifts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWorkShift(id, payload) {
  return api.request(`/work-shifts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteWorkShift(id) {
  return api.request(`/work-shifts/${id}`, {
    method: "DELETE",
  });
}

