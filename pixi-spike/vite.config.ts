import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Сборка в один HTML — тот же артефакт, что уходит в exe на WebView2.
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    target: "es2022",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
  base: "./",
});
