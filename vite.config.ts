import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { projects } from "./src/projects/projects.dictionnary";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: { port: parseInt(env.VITE_LOCAL_PORT, 10) },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@styles": path.resolve(__dirname, "src/styles"),
      },
      dedupe: ["react", "react-dom"],
    },
    plugins: [react()],
    build: {
      assetsInlineLimit: 0,
      assetsDir: "./",
      cssCodeSplit: true,
      manifest: true,
      outDir: "./build",
      rollupOptions: {
        input: { app: "./index.html" },
        output: {
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names?.[0];
            if (fileName) {
              const extType = fileName.split(".").pop();
              if (extType === "png") {
                return "assets/images/[name]-[hash][extname]";
              }
              if (extType === "ico") {
                return "assets/[name][extname]";
              }
              return "[name]-[hash][extname]";
            }
            return "assets/others/[name]-[hash][extname]";
          },
          manualChunks: (fileName) => {
            if (fileName.includes("node_modules")) return "vendor";
            if (fileName.includes("components")) return "common/";
            for (const project of Object.values(projects)) {
              if (fileName.includes(project.buildPath)) {
                console.log(fileName);
                return project.outputFile;
              }
            }
      //       const translationsFilesRegex =
      //         /src\/.*\/translations\/.*\.translations\.ts/;
      //       if (translationsFilesRegex.test(fileName)) {
      //         const language = fileName.split("translations/")[1].split("/")[0];
      //         return `translations-${language}`;
      //       }
      //       if (fileName.includes("/src/")) return "satisfactoryProject";
      //       return "app";
          },
        },
      },
    },
  };
});
