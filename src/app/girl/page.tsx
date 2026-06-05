import type { Metadata } from "next";
import ChannelHome from "@/components/ChannelHome";
import { site } from "@/lib/config";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "女生频道",
  description: "言情等女生频道小说，免费在线阅读，无弹窗、更新快。",
  alternates: { canonical: `${site.url}/girl` },
};

export default function GirlChannel() {
  return <ChannelHome channel="girl" />;
}
