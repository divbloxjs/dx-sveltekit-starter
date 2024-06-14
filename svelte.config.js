import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        alias: {
            divblox: "divblox",
            datamodel: "divblox/configs/datamodel.json",
            $constants: "src/lib/constants",
            $components: "src/lib/components",
            $ui: "src/lib/components/shadcn/ui"
        }
    },

    preprocess: [vitePreprocess({})]
};

export default config;
