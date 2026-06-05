import { getChannels } from "@/lib/taxonomy";
import ShelfClient from "@/components/ShelfClient";

export const dynamic = "force-dynamic";

export default async function ShelfPage() {
  const channels = await getChannels();
  return <ShelfClient channels={channels} />;
}
