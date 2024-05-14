import { listen } from "svelte/internal";

export function pressEscapeAction(node, callback) {
    const handleKeypress = (event) => {
        if (event.key === "Escape") {
            node.dispatchEvent(new CustomEvent("escapepress"));
            callback?.();
        }
    };

    const stop = listen(document.body, "keydown", handleKeypress, true);

    return {
        destroy() {
            stop();
        }
    };
}
