
const ADMIN_CLASS = "trap-admin-route";

function setViewportHeight() {
  const height =
    window.visualViewport?.height ||
    window.innerHeight;

  document.documentElement.style.setProperty(
    "--admin-viewport-height",
    `${Math.round(height)}px`
  );
}

function setAdminRouteClass() {
  const active =
    window.location.pathname.startsWith(
      "/admin"
    );

  document.documentElement.classList.toggle(
    ADMIN_CLASS,
    active
  );

  document.body?.classList.toggle(
    ADMIN_CLASS,
    active
  );

  if (active) {
    setViewportHeight();
  }
}

export function runAdminOverflowAudit() {
  if (
    !window.location.pathname.startsWith(
      "/admin"
    )
  ) {
    return [];
  }

  const viewportWidth =
    document.documentElement.clientWidth;

  const offenders = [
    ...document.querySelectorAll(
      "[data-admin-shell] *"
    ),
  ]
    .filter((element) => {
      const rect =
        element.getBoundingClientRect();

      return (
        rect.width > 0 &&
        (
          rect.right >
            viewportWidth + 2 ||
          rect.left < -2
        )
      );
    })
    .slice(0, 25)
    .map((element) => ({
      tag: element.tagName,
      className:
        typeof element.className ===
        "string"
          ? element.className
          : "",
      rect:
        element
          .getBoundingClientRect()
          .toJSON?.() || {},
    }));

  if (
    import.meta.env.DEV &&
    offenders.length
  ) {
    console.groupCollapsed(
      `[TRAP admin UI] ${offenders.length} horizontal overflow candidate(s)`
    );
    console.table(offenders);
    console.groupEnd();
  }

  return offenders;
}

function scheduleAudit() {
  window.clearTimeout(
    window.__trapAdminAuditTimer
  );

  window.__trapAdminAuditTimer =
    window.setTimeout(
      runAdminOverflowAudit,
      350
    );
}

setAdminRouteClass();

window.visualViewport?.addEventListener(
  "resize",
  () => {
    setViewportHeight();
    scheduleAudit();
  }
);

window.addEventListener(
  "resize",
  () => {
    setViewportHeight();
    scheduleAudit();
  },
  {
    passive: true,
  }
);

window.addEventListener(
  "orientationchange",
  () => {
    window.setTimeout(() => {
      setViewportHeight();
      scheduleAudit();
    }, 120);
  },
  {
    passive: true,
  }
);

window.addEventListener(
  "popstate",
  setAdminRouteClass
);

window.addEventListener(
  "load",
  scheduleAudit,
  {
    once: true,
  }
);

window.__TRAP_ADMIN_UI_AUDIT__ =
  runAdminOverflowAudit;
