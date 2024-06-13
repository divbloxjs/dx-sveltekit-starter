import { listen } from "svelte/internal";

export function arrowNavigationAction(node, callback) {
    const handleKeypress = (event) => {
        if (event.key === "ArrowLeft") {
            node.dispatchEvent(new CustomEvent("arrowleft"));
            callback?.("left");
        }

        if (event.key === "ArrowRight") {
            node.dispatchEvent(new CustomEvent("arrowright"));
            callback?.("right");
        }

        if (event.key === "ArrowUp") {
            node.dispatchEvent(new CustomEvent("arrowup"));
            callback?.("up");
        }

        if (event.key === "ArrowDown") {
            node.dispatchEvent(new CustomEvent("arrowdown"));
            callback?.("down");
        }
    };

    const stop = listen(document.body, "keydown", handleKeypress, true);

    return {
        destroy() {
            stop();
        }
    };
}
