import { Outlet } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";
import { InteractiveMenu, type InteractiveMenuItem } from "../../components/ui/modern-mobile-menu";
import { Home, Key, DollarSign, Megaphone } from "lucide-react";
import { paths } from "../../routes/paths";

const mobileMenuItems: InteractiveMenuItem[] = [
  { label: "Home", icon: Home, path: paths.home },
  { label: "Aluguel", icon: Key, path: paths.aluguel },
  { label: "Venda", icon: DollarSign, path: paths.venda },
  { label: "Anunciar", icon: Megaphone, path: paths.plans },
];

export default function PublicLayout() {
  return (
    <div className="min-h-full flex flex-col relative pb-20 md:pb-0">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pt-[10vh]">
        <Outlet />
      </main>
      <Footer />
      <div className="md:hidden">
        <InteractiveMenu items={mobileMenuItems} />
      </div>
    </div>
  );
}
