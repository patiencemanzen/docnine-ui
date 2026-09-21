import fs from "fs";
import path from "path";

const SRC = "src";
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

function keepDirective(line) {
  return /eslint-disable|eslint-enable|prettier-ignore|@ts-expect-error|@ts-ignore|@ts-nocheck|istanbul ignore/.test(
    line,
  );
}

function isJsx(file) {
  return file.endsWith(".tsx") || file.endsWith(".jsx");
}

function isCss(file) {
  return file.endsWith(".css");
}

function stripComments(code, { jsx, css }) {
  let result = "";
  let i = 0;
  const n = code.length;
  let state = "code";
  let templateDepth = 0;
  let escape = false;
  let regexClass = false;

  while (i < n) {
    const c = code[i];
    const next = i + 1 < n ? code[i + 1] : "";

    if (state === "sline") {
      if (c === "\n") {
        result += c;
        state = "code";
      }
      i++;
      continue;
    }

    if (state === "mline") {
      if (c === "*" && next === "/") {
        i += 2;
        state = "code";
        continue;
      }
      i++;
      continue;
    }

    if (state === "squote" || state === "dquote") {
      result += c;
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (c === "\\") {
        escape = true;
        i++;
        continue;
      }
      if ((state === "squote" && c === "'") || (state === "dquote" && c === '"')) {
        state = "code";
      }
      i++;
      continue;
    }

    if (state === "template") {
      result += c;
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (c === "\\") {
        escape = true;
        i++;
        continue;
      }
      if (c === "`") {
        state = "code";
        i++;
        continue;
      }
      if (c === "$" && next === "{") {
        result += "{";
        i += 2;
        templateDepth++;
        state = "code";
        continue;
      }
      i++;
      continue;
    }

    if (state === "regex") {
      result += c;
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (c === "\\") {
        escape = true;
        i++;
        continue;
      }
      if (c === "[") regexClass = true;
      else if (c === "]" && regexClass) regexClass = false;
      else if (c === "/" && !regexClass) {
        state = "code";
      }
      i++;
      continue;
    }

    if (!css && c === "/" && next === "/") {
      let k = result.length - 1;
      while (k >= 0 && /[ \t]/.test(result[k])) k--;
      if (k >= 0 && result[k] === ":") {
        result += c;
        i++;
        continue;
      }

      let j = i + 2;
      let line = "";
      while (j < n && code[j] !== "\n") {
        line += code[j];
        j++;
      }
      if (keepDirective(line)) {
        result += "//" + line;
        i = j;
        continue;
      }
      state = "sline";
      i += 2;
      continue;
    }

    if (c === "/" && next === "*") {
      state = "mline";
      i += 2;
      continue;
    }

    if (c === "'") {
      state = "squote";
      result += c;
      i++;
      continue;
    }
    if (c === '"') {
      state = "dquote";
      result += c;
      i++;
      continue;
    }
    if (c === "`") {
      state = "template";
      result += c;
      i++;
      continue;
    }

    if (!css && c === "/") {
      let k = result.length - 1;
      while (k >= 0 && /[ \t\r\n]/.test(result[k])) k--;
      const prev = k >= 0 ? result[k] : "";
      const prev2 = result.slice(Math.max(0, k - 5), k + 1);
      const regexPrefix = jsx ? /[=({[;,:!?&|^~+\-*%]/ : /[=({[;,:!?&|^~+\-*%<>]/;
      if (
        k < 0 ||
        regexPrefix.test(prev) ||
        /\breturn$/.test(prev2.trimEnd()) ||
        prev2.endsWith("=>")
      ) {
        state = "regex";
        regexClass = false;
        result += c;
        i++;
        continue;
      }
    }

    if (c === "}" && templateDepth > 0) {
      result += c;
      templateDepth--;
      state = "template";
      i++;
      continue;
    }

    result += c;
    i++;
  }

  return result
    .replace(/[ \t]+\n/g, "\n")
    .replace(/^[ \t]*\{\}[ \t]*\r?\n/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

const files = walk(SRC);
let changed = 0;
let bytesBefore = 0;
let bytesAfter = 0;

for (const f of files) {
  const before = fs.readFileSync(f, "utf8");
  bytesBefore += before.length;
  const after = stripComments(before, { jsx: isJsx(f), css: isCss(f) });
  bytesAfter += after.length;
  if (after !== before) {
    fs.writeFileSync(f, after);
    changed++;
  }
}

console.log(
  JSON.stringify(
    {
      files: files.length,
      changed,
      bytesBefore,
      bytesAfter,
      saved: bytesBefore - bytesAfter,
    },
    null,
    2,
  ),
);
