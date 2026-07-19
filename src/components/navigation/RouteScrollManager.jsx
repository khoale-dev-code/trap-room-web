import {
  useLayoutEffect,
  useRef,
} from "react";
import {
  useLocation,
} from "react-router-dom";

const INITIAL_RESET_DELAYS = [
  0,
  40,
  120,
  320,
  720,
  1200,
];

if (
  typeof window !==
    "undefined" &&
  "scrollRestoration" in
    window.history
) {
  window.history.scrollRestoration =
    "manual";
}

function getScrollingElement() {
  return (
    document.scrollingElement ||
    document.documentElement
  );
}

function scrollDocumentToTop() {
  const scrollingElement =
    getScrollingElement();

  if (scrollingElement) {
    scrollingElement.scrollTop = 0;
    scrollingElement.scrollLeft = 0;
  }

  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;

  if (document.body) {
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  document
    .querySelectorAll(
      "[data-route-scroll-container]"
    )
    .forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
}

function scrollToHash(hash) {
  const id =
    decodeURIComponent(
      String(hash || "")
        .replace(/^#/, "")
    );

  if (!id) {
    return false;
  }

  const target =
    document.getElementById(id);

  if (!target) {
    return false;
  }

  target.scrollIntoView({
    block: "start",
    behavior: "auto",
  });

  return true;
}

function scheduleInitialReset({
  hash,
  cancelledRef,
}) {
  const timers = [];

  const run = () => {
    if (cancelledRef.current) {
      return;
    }

    if (
      hash &&
      scrollToHash(hash)
    ) {
      return;
    }

    scrollDocumentToTop();
  };

  for (
    const delay of
    INITIAL_RESET_DELAYS
  ) {
    if (delay === 0) {
      const frame =
        window.requestAnimationFrame(
          run
        );

      timers.push({
        type: "frame",
        id: frame,
      });

      continue;
    }

    const timer =
      window.setTimeout(
        run,
        delay
      );

    timers.push({
      type: "timeout",
      id: timer,
    });
  }

  return () => {
    for (const timer of timers) {
      if (
        timer.type ===
        "frame"
      ) {
        window.cancelAnimationFrame(
          timer.id
        );
      } else {
        window.clearTimeout(
          timer.id
        );
      }
    }
  };
}

export default function RouteScrollManager() {
  const {
    pathname,
    search,
    hash,
  } = useLocation();

  const mountedRef =
    useRef(false);

  useLayoutEffect(() => {
    if (
      "scrollRestoration" in
      window.history
    ) {
      window.history.scrollRestoration =
        "manual";
    }

    const cancelledRef = {
      current: false,
    };

    function cancelDelayedReset() {
      cancelledRef.current = true;
    }

    const clearScheduled =
      scheduleInitialReset({
        hash,
        cancelledRef,
      });

    const interactionEvents = [
      "pointerdown",
      "touchstart",
      "wheel",
      "keydown",
    ];

    for (
      const eventName of
      interactionEvents
    ) {
      window.addEventListener(
        eventName,
        cancelDelayedReset,
        {
          passive: true,
          once: true,
        }
      );
    }

    function handlePageShow(event) {
      if (
        event.persisted &&
        !hash
      ) {
        cancelledRef.current = false;

        window.requestAnimationFrame(
          () => {
            scrollDocumentToTop();
          }
        );
      }
    }

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    mountedRef.current = true;

    return () => {
      clearScheduled();

      for (
        const eventName of
        interactionEvents
      ) {
        window.removeEventListener(
          eventName,
          cancelDelayedReset
        );
      }

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );
    };
  }, [
    pathname,
    search,
    hash,
  ]);

  return null;
}
