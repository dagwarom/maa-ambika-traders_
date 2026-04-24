import SiteLayout from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { Award, Heart, Sparkles, Check, Trophy, Medal, BadgeCheck, Star } from "lucide-react";
import shop from "../assests/hero-shop.jpg";

const icons = [Heart, Award, Sparkles];
const awardIcons = [Trophy, Medal, BadgeCheck, Star];

const About = () => {
  const { t, lang } = useLang();
  const mr = lang === "mr" ? "font-marathi" : "";
  return (
    <SiteLayout>
      <section className="py-24 md:py-32 bg-navy-deep">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal">
            <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// {t.nav.about}</span>
            <h1 className={`mt-3 text-4xl md:text-6xl font-bold leading-tight ${mr}`}>{t.about.title}</h1>
            <p className={`mt-6 text-lg text-foreground/80 leading-relaxed ${mr}`}>{t.about.lead}</p>
            <p className={`mt-4 text-muted-foreground leading-relaxed ${mr}`}>{t.about.p1}</p>
            <p className={`mt-4 text-muted-foreground leading-relaxed ${mr}`}>{t.about.p2}</p>
          </div>
          <div className="reveal image-zoom rounded-3xl overflow-hidden border border-border aspect-[4/5] shadow-elegant">
            <img src={shop} alt="Shop" loading="lazy" width={1024} height={1280} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-navy">
        <div className="container mx-auto px-4 grid gap-6 md:grid-cols-3">
          {t.about.values.map((v, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="reveal gradient-card text-card-foreground rounded-2xl p-8 shadow-card hover-lift" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-saffron text-primary-foreground"><Icon className="h-6 w-6" /></div>
                <h3 className={`mt-5 text-xl font-semibold ${mr}`}>{v.t}</h3>
                <p className={`mt-2 text-card-foreground/70 ${mr}`}>{v.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-24 bg-navy-deep">
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
                  {/* Future: replace placeholder achievements with real awards, certificates, or recognition photos. */}
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-saffron text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-5 inline-flex rounded-full border border-saffron/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">
                    {award.y}
                  </div>
                  <h3 className={`mt-4 text-lg font-semibold ${mr}`}>{award.t}</h3>
                  <p className={`mt-3 text-sm text-foreground/75 ${mr}`}>{award.d}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-navy-deep">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className={`text-3xl md:text-5xl font-bold reveal ${mr}`}>{t.about.services.title}</h2>
          <ul className="mt-10 grid sm:grid-cols-2 gap-4 reveal">
            {t.about.services.items.map((s, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-navy-light/40 px-5 py-4 text-left">
                <span className="grid h-8 w-8 place-items-center rounded-full gradient-saffron text-primary-foreground"><Check className="h-4 w-4" /></span>
                <span className={`font-medium ${mr}`}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
};
export default About;
