import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Le front de la console. En prod, son serveur Express sert ce build (build/public).
// `pnpm dev:local` : ce front en direct, branché sur la console de `pnpm prod:local`
// (http://localhost:8100), pour travailler l'interface sans reconstruire l'image.
export default defineConfig({
	root: "src/client",
	plugins: [react()],
	server: {
		port: 3003,
		strictPort: true,
		proxy: {
			"/api": {
				target: "http://localhost:8100",
				// La console refuse une action venue d'une autre page que la sienne
				// (requireSameOrigin) : on se présente comme elle
				headers: { origin: "http://localhost:8100" },
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "../../build/public",
		emptyOutDir: true,
	},
});
