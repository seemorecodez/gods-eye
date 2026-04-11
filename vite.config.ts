import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
      // Stub out satellite.js WASM modules that pull in Node.js-only APIs and
      // top-level await incompatible with the Rollup iife format.
      // The SGP4 propagation functions used by satellite-api.ts are pure JS
      // and do not require WASM.
      'satellite.js/dist/wasm/index.js': resolve(projectRoot, 'src/lib/stubs/satellite-wasm-stub.js'),
      'satellite.js/dist/wasm/runtimes/index.js': resolve(projectRoot, 'src/lib/stubs/satellite-wasm-stub.js'),
      'satellite.js/dist/wasm/runtimes/multi-thread-runtime.js': resolve(projectRoot, 'src/lib/stubs/satellite-wasm-stub.js'),
      'satellite.js/dist/wasm/runtimes/single-thread-runtime.js': resolve(projectRoot, 'src/lib/stubs/satellite-wasm-stub.js'),
      [resolve(projectRoot, 'node_modules/satellite.js/wasm-build/pthreads-release/index.js')]: resolve(projectRoot, 'src/lib/stubs/satellite-wasm-stub.js'),
      [resolve(projectRoot, 'node_modules/satellite.js/wasm-build/base-release/index.js')]: resolve(projectRoot, 'src/lib/stubs/satellite-wasm-stub.js'),
    }
  },
});
