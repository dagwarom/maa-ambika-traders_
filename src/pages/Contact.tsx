import SiteLayout from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { Phone, MessageCircle, Mail, MapPin, Clock, Navigation } from "lucide-react";

const Contact = () => {
  const { t, lang } = useLang();
  const mr = lang === "mr" ? "font-marathi" : "";
  return (
    <SiteLayout>
      <section className="py-24 md:py-28 bg-navy-deep">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// {t.nav.contact}</span>
          <h1 className={`mt-3 text-4xl md:text-6xl font-bold ${mr}`}>{t.contact.title}</h1>
        </div>
      </section>

      <section className="pb-24 bg-navy-deep">
        <div className="container mx-auto px-4 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[
              { I: Phone, l: t.contact.phone, v: "+91 94228 43028", href: "tel:9422843028" },
              { I: MessageCircle, l: t.contact.whatsapp, v: "+91 88060 26628", href: "https://wa.me/918806026628" },
              { I: Mail, l: t.contact.email, v: "themaaambikatraders@gmail.com", href: "mailto:themaaambikatraders@gmail.com" },
              { I: MapPin, l: t.contact.address, v: t.contact.addressVal },
              { I: Clock, l: t.contact.hours, v: t.contact.hoursVal },
            ].map(({ I, l, v, href }, i) => (
              <a
                key={i}
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel="noopener"
                className={`reveal block rounded-2xl border border-border bg-navy-light/40 p-6 hover:border-saffron transition group ${href ? "" : "pointer-events-none"}`}
              >
                <div className="flex gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl gradient-saffron text-primary-foreground shrink-0"><I className="h-5 w-5" /></span>
                  <div>
                    <div className={`text-xs uppercase tracking-wider text-muted-foreground ${mr}`}>{l}</div>
                    <div className={`mt-1 font-medium text-foreground group-hover:text-saffron transition break-words ${mr}`}>{v}</div>
                  </div>
                </div>
              </a>
            ))}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Maa+Ambika+Traders+Samudrapur+442305"
              target="_blank" rel="noopener"
              className={`reveal inline-flex w-full items-center justify-center gap-2 rounded-full gradient-saffron px-6 py-4 text-sm font-semibold text-primary-foreground shadow-saffron hover:scale-[1.02] transition ${mr}`}
            >
              <Navigation className="h-4 w-4" /> {t.contact.directions}
            </a>
          </div>

          <div className="lg:col-span-3 reveal rounded-3xl overflow-hidden border border-border bg-navy-light/40 min-h-[420px] lg:min-h-full">
            <iframe
              title="Maa Ambika Traders location"
              src="https://www.google.com/maps?q=Samudrapur,+Maharashtra+442305&output=embed"
              className="w-full h-full min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};
export default Contact;
