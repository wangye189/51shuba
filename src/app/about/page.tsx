import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "关于我们",
  description: `关于 ${site.name}、免责声明、隐私政策与联系方式。`,
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="space-y-3">
      <section className="panel space-y-6 p-5 text-[14px] leading-relaxed text-[#444]">
        <div>
          <h1 className="mb-2 text-lg font-bold text-[#222]">关于我们</h1>
          <p>
            {site.name}（{site.domainText}）是一个免费的在线小说阅读网站，致力于为读者提供干净、无弹窗、
            响应式的阅读体验。站内收录玄幻、都市、言情、历史、武侠、科幻等多种类型作品，手机与电脑均可流畅浏览。
          </p>
        </div>

        <div id="disclaimer">
          <h2 className="mb-2 text-base font-bold text-[#222]">免责声明</h2>
          <p>
            本站所展示的小说内容均来自互联网公开渠道，版权归原作者及相关版权方所有，本站仅提供信息检索与展示服务，
            不存储、不主张对任何作品的版权。若版权方认为本站内容侵犯了您的合法权益，请通过下方邮箱与我们联系，
            我们将在核实后第一时间删除相关内容。
          </p>
        </div>

        <div id="privacy">
          <h2 className="mb-2 text-base font-bold text-[#222]">隐私政策</h2>
          <p>
            本站使用 Cookie 及第三方统计服务（如 Google Analytics）分析访问情况以改进体验；在投放广告时可能接入
            第三方广告服务（如 Google AdSense），相关服务可能依据其各自的隐私政策使用 Cookie。您可以随时在浏览器中
            管理或清除 Cookie。除统计与广告所需的匿名数据外，本站不会主动收集您的个人身份信息。
          </p>
        </div>

        <div id="contact">
          <h2 className="mb-2 text-base font-bold text-[#222]">联系方式</h2>
          <p>
            合作、版权或其他问题，请发送邮件至：
            <a className="link" href="mailto:admin@51shuku.com">admin@51shuku.com</a>
            ，我们会尽快回复。
          </p>
        </div>
      </section>
    </div>
  );
}
