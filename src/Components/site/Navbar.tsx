import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const Navbar = () => {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const logoPath = `${import.meta.env.BASE_URL}logos/MAA_AMBIKA_Logo_Horizontal_Transparent.svg`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/about", label: t.nav.about },
    { to: "/products", label: t.nav.products },
    { to: "/contact", label: t.nav.contact },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-navy-deep/90 backdrop-blur-xl shadow-elegant" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-24 md:h-32 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center min-h-[88px] md:min-h-[112px]">
            <div className="flex items-center pl-3 pr-4 py-3">
              <img
                src={logoPath}
                alt="Maa Ambika Traders Logo"
                className="h-[72px] md:h-[92px] w-auto object-contain object-left"
              />
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative text-sm font-medium transition-colors hover:text-saffron ${
                  isActive ? "text-saffron" : "text-foreground/80"
                } ${lang === "mr" ? "font-marathi" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-0.5 bg-saffron transition-all duration-300 ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageToggle />
          <a
            href="tel:9422843028"
            className="inline-flex items-center gap-2 rounded-full gradient-saffron px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-saffron transition-transform hover:scale-105"
          >
            <Phone className="h-4 w-4" /> 94228 43028
          </a>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden grid h-11 w-11 place-items-center rounded-full bg-navy-light text-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-navy-deep/95 backdrop-blur-xl border-t border-border animate-slide-down">
          <nav className="container mx-auto flex flex-col px-4 py-6 gap-1">
            <div className="mb-4 flex justify-start">
              <LanguageToggle />
            </div>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-base font-medium transition ${
                    isActive ? "bg-navy-light text-saffron" : "text-foreground/85"
                  } ${lang === "mr" ? "font-marathi" : ""}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-4 flex items-center justify-start">
              <a
                href="tel:9422843028"
                className="inline-flex items-center gap-2 rounded-full gradient-saffron px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> {t.cta.call}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
