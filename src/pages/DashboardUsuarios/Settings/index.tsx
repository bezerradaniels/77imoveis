import { useState } from "react";
import Seo from "../../../components/common/Seo";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

export default function Settings() {
    const [notifications, setNotifications] = useState({
        newLeads: true,
        weeklyReport: false,
        planUpdates: true,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-8">
            <Seo title="Dashboard | Configurações" />

            <header className="bg-white border border-slate-100 rounded-3xl p-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Dashboard</p>
                <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
                <p className="text-sm text-slate-500">
                    Personalize preferências de conta, notificações e integrações.
                </p>
            </header>

            <section className="bg-white border border-slate-100 rounded-3xl p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Dados principais</h2>
                    <p className="text-sm text-slate-500">Atualize nome e contatos exibidos nas fichas.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nome de exibição</label>
                        <Input placeholder="Imobiliária 77 Prime" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">E-mail comercial</label>
                        <Input type="email" placeholder="contato@77prime.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Telefone/WhatsApp</label>
                        <Input placeholder="(77) 99999-0000" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Site / landing page</label>
                        <Input placeholder="https://77prime.com.br" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">Salvar alterações</Button>
                </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-3xl p-6 space-y-5">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Notificações</h2>
                    <p className="text-sm text-slate-500">Escolha como deseja ser avisado.</p>
                </div>
                <div className="space-y-4">
                    {[
                        { key: "newLeads", label: "Novos leads", description: "Receber alertas instantâneos de novos contatos." },
                        { key: "weeklyReport", label: "Relatório semanal", description: "Resumo de performance enviado toda segunda-feira." },
                        { key: "planUpdates", label: "Atualizações de plano", description: "Avisos sobre limites e consumo do plano atual." },
                    ].map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-3 border border-slate-100 rounded-2xl p-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={notifications[item.key as keyof typeof notifications]}
                                    onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                                    className="size-4 rounded border-slate-300 text-lime-500 focus:ring-lime-400"
                                />
                                Ativar
                            </label>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
