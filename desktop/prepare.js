// Копирует игру в папку сборки и синхронизирует версию из index.html.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const here = __dirname;

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const version = (html.match(/var GAME_VERSION\s*=\s*"([^"]+)"/) || [])[1];
if (!version) throw new Error("GAME_VERSION not found in index.html");

fs.copyFileSync(path.join(root, "index.html"), path.join(here, "index.html"));
const images = fs.readdirSync(root).filter((f) => /^\d+\.jpg$/i.test(f) || f === "fon.jpg");
for (const file of images) {
  fs.copyFileSync(path.join(root, file), path.join(here, file));
}

const pkgPath = path.join(here, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`prepare: Moryaka Jump ${version}, ${images.length} images`);
