import { getChannels, getCategories } from "@/lib/taxonomy";
import TaxonomyManager from "@/components/admin/TaxonomyManager";

export const dynamic = "force-dynamic";

export default async function AdminTaxonomy() {
  const [channels, categories] = await Promise.all([getChannels(), getCategories()]);
  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-[#2c3e50]">频道 / 分类管理</h1>
      <p className="mb-4 text-sm text-gray-500">改动即时生效到前台导航与频道内容。slug/标识用英文，对应书籍的 category 字段。</p>
      <TaxonomyManager channels={channels} categories={categories} />
    </div>
  );
}
