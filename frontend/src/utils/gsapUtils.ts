import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Basic Animations ─────────────────────────────────────────────────────── */

export const fadeIn = (target: gsap.TweenTarget, delay = 0, duration = 0.5) =>
  gsap.fromTo(
    target,
    { opacity: 0 },
    { opacity: 1, duration, delay, ease: "power2.out" },
  );

export const slideUp = (target: gsap.TweenTarget, delay = 0, duration = 0.6) =>
  gsap.fromTo(
    target,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration, delay, ease: "power3.out" },
  );

export const slideDown = (
  target: gsap.TweenTarget,
  delay = 0,
  duration = 0.5,
) =>
  gsap.fromTo(
    target,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration, delay, ease: "power2.out" },
  );

export const scaleIn = (target: gsap.TweenTarget, delay = 0, duration = 0.4) =>
  gsap.fromTo(
    target,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration, delay, ease: "back.out(1.7)" },
  );

/* ─── Stagger Animations ───────────────────────────────────────────────────── */

export const staggerFadeUp = (
  targets: gsap.TweenTarget,
  stagger = 0.1,
  delay = 0,
) =>
  gsap.fromTo(
    targets,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.55,
      delay,
      stagger,
      ease: "power3.out",
    },
  );

export const staggerScaleIn = (
  targets: gsap.TweenTarget,
  stagger = 0.08,
  delay = 0,
) =>
  gsap.fromTo(
    targets,
    { opacity: 0, scale: 0.85, y: 16 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      delay,
      stagger,
      ease: "back.out(1.4)",
    },
  );

/* ─── Count-Up Animation ───────────────────────────────────────────────────── */

export const countUp = (
  element: HTMLElement,
  end: number,
  duration = 1.5,
  delay = 0,
) => {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: end,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.val).toString();
    },
  });
};

/* ─── Page Transition ──────────────────────────────────────────────────────── */

export const pageEnter = (container: gsap.TweenTarget) =>
  gsap.fromTo(
    container,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
  );

export const pageLeave = (container: gsap.TweenTarget) =>
  gsap.to(container, { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" });

/* ─── Dialog Animations ────────────────────────────────────────────────────── */

export const dialogEnter = (target: gsap.TweenTarget) =>
  gsap.fromTo(
    target,
    { opacity: 0, scale: 0.92, y: 20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.5)" },
  );

/* ─── Floating / Hero Animations ──────────────────────────────────────────── */

export const floatLoop = (target: gsap.TweenTarget) =>
  gsap.to(target, {
    y: -12,
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

export const heroBanner = (container: string) => {
  const tl = gsap.timeline();
  tl.fromTo(
    `${container} .hero-title`,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
  )
    .fromTo(
      `${container} .hero-subtitle`,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4",
    )
    .fromTo(
      `${container} .hero-cta`,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
        stagger: 0.1,
      },
      "-=0.3",
    );
  return tl;
};

/* ─── Row Add/Remove Animations ───────────────────────────────────────────── */

export const rowEnter = (target: gsap.TweenTarget) =>
  gsap.fromTo(
    target,
    { opacity: 0, x: -20, height: 0 },
    { opacity: 1, x: 0, height: "auto", duration: 0.4, ease: "power2.out" },
  );

export const rowLeave = (target: gsap.TweenTarget, onComplete?: () => void) =>
  gsap.to(target, {
    opacity: 0,
    x: 20,
    height: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete,
  });

export { ScrollTrigger };
export default gsap;
