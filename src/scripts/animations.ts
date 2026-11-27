import { animate, createTimeline, spring, stagger, utils } from "animejs";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

// bounce 0 = critically damped spring; duration is the perceived settle time in ms.
const settle = (duration: number) => spring({ bounce: 0, duration });

export function playEntrance() {
    const root = document.documentElement;
    if (root.dataset.motion !== "run") return;

    const entrance = createTimeline({ onComplete: finish })
        .add("[data-scan]", { scaleY: [1, 0], ease: settle(400) }, 0)
        .add("[data-animate=scale]", { scale: [0.98, 1], ease: settle(450) }, 0)
        .add("[data-animate=rise]", { opacity: [0, 1], y: [12, 0], ease: settle(300), delay: stagger(30) }, 0);

    function finish() {
        root.dataset.motion = "done";
        entrance.pause();
        utils.cleanInlineStyles(entrance);
    }

    reducedMotion.addEventListener("change", finish, { once: true });
}

export function pressFeedback() {
    for (const target of document.querySelectorAll<HTMLElement>("[data-press]")) {
        const scaleTo = (scale: number, duration: number) => {
            if (reducedMotion.matches) return;
            animate(target, {
                scale,
                ease: settle(duration),
                onComplete: () => scale === 1 && target.style.removeProperty("transform"),
            });
        };
        target.addEventListener("pointerdown", () => scaleTo(0.97, 120));
        for (const type of ["pointerup", "pointerleave", "pointercancel"])
            target.addEventListener(type, () => scaleTo(1, 380));
    }
}
