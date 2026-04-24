import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const distDir = new URL("../dist/", import.meta.url);
const indexFile = new URL("../dist/index.html", import.meta.url);
const notFoundFile = new URL("../dist/404.html", import.meta.url);

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

copyFileSync(indexFile, notFoundFile);
