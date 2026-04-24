import SiteLayout from "@/components/site/SiteLayout";
import LiveRates from "@/components/site/LiveRates";
import { useLang } from "@/i18n/LanguageContext";
import { Phone, MessageCircle } from "lucide-react";
import cement from "../assests/cat-cement.jpg";
import pipes from "../assests/cat-pipes.jpg";
import sanitary from "../assests/cat-sanitary.jpg";
import hardware from "../assests/cat-hardware.jpg";

const Products = () => {
  const { t, lang } = useLang();
  const mr = lang === "mr" ? "font-marathi" : "";
  const imgs = [cement, pipes, sanitary, hardware];
  const brands = [
    ["UltraTech", "ACC", "Ambuja", "Birla", "Dalmia"],
    ["Astral", "Supreme", "Finolex", "Prince", "Ashirvad"],
    ["Hindware", "Cera", "Parryware", "Jaquar"],
    ["Bosch", "Stanley", "Taparia", "Godrej", "GKW"],
  ];
  return (
    <SiteLayout>
      <section className="py-24 md:py-28 bg-navy-deep">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// {t.nav.products}</span>
          <h1 className={`mt-3 text-4xl md:text-6xl font-bold ${mr}`}>{t.products.title}</h1>
          <p className={`mt-5 text-muted-foreground ${mr}`}>{t.products.subtitle}</p>
        </div>
      </section>

      <LiveRates />

      <section className="pb-24 bg-navy-deep">
        <div className="container mx-auto px-4 space-y-8">
          {t.categories.items.map((c, i) => (
            <article key={i} className={`reveal grid lg:grid-cols-2 gap-8 items-center rounded-3xl overflow-hidden border border-border bg-navy-light/40 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="image-zoom aspect-[4/3] lg:aspect-auto lg:h-full">
                <img src={imgs[i]} alt={c.t} loading="lazy" width={1000} height={750} className="h-full w-full object-cover" />
              </div>
              <div className="p-8 md:p-12">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-saffron">0{i + 1}</span>
                <h2 className={`mt-2 text-3xl md:text-4xl font-bold ${mr}`}>{c.t}</h2>
                <p className={`mt-4 text-muted-foreground ${mr}`}>{c.d}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {brands[i].map((b) => (
                    <span key={b} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80">{b}</span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="tel:9422843028" className={`inline-flex items-center gap-2 rounded-full gradient-saffron px-5 py-3 text-sm font-semibold text-primary-foreground shadow-saffron hover:scale-105 transition-transform ${mr}`}>
                    <Phone className="h-4 w-4" /> {t.cta.askRate}
                  </a>
                  <a href="https://wa.me/918806026628" target="_blank" rel="noopener" className={`inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-saffron hover:text-saffron transition ${mr}`}>
                    <MessageCircle className="h-4 w-4" /> {t.cta.whatsapp}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};
export default Products;
