import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import RequireAuth from "./guards/RequireAuth";
import RequireRole from "./guards/RequireRole";
import GuestOnly from "./guards/GuestOnly";

import Home from "../pages/Home";
import Listings from "../pages/Listings";
import Aluguel from "../pages/Aluguel";
import Vendas from "../pages/Vendas";
import Lancamentos from "../pages/Lancamentos";
import Property from "../pages/Property";
import Login from "../pages/Login";
import ProfileImobiliaria from "../pages/ProfileImobiliaria";
import ProfileCorretor from "../pages/ProfileCorretor";
import Support from "../pages/Support";

import RegisterImobiliaria from "../pages/RegisterImobiliaria";
import RegisterCorretor from "../pages/RegisterCorretor";
import RegisterUsuario from "../pages/RegisterUsuario";

import Favorites from "../pages/DashboardUsuarios/Favorites";
import Settings from "../pages/DashboardUsuarios/Settings";

import DashboardImoveisImobiliaria from "../pages/DashboardImobiliarias/Imoveis";
import DashboardImovelNovoImobiliaria from "../pages/DashboardImobiliarias/ImoveisNovo";
import DashboardImovelEditarImobiliaria from "../pages/DashboardImobiliarias/ImoveisEditar";

import DashboardImoveisCorretor from "../pages/DashboardCorretores/Imoveis";
import DashboardImovelNovoCorretor from "../pages/DashboardCorretores/ImoveisNovo";
import DashboardImovelEditarCorretor from "../pages/DashboardCorretores/ImoveisEditar";

import DashboardUsuarioLayout from "../layouts/DashboardUsuarioLayout";
import CreateImobiliaria from "../pages/DashboardUsuarios/CreateImobiliaria";
import MyListings from "../pages/DashboardUsuarios/MyListings";
import NewProperty from "../pages/DashboardUsuarios/NewProperty";
import Clients from "../pages/DashboardUsuarios/Clients";
import Messages from "../pages/DashboardUsuarios/Messages";
import MyProfiles from "../pages/DashboardUsuarios/MyProfiles";

import Contact from "../pages/Contact";
import Plans from "../pages/Plans";
import Terms from "../pages/Terms";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CookiesPolicy from "../pages/CookiesPolicy";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },

      { path: "/imoveis", element: <Listings /> },

      { path: "/aluguel", element: <Aluguel /> },
      { path: "/venda", element: <Vendas /> },
      { path: "/lancamentos", element: <Lancamentos /> },

      { path: "/:purpose", element: <Listings /> },
      { path: "/:purpose/:city", element: <Listings /> },
      { path: "/:purpose/:city/:type", element: <Listings /> },
      { path: "/:purpose/:city/:type/:bedrooms", element: <Listings /> },

      { path: "/imovel/:idOrSlug", element: <Property /> },
      { path: "/perfil/imobiliaria", element: <ProfileImobiliaria /> },
      { path: "/perfil/corretor", element: <ProfileCorretor /> },
      { path: "/ajuda-suporte", element: <Support /> },

      { path: "/contato", element: <Contact /> },
      { path: "/planos", element: <Plans /> },
      { path: "/termos", element: <Terms /> },
      { path: "/privacidade", element: <PrivacyPolicy /> },
      { path: "/cookies", element: <CookiesPolicy /> },
    ],
  },

  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/cadastro/imobiliaria", element: <RegisterImobiliaria /> },
          { path: "/cadastro/corretor", element: <RegisterCorretor /> },
          { path: "/cadastro/usuario", element: <RegisterUsuario /> },
        ],
      },
    ],
  },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <RequireRole allow={["imobiliaria"]} />,
            children: [
              { path: "/dashboard/imobiliaria", element: <Navigate to="/dashboard/imobiliaria/imoveis" replace /> },
              { path: "/dashboard/imobiliaria/imoveis", element: <DashboardImoveisImobiliaria /> },
              { path: "/dashboard/imobiliaria/imoveis/novo", element: <DashboardImovelNovoImobiliaria /> },
              { path: "/dashboard/imobiliaria/imoveis/:id", element: <DashboardImovelEditarImobiliaria /> },
            ],
          },
          {
            element: <RequireRole allow={["corretor"]} />,
            children: [
              { path: "/dashboard/corretor", element: <Navigate to="/dashboard/corretor/imoveis" replace /> },
              { path: "/dashboard/corretor/imoveis", element: <DashboardImoveisCorretor /> },
              { path: "/dashboard/corretor/imoveis/novo", element: <DashboardImovelNovoCorretor /> },
              { path: "/dashboard/corretor/imoveis/:id", element: <DashboardImovelEditarCorretor /> },
            ],
          },
        ],
      },
      {
        element: <RequireRole allow={["usuario"]} />,
        children: [
          {
            element: <DashboardUsuarioLayout />,
            children: [
              { path: "/dashboard/usuario", element: <MyListings /> },
              { path: "/dashboard/usuario/imoveis", element: <MyListings /> },
              { path: "/dashboard/usuario/favoritos", element: <Favorites /> },
              { path: "/dashboard/usuario/clientes", element: <Clients /> },
              { path: "/dashboard/usuario/mensagens", element: <Messages /> },
              { path: "/dashboard/usuario/perfis", element: <MyProfiles /> },
              { path: "/dashboard/usuario/configuracoes", element: <Settings /> },
              { path: "/dashboard/usuario/criar-imobiliaria", element: <CreateImobiliaria /> },
              { path: "/dashboard/usuario/imoveis/novo", element: <NewProperty /> },
              { path: "/dashboard/usuario/imoveis/:id", element: <NewProperty /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
