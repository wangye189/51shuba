import { latestUpdated } from "@/lib/repo";
import BookListRow from "@/components/BookListRow";
import AdSlot from "@/components/AdSlot";

export default async function ChannelComplete({ channel }: { channel: string }) {
  const rows = (await latestUpdated(500, channel)).filter((b) => /完/.test(b.status || ""));

  return (
    <div className="space-y-3">
      <AdSlot place="homeTop" />
      <section className="panel">
        <div className="block-head">
          <h2>完本小说</h2>
          <span className="more">共 {rows.length} 部</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-[var(--muted)]">该频道暂无完本作品。</p>
        ) : (
          <div>
            {rows.map((b) => (
              <BookListRow key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
