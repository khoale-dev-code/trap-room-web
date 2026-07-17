import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollEffects() {
  const progressRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    let frame = 0;

    function updateProgress() {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const element = progressRef.current;
        if (!element) return;

        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;

        element.style.setProperty("--scroll-progress", String(progress));
      });
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 bg-transparent"
    >
      <div
        ref={progressRef}
        className="trap-progress h-full w-full bg-trap-orange will-change-transform"
      />
    </div>
  );
}
