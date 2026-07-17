
import { timeToMinutes } from "./dateTime.js";

const COLORS = [
  "#011ea0",
  "#ef4d05",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#db2777",
  "#b45309",
];

export function extractList(response, aliases) {
  if (Array.isArray(response)) return response;

  for (const alias of aliases) {
    const candidate = response?.[alias];

    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const nested = extractList(candidate, aliases);
      if (nested.length) return nested;
    }
  }

  return [];
}

export function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || "");
}

export function normalizeEmployees(response) {
  return extractList(response, ["employees", "items", "data", "results"])
    .map((employee, index) => {
      const id = getId(employee);

      return {
        ...employee,
        id,
        fullName:
          employee.fullName ||
          employee.name ||
          employee.displayName ||
          employee.username ||
          `Staff ${index + 1}`,
        position: employee.position || "",
        role: employee.role || "",
        color: employee.color || colorForKey(id || index),
      };
    })
    .filter((employee) => employee.id && employee.isActive !== false);
}

export function normalizeShifts(response) {
  return extractList(response, ["shifts", "workShifts", "items", "data", "results"])
    .map((shift) => ({
      ...shift,
      id: getId(shift),
      date: String(shift.date || ""),
      startTime: String(shift.startTime || "09:00"),
      endTime: String(shift.endTime || "13:00"),
      title: shift.title || "Store shift",
      position: shift.position || "General",
      employeeIds: Array.isArray(shift.employeeIds) ? shift.employeeIds : [],
      requiredStaff: Number(shift.requiredStaff || 1),
      status: shift.status || "published",
      note: shift.note || "",
    }))
    .filter(
      (shift) =>
        shift.id &&
        /^\d{4}-\d{2}-\d{2}$/.test(shift.date) &&
        timeToMinutes(shift.endTime) > timeToMinutes(shift.startTime)
    )
    .sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
    );
}

export function getShiftEmployeeIds(shift) {
  return (Array.isArray(shift.employeeIds) ? shift.employeeIds : [])
    .map(getId)
    .filter(Boolean);
}

export function getShiftEmployees(shift, employees) {
  const ids = getShiftEmployeeIds(shift);

  const populated = (Array.isArray(shift.employeeIds) ? shift.employeeIds : [])
    .filter((value) => value && typeof value === "object")
    .map((employee) => ({
      ...employee,
      id: getId(employee),
      fullName:
        employee.fullName ||
        employee.name ||
        employee.username ||
        "Staff",
      color: employee.color || colorForKey(getId(employee)),
    }));

  const byId = new Map(
    [...employees, ...populated].map((employee) => [employee.id, employee])
  );

  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export function buildShiftPayload(form) {
  return {
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    title: String(form.title || "Store shift").trim(),
    position: String(form.position || "General").trim(),
    employeeIds: form.employeeIds,
    requiredStaff: Number(form.requiredStaff || 1),
    status: form.status || "published",
    note: String(form.note || "").trim(),
  };
}

export function validateShiftPayload(payload, copy) {
  if (!payload.date) return copy.invalidDate;

  if (timeToMinutes(payload.endTime) <= timeToMinutes(payload.startTime)) {
    return copy.invalidTime;
  }

  if (payload.requiredStaff < 1) {
    return copy.invalidRequiredStaff;
  }

  return "";
}

export function layoutDayShifts(shifts) {
  const sorted = [...shifts].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const result = [];
  let group = [];
  let groupEnd = -1;

  function flush() {
    if (!group.length) return;

    const columns = [];
    const groupKey = group[0].id;

    group.forEach((shift) => {
      const start = timeToMinutes(shift.startTime);
      let column = columns.findIndex((end) => end <= start);

      if (column < 0) column = columns.length;

      columns[column] = timeToMinutes(shift.endTime);
      result.push({ shift, column, columns: 1, groupKey });
    });

    const count = Math.max(columns.length, 1);

    result
      .filter((item) => item.groupKey === groupKey)
      .forEach((item) => {
        item.columns = count;
      });

    group = [];
  }

  sorted.forEach((shift) => {
    const start = timeToMinutes(shift.startTime);
    const end = timeToMinutes(shift.endTime);

    if (group.length && start >= groupEnd) {
      flush();
      groupEnd = -1;
    }

    group.push(shift);
    groupEnd = Math.max(groupEnd, end);
  });

  flush();
  return result;
}

export function buildStats(shifts, employees, from, to) {
  const active = shifts.filter(
    (shift) =>
      shift.date >= from &&
      shift.date <= to &&
      shift.status !== "cancelled"
  );

  const staffIds = new Set(active.flatMap(getShiftEmployeeIds));

  const hours = active.reduce(
    (total, shift) =>
      total +
      Math.max(
        0,
        timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)
      ) /
        60,
    0
  );

  const shortStaffed = active.filter(
    (shift) =>
      getShiftEmployeeIds(shift).length <
      Number(shift.requiredStaff || 1)
  ).length;

  return {
    shifts: active.length,
    staff: Math.min(staffIds.size, employees.length),
    hours,
    shortStaffed,
  };
}

export function getShiftColor(shift, assignedEmployees) {
  if (shift.status === "cancelled") return "#94a3b8";
  if (shift.status === "draft") return "#ef4d05";

  return (
    assignedEmployees[0]?.color ||
    colorForKey(shift.position || shift.title)
  );
}

export function colorForKey(value) {
  const text = String(value || "");
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }

  return COLORS[Math.abs(hash) % COLORS.length];
}

export function getInitials(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}
