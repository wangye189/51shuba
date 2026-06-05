import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ChannelRank from "@/components/ChannelRank";
import { getChannels } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const chs = await getChannels();
  return chs.filter((c) => c.ckey !== "boy").map((c) => ({ ch: c.ckey }));
}

type Props = { params: Promise<{ ch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ch } = await params;
  const chan = (await getChannels()).find((c) => c.ckey === ch);
  return { title: chan ? `${chan.name}·点击排行榜` : "排行榜" };
}

export default async function ChannelRankPage({ params }: Props) {
  const { ch } = await params;
  if (ch === "boy" || !(await getChannels()).some((c) => c.ckey === ch)) notFound();
  return <ChannelRank channel={ch} />;
}
