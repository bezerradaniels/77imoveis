import { Outlet } from "react-router-dom";

import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

export default function AuthLayout() {
  return (
    <div className="min-h-full flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-[10vh]">
        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
