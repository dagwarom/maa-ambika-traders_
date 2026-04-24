import { useLang } from "@/i18n/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-navy-light/60 p-1 text-xs font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-full transition ${lang === "en" ? "bg-saffron text-primary-foreground" : "text-foreground/70"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("mr")}
        className={`px-3 py-1.5 rounded-full transition font-marathi ${lang === "mr" ? "bg-saffron text-primary-foreground" : "text-foreground/70"}`}
      >
        मराठी
      </button>
    </div>
  );
};
export default LanguageToggle;
