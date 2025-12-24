import { useState } from "react";
import Container from "../../components/common/Container";
import Seo from "../../components/common/Seo";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="space-y-2 text-sm font-medium text-gray-700 block">
      <span>{label}</span>
      {children}
    </label>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  helper?: string;
};

function InfoCard({ icon, title, value, helper }: InfoCardProps) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-1">{value}</div>
        {helper && <div className="text-xs text-gray-500 mt-1">{helper}</div>}
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange<T extends keyof typeof form>(field: T, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo title="77 Imóveis | Contato" />

      <div className="bg-white border-b border-gray-100 py-12 md:py-16">
        <Container>
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Contato</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Fale com a 77 Imóveis</h1>
            <p className="text-lg text-gray-600">
              Envie sua mensagem pelo formulário ou utilize nossos canais de atendimento.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-10">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Canais de Atendimento</h2>
                <p className="text-sm text-gray-600">Entre em contato direto com nossa equipe especializada.</p>
              </div>
              <div className="space-y-5">
                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                  title="Telefone / WhatsApp"
                  value="(77) 99999-9999"
                  helper="Seg a Sex, 8h às 18h"
                />
                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 11H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
                    </svg>
                  }
                  title="E-mail"
                  value="contato@77imoveis.com.br"
                  helper="Resposta em até 24h úteis"
                />
                <InfoCard
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Escritório"
                  value="Av. Olívia Flores, 1000"
                  helper="Candeias, Vitória da Conquista - BA"
                />
              </div>
            </div>
            <div className="bg-lime-500 rounded-2xl p-6 text-white space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">Anuncie aqui</p>
              <h3 className="text-xl font-semibold">Quer anunciar seu imóvel?</h3>
              <p className="text-sm text-white/80">Cadastre gratuitamente e alcance milhares de interessados.</p>
              <Button variant="secondary" className="w-full text-lime-600 bg-white hover:bg-white/90">
                Começar agora
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="space-y-1 mb-8">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Mensagem</p>
              <h2 className="text-2xl font-semibold text-gray-900">Envie seu recado</h2>
              <p className="text-sm text-gray-500">Nos conte sobre sua necessidade que retornamos rapidamente.</p>
            </div>
            {success ? (
              <div className="space-y-4 text-center py-10">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Mensagem enviada!</h3>
                  <p className="text-sm text-gray-600 mt-1">Nossa equipe responderá em breve.</p>
                </div>
                <Button variant="outline" onClick={() => setSuccess(false)}>
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Nome completo">
                    <Input
                      required
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </Field>
                  <Field label="Telefone / WhatsApp">
                    <Input
                      required
                      placeholder="(77) 99999-9999"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </Field>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="E-mail">
                    <Input
                      required
                      type="email"
                      placeholder="voce@email.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </Field>
                  <Field label="Assunto">
                    <Input
                      required
                      placeholder="Sobre o que você quer falar?"
                      value={form.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </Field>
                </div>
                <Field label="Mensagem">
                  <Textarea
                    required
                    rows={6}
                    placeholder="Digite sua mensagem..."
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white resize-none"
                  />
                </Field>
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full md:w-auto bg-lime-500 hover:bg-lime-600 text-white font-semibold min-w-40"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </div>
                    ) : (
                      "Enviar Mensagem"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
