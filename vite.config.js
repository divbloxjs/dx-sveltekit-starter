import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { svelteInspector } from "@sveltejs/vite-plugin-svelte-inspector";
export default defineConfig({
    plugins: [sveltekit(), svelteInspector({})],
    server: {
        port: 5174,
        fs: {
            allow: ["uploads", "dx.config.js"]
        }
    }
});
