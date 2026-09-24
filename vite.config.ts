import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El repositori es diu "liniaTemps" -> GitHub Pages el serveix a
// https://<usuari>.github.io/liniaTemps/
export default defineConfig({
  base: "/liniaTemps/",
  plugins: [react()],
});
