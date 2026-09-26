import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El repositori es diu "societatsitecnologies" -> GitHub Pages el serveix a
// https://<usuari>.github.io/societatsitecnologies/
export default defineConfig({
  base: "/societatsitecnologies/",
  plugins: [react()],
});
