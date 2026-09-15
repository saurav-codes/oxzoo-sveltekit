import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	// expose PUBLIC_* to import.meta.env so vite inlines the value as a string literal at build time
	envPrefix: "PUBLIC_",
	plugins: [sveltekit()]
});
