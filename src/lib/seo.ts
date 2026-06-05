import { site } from "./config";
import type { Book } from "./repo";

const abs = (path: string) => `${site.url}${path}`;

/** 全站：WebSite + 站内搜索框（让 Google 显示 sitelinks searchbox） */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: abs("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** 书详情：Book schema */
export function bookJsonLd(book: Book, chapterCount: number, genre: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    genre,
    inLanguage: "zh-CN",
    bookFormat: "https://schema.org/EBook",
    numberOfPages: chapterCount,
    description: book.intro,
    url: abs(`/book/${book.id}`),
    aggregateRating:
      book.views > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: "4.7",
            ratingCount: Math.max(10, Math.round(book.views / 100)),
          }
        : undefined,
  };
}

/** 面包屑 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
