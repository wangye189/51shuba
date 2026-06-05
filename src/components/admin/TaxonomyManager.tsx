"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Chan = { ckey: string; name: string; sort: number };
type Cat = { id: number; slug: string; name: string; channel: string; sort: number };

const inp = "h-8 rounded border border-gray-300 px-2 text-sm outline-none focus:border-[#2c3e50]";
const btn = "rounded px-2.5 py-1 text-xs";

async function call(url: string, method: string, body: unknown): Promise<string | null> {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (r.ok) return null;
  const d = await r.json().catch(() => ({}));
  return d.error || "操作失败";
}

function ChanRow({ c, channels, onDone }: { c: Chan; channels: Chan[]; onDone: () => void }) {
  const [name, setName] = useState(c.name);
  const [sort, setSort] = useState(c.sort);
  return (
    <tr className="border-b last:border-0">
      <td className="px-2 py-1.5 font-mono text-xs text-gray-400">{c.ckey}</td>
      <td className="px-2 py-1.5"><input className={`${inp} w-28`} value={name} onChange={(e) => setName(e.target.value)} /></td>
      <td className="px-2 py-1.5"><input type="number" className={`${inp} w-16`} value={sort} onChange={(e) => setSort(Number(e.target.value))} /></td>
      <td className="px-2 py-1.5 text-right">
        <button className={`${btn} text-[#2c3e50] hover:underline`} onClick={async () => { const e = await call("/api/admin/channels", "PUT", { ckey: c.ckey, name, sort }); if (e) alert(e); else onDone(); }}>保存</button>
        {c.ckey !== "boy" && channels.length > 1 && (
          <button className={`${btn} text-[#c0392b] hover:underline`} onClick={async () => { if (confirm(`删除频道「${c.name}」？`)) { const e = await call("/api/admin/channels", "DELETE", { ckey: c.ckey }); if (e) alert(e); else onDone(); } }}>删除</button>
        )}
      </td>
    </tr>
  );
}

function CatRow({ c, channels, onDone }: { c: Cat; channels: Chan[]; onDone: () => void }) {
  const [name, setName] = useState(c.name);
  const [channel, setChannel] = useState(c.channel);
  const [sort, setSort] = useState(c.sort);
  return (
    <tr className="border-b last:border-0">
      <td className="px-2 py-1.5 font-mono text-xs text-gray-400">{c.slug}</td>
      <td className="px-2 py-1.5"><input className={`${inp} w-28`} value={name} onChange={(e) => setName(e.target.value)} /></td>
      <td className="px-2 py-1.5">
        <select className={`${inp} w-20`} value={channel} onChange={(e) => setChannel(e.target.value)}>
          {channels.map((ch) => <option key={ch.ckey} value={ch.ckey}>{ch.name}</option>)}
        </select>
      </td>
      <td className="px-2 py-1.5"><input type="number" className={`${inp} w-16`} value={sort} onChange={(e) => setSort(Number(e.target.value))} /></td>
      <td className="px-2 py-1.5 text-right">
        <button className={`${btn} text-[#2c3e50] hover:underline`} onClick={async () => { const e = await call("/api/admin/categories", "PUT", { id: c.id, name, channel, sort }); if (e) alert(e); else onDone(); }}>保存</button>
        <button className={`${btn} text-[#c0392b] hover:underline`} onClick={async () => { if (confirm(`删除分类「${c.name}」？`)) { const e = await call("/api/admin/categories", "DELETE", { id: c.id }); if (e) alert(e); else onDone(); } }}>删除</button>
      </td>
    </tr>
  );
}

export default function TaxonomyManager({ channels, categories }: { channels: Chan[]; categories: Cat[] }) {
  const router = useRouter();
  const done = () => router.refresh();
  const [nc, setNc] = useState({ ckey: "", name: "", sort: 0 });
  const [nca, setNca] = useState({ slug: "", name: "", channel: channels[0]?.ckey || "boy", sort: 0 });

  const card = "rounded-lg bg-white p-4 shadow-sm";
  const th = "px-2 py-1.5 text-left font-medium text-gray-500";

  return (
    <div className="space-y-4">
      {/* 频道 */}
      <section className={card}>
        <h2 className="mb-3 font-bold text-[#2c3e50]">频道管理</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className={th}>标识</th><th className={th}>名称</th><th className={th}>排序</th><th className={`${th} text-right`}>操作</th></tr></thead>
          <tbody>{channels.map((c) => <ChanRow key={c.ckey} c={c} channels={channels} onDone={done} />)}</tbody>
        </table>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <input className={`${inp} w-24`} placeholder="标识(英文)" value={nc.ckey} onChange={(e) => setNc({ ...nc, ckey: e.target.value })} />
          <input className={`${inp} w-28`} placeholder="名称" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
          <input type="number" className={`${inp} w-16`} placeholder="排序" value={nc.sort} onChange={(e) => setNc({ ...nc, sort: Number(e.target.value) })} />
          <button className="rounded bg-[#2c3e50] px-3 py-1.5 text-xs text-white" onClick={async () => { const e = await call("/api/admin/channels", "POST", nc); if (e) alert(e); else { setNc({ ckey: "", name: "", sort: 0 }); done(); } }}>新增频道</button>
        </div>
      </section>

      {/* 分类 */}
      <section className={card}>
        <h2 className="mb-3 font-bold text-[#2c3e50]">分类管理</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50"><th className={th}>slug</th><th className={th}>名称</th><th className={th}>频道</th><th className={th}>排序</th><th className={`${th} text-right`}>操作</th></tr></thead>
          <tbody>{categories.map((c) => <CatRow key={c.id} c={c} channels={channels} onDone={done} />)}</tbody>
        </table>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <input className={`${inp} w-24`} placeholder="slug(英文)" value={nca.slug} onChange={(e) => setNca({ ...nca, slug: e.target.value })} />
          <input className={`${inp} w-28`} placeholder="名称" value={nca.name} onChange={(e) => setNca({ ...nca, name: e.target.value })} />
          <select className={`${inp} w-20`} value={nca.channel} onChange={(e) => setNca({ ...nca, channel: e.target.value })}>
            {channels.map((ch) => <option key={ch.ckey} value={ch.ckey}>{ch.name}</option>)}
          </select>
          <input type="number" className={`${inp} w-16`} placeholder="排序" value={nca.sort} onChange={(e) => setNca({ ...nca, sort: Number(e.target.value) })} />
          <button className="rounded bg-[#2c3e50] px-3 py-1.5 text-xs text-white" onClick={async () => { const e = await call("/api/admin/categories", "POST", nca); if (e) alert(e); else { setNca({ slug: "", name: "", channel: channels[0]?.ckey || "boy", sort: 0 }); done(); } }}>新增分类</button>
        </div>
      </section>
    </div>
  );
}
