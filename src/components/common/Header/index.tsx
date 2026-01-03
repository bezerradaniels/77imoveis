import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import Container from "../Container";
import { paths } from "../../../routes/paths";
import { AuthContext } from "../../../app/providers";
import { Button } from "../../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

export default function Header() {
  const { user, role } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: paths.aluguel, label: "Aluguel" },
    { to: paths.venda, label: "Vendas" },
    { to: paths.lancamentos, label: "Lançamentos" },
    { to: paths.contact, label: "Contato" },
    { to: paths.plans, label: "Planos" },
    { to: paths.registerCorretor, label: "Corretores" },
  ];

  const getDashboardPath = () => {
    if (role === "imobiliaria") return paths.dashImobiliaria;
    if (role === "corretor") return paths.dashCorretor;
    return paths.dashUsuario;
  };

  const getNewPropertyPath = () => {
    if (role === "imobiliaria") return paths.dashImobiliariaNew;
    if (role === "corretor") return paths.dashCorretorNew;
    return paths.dashUsuarioImovelNovo;
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-slate-50/90 backdrop-blur border-b border-slate-100 h-[10vh] min-h-20 flex items-center"
    >
      <Container className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to={paths.home} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${scrolled ? "bg-lime-500" : "bg-lime-400"}`}>
              <span className="font-black text-lg text-gray-900">77</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Imóveis</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-gray-900 hover:text-lime-600 hover:bg-lime-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to={getDashboardPath()} className="hidden md:block">
              <Button variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-lime-400 font-semibold">
                Acessar Painel
              </Button>
            </Link>
          ) : (
            <Link to={paths.login} className="hidden md:block">
              <Button variant="ghost" size="sm" className="rounded-full text-gray-900 hover:text-lime-400">
                Entrar
              </Button>
            </Link>
          )}

          {user ? (
            <Link to={getNewPropertyPath()} className="hidden md:block">
              <Button size="sm" className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-full px-6">
                Anunciar
              </Button>
            </Link>
          ) : (
            <Link to={paths.register} className="hidden md:block">
              <Button size="sm" className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-full px-6">
                Cadastrar
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden text-gray-900 hover:text-lime-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-gray-200 w-80 p-6">
              <SheetHeader className="mb-8">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center">
                    <span className="text-gray-900 font-black text-sm">77</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">Imóveis</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-gray-900 hover:text-lime-600 hover:bg-lime-50 transition-all px-3 py-3 rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-3">
                {user ? (
                  <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-900 hover:text-lime-400 h-11">
                      Acessar Painel
                    </Button>
                  </Link>
                ) : (
                  <Link to={paths.login} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-900 hover:text-lime-400 h-11">
                      Entrar
                    </Button>
                  </Link>
                )}

                {user ? (
                  <Link to={getNewPropertyPath()} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold h-11 rounded-full">
                      Anunciar Grátis
                    </Button>
                  </Link>
                ) : (
                  <Link to={paths.register} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold h-11 rounded-full">
                      Cadastrar
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
