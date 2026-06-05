import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ChannelComplete from "@/components/ChannelComplete";
import { getChannels } from "@/lib/taxonomy";

export const revalidate = 86400;

export async function generateStaticParams() {
  const chs = await getChannels();
  return chs.filter((c) => c.ckey !== "boy").map((c) => ({ ch: c.ckey }));
}

type Props = { params: Promise<{ ch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ch } = await params;
  const chan = (await getChannels()).find((c) => c.ckey === ch);
  return { title: chan ? `${chan.name}·完本小说` : "完本小说" };
}

export default async function ChannelCompletePage({ params }: Props) {
  const { ch } = await params;
  if (ch === "boy" || !(await getChannels()).some((c) => c.ckey === ch)) notFound();
  return <ChannelComplete channel={ch} />;
}
