"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap, TwoPane } from "../ui";

/* ── JSON Formatter ── */
export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const format = () => {
    try { setOutput(JSON.stringify(JSON.parse(input), null, indent)); setError(""); }
    catch(e) { setError((e as Error).message); }
  };
  const minify = () => {
    try { setOutput(JSON.stringify(JSON.parse(input))); setError(""); }
    catch(e) { setError((e as Error).message); }
  };
  const sort = () => {
    const sortObj = (o: unknown): unknown => {
      if (Array.isArray(o)) return o.map(sortObj);
      if (o && typeof o==="object") return Object.fromEntries(Object.entries(o as Record<string,unknown>).sort().map(([k,v])=>[k,sortObj(v)]));
      return o;
    };
    try { setOutput(JSON.stringify(sortObj(JSON.parse(input)), null, indent)); setError(""); }
    catch(e) { setError((e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-2 flex-wrap mb-2">
        <button className="btn-primary" onClick={format}>Format</button>
        <button className="btn-secondary" onClick={minify}>Minify</button>
        <button className="btn-secondary" onClick={sort}>Sort Keys</button>
        <label className="flex items-center gap-1.5 text-sm ml-auto">Indent: <input type="number" className="input-field w-16" value={indent} min={0} max={8} onChange={e=>setIndent(+e.target.value)} /></label>
      </div>
      {error && <p className="text-xs text-red-500 mb-2">⚠ {error}</p>}
      <TwoPane
        left={<textarea className="input-area h-64 font-mono text-xs" placeholder='{"key": "value"}' value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-64 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── JSON to TypeScript ── */
export function JsonToTypescript() {
  const [input, setInput] = useState('{"name":"Alice","age":30,"active":true,"scores":[1,2,3]}');
  const [output, setOutput] = useState("");
  const [name, setName] = useState("Root");
  const convert = () => {
    try {
      const obj = JSON.parse(input);
      const typeOf = (v: unknown, depth=0): string => {
        if (v === null) return "null";
        if (Array.isArray(v)) {
          if (v.length===0) return "unknown[]";
          const t = typeOf(v[0], depth);
          return v.every(i=>typeOf(i,depth)===t) ? `${t}[]` : "unknown[]";
        }
        if (typeof v === "object") return objToInterface(v as Record<string,unknown>, depth+1);
        return typeof v;
      };
      const objToInterface = (obj: Record<string,unknown>, depth=0): string => {
        if (depth>0) return "{\n"+Object.entries(obj).map(([k,v])=>`  ${"  ".repeat(depth)}${k}: ${typeOf(v,depth)};`).join("\n")+"\n"+"  ".repeat(depth)+"}";
        return `interface ${name} {\n`+Object.entries(obj).map(([k,v])=>`  ${k}: ${typeOf(v,depth)};`).join("\n")+"\n}";
      };
      setOutput(objToInterface(Array.isArray(obj) ? {items: obj} : obj));
    } catch(e) { setOutput("⚠ " + (e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-2 flex-wrap">
        <input className="input-field flex-1 min-w-32" placeholder="Interface name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn-primary" onClick={convert}>Convert</button>
      </div>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" placeholder='{"key": "value"}' value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── JSON to Zod ── */
export function JsonToZod() {
  const [input, setInput] = useState('{"name":"Alice","age":30,"active":true}');
  const [output, setOutput] = useState("");
  const [schemaName, setSchemaName] = useState("schema");
  const convert = () => {
    try {
      const obj = JSON.parse(input);
      const toZod = (v: unknown, depth=0): string => {
        if (v === null) return "z.null()";
        if (Array.isArray(v)) return `z.array(${v.length?toZod(v[0],depth):"z.unknown()"})`;
        switch(typeof v) {
          case "string": return "z.string()";
          case "number": return Number.isInteger(v)?"z.number().int()":"z.number()";
          case "boolean": return "z.boolean()";
          case "object": {
            const pad = "  ".repeat(depth+1);
            const fields = Object.entries(v as Record<string,unknown>).map(([k,val])=>`${pad}${k}: ${toZod(val,depth+1)},`).join("\n");
            return `z.object({\n${fields}\n${"  ".repeat(depth)}})`;
          }
          default: return "z.unknown()";
        }
      };
      const obj2 = Array.isArray(obj) ? {items: obj} : obj as Record<string,unknown>;
      setOutput(`import { z } from "zod";\n\nexport const ${schemaName} = ${toZod(obj2)};\n\nexport type ${schemaName.charAt(0).toUpperCase()+schemaName.slice(1)} = z.infer<typeof ${schemaName}>;`);
    } catch(e) { setOutput("⚠ " + (e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-2">
        <input className="input-field flex-1" placeholder="Schema name" value={schemaName} onChange={e=>setSchemaName(e.target.value)} />
        <button className="btn-primary" onClick={convert}>Convert</button>
      </div>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── Cron Parser ── */
export function CronParser() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const PRESETS = [
    ["Every minute","* * * * *"],["Every hour","0 * * * *"],["Daily 9am","0 9 * * *"],
    ["Weekdays 9am","0 9 * * 1-5"],["Weekly Monday","0 9 * * 1"],["Monthly 1st","0 9 1 * *"],
    ["Every 15 min","*/15 * * * *"],["Twice daily","0 9,17 * * *"],
  ];
  const explain = (e: string): string => {
    const parts = e.trim().split(/\s+/);
    if (parts.length < 5) return "⚠ Need at least 5 fields: minute hour day-of-month month day-of-week";
    const [min, hr, dom, mon, dow, ...rest] = parts;
    const field = (v:string,unit:string,names?:string[]) => {
      if (v==="*") return `every ${unit}`;
      if (v.startsWith("*/")) return `every ${v.slice(2)} ${unit}s`;
      if (v.includes(",")) {
        const vals = v.split(",").map(n=>names?names[+n-1]||n:n);
        return `at ${unit}s ${vals.join(", ")}`;
      }
      if (v.includes("-")) { const [a,b]=v.split("-"); return `${unit}s ${a} through ${b}`; }
      return `at ${unit} ${names?names[+v-1]||v:v}`;
    };
    const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    return `Runs ${field(min,"minute")} · ${field(hr,"hour")} · ${field(dom,"day-of-month")} · ${field(mon,"month",MONTHS)} · ${field(dow,"day-of-week",DAYS)}${rest.length?" · "+rest.join(" "):""}`;
  };
  return (
    <ToolWrap>
      <input className="input-field w-full font-mono mb-2" value={expr} onChange={e=>setExpr(e.target.value)} placeholder="* * * * *" />
      <p className="text-sm mb-3 font-medium">{explain(expr)}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PRESETS.map(([l,v])=>(
          <button key={v} onClick={()=>setExpr(v)} className="surface rounded-lg border px-3 py-2 text-left text-sm hover:border-brand-400 transition-colors">
            <span className="font-mono text-xs text-muted">{v}</span><br/><span className="text-xs">{l}</span>
          </button>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── HTTP Status Lookup ── */
export function HttpStatusLookup() {
  const [query, setQuery] = useState("");
  const CODES: [number,string,string][] = [
    [100,"Continue","Request received, continue process"],[101,"Switching Protocols","Upgrading protocol"],[102,"Processing","Processing (WebDAV)"],[103,"Early Hints","Return headers before full response"],
    [200,"OK","Request succeeded"],[201,"Created","Resource created"],[202,"Accepted","Request accepted, processing async"],[204,"No Content","Success, no body"],[206,"Partial Content","Range request fulfilled"],
    [301,"Moved Permanently","Resource permanently moved"],[302,"Found","Temporary redirect"],[304,"Not Modified","Use cached version"],[307,"Temporary Redirect","Same method redirect"],[308,"Permanent Redirect","Same method permanent redirect"],
    [400,"Bad Request","Malformed request syntax"],[401,"Unauthorized","Authentication required"],[403,"Forbidden","Server refuses to fulfill"],[404,"Not Found","Resource not found"],[405,"Method Not Allowed","HTTP method not supported"],[409,"Conflict","Conflict with current state"],[410,"Gone","Resource permanently removed"],[422,"Unprocessable Entity","Validation failed"],[429,"Too Many Requests","Rate limit exceeded"],
    [500,"Internal Server Error","Unexpected server error"],[501,"Not Implemented","Feature not supported"],[502,"Bad Gateway","Invalid upstream response"],[503,"Service Unavailable","Server temporarily down"],[504,"Gateway Timeout","Upstream timeout"],
  ];
  const filtered = query ? CODES.filter(([c,t,d])=>c.toString().includes(query)||t.toLowerCase().includes(query.toLowerCase())||d.toLowerCase().includes(query.toLowerCase())) : CODES;
  const color = (c:number)=>c<200?"text-blue-500":c<300?"text-green-500":c<400?"text-yellow-500":c<500?"text-orange-500":"text-red-500";
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Search by code or name…" value={query} onChange={e=>setQuery(e.target.value)} />
      <div className="max-h-72 overflow-auto space-y-1">
        {filtered.map(([code,text,desc])=>(
          <div key={code} className="surface flex items-start gap-3 rounded-lg border px-3 py-2 text-sm">
            <span className={`w-10 shrink-0 font-bold font-mono tabular-nums ${color(code)}`}>{code}</span>
            <div><div className="font-semibold">{text}</div><div className="text-xs text-muted">{desc}</div></div>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── MIME Type Lookup ── */
export function MimeLookup() {
  const [query, setQuery] = useState("");
  const MIMES = [
    [".html","text/html"],["html","text/html"],[".css","text/css"],[".js","application/javascript"],[".json","application/json"],
    [".xml","application/xml"],[".png","image/png"],[".jpg","image/jpeg"],[".jpeg","image/jpeg"],[".gif","image/gif"],
    [".webp","image/webp"],[".svg","image/svg+xml"],[".ico","image/x-icon"],[".pdf","application/pdf"],
    [".zip","application/zip"],[".gz","application/gzip"],[".tar","application/x-tar"],[".mp4","video/mp4"],
    [".mp3","audio/mpeg"],[".wav","audio/wav"],[".ogg","audio/ogg"],[".webm","video/webm"],
    [".woff","font/woff"],[".woff2","font/woff2"],[".ttf","font/ttf"],[".csv","text/csv"],
    [".md","text/markdown"],[".yaml","application/x-yaml"],[".toml","application/toml"],
    [".avif","image/avif"],[".wasm","application/wasm"],[".txt","text/plain"],[".bin","application/octet-stream"],
    [".docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    [".xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    [".pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ];
  const filtered = query ? MIMES.filter(([e,m])=>e.includes(query)||m.toLowerCase().includes(query.toLowerCase())) : MIMES;
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Search extension or MIME type…" value={query} onChange={e=>setQuery(e.target.value)} />
      <div className="max-h-72 overflow-auto space-y-1">
        {filtered.map(([ext,mime])=>(
          <div key={ext+mime} className="surface flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
            <span className="font-mono text-brand-600 dark:text-brand-400 w-12 shrink-0">{ext}</span>
            <span className="font-mono text-xs flex-1">{mime}</span>
            <CopyBtn text={mime} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── SQL Formatter ── */
export function SqlFormatter() {
  const [input, setInput] = useState("SELECT u.id,u.name,o.total FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.active=1 ORDER BY u.name LIMIT 10");
  const [output, setOutput] = useState("");
  const format = () => {
    const kw = ["SELECT","FROM","WHERE","JOIN","LEFT JOIN","RIGHT JOIN","INNER JOIN","OUTER JOIN","ON","AND","OR","ORDER BY","GROUP BY","HAVING","LIMIT","OFFSET","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","CREATE TABLE","ALTER TABLE","DROP TABLE","UNION","UNION ALL","CASE","WHEN","THEN","ELSE","END"];
    let sql = input.trim();
    kw.forEach(k => { sql = sql.replace(new RegExp(`\\b${k}\\b`,"gi"), `\n${k}`); });
    setOutput(sql.trim().split("\n").map(l=>l.trim()).filter(Boolean).join("\n"));
  };
  return (
    <ToolWrap>
      <button className="btn-primary mb-3" onClick={format}>Format SQL</button>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} placeholder="SELECT * FROM table WHERE id = 1" />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── Markdown Previewer ── */
export function MarkdownPreviewer() {
  const [md, setMd] = useState("# Hello\n\nThis is **bold** and _italic_.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hello');\n```");
  const html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g,(_,l,c)=>`<pre class="bg-[var(--surface-2)] rounded-lg p-3 overflow-x-auto my-2"><code>${c.replace(/</g,"&lt;")}</code></pre>`)
    .replace(/^######\s+(.+)$/gm,"<h6 class='text-sm font-bold mt-3'>$1</h6>")
    .replace(/^#####\s+(.+)$/gm,"<h5 class='text-base font-bold mt-3'>$1</h5>")
    .replace(/^####\s+(.+)$/gm,"<h4 class='text-lg font-bold mt-3'>$1</h4>")
    .replace(/^###\s+(.+)$/gm,"<h3 class='text-xl font-bold mt-4'>$1</h3>")
    .replace(/^##\s+(.+)$/gm,"<h2 class='text-2xl font-bold mt-4'>$1</h2>")
    .replace(/^#\s+(.+)$/gm,"<h1 class='text-3xl font-bold mt-4'>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/`([^`]+)`/g,"<code class='bg-[var(--surface-2)] px-1 rounded font-mono text-sm'>$1</code>")
    .replace(/^\s*[-*]\s+(.+)$/gm,"<li class='ml-4 list-disc'>$1</li>")
    .replace(/^\s*\d+\.\s+(.+)$/gm,"<li class='ml-4 list-decimal'>$1</li>")
    .replace(/^(?!<[a-z]).+$/gm, line=>line.trim()?`<p class='my-1'>${line}</p>`:"")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,"<a href='$2' class='text-brand-600 underline'>$1</a>")
    .replace(/^---+$/gm,"<hr class='my-4 border-[var(--border)]'/>")
    .replace(/^>\s(.+)$/gm,"<blockquote class='border-l-4 border-brand-400 pl-3 text-muted my-2'>$1</blockquote>");
  return (
    <ToolWrap>
      <TwoPane
        left={<textarea className="input-area h-72 font-mono text-xs" value={md} onChange={e=>setMd(e.target.value)} />}
        right={<div className="input-area h-72 overflow-auto prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html:html}} />}
      />
    </ToolWrap>
  );
}

/* ── HTML Previewer ── */
export function HtmlPreviewer() {
  const [html, setHtml] = useState("<h1 style='color:#6366f1'>Hello World</h1>\n<p>Type HTML here to preview it live.</p>");
  const [view, setView] = useState<"split"|"preview">("split");
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-2">
        {(["split","preview"] as const).map(v=>(
          <button key={v} onClick={()=>setView(v)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${view===v?"border-brand-500 bg-brand-500/10 text-brand-600":"surface hover:border-brand-400"}`}>{v}</button>
        ))}
      </div>
      <div className={view==="split"?"grid sm:grid-cols-2 gap-3":"block"}>
        {view==="split"&&<textarea className="input-area h-64 font-mono text-xs" value={html} onChange={e=>setHtml(e.target.value)} />}
        <iframe title="preview" srcDoc={html} sandbox="allow-scripts" className="w-full h-64 rounded-xl border bg-white" />
      </div>
      {view==="preview"&&<textarea className="input-area h-32 font-mono text-xs mt-3" value={html} onChange={e=>setHtml(e.target.value)} />}
    </ToolWrap>
  );
}

/* ── .env Parser ── */
export function EnvParser() {
  const [input, setInput] = useState("# App config\nAPP_NAME=MyApp\nDATABASE_URL=postgres://localhost:5432/db\nDEBUG=true\nAPI_KEY=sk-abc123");
  const parsed = input.split("\n").reduce((acc, line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return acc;
    const idx = t.indexOf("=");
    if (idx < 0) return acc;
    const key = t.slice(0,idx).trim();
    const val = t.slice(idx+1).replace(/^["']|["']$/g,"");
    return {...acc, [key]: val};
  }, {} as Record<string,string>);
  return (
    <ToolWrap>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={
          <div className="input-area h-48 overflow-auto space-y-1.5 p-2">
            {Object.entries(parsed).map(([k,v])=>(
              <div key={k} className="flex items-start gap-2">
                <span className="font-mono text-xs text-brand-600 dark:text-brand-400 w-36 shrink-0 truncate">{k}</span>
                <span className="font-mono text-xs text-muted truncate">{v}</span>
              </div>
            ))}
          </div>
        }
      />
    </ToolWrap>
  );
}

/* ── JSON Path Tester ── */
export function JsonPathTester() {
  const [json, setJson] = useState('{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}],"count":2}');
  const [path, setPath] = useState("$.users[0].name");
  const [result, setResult] = useState("");
  const query = () => {
    try {
      const obj = JSON.parse(json);
      const parts = path.replace(/^\$/,"").split(".").filter(Boolean);
      let cur: unknown = obj;
      for (const p of parts) {
        if (cur === null || cur === undefined) break;
        const m = p.match(/^([^\[]+)?\[(\d+)\]$/);
        if (m) {
          if (m[1]) cur = (cur as Record<string,unknown>)[m[1]];
          cur = (cur as unknown[])[+m[2]];
        } else {
          cur = (cur as Record<string,unknown>)[p];
        }
      }
      setResult(JSON.stringify(cur, null, 2));
    } catch(e) { setResult("⚠ " + (e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        <input className="input-field flex-1 font-mono" placeholder="$.path.to.value" value={path} onChange={e=>setPath(e.target.value)} />
        <button className="btn-primary" onClick={query}>Query</button>
      </div>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={json} onChange={e=>setJson(e.target.value)} />}
        right={<div className="relative"><pre className="input-area h-48 overflow-auto font-mono text-xs pr-8">{result||"Result appears here"}</pre><CopyBtn text={result} absolute /></div>}
      />
    </ToolWrap>
  );
}

/* ── JSON → Go Struct ── */
export function JsonToGoStruct() {
  const [input, setInput] = useState('{"name":"Alice","age":30,"active":true,"tags":["a","b"]}');
  const [structName, setStructName] = useState("Root");
  const [output, setOutput] = useState("");
  const convert = () => {
    try {
      const goType = (v: unknown): string => {
        if (v===null) return "interface{}";
        if (Array.isArray(v)) return `[]${goType(v[0]||"")}`;
        switch(typeof v) {
          case "string": return "string";
          case "number": return Number.isInteger(v)?"int64":"float64";
          case "boolean": return "bool";
          case "object": return structName+"Sub";
          default: return "interface{}";
        }
      };
      const obj = JSON.parse(input) as Record<string,unknown>;
      const toPascal = (s:string)=>s.charAt(0).toUpperCase()+s.slice(1).replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
      const fields = Object.entries(obj).map(([k,v])=>`\t${toPascal(k)} ${goType(v)} \`json:"${k}"\``).join("\n");
      setOutput(`type ${structName} struct {\n${fields}\n}`);
    } catch(e) { setOutput("⚠ " + (e as Error).message); }
  };
  return (
    <ToolWrap>
      <div className="flex gap-3 mb-2">
        <input className="input-field flex-1" placeholder="Struct name" value={structName} onChange={e=>setStructName(e.target.value)} />
        <button className="btn-primary" onClick={convert}>Convert</button>
      </div>
      <TwoPane
        left={<textarea className="input-area h-48 font-mono text-xs" value={input} onChange={e=>setInput(e.target.value)} />}
        right={<div className="relative"><textarea className="input-area h-48 pr-10 font-mono text-xs" readOnly value={output} /><CopyBtn text={output} absolute /></div>}
      />
    </ToolWrap>
  );
}
