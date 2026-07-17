
import { useEffect } from "react";

export function useMobileEditorLock(open) {
  useEffect(() => {
    if (!open || typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 1279px)");

    if (!mediaQuery.matches) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
}
