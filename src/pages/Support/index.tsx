import { Link } from "react-router-dom";
import { Mail, MessageCircle, PhoneCall, BookOpen, ShieldCheck, LifeBuoy, ArrowRight } from "lucide-react";
import Seo from "../../components/common/Seo";
import { Button } from "../../components/ui/button";
import Container from "../../components/common/Container";
import { paths } from "../../routes/paths";

const channels = [
    {
        title: "Chat com especialista",
        description: "Atendimento de segunda a sexta, das 8h às 20h",
        icon: <MessageCircle className="size-5" />,
        action: "Iniciar chat",
    },
    {
        title: "E-mail",
        description: "respostas em até 4h úteis",
        icon: <Mail className="size-5" />,
        action: "Enviar e-mail",
    },
    {
        title: "Telefone / WhatsApp",
        description: "(77) 99999-0000",
        icon: <PhoneCall className="size-5" />,
        action: "Ligar agora",
    },
];

const faqs = [
    {
        question: "Como acompanho meus leads?",
        answer: "Acesse Dashboard → Clientes e visualize o funil completo, exporte relatórios e configure alertas.",
    },
    {
        question: "Posso alterar o plano da minha imobiliária?",
        answer: "Sim. Basta ir em Configurações → Planos e escolher a opção desejada. A mudança é imediata.",
    },
    {
        question: "Preciso de ajuda para importar imóveis?",
        answer: "Nosso time de onboarding ajuda com planilhas ou integrações via API. Envie os dados pelo chat.",
    },
];

export default function Support() {
    return (
        <>
            <Seo title="Ajuda e Suporte | 77 Imóveis" />
            <div className="bg-slate-50 min-h-screen py-12">
                <Container className="space-y-10">
                    <header className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Suporte</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Central de Ajuda</h1>
                            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                                Tire dúvidas, fale com especialistas e explore recursos para potencializar seus anúncios.
                            </p>
                        </div>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800" asChild>
                            <Link to={paths.dashUsuarioMensagens}>Abrir um chamado</Link>
                        </Button>
                    </header>

                    <section className="grid gap-4 md:grid-cols-3">
                        {channels.map((channel) => (
                            <div key={channel.title} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900/5 text-slate-900 flex items-center justify-center">
                                    {channel.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{channel.title}</h3>
                                    <p className="text-sm text-slate-500">{channel.description}</p>
                                </div>
                                <Button variant="outline" className="mt-auto text-sm">
                                    {channel.action}
                                </Button>
                            </div>
                        ))}
                    </section>

                    <section className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <LifeBuoy className="size-5 text-slate-900" />
                                <h2 className="text-xl font-semibold text-slate-900">Dúvidas frequentes</h2>
                            </div>
                            <div className="space-y-4">
                                {faqs.map((faq) => (
                                    <details key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <summary className="cursor-pointer px-4 py-3 font-semibold text-slate-800 flex items-center justify-between">
                                            {faq.question}
                                            <ArrowRight className="size-4 text-slate-400" />
                                        </summary>
                                        <p className="px-4 pb-4 text-sm text-slate-600">{faq.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="size-4 text-slate-400" />
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Guia rápido</p>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Documentação</h3>
                                <p className="text-sm text-slate-500">
                                    Veja passo a passo para importar imóveis, gerenciar leads e configurar notificações.
                                </p>
                                <Button variant="outline" className="w-full">Abrir documentação</Button>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-slate-400" />
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Status</p>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Plataforma</h3>
                                <p className="text-sm text-slate-500">
                                    Todos os serviços operando normalmente. Última atualização há 5 minutos.
                                </p>
                                <Button variant="ghost" className="text-sm text-lime-600 hover:text-lime-500">
                                    Ver histórico →
                                </Button>
                            </div>
                        </div>
                    </section>
                </Container>
            </div>
        </>
    );
}
