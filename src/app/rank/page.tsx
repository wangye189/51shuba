import type { Metadata } from "next";
import ChannelRank from "@/components/ChannelRank";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "男生·点击排行榜" };

export default function RankPage() {
  return <ChannelRank channel="boy" />;
}
