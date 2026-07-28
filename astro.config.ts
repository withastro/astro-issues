import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import vitePluginStats from "./scripts/vite-plugin-stats.js";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: process.env.CONTEXT !== 'production' && process.env.DEPLOY_PRIME_URL || 'https://issues.astro.build/',
  integrations: [tailwind({ applyBaseStyles: false })],

  vite: {
    plugins: [vitePluginStats()],
  },

  adapter: cloudflare()
});