
import {
  useLayoutEffect,
} from "react";
import {
  useLocation,
} from "react-router-dom";

function scrollDocumentToTop() {
  const scrollingElement =
    document.scrollingElement ||
    document.documentElement;

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

  /*
   * Reset only explicitly marked nested route containers.
   * This avoids unexpectedly moving sliders or ordinary content areas.
   */
  document
    .querySelectorAll(
      "[data-route-scroll-container]"
    )
    .forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
}

export default function RouteScrollManager() {
  const {
    pathname,
    search,
    hash,
  } = useLocation();

  useLayoutEffect(() => {
    const previousRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration =
      "manual";

    let frameOne = 0;
    let frameTwo = 0;

    const run = () => {
      if (hash) {
        const target =
          document.getElementById(
            decodeURIComponent(
              hash.slice(1)
            )
          );

        if (target) {
          target.scrollIntoView({
            block: "start",
            behavior: "auto",
          });

          return;
        }
      }

      scrollDocumentToTop();
    };

    run();

    frameOne =
      window.requestAnimationFrame(() => {
        run();

        frameTwo =
          window.requestAnimationFrame(
            run
          );
      });

    return () => {
      window.cancelAnimationFrame(
        frameOne
      );

      window.cancelAnimationFrame(
        frameTwo
      );

      window.history.scrollRestoration =
        previousRestoration;
    };
  }, [
    pathname,
    search,
    hash,
  ]);

  return null;
}
