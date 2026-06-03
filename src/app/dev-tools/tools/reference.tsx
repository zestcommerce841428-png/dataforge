"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

function LookupTable({ items, cols = 3 }: { items: [string, string, string?][]; cols?: number }) {
  const [q, setQ] = useState("");
  const filtered = q ? items.filter(([a,b,c])=>[a,b,c].some(x=>x?.toLowerCase().includes(q.toLowerCase()))) : items;
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Filter…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="max-h-80 overflow-auto space-y-1">
        {filtered.map(([a,b,c],i)=>(
          <div key={i} className="surface flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
            <span className="font-mono text-brand-600 dark:text-brand-400 w-12 shrink-0">{a}</span>
            <span className="flex-1 text-xs">{b}</span>
            {c&&<span className="text-xs text-muted shrink-0">{c}</span>}
            <CopyBtn text={a} />
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}

/* ── ASCII Table ── */
export function AsciiTable() {
  const items: [string,string,string][] = Array.from({length:128},(_,i)=>[
    i.toString(),
    i<32?["NUL","SOH","STX","ETX","EOT","ENQ","ACK","BEL","BS","HT","LF","VT","FF","CR","SO","SI","DLE","DC1","DC2","DC3","DC4","NAK","SYN","ETB","CAN","EM","SUB","ESC","FS","GS","RS","US"][i]:(i===127?"DEL":String.fromCharCode(i)),
    "0x"+i.toString(16).padStart(2,"0"),
  ]);
  return <LookupTable items={items} />;
}

/* ── HTTP Headers Reference ── */
export function HttpHeadersRef() {
  const items: [string,string,string][] = [
    ["Accept","Media types the client can process","Request"],["Accept-Encoding","Encoding algorithms the client supports","Request"],
    ["Accept-Language","Natural languages the client prefers","Request"],["Authorization","Credentials for server authentication","Request"],
    ["Cache-Control","Directives for caching mechanisms","Both"],["Content-Length","Size of message body in bytes","Both"],
    ["Content-Type","Media type of the resource/body","Both"],["Cookie","HTTP cookies from the client","Request"],
    ["ETag","Identifier for a specific resource version","Response"],["Host","Domain and port of the server","Request"],
    ["If-Modified-Since","Conditional request — date version","Request"],["If-None-Match","Conditional request — ETag version","Request"],
    ["Last-Modified","Date resource was last changed","Response"],["Location","URL to redirect to","Response"],
    ["Origin","Origin of the cross-site access request","Request"],["Referer","Address of previous web page","Request"],
    ["Set-Cookie","Cookie sent from server","Response"],["Strict-Transport-Security","HSTS policy","Response"],
    ["Transfer-Encoding","Encoding for transfer","Both"],["User-Agent","Application making the request","Request"],
    ["Vary","Which request headers affect caching","Response"],["WWW-Authenticate","Authentication method for resource","Response"],
    ["X-Content-Type-Options","Prevents MIME sniffing","Response"],["X-Frame-Options","Clickjacking protection","Response"],
    ["X-XSS-Protection","XSS filter (legacy)","Response"],["Access-Control-Allow-Origin","CORS allowed origins","Response"],
    ["Access-Control-Allow-Methods","CORS allowed methods","Response"],["Content-Security-Policy","CSP rules","Response"],
    ["Retry-After","How long to wait before retry","Response"],["Forwarded","Original request info via proxy","Request"],
  ];
  return <LookupTable items={items} />;
}

/* ── HTML Entities Reference ── */
export function HtmlEntitiesRef() {
  const items: [string,string,string][] = [
    ["&amp;","&","Ampersand"],["&lt;","<","Less-than"],["&gt;",">","Greater-than"],["&quot;",'"',"Double quote"],
    ["&#39;","'","Single quote"],["&nbsp;"," ","Non-breaking space"],["&copy;","©","Copyright"],
    ["&reg;","®","Registered"],["&trade;","™","Trademark"],["&mdash;","—","Em dash"],
    ["&ndash;","–","En dash"],["&laquo;","«","Left angle quote"],["&raquo;","»","Right angle quote"],
    ["&ldquo;","“","Left double quote"],["&rdquo;","”","Right double quote"],
    ["&lsquo;","‘","Left single quote"],["&rsquo;","’","Right single quote"],
    ["&euro;","€","Euro"],["&pound;","£","Pound"],["&yen;","¥","Yen"],
    ["&cent;","¢","Cent"],["&deg;","°","Degree"],["&plusmn;","±","Plus-minus"],
    ["&frac12;","½","One half"],["&frac14;","¼","One quarter"],["&frac34;","¾","Three quarters"],
    ["&times;","×","Multiplication"],["&divide;","÷","Division"],["&infin;","∞","Infinity"],
    ["&pi;","π","Pi"],["&sum;","∑","Sum"],["&radic;","√","Square root"],
    ["&darr;","↓","Down arrow"],["&uarr;","↑","Up arrow"],["&rarr;","→","Right arrow"],
    ["&larr;","←","Left arrow"],["&harr;","↔","Left-right arrow"],
    ["&check;","✓","Check mark"],["&cross;","✗","Cross mark"],
  ];
  return <LookupTable items={items} />;
}

/* ── Regex Reference ── */
export function RegexRef() {
  const items: [string,string,string][] = [
    [".","Any character except newline","Metachar"],["\\d","Digit [0-9]","Shorthand"],["\\D","Non-digit","Shorthand"],
    ["\\w","Word char [a-zA-Z0-9_]","Shorthand"],["\\W","Non-word char","Shorthand"],["\\s","Whitespace","Shorthand"],
    ["\\S","Non-whitespace","Shorthand"],["\\b","Word boundary","Anchor"],["\\B","Non-word boundary","Anchor"],
    ["^","Start of string/line","Anchor"],["$","End of string/line","Anchor"],
    ["*","0 or more","Quantifier"],["+","1 or more","Quantifier"],["?","0 or 1","Quantifier"],
    ["{n}","Exactly n times","Quantifier"],["{n,}","n or more times","Quantifier"],["{n,m}","Between n and m times","Quantifier"],
    ["[abc]","Character class","Class"],["[^abc]","Negated class","Class"],["[a-z]","Range","Class"],
    ["(...)","Capturing group","Group"],["(?:...)","Non-capturing group","Group"],["(?=...)","Lookahead","Group"],
    ["(?!...)","Negative lookahead","Group"],["(?<=...)","Lookbehind","Group"],["a|b","Alternation (a or b)","Operator"],
    ["\\n","Newline","Escape"],["\\t","Tab","Escape"],["\\r","Carriage return","Escape"],
    ["g","Global flag","Flag"],["i","Case insensitive","Flag"],["m","Multiline","Flag"],
    ["s","Dotall (. matches \\n)","Flag"],["u","Unicode","Flag"],
  ];
  return <LookupTable items={items} />;
}

/* ── Git Commands ── */
export function GitRef() {
  const items: [string,string,string][] = [
    ["git init","Initialize a new repository","Setup"],["git clone <url>","Clone a repository","Setup"],
    ["git status","Show working tree status","Info"],["git log --oneline","Compact commit history","Info"],
    ["git diff","Show unstaged changes","Info"],["git diff --staged","Show staged changes","Info"],
    ["git add .","Stage all changes","Staging"],["git add <file>","Stage a specific file","Staging"],
    ["git commit -m 'msg'","Commit with message","Commit"],["git commit --amend","Amend last commit","Commit"],
    ["git push","Push to remote","Remote"],["git push -u origin main","Push and set upstream","Remote"],
    ["git pull","Fetch and merge","Remote"],["git fetch","Fetch without merging","Remote"],
    ["git branch","List branches","Branch"],["git branch <name>","Create branch","Branch"],
    ["git checkout <branch>","Switch branch","Branch"],["git checkout -b <name>","Create and switch","Branch"],
    ["git merge <branch>","Merge branch","Merge"],["git rebase <branch>","Rebase current onto branch","Merge"],
    ["git stash","Stash changes","Stash"],["git stash pop","Apply stashed changes","Stash"],
    ["git reset HEAD <file>","Unstage a file","Reset"],["git reset --hard HEAD","Discard all changes","Reset"],
    ["git revert <commit>","Revert a commit","Reset"],["git tag <name>","Create a tag","Tag"],
    ["git remote -v","Show remotes","Remote"],["git cherry-pick <sha>","Apply a commit","Advanced"],
    ["git bisect start","Start binary search","Debug"],["git blame <file>","Show who changed lines","Debug"],
  ];
  return <LookupTable items={items} />;
}

/* ── Linux Commands ── */
export function LinuxRef() {
  const items: [string,string,string][] = [
    ["ls -la","List all files with details","Files"],["cd <dir>","Change directory","Files"],
    ["pwd","Print working directory","Files"],["mkdir -p <dir>","Make directory (with parents)","Files"],
    ["rm -rf <dir>","Remove directory recursively","Files"],["cp -r <src> <dst>","Copy recursively","Files"],
    ["mv <src> <dst>","Move/rename","Files"],["find . -name '*.ts'","Find files by name","Find"],
    ["grep -r 'text' .","Recursive search","Search"],["grep -i 'text' file","Case-insensitive search","Search"],
    ["cat <file>","Print file contents","View"],["less <file>","Paginated view","View"],
    ["head -n 20 <file>","First 20 lines","View"],["tail -f <file>","Follow file updates","View"],
    ["wc -l <file>","Count lines","Info"],["du -sh <dir>","Directory size","Info"],
    ["df -h","Disk usage","Info"],["top","Process monitor","Process"],
    ["ps aux","All processes","Process"],["kill -9 <pid>","Force kill process","Process"],
    ["chmod 755 <file>","Set permissions","Permissions"],["chown user:group <file>","Change ownership","Permissions"],
    ["tar -czf out.tar.gz dir/","Create gzip archive","Archive"],["tar -xzf file.tar.gz","Extract archive","Archive"],
    ["ssh user@host","SSH connection","Network"],["scp file user@host:/path","Copy via SSH","Network"],
    ["curl -X POST -H 'Content-Type: application/json' -d '{}'","HTTP POST with curl","Network"],
    ["wget <url>","Download file","Network"],["netstat -tlnp","Open ports","Network"],
    ["history | grep <cmd>","Search history","Shell"],["!!","Repeat last command","Shell"],
    ["ctrl+r","Reverse history search","Shell"],["env","Show environment vars","Shell"],
  ];
  return <LookupTable items={items} />;
}

/* ── Emoji Picker ── */
export function EmojiPicker() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");
  const EMOJIS: [string,string,string][] = [
    ["😀","Grinning Face","Smileys"],["😂","Face with Tears of Joy","Smileys"],["😍","Smiling Face with Heart-Eyes","Smileys"],
    ["🤔","Thinking Face","Smileys"],["😎","Smiling Face with Sunglasses","Smileys"],["😭","Loudly Crying Face","Smileys"],
    ["🎉","Party Popper","Objects"],["🔥","Fire","Nature"],["💯","Hundred Points","Symbols"],["❤️","Red Heart","Symbols"],
    ["👍","Thumbs Up","People"],["👎","Thumbs Down","People"],["👀","Eyes","People"],["🚀","Rocket","Travel"],
    ["💻","Laptop","Objects"],["📱","Mobile Phone","Objects"],["🔑","Key","Objects"],["🔒","Locked","Objects"],
    ["✅","Check Mark Button","Symbols"],["❌","Cross Mark","Symbols"],["⚠️","Warning","Symbols"],["ℹ️","Information","Symbols"],
    ["🐛","Bug","Nature"],["🐙","Octopus","Nature"],["🦄","Unicorn","Nature"],["⭐","Star","Nature"],
    ["🌈","Rainbow","Nature"],["☀️","Sun","Nature"],["🌙","Crescent Moon","Nature"],["❄️","Snowflake","Nature"],
    ["🍕","Pizza","Food"],["☕","Hot Beverage","Food"],["🍺","Beer Mug","Food"],["🎮","Video Game","Objects"],
    ["📚","Books","Objects"],["📌","Pushpin","Objects"],["🔗","Link","Objects"],["💡","Light Bulb","Objects"],
    ["🛠️","Hammer and Wrench","Objects"],["🗂️","Card Index Dividers","Objects"],["📊","Bar Chart","Objects"],["📈","Chart Increasing","Objects"],
    ["🏆","Trophy","Objects"],["🎯","Direct Hit","Objects"],["⚡","High Voltage","Symbols"],["💎","Gem Stone","Objects"],
    ["🦁","Lion","Animals"],["🐼","Panda","Animals"],["🦊","Fox","Animals"],["🐬","Dolphin","Animals"],
  ];
  const filtered = q ? EMOJIS.filter(([e,n,c])=>[e,n,c].some(x=>x.toLowerCase().includes(q.toLowerCase()))) : EMOJIS;
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Search emojis…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="flex flex-wrap gap-1.5 max-h-64 overflow-auto">
        {filtered.map(([e,n])=>(
          <button key={e+n} title={n} onClick={async()=>{await navigator.clipboard.writeText(e);setCopied(e);setTimeout(()=>setCopied(""),1500);}} className={`text-2xl rounded-lg p-1.5 hover:bg-[var(--surface-2)] transition-colors ${copied===e?"bg-brand-100 dark:bg-brand-900/30":""}`}>{e}</button>
        ))}
      </div>
      {copied&&<p className="text-sm text-green-600 mt-2">Copied {copied}</p>}
    </ToolWrap>
  );
}

/* ── Keyboard Shortcuts Reference ── */
export function KeyboardRef() {
  const [os, setOs] = useState<"mac"|"win">("mac");
  const shortcuts: [string,string,string][] = [
    [os==="mac"?"⌘C":"Ctrl+C","Copy","Universal"],
    [os==="mac"?"⌘V":"Ctrl+V","Paste","Universal"],
    [os==="mac"?"⌘X":"Ctrl+X","Cut","Universal"],
    [os==="mac"?"⌘Z":"Ctrl+Z","Undo","Universal"],
    [os==="mac"?"⌘⇧Z":"Ctrl+Y","Redo","Universal"],
    [os==="mac"?"⌘A":"Ctrl+A","Select All","Universal"],
    [os==="mac"?"⌘F":"Ctrl+F","Find","Universal"],
    [os==="mac"?"⌘S":"Ctrl+S","Save","Universal"],
    [os==="mac"?"⌘W":"Ctrl+W","Close Tab","Browser"],
    [os==="mac"?"⌘T":"Ctrl+T","New Tab","Browser"],
    [os==="mac"?"⌘⇧T":"Ctrl+Shift+T","Reopen Tab","Browser"],
    [os==="mac"?"⌘L":"Ctrl+L","Focus Address Bar","Browser"],
    [os==="mac"?"⌘R":"Ctrl+R","Reload","Browser"],
    [os==="mac"?"⌥⌘I":"F12","DevTools","Browser"],
    [os==="mac"?"⌘⇧P":"Ctrl+Shift+P","Command Palette (VS Code)","Editor"],
    [os==="mac"?"⌘P":"Ctrl+P","Quick Open File (VS Code)","Editor"],
    [os==="mac"?"⌘B":"Ctrl+B","Toggle Sidebar (VS Code)","Editor"],
    [os==="mac"?"⌘`":"Ctrl+`","Toggle Terminal (VS Code)","Editor"],
    [os==="mac"?"⌘⇧F":"Ctrl+Shift+F","Search Everywhere (VS Code)","Editor"],
    [os==="mac"?"⌥Click":"Alt+Click","Multi-cursor","Editor"],
  ];
  return (
    <ToolWrap>
      <div className="flex gap-2 mb-3">
        {(["mac","win"] as const).map(o=>(
          <button key={o} onClick={()=>setOs(o)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${os===o?"border-brand-500 bg-brand-500/10 text-brand-600":"surface"}`}>{o==="mac"?"macOS":"Windows/Linux"}</button>
        ))}
      </div>
      <LookupTable items={shortcuts} />
    </ToolWrap>
  );
}

/* ── Color Names Reference ── */
export function ColorNamesRef() {
  const COLORS: [string,string,string][] = [
    ["#FF0000","Red","Basic"],["#00FF00","Lime","Basic"],["#0000FF","Blue","Basic"],["#FFFF00","Yellow","Basic"],
    ["#FF00FF","Magenta","Basic"],["#00FFFF","Cyan","Basic"],["#FFFFFF","White","Basic"],["#000000","Black","Basic"],
    ["#FFA500","Orange","Named"],["#800080","Purple","Named"],["#FFC0CB","Pink","Named"],["#A52A2A","Brown","Named"],
    ["#808080","Gray","Named"],["#F5F5DC","Beige","Named"],["#90EE90","LightGreen","Named"],["#ADD8E6","LightBlue","Named"],
    ["#6366F1","Indigo","Tailwind"],["#8B5CF6","Violet","Tailwind"],["#EC4899","Pink-500","Tailwind"],["#EF4444","Red-500","Tailwind"],
    ["#F97316","Orange-500","Tailwind"],["#EAB308","Yellow-500","Tailwind"],["#22C55E","Green-500","Tailwind"],["#06B6D4","Cyan-500","Tailwind"],
    ["#3B82F6","Blue-500","Tailwind"],["#14B8A6","Teal-500","Tailwind"],["#F59E0B","Amber-500","Tailwind"],["#10B981","Emerald-500","Tailwind"],
  ];
  const [q, setQ] = useState("");
  const filtered = q ? COLORS.filter(([h,n])=>[h,n].some(x=>x.toLowerCase().includes(q.toLowerCase()))) : COLORS;
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Search colors…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="grid gap-2 sm:grid-cols-2 max-h-72 overflow-auto">
        {filtered.map(([hex,name,cat])=>(
          <div key={hex+name} className="surface flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:border-brand-400" onClick={()=>navigator.clipboard.writeText(hex)}>
            <div className="h-8 w-8 rounded-md border border-black/10 shrink-0" style={{background:hex}} />
            <div><div className="text-sm font-medium">{name}</div><div className="font-mono text-xs text-muted">{hex}</div></div>
            <span className="ml-auto text-xs text-muted">{cat}</span>
          </div>
        ))}
      </div>
    </ToolWrap>
  );
}
