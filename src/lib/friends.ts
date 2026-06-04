import { getDb } from "./db";

export type FriendLink = {
  id: number;
  name: string;
  domain: string;
  code: string;
  url: string;
  status: number;
  created_at: string;
};

export type LinkStat = FriendLink & {
  in_pv: number;
  out_pv: number;
  in_uv: number;
  out_uv: number;
};

// ===== 配置（后台）=====
export async function listLinks(): Promise<FriendLink[]> {
  const db = await getDb();
  const r = await db.execute(`SELECT * FROM friend_links ORDER BY id DESC`);
  return r.rows as unknown as FriendLink[];
}

export async function getLinkByCode(code: string): Promise<FriendLink | undefined> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT * FROM friend_links WHERE code = ? AND status = 1`,
    args: [code],
  });
  return r.rows[0] as unknown as FriendLink | undefined;
}

export async function createLink(d: { name: string; domain: string; code: string; url: string }) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO friend_links (name, domain, code, url) VALUES (?, ?, ?, ?)`,
    args: [d.name, d.domain, d.code, d.url],
  });
}

export async function toggleLink(id: number) {
  const db = await getDb();
  await db.execute({ sql: `UPDATE friend_links SET status = 1 - status WHERE id = ?`, args: [id] });
}

// ===== 计数（24h 同 IP 去重）=====
const DEDUP_HOURS = 24;
const RETAIN_DAYS = 30;

async function record(linkId: number, type: "in" | "out", ip: string): Promise<void> {
  const db = await getDb();
  // PV：每次都写一条原始日志；UV 由 24h 去重 SQL 统计时算
  await db.execute({
    sql: `INSERT INTO friend_link_logs (link_id, type, ip) VALUES (?, ?, ?)`,
    args: [linkId, type, ip || ""],
  });
  // 抽样清理 30 天前日志（避免每次都删）
  if (Math.random() < 0.02) {
    await db.execute(
      `DELETE FROM friend_link_logs WHERE created_at < datetime('now', '-${RETAIN_DAYS} days')`
    );
  }
}

export async function recordIn(code: string, ip: string) {
  const link = await getLinkByCode(code);
  if (link) await record(link.id, "in", ip);
}

export async function recordOut(code: string, ip: string): Promise<FriendLink | undefined> {
  const link = await getLinkByCode(code);
  if (link) await record(link.id, "out", ip);
  return link;
}

// ===== 统计（最近 N 天聚合）=====
export async function statsForLinks(days = 30): Promise<LinkStat[]> {
  const db = await getDb();
  const links = await listLinks();
  const out: LinkStat[] = [];
  for (const l of links) {
    const r = await db.execute({
      sql: `SELECT
              SUM(CASE WHEN type='in'  THEN 1 ELSE 0 END) AS in_pv,
              SUM(CASE WHEN type='out' THEN 1 ELSE 0 END) AS out_pv,
              COUNT(DISTINCT CASE WHEN type='in'  THEN ip END) AS in_uv,
              COUNT(DISTINCT CASE WHEN type='out' THEN ip END) AS out_uv
           FROM friend_link_logs
           WHERE link_id = ? AND created_at > datetime('now', ?)`,
      args: [l.id, `-${days} days`],
    });
    const a = r.rows[0];
    out.push({
      ...l,
      in_pv: Number(a.in_pv || 0),
      out_pv: Number(a.out_pv || 0),
      in_uv: Number(a.in_uv || 0),
      out_uv: Number(a.out_uv || 0),
    });
  }
  return out;
}

export async function dailyStats(days = 30): Promise<{ day: string; in_pv: number; out_pv: number }[]> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT date(created_at) AS day,
            SUM(CASE WHEN type='in'  THEN 1 ELSE 0 END) AS in_pv,
            SUM(CASE WHEN type='out' THEN 1 ELSE 0 END) AS out_pv
         FROM friend_link_logs
         WHERE created_at > datetime('now', ?)
         GROUP BY date(created_at) ORDER BY day DESC`,
    args: [`-${days} days`],
  });
  return r.rows.map((x) => ({
    day: String(x.day),
    in_pv: Number(x.in_pv || 0),
    out_pv: Number(x.out_pv || 0),
  }));
}
