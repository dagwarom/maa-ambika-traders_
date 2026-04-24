import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t, lang } = useLang();
  const mr = lang === "mr" ? "font-marathi" : "";
  return (
    <footer className="bg-navy-deep border-t border-border">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center">
            <img
              src="/logos/MAA_AMBIKA_Logo_Horizontal_Transparent.svg"
              alt="Maa Ambika Traders Logo"
              className="h-16 md:h-20 w-auto object-contain object-left"
            />
          </div>
          <p className={`mt-4 text-sm text-muted-foreground leading-relaxed ${mr}`}>{t.footer.about}</p>
        </div>
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider text-saffron ${mr}`}>{t.footer.quick}</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/", l: t.nav.home },
              { to: "/about", l: t.nav.about },
              { to: "/products", l: t.nav.products },
              { to: "/contact", l: t.nav.contact },
            ].map((i) => (
              <li key={i.to}>
                <Link to={i.to} className={`text-foreground/75 hover:text-saffron transition ${mr}`}>
                  {i.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider text-saffron ${mr}`}>{t.footer.reach}</h4>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-saffron" /><span className={mr}>{t.contact.addressVal}</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-saffron" /><a href="tel:9422843028">+91 94228 43028</a></li>
            <li className="flex gap-2"><MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-saffron" /><a href="https://wa.me/918806026628">+91 88060 26628</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-saffron" /><a href="mailto:themaaambikatraders@gmail.com" className="break-all">themaaambikatraders@gmail.com</a></li>
          </ul>
        </div>
        <div>
          <h4 className={`text-sm font-semibold uppercase tracking-wider text-saffron ${mr}`}>{t.contact.hours}</h4>
          <p className={`mt-4 text-sm text-foreground/80 leading-relaxed ${mr}`}>{t.contact.hoursVal}</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className={`container mx-auto px-4 py-5 text-center text-xs text-muted-foreground ${mr}`}>
          © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
};
export default Footer;
