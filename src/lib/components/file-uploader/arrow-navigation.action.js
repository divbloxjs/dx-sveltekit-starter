import { listen } from "svelte/internal";

export function arrowNavigationAction(node, callback) {
    console.log(callback);
    const handleKeypress = (event) => {
        console.log("arrowNavigationAction()", event.key);
        if (event.key === "ArrowLeft") {
            console.log(callback);
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
