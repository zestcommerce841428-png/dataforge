// Runs every generator once with its default options to prove real output.
import { GENERATORS } from "../src/lib/generators.ts";

let ok = 0,
  fail = 0;
for (const g of GENERATORS) {
  try {
    const opts = {};
    for (const f of g.fields) opts[f.key] = f.default;
    const v = await g.generate(opts);
    if (v == null || v === "") throw new Error("empty");
    console.log(`✓ ${g.slug.padEnd(16)} → ${String(v).slice(0, 60)}`);
    ok++;
  } catch (e) {
    console.log(`✗ ${g.slug.padEnd(16)} → ERROR: ${e.message}`);
    fail++;
  }
}
console.log(`\n${ok}/${GENERATORS.length} generators produced output, ${fail} failed.`);
