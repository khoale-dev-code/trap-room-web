
export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 23;
export const SLOT_MINUTES = 15;
export const MINUTE_HEIGHT = 1;

export const CALENDAR_HEIGHT =
  (CALENDAR_END_HOUR - CALENDAR_START_HOUR) *
  60 *
  MINUTE_HEIGHT;

export const EMPTY_SHIFT_FORM = Object.freeze({
  id: "",
  date: "",
  startTime: "09:00",
  endTime: "13:00",
  title: "Store shift",
  position: "General",
  employeeIds: [],
  requiredStaff: 1,
  status: "published",
  note: "",
});
