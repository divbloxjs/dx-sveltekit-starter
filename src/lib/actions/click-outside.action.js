import { listen } from "svelte/internal";

export function clickOutsideAction(node, callback) {
    const handleClick = (event) => {
        if (event.target !== null && !node.contains(event.target)) {
            node.dispatchEvent(new CustomEvent("clickoutside"));
            callback?.();
        }
    };

    const stop = listen(document, "click", handleClick, true);

    return {
        destroy() {
            stop();
        }
    };
}
