import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

type RateRow = {
  item: string;
  price: string;
};

type RateState = {
  cementRates: RateRow[];
  steelRates: RateRow[];
};

type LiveRatesResponse = {
  success?: boolean;
  message?: string;
  cement?: Array<{ item?: string; price?: string | number }>;
  steel?: Array<{ item?: string; price?: string | number }>;
};

const FALLBACK_RATES: RateState = {
  cementRates: [
    { item: "Ultratech", price: "₹300" },
    { item: "Dalmia", price: "₹320" },
  ],
  steelRates: [
    { item: "5/6mm", price: "₹60" },
    { item: "8mm", price: "₹62" },
    { item: "10mm", price: "₹65" },
    { item: "12mm", price: "₹66" },
  ],
};

// Future workflow note:
// Papa can send WhatsApp messages in a fixed rate-update format.
// A Make/Zapier/WhatsApp Business API flow can write those values into Google Sheets.
// This website can keep reading the Apps Script GET endpoint without changing the UI layer.
const API_URL = import.meta.env.VITE_RATES_UPDATE_API_URL?.trim();

const normalizeRates = (rows: LiveRatesResponse["cement"] = []) =>
  rows
    .map((row) => {
      const item = String(row?.item ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\s+mm$/i, "mm");
      const rawPrice = String(row?.price ?? "").replace(/\s+/g, " ").trim();
      const price = rawPrice ? (rawPrice.startsWith("₹") ? rawPrice : `₹${rawPrice}`) : "";
      return { item, price };
    })
    .filter((row) => row.item && row.price);

const RateCard = ({
  title,
  rows,
  labels,
}: {
  title: string;
  rows: RateRow[];
  labels: {
    item: string;
    price: string;
    live: string;
    noRatesFound: string;
  };
}) => (
  <article className="hover-lift rounded-3xl border border-border bg-navy-light/40 p-6 md:p-8 shadow-card">
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-2xl font-bold">{title}</h3>
      <span className="rounded-full border border-saffron/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron">
        {labels.live}
      </span>
    </div>

    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-navy-deep/40">
      <div className="grid grid-cols-2 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
        <span>{labels.item}</span>
        <span className="text-right">{labels.price}</span>
      </div>
      {rows.length > 0 ? (
        rows.map((row) => (
          <div key={row.item} className="grid grid-cols-2 items-center px-4 py-4 text-sm text-foreground/90 not-last:border-b not-last:border-border/70">
            <span>{row.item}</span>
            <span className="text-right font-semibold text-saffron">{row.price}</span>
          </div>
        ))
      ) : (
        <div className="px-4 py-4 text-sm text-foreground/70">
          {labels.noRatesFound}
        </div>
      )}
    </div>
  </article>
);

const LiveRates = () => {
  const { t, lang } = useLang();
  const [rates, setRates] = useState<RateState>({ cementRates: [], steelRates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mr = lang === "mr" ? "font-marathi" : "";

  const hasAnyRates = rates.cementRates.length > 0 || rates.steelRates.length > 0;

  useEffect(() => {
    let active = true;

    const loadRates = async () => {
      try {
        setLoading(true);
        setError(false);
        if (!API_URL) {
          throw new Error("Live rates API URL is missing.");
        }

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch live rates.");
        }

        const data = (await response.json()) as LiveRatesResponse;
        console.log("LiveRates API response:", data);

        const cementRates = normalizeRates(data.cement);
        const steelRates = normalizeRates(data.steel);

        if (!active) return;

        setRates({
          cementRates,
          steelRates,
        });

        if (!data.success || (cementRates.length === 0 && steelRates.length === 0)) {
          console.error("LiveRates: no pricing rows found in Apps Script GET data.", data);
        }
      } catch (err) {
        console.error("LiveRates: failed to fetch or parse live rates.", err);
        if (active) {
          setError(true);
          setRates(FALLBACK_RATES);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRates();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-24 bg-navy">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl reveal text-center mx-auto">
          <span className={`text-xs font-semibold uppercase tracking-[0.25em] text-saffron ${mr}`}>// {t.liveRates.livePricing}</span>
          <h2 className={`mt-3 text-3xl md:text-5xl font-bold ${mr}`}>{t.liveRates.todaysSellingRates}</h2>
          <p className={`mt-4 text-muted-foreground ${mr}`}>
            {t.liveRates.liveRatesSubtitle}
          </p>
        </div>

        {loading ? (
          <div className={`mt-12 rounded-3xl border border-border bg-navy-light/40 px-6 py-10 text-center text-foreground/80 ${mr}`}>
            {t.liveRates.loadingRates}
          </div>
        ) : (
          <>
            {!hasAnyRates ? (
              <div className={`mt-12 rounded-3xl border border-border bg-navy-light/40 px-6 py-10 text-center text-foreground/80 ${mr}`}>
                {t.liveRates.noRatesFound}
              </div>
            ) : null}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <RateCard
              title={t.liveRates.todaysCementRates}
              rows={rates.cementRates}
              labels={{
                item: t.liveRates.item,
                price: t.liveRates.price,
                live: t.liveRates.live,
                noRatesFound: t.liveRates.noRatesFound,
              }}
            />
            <RateCard
              title={t.liveRates.todaysSteelRates}
              rows={rates.steelRates}
              labels={{
                item: t.liveRates.item,
                price: t.liveRates.price,
                live: t.liveRates.live,
                noRatesFound: t.liveRates.noRatesFound,
              }}
            />
          </div>
          </>
        )}

        {error && (
          <div className={`mt-6 rounded-3xl border border-border bg-navy-light/30 px-6 py-4 text-center text-sm text-foreground/80 ${mr}`}>
            {t.liveRates.unableToLoadRates}
          </div>
        )}

        <p className={`reveal mt-8 text-center text-sm text-muted-foreground max-w-3xl mx-auto ${mr}`}>
          {t.liveRates.ratesNote}
        </p>

        <div className="reveal mt-8 flex justify-center">
          <a
            href="https://wa.me/918806026628?text=Hello%20Maa%20Ambika%20Traders,%20I%20want%20today's%20final%20cement%20and%20steel%20rate."
            target="_blank"
            rel="noopener"
            className={`inline-flex items-center gap-2 rounded-full gradient-saffron px-7 py-4 text-sm font-semibold text-primary-foreground shadow-saffron transition-transform hover:scale-105 ${mr}`}
          >
            <MessageCircle className="h-4 w-4" /> {t.liveRates.askFinalRate}
          </a>
        </div>
      </div>
    </section>
  );
};

export default LiveRates;
