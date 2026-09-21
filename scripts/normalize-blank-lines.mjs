import fs from "fs";
import path from "path";

const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

let n = 0;
for (const f of walk("src")) {
  const before = fs.readFileSync(f, "utf8");
  const after = before.replace(/^\uFEFF?(?:\r?\n)+/, "").replace(/(?:\r?\n){3,}/g, "\n\n");
  if (after !== before) {
    fs.writeFileSync(f, after);
    n++;
  }
}
console.log(`normalized ${n} files`);
