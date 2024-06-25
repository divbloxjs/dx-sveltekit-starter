import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { svelteInspector } from "@sveltejs/vite-plugin-svelte-inspector";
export default defineConfig({
    plugins: [sveltekit(), svelteInspector({})],
    server: {
        port: 5173,
        fs: {
            allow: ["uploads", "dx.config.js", "divblox/code-gen/datamodel-ui.config.json"]
        }
    }
});
