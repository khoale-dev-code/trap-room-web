
import { useCallback, useEffect, useState } from "react";
import {
  createWorkShift,
  deleteWorkShift,
  fetchEmployees,
  fetchWorkShifts,
  updateWorkShift,
} from "../services/workScheduleApi.js";
import {
  normalizeEmployees,
  normalizeShifts,
} from "../utils/schedule.js";

export function useWorkSchedule({ from, to, copy }) {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const load = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);

      try {
        const [employeeResponse, shiftResponse] = await Promise.all([
          fetchEmployees(),
          fetchWorkShifts(from, to),
        ]);

        setEmployees(normalizeEmployees(employeeResponse));
        setShifts(normalizeShifts(shiftResponse));
        setNotice({ type: "", text: "" });
      } catch (error) {
        setNotice({
          type: "error",
          text: error?.message || copy.loadError,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [copy.loadError, from, to]
  );

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async ({ id, payload }) => {
      try {
        id
          ? await updateWorkShift(id, payload)
          : await createWorkShift(payload);

        setNotice({
          type: "success",
          text: id ? copy.updated : copy.created,
        });

        notifyWorkScheduleChange();
        await load({ silent: true });
        return true;
      } catch (error) {
        setNotice({
          type: "error",
          text: error?.message || copy.saveError,
        });
        return false;
      }
    },
    [copy.created, copy.saveError, copy.updated, load]
  );

  const remove = useCallback(
    async (id) => {
      try {
        await deleteWorkShift(id);
        setNotice({ type: "success", text: copy.deleted });
        notifyWorkScheduleChange();
        await load({ silent: true });
        return true;
      } catch (error) {
        setNotice({
          type: "error",
          text: error?.message || copy.deleteError,
        });
        return false;
      }
    },
    [copy.deleteError, copy.deleted, load]
  );

  const move = useCallback(
    async (id, payload) => {
      try {
        await updateWorkShift(id, payload);
        setNotice({ type: "success", text: copy.moved });
        notifyWorkScheduleChange();
        await load({ silent: true });
        return true;
      } catch (error) {
        setNotice({
          type: "error",
          text: error?.message || copy.moveError,
        });
        await load({ silent: true });
        return false;
      }
    },
    [copy.moveError, copy.moved, load]
  );

  return {
    employees,
    shifts,
    loading,
    refreshing,
    notice,
    setNotice,
    load,
    save,
    remove,
    move,
  };
}

function notifyWorkScheduleChange() {
  const version = String(Date.now());

  try {
    localStorage.setItem("trap:data-version", version);
  } catch {
    // Storage may be unavailable in private browsing.
  }

  window.dispatchEvent(
    new CustomEvent("trap:data-changed", {
      detail: {
        resource: "work-shifts",
        version,
      },
    })
  );
}
