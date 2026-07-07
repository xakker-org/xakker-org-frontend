#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, ".env"));

const PLATFORM_URL = process.env.PLATFORM_URL || "https://self-study.xakker.org";

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const distDir = path.join(__dirname, "dist");
fs.rmSync(distDir, { recursive: true, force: true });
copyDir(path.join(__dirname, "static"), path.join(distDir, "static"));

const html = fs
  .readFileSync(path.join(__dirname, "index.html"), "utf8")
  .replaceAll("__PLATFORM_URL__", PLATFORM_URL);
fs.writeFileSync(path.join(distDir, "index.html"), html);

console.log(`landing/dist built — PLATFORM_URL=${PLATFORM_URL}`);
