/**
 * 构建后源码保护：混淆 dist 产物中的业务 JS。
 * - 排除 workbox/sw.js（PWA 插件生成的运行时代码，混淆会破坏缓存逻辑）
 * - 变量名十六进制化 + 字符串 base64 编码 + 控制流简化
 * - 纯前端无法绝对防抄，此步骤将"F12 直接可读"提升为"需逆向工程"
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import JavaScriptObfuscator from "javascript-obfuscator";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

function listJs(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listJs(full));
    else if (entry.endsWith(".js")) out.push(full);
  }
  return out;
}

const files = listJs(distDir).filter(
  (f) =>
    !/workbox-.*\.js$/.test(f) &&
    !f.endsWith("/sw.js") &&
    !f.endsWith("/registerSW.js"),
);

if (files.length === 0) {
  console.log("[obfuscate] 无可混淆的业务 JS");
  process.exit(0);
}

const options = {
  compact: true,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.75,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  disableConsoleOutput: true,
  simplify: true,
  transformObjectKeys: true,
};

for (const file of files) {
  const before = statSync(file).size;
  const code = readFileSync(file, "utf8");
  const result = JavaScriptObfuscator.obfuscate(code, options).getObfuscatedCode();
  writeFileSync(file, result);
  const after = statSync(file).size;
  console.log(`[obfuscate] ${file.split("/dist/")[1]} ${before} → ${after} bytes`);
}

console.log(`[obfuscate] 完成：混淆 ${files.length} 个文件`);
