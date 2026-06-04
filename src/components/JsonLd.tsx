/** 把结构化数据以 <script type="application/ld+json"> 注入页面（SSR 进 HTML，搜索引擎可读） */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // 结构化数据由本地可信对象序列化，非用户输入
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
