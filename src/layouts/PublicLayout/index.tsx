import { Outlet } from "react-router-dom";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import ScrollToTop from "../../components/common/ScrollToTop";

export default function PublicLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pt-[10vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
