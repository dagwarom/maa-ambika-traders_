import { useEffect, useState } from "react";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";

const FloatingActions = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="https://wa.me/918806026628"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-elegant pulse-ring transition-transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href="tel:9422843028"
        aria-label="Call"
        className="fixed bottom-5 right-24 z-40 grid h-14 w-14 place-items-center rounded-full gradient-saffron text-primary-foreground shadow-saffron transition-transform hover:scale-110 md:hidden"
      >
        <Phone className="h-6 w-6" />
      </a>
      {show && (
        <button
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-navy-light/90 backdrop-blur border border-border text-foreground hover:text-saffron transition animate-fade-in"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
};
export default FloatingActions;
