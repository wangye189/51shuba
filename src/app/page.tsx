import ChannelHome from "@/components/ChannelHome";
import JsonLd from "@/components/JsonLd";
import { websiteJsonLd } from "@/lib/seo";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <ChannelHome channel="boy" />
    </>
  );
}
