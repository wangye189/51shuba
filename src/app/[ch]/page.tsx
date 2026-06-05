import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ChannelHome from "@/components/ChannelHome";
import { getChannels } from "@/lib/taxonomy";
import { site } from "@/lib/config";

export const revalidate = 300;

// 预渲染除 boy（根路径 /）以外的所有频道
export async function generateStaticParams() {
  const chs = await getChannels();
  return chs.filter((c) => c.ckey !== "boy").map((c) => ({ ch: c.ckey }));
}

type Props = { params: Promise<{ ch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ch } = await params;
  const chan = (await getChannels()).find((c) => c.ckey === ch);
  if (!chan || ch === "boy") return { title: "未找到" };
  return {
    title: `${chan.name}频道`,
    description: `${chan.name}频道小说，免费在线阅读，无弹窗、更新快。`,
    alternates: { canonical: `${site.url}/${ch}` },
  };
}

export default async function ChannelPage({ params }: Props) {
  const { ch } = await params;
  // boy 用根路径 /，这里只处理其它频道
  if (ch === "boy" || !(await getChannels()).some((c) => c.ckey === ch)) notFound();
  return <ChannelHome channel={ch} />;
}
