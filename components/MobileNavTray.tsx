"use client";

import { useEffect } from "react";

/**
 * Pins the mobile nav tray to the visible viewport bottom.
 * Mobile browser chrome can change the visual viewport after load;
 * without this the fixed tray appears to shift upward.
 */
export function MobileNavTrayLock() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) {
        root.style.setProperty("--mobile-nav-offset", "0px");
        return;
      }

      // Distance between layout viewport bottom and visual viewport bottom.
      // Positive when the browser UI shrinks the visible area from the bottom.
      const offset = Math.max(
        0,
        window.innerHeight - (vv.height + vv.offsetTop)
      );
      root.style.setProperty("--mobile-nav-offset", `${-offset}px`);
    };

    sync();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      root.style.removeProperty("--mobile-nav-offset");
    };
  }, []);

  return null;
}
