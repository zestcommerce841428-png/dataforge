"use client";
import { useState } from "react";
import { CopyBtn, ToolWrap } from "../ui";

function RefTable({ items, cols=["Code","Description","Notes"] }: { items: string[][]; cols?: string[] }) {
  const [q, setQ] = useState("");
  const f = q ? items.filter(r=>r.some(c=>c.toLowerCase().includes(q.toLowerCase()))) : items;
  return (
    <ToolWrap>
      <input className="input-field w-full mb-3" placeholder="Filter…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead><tr>{cols.map(c=><th key={c} className="bg-[var(--surface-2)] border border-[var(--border)] px-2 py-1.5 text-left font-semibold sticky top-0">{c}</th>)}</tr></thead>
          <tbody>
            {f.map((r,i)=>(
              <tr key={i} className="hover:bg-[var(--surface-2)]">
                {r.map((cell,j)=>(
                  <td key={j} className={`border border-[var(--border)] px-2 py-1.5 ${j===0?"font-mono text-brand-600 dark:text-brand-400 whitespace-nowrap":""}`}>
                    <div className="flex items-center gap-1">{j===0&&<CopyBtn text={cell} />}{cell}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolWrap>
  );
}

/* ── SQL Quick Reference ── */
export function SqlReference() {
  return <RefTable cols={["Statement","Syntax","Description"]} items={[
    ["SELECT","SELECT col1, col2 FROM table","Retrieve data from a table"],
    ["WHERE","SELECT * FROM t WHERE col = 'val'","Filter rows by condition"],
    ["JOIN","SELECT * FROM a INNER JOIN b ON a.id = b.id","Combine rows from tables"],
    ["LEFT JOIN","SELECT * FROM a LEFT JOIN b ON a.id = b.id","All from left + matching right"],
    ["GROUP BY","SELECT col, COUNT(*) FROM t GROUP BY col","Aggregate grouped rows"],
    ["HAVING","SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) > 1","Filter groups"],
    ["ORDER BY","SELECT * FROM t ORDER BY col DESC","Sort result set"],
    ["LIMIT","SELECT * FROM t LIMIT 10 OFFSET 20","Paginate results"],
    ["INSERT","INSERT INTO t (col1, col2) VALUES ('a', 1)","Add new row"],
    ["UPDATE","UPDATE t SET col1 = 'val' WHERE id = 1","Modify existing rows"],
    ["DELETE","DELETE FROM t WHERE id = 1","Remove rows"],
    ["CREATE TABLE","CREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(255))","Create new table"],
    ["ALTER TABLE","ALTER TABLE t ADD COLUMN email VARCHAR(255)","Modify table structure"],
    ["DROP TABLE","DROP TABLE IF EXISTS t","Delete table"],
    ["INDEX","CREATE INDEX idx_name ON t (col)","Speed up queries"],
    ["DISTINCT","SELECT DISTINCT col FROM t","Remove duplicate rows"],
    ["IN","SELECT * FROM t WHERE col IN ('a','b','c')","Match multiple values"],
    ["LIKE","SELECT * FROM t WHERE name LIKE '%alice%'","Pattern matching"],
    ["BETWEEN","SELECT * FROM t WHERE age BETWEEN 20 AND 30","Range condition"],
    ["IS NULL","SELECT * FROM t WHERE col IS NULL","Check for null values"],
    ["CASE","SELECT CASE WHEN x>10 THEN 'big' ELSE 'small' END FROM t","Conditional expression"],
    ["SUBQUERY","SELECT * FROM t WHERE id IN (SELECT id FROM other)","Nested query"],
    ["UNION","SELECT col FROM t1 UNION SELECT col FROM t2","Combine result sets"],
    ["TRANSACTION","BEGIN; UPDATE t SET x=1; COMMIT;","Atomic operations"],
    ["ROLLBACK","ROLLBACK;","Undo transaction"],
  ]} />;
}

/* ── CSS Properties Reference ── */
export function CssReference() {
  return <RefTable cols={["Property","Values","Description"]} items={[
    ["display","block|inline|flex|grid|none","Layout type"],
    ["position","static|relative|absolute|fixed|sticky","Positioning method"],
    ["flex-direction","row|column|row-reverse|column-reverse","Flex main axis"],
    ["justify-content","flex-start|center|space-between|space-around|space-evenly","Align along main axis"],
    ["align-items","flex-start|center|flex-end|stretch|baseline","Align along cross axis"],
    ["grid-template-columns","repeat(3,1fr)|200px 1fr|auto","Grid column tracks"],
    ["gap","8px|1rem|16px 8px","Grid/flex gap"],
    ["margin","auto|8px|0 auto","Outer spacing"],
    ["padding","16px|8px 16px|1rem","Inner spacing"],
    ["border","1px solid #ccc|none","Border shorthand"],
    ["border-radius","8px|50%|0.5rem","Corner rounding"],
    ["background","#fff|linear-gradient(...)|url(img.png)","Background"],
    ["color","#000|rgb()|hsl()|inherit","Text color"],
    ["font-size","16px|1rem|clamp(1rem,2vw,2rem)","Text size"],
    ["font-weight","100-900|bold|lighter","Text weight"],
    ["line-height","1.5|24px|normal","Line spacing"],
    ["text-align","left|right|center|justify","Horizontal text alignment"],
    ["overflow","visible|hidden|scroll|auto","Overflow behavior"],
    ["z-index","auto|0|10|-1","Stacking order"],
    ["opacity","0-1|0.5","Transparency"],
    ["transform","translate(x,y)|rotate(deg)|scale(n)","2D/3D transforms"],
    ["transition","all 0.3s ease|opacity 200ms","Smooth property changes"],
    ["animation","name duration timing iteration","Keyframe animation"],
    ["box-shadow","0 4px 8px rgba(0,0,0,0.1)","Element shadow"],
    ["cursor","pointer|default|crosshair|not-allowed","Mouse cursor"],
    ["pointer-events","auto|none","Mouse event interactivity"],
    ["user-select","none|auto|all","Text selection"],
    ["object-fit","contain|cover|fill|none","Image fitting"],
    ["aspect-ratio","16/9|1/1|auto","Width/height ratio"],
    ["backdrop-filter","blur(10px)|brightness(0.8)","Backdrop effects"],
  ]} />;
}

/* ── JavaScript Methods Reference ── */
export function JsMethodsReference() {
  return <RefTable cols={["Method","Syntax","Returns"]} items={[
    ["Array.map","arr.map(x => x * 2)","New array, transformed"],
    ["Array.filter","arr.filter(x => x > 0)","New array, filtered"],
    ["Array.reduce","arr.reduce((acc,x)=>acc+x, 0)","Single accumulated value"],
    ["Array.find","arr.find(x => x.id === 1)","First matching element"],
    ["Array.findIndex","arr.findIndex(x => x > 10)","Index of first match"],
    ["Array.includes","arr.includes('a')","Boolean"],
    ["Array.flat","arr.flat(Infinity)","Flattened array"],
    ["Array.flatMap","arr.flatMap(x => [x, x*2])","Mapped and flattened"],
    ["Array.every","arr.every(x => x > 0)","Boolean — all match"],
    ["Array.some","arr.some(x => x < 0)","Boolean — any match"],
    ["Array.sort","arr.sort((a,b) => a-b)","Sorted array (in-place)"],
    ["Array.from","Array.from({length:5}, (_,i)=>i)","Array from iterable"],
    ["Object.keys","Object.keys(obj)","Array of keys"],
    ["Object.values","Object.values(obj)","Array of values"],
    ["Object.entries","Object.entries(obj)","Array of [key,val] pairs"],
    ["Object.assign","Object.assign({}, a, b)","Merged object"],
    ["Object.freeze","Object.freeze(obj)","Immutable object"],
    ["Object.fromEntries","Object.fromEntries(entries)","Object from entries"],
    ["String.split","str.split(',')","Array of substrings"],
    ["String.replace","str.replace(/a/g, 'b')","New string"],
    ["String.includes","str.includes('hello')","Boolean"],
    ["String.startsWith","str.startsWith('http')","Boolean"],
    ["String.padStart","str.padStart(10, '0')","Padded string"],
    ["String.trimStart","str.trimStart()","Leading whitespace removed"],
    ["String.matchAll","[...str.matchAll(/re/g)]","Iterator of matches"],
    ["Promise.all","await Promise.all([p1,p2])","All resolved values"],
    ["Promise.allSettled","await Promise.allSettled([p1,p2])","All results"],
    ["Promise.race","await Promise.race([p1,p2])","First resolved"],
    ["structuredClone","structuredClone(obj)","Deep clone"],
    ["JSON.stringify","JSON.stringify(obj, null, 2)","JSON string"],
  ]} />;
}

/* ── Docker Commands Reference ── */
export function DockerReference() {
  return <RefTable cols={["Command","Example","Description"]} items={[
    ["docker pull","docker pull nginx:latest","Download image from registry"],
    ["docker build","docker build -t myapp:1.0 .","Build image from Dockerfile"],
    ["docker run","docker run -d -p 80:80 nginx","Start container"],
    ["docker run -it","docker run -it ubuntu bash","Start interactive container"],
    ["docker ps","docker ps -a","List containers"],
    ["docker stop","docker stop container_name","Stop running container"],
    ["docker rm","docker rm -f container_name","Remove container"],
    ["docker rmi","docker rmi image_name","Remove image"],
    ["docker exec","docker exec -it container bash","Run command in container"],
    ["docker logs","docker logs -f container","View container logs"],
    ["docker inspect","docker inspect container","Get container details"],
    ["docker images","docker images","List local images"],
    ["docker stats","docker stats","Live resource usage"],
    ["docker cp","docker cp file.txt container:/path","Copy files"],
    ["docker network","docker network create mynet","Manage networks"],
    ["docker volume","docker volume create myvol","Manage volumes"],
    ["docker-compose up","docker-compose up -d","Start all services"],
    ["docker-compose down","docker-compose down -v","Stop all services"],
    ["docker-compose build","docker-compose build","Build service images"],
    ["docker-compose logs","docker-compose logs -f","Follow all service logs"],
    ["docker system prune","docker system prune -af","Remove unused resources"],
    ["docker tag","docker tag app registry.io/app:1.0","Tag image"],
    ["docker push","docker push registry.io/app:1.0","Push image to registry"],
    ["docker login","docker login registry.io","Authenticate to registry"],
    ["docker save","docker save myapp | gzip > app.tar.gz","Export image"],
    ["docker load","docker load < app.tar.gz","Import image"],
    ["docker diff","docker diff container","Show filesystem changes"],
    ["docker commit","docker commit container new_image","Create image from container"],
    ["docker scan","docker scan myapp","Vulnerability scan"],
    ["HEALTHCHECK","HEALTHCHECK CMD curl -f http://localhost/ || exit 1","Dockerfile health check"],
  ]} />;
}

/* ── Node.js / npm Reference ── */
export function NodeReference() {
  return <RefTable cols={["Command","Example","Description"]} items={[
    ["node","node app.js","Run a Node.js script"],
    ["npm init","npm init -y","Initialize package.json"],
    ["npm install","npm install express","Install package"],
    ["npm install -D","npm install -D typescript","Install dev dependency"],
    ["npm install -g","npm install -g nodemon","Install globally"],
    ["npm run","npm run dev","Run npm script"],
    ["npm test","npm test","Run test script"],
    ["npm build","npm run build","Run build script"],
    ["npx","npx create-next-app@latest","Execute without installing"],
    ["npm update","npm update","Update all packages"],
    ["npm outdated","npm outdated","Show outdated packages"],
    ["npm audit","npm audit --fix","Security vulnerability check"],
    ["npm ls","npm ls --depth=0","List installed packages"],
    ["npm uninstall","npm uninstall package","Remove package"],
    ["npm publish","npm publish --access public","Publish to npm"],
    ["npm pack","npm pack","Create tarball locally"],
    ["npm version","npm version patch","Bump version"],
    ["npm ci","npm ci","Clean install from lock file"],
    ["npm link","npm link","Symlink local package"],
    ["node --inspect","node --inspect app.js","Start debugger"],
    ["process.env","process.env.NODE_ENV","Read environment variable"],
    ["__dirname","path.join(__dirname, 'file')","Current directory path"],
    ["require","const x = require('./module')","Import CommonJS module"],
    ["import","import x from './module.js'","Import ES module"],
    ["fs.readFile","fs.promises.readFile('file.txt','utf8')","Read file async"],
    ["fs.writeFile","fs.promises.writeFile('file.txt', data)","Write file async"],
    ["path.join","path.join(__dirname, 'src', 'index.js')","Join path segments"],
    ["EventEmitter","emitter.on('event', handler)","Listen to events"],
    ["http.createServer","http.createServer((req,res)=>...)","Create HTTP server"],
    ["child_process","exec('ls -la', (err,stdout)=>...)","Run shell command"],
  ]} />;
}

/* ── Tailwind CSS Reference ── */
export function TailwindReference() {
  const items = [
    ["flex","display: flex","Flexbox"],["items-center","align-items: center","Flex align"],
    ["justify-between","justify-content: space-between","Flex justify"],["gap-4","gap: 1rem","Gap"],
    ["grid","display: grid","Grid"],["grid-cols-3","grid-template-columns: repeat(3,minmax(0,1fr))","Grid cols"],
    ["p-4","padding: 1rem","Padding"],["px-4","padding-left/right: 1rem","Padding X"],
    ["py-2","padding-top/bottom: 0.5rem","Padding Y"],["m-auto","margin: auto","Margin"],
    ["w-full","width: 100%","Width"],["h-screen","height: 100vh","Height"],
    ["max-w-xl","max-width: 36rem","Max width"],["min-h-0","min-height: 0","Min height"],
    ["text-sm","font-size: 0.875rem","Font size"],["text-xl","font-size: 1.25rem","Font size"],
    ["font-bold","font-weight: 700","Font weight"],["text-center","text-align: center","Text align"],
    ["rounded-lg","border-radius: 0.5rem","Border radius"],["rounded-full","border-radius: 9999px","Circle"],
    ["border","border-width: 1px","Border"],["border-gray-200","border-color: #e5e7eb","Border color"],
    ["bg-blue-500","background-color: #3b82f6","Background"],["text-white","color: #fff","Text color"],
    ["shadow-md","box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)","Shadow"],
    ["opacity-50","opacity: 0.5","Opacity"],["hidden","display: none","Hide"],
    ["overflow-hidden","overflow: hidden","Overflow"],["truncate","overflow:hidden;text-overflow:ellipsis;white-space:nowrap","Truncate"],
    ["transition","transition-property: all;transition-duration: 150ms","Transition"],
    ["hover:scale-105","scale: 1.05 on hover","Scale on hover"],
    ["sm:flex","display: flex at ≥640px","Responsive"],
    ["dark:bg-gray-900","background on dark mode","Dark mode"],
    ["z-10","z-index: 10","Z-index"],["cursor-pointer","cursor: pointer","Cursor"],
  ];
  return <RefTable cols={["Class","CSS","Category"]} items={items} />;
}
