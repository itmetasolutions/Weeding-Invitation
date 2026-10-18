"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Runs GSAP code scoped to a container and reverts everything on cleanup. */
export function useGsap(scope: RefObject<HTMLElement | null>, fn: (ctx: gsap.Context) => void | (() => void), deps: DependencyList) {
  useIso(() => {
    if (!scope.current) return;
    let extra: void | (() => void);
    const ctx = gsap.context((self) => {
      extra = fn(self);
    }, scope);
    return () => {
      if (typeof extra === "function") extra();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap, ScrollTrigger };
