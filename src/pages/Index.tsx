import { Link } from "react-router-dom";
import { Phone, MessageCircle, ShieldCheck, Truck, Tags, PackageCheck, ArrowRight, MapPin, Clock, Mail, Trophy, Medal, BadgeCheck, Star } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import Counter from "@/components/site/Counter";
import { useLang } from "@/i18n/LanguageContext";
import hero from "../assests/hero-shop.jpg";
import cement from "../assests/cat-cement.jpg";
import pipes from "../assests/cat-pipes.jpg";
import sanitary from "../assests/cat-sanitary.jpg";
import hardware from "../assests/cat-hardware.jpg";
import g1 from "../assests/gallery-1.jpg";
import g2 from "../assests/gallery-2.jpg";
import g3 from "../assests/gallery-3.jpg";

const Index = () => {
  const { t, lang } = useLang();
  const mr = lang === "mr" ? "font-marathi" : "";
  const cats = [cement, pipes, sanitary, hardware];
  const whyIcons = [ShieldCheck, Tags, Truck, PackageCheck];
  const awardIcons = [Trophy, Medal, BadgeCheck, Star];
  const tickerMessages = [
    "We have three shops available for rent. Interested customers may contact us.",
    "आमच्याकडे भाड्याने देण्यासाठी तीन दुकाने उपलब्ध आहेत. इच्छुकांनी कृपया संपर्क साधावा.",
    "हमारे पास किराये के लिए तीन दुकानें उपलब्ध हैं। इच्छुक ग्राहक कृपया संपर्क करें।",
  ];

  return (
    <SiteLayout>
      <section className="bg-navy-deep border-y border-border/80">
        <div className="ticker-mask">
          <div className="ticker-track py-3 text-sm font-semibold text-saffron">
            {[0, 1].map((loop) => (
              <div key={loop} className="ticker-item flex items-center gap-8 pr-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <span key={index} className="inline-flex items-center gap-8">
                    <span className="h-2 w-2 rounded-full bg-saffron" />
                    {tickerMessages.map((message) => (
                      <span key={message} className="whitespace-nowrap">
                        {message}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="Maa Ambika Traders shopfront" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute inset-0 bg-navy-deep/40" />
        </div>
        <div className="container mx-auto px-4 py-28 md:py-40 max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-navy-deep/40 px-4 py-1.5 text-xs font-medium text-saffron backdrop-blur animate-fade-in">
            <img
              src="/logos/MAA_AMBIKA_Icon_Badge.svg"
              alt="Maa Ambika Traders Logo"
              className="h-9 w-9 object-contain"
            />
            <span className={mr}>{t.hero.eyebrow}</span>
          </div>
          <h1 className={`mt-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-foreground animate-fade-up ${mr}`}>
            {t.hero.title}<br />
            <span className="bg-gradient-to-r from-saffron via-gold to-primary-glow bg-clip-text text-transparent">{t.hero.titleAccent}</span>
          </h1>
          <p className={`mt-6 max-w-2xl text-base md:text-lg text-foreground/85 leading-relaxed animate-fade-up ${mr}`} style={{ animationDelay: "0.15s" }}>
            {t.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a href="tel:9422843028" className="group inline-flex items-center gap-2 rounded-full gradient-saffron px-7 py-4 text-sm font-semibold text-primary-foreground shadow-saffron transition-transform hover:scale-105">
              <Phone className="h-4 w-4" /> <span className={mr}>{t.cta.call}</span> · 94228 43028
            </a>
            <a href="https://wa.me/918806026628" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-border bg-navy-deep/60 backdrop-blur px-7 py-4 text-sm font-semibold text-foreground hover:border-saffron hover:text-saffron transition">
              <MessageCircle className="h-4 w-4" /> <span className={mr}>{t.cta.whatsapp}</span>
            </a>
          </div>
          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-3 text-xs uppercase tracking-[0.2em] text-foreground/60">
            <span>UltraTech</span><span>ACC</span><span>Ambuja</span><span>Astral</span><span>Supreme</span><span>Finolex</span>
          </div>
        </div>
      </section>

      {/* AWARDS */}
      <section className="py-24 bg-navy-deep overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl reveal">
            <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// {t.awards.title}</span>
            <h2 className={`mt-3 text-3xl md:text-5xl font-bold ${mr}`}>{t.awards.title}</h2>
            <p className={`mt-4 text-muted-foreground ${mr}`}>{t.awards.subtitle}</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {t.awards.items.map((award, i) => {
              const Icon = awardIcons[i];
              return (
                <article key={award.t} className="reveal hover-lift rounded-2xl border border-border bg-navy-light/40 p-7 shadow-card" style={{ transitionDelay: `${i * 80}ms` }}>
                  {/* Future: replace placeholder achievements with real award names, photos, and year-specific media. */}
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-saffron text-primary-foreground shadow-saffron">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-5 inline-flex rounded-full border border-saffron/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">
                    {award.y}
                  </div>
                  <h3 className={`mt-4 text-lg font-semibold ${mr}`}>{award.t}</h3>
                  <p className={`mt-3 text-sm leading-relaxed text-foreground/75 ${mr}`}>{award.d}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-24 bg-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl reveal">
            <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// {t.why.title.split(" ")[0]}</span>
            <h2 className={`mt-3 text-3xl md:text-5xl font-bold ${mr}`}>{t.why.title}</h2>
            <p className={`mt-4 text-muted-foreground ${mr}`}>{t.why.subtitle}</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((it, i) => {
              const Icon = whyIcons[i];
              return (
                <div key={i} className="reveal hover-lift gradient-card text-card-foreground rounded-2xl p-7 shadow-card border border-black/5" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-saffron text-primary-foreground shadow-saffron">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`mt-5 text-lg font-semibold ${mr}`}>{it.t}</h3>
                  <p className={`mt-2 text-sm text-card-foreground/70 leading-relaxed ${mr}`}>{it.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-navy-deep">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-end justify-between gap-6 reveal">
            <div className="max-w-xl">
              <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// 04 Categories</span>
              <h2 className={`mt-3 text-3xl md:text-5xl font-bold ${mr}`}>{t.categories.title}</h2>
              <p className={`mt-4 text-muted-foreground ${mr}`}>{t.categories.subtitle}</p>
            </div>
            <Link to="/products" className={`inline-flex items-center gap-2 text-sm font-semibold text-saffron hover:gap-3 transition-all ${mr}`}>
              {t.nav.products} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.categories.items.map((c, i) => (
              <article key={i} className="reveal group relative overflow-hidden rounded-2xl bg-navy-light border border-border hover-lift" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="image-zoom aspect-[4/5]">
                  <img src={cats[i]} alt={c.t} loading="lazy" width={800} height={1000} className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className={`text-xl font-semibold text-foreground ${mr}`}>{c.t}</h3>
                  <p className={`mt-2 text-sm text-foreground/80 line-clamp-2 ${mr}`}>{c.d}</p>
                  <div className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold text-saffron ${mr}`}>
                    {t.cta.askRate} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY RATE */}
      <section className="py-24 bg-navy">
        <div className="container mx-auto px-4">
          <div className="reveal relative overflow-hidden rounded-3xl gradient-saffron p-10 md:p-16 shadow-saffron">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-navy-deep/30 blur-3xl" />
            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/80 ${mr}`}>{t.rate.eyebrow}</span>
                <h2 className={`mt-3 text-3xl md:text-5xl font-bold text-primary-foreground ${mr}`}>{t.rate.title}</h2>
                <p className={`mt-4 text-primary-foreground/85 max-w-lg ${mr}`}>{t.rate.subtitle}</p>
              </div>
              <div className="flex flex-col gap-3">
                <a href="tel:9422843028" className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-deep px-7 py-4 text-sm font-semibold text-foreground hover:bg-navy transition">
                  <Phone className="h-4 w-4 text-saffron" /> 94228 43028
                </a>
                <a href="https://wa.me/918806026628?text=Hello%20Maa%20Ambika%20Traders%2C%20please%20share%20today's%20rate." target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp text-white px-7 py-4 text-sm font-semibold hover:opacity-90 transition">
                  <MessageCircle className="h-4 w-4" /> <span className={mr}>{t.cta.whatsapp}</span> · 88060 26628
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 bg-navy-deep">
        <div className="container mx-auto px-4">
          <h2 className={`text-center text-3xl md:text-5xl font-bold reveal ${mr}`}>{t.stats.title}</h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.stats.items.map((s, i) => (
              <div key={i} className="reveal text-center rounded-2xl border border-border bg-navy-light/40 p-8" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-saffron to-gold bg-clip-text text-transparent">
                  <Counter to={s.v} suffix={s.s} />
                </div>
                <div className={`mt-3 text-sm uppercase tracking-wider text-muted-foreground ${mr}`}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24 bg-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl reveal">
            <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// Gallery</span>
            <h2 className={`mt-3 text-3xl md:text-5xl font-bold ${mr}`}>{t.gallery.title}</h2>
            <p className={`mt-4 text-muted-foreground ${mr}`}>{t.gallery.subtitle}</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[g1, g2, g3].map((g, i) => (
              <div key={i} className="reveal image-zoom rounded-2xl overflow-hidden border border-border aspect-[4/3]" style={{ transitionDelay: `${i * 80}ms` }}>
                <img src={g} alt={`Gallery ${i + 1}`} loading="lazy" width={1024} height={768} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-24 bg-navy-deep">
        <div className="container mx-auto px-4">
          <div className="reveal grid lg:grid-cols-2 gap-10 items-center rounded-3xl border border-border bg-navy-light/40 p-10 md:p-14">
            <div>
              <h2 className={`text-3xl md:text-5xl font-bold ${mr}`}>{t.contactCta.title}</h2>
              <p className={`mt-4 text-muted-foreground max-w-lg ${mr}`}>{t.contactCta.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="tel:9422843028" className="inline-flex items-center gap-2 rounded-full gradient-saffron px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-saffron hover:scale-105 transition-transform">
                  <Phone className="h-4 w-4" /> <span className={mr}>{t.cta.call}</span>
                </a>
                <Link to="/contact" className={`inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold hover:border-saffron hover:text-saffron transition ${mr}`}>
                  {t.cta.visit} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3 items-start"><MapPin className="h-5 w-5 text-saffron mt-0.5" /><span className={mr}>{t.contact.addressVal}</span></li>
              <li className="flex gap-3 items-start"><Clock className="h-5 w-5 text-saffron mt-0.5" /><span className={mr}>{t.contact.hoursVal}</span></li>
              <li className="flex gap-3 items-start"><Mail className="h-5 w-5 text-saffron mt-0.5" /><a href="mailto:themaaambikatraders@gmail.com" className="break-all">themaaambikatraders@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
