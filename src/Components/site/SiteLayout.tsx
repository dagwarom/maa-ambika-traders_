import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingActions from "./FloatingActions";
import { useReveal } from "@/hooks/useReveal";
import { useLocation } from "react-router-dom";

const SiteLayout = ({ children }: { children: ReactNode }) => {
  useReveal();
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 md:pt-36">{children}</main>
      <Footer />
      <FloatingActions />
    </div>
  );
};
export default SiteLayout;
