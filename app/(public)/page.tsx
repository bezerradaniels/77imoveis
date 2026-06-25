// Home (placeholder funcional para o primeiro build/deploy).
// Será substituída pela home completa no milestone M0/M1.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <img src="/logo.svg" alt="77Imóveis" width={260} height={64} className="mx-auto" />
      <h1 className="mt-8 text-3xl font-bold text-text">
        Imóveis na região do DDD 77
      </h1>
      <p className="mt-3 text-muted">
        Em breve: o maior portal imobiliário do oeste e sudoeste da Bahia.
        Vitória da Conquista, Barreiras, Guanambi, Brumado, Bom Jesus da Lapa e
        Santa Maria da Vitória.
      </p>
      <p className="mt-8 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-white">
        Site em construção 🚧
      </p>
    </main>
  );
}
