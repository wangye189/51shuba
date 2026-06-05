import type { Metadata } from "next";
import ChannelComplete from "@/components/ChannelComplete";
import { site } from "@/lib/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "男生·完本小说",
  description: "已完结全本小说大全，免费在线阅读，无弹窗、更新快。",
  alternates: { canonical: `${site.url}/complete` },
};

export default function CompletePage() {
  return <ChannelComplete channel="boy" />;
}
