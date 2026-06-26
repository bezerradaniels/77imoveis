import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Renova a sessão do Supabase a cada navegação e protege as áreas logadas.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: { name: string; value: string; options?: any }[]) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Áreas que exigem login.
  const path = request.nextUrl.pathname;
  const protectedPath = path.startsWith('/painel') || path.startsWith('/admin');
  if (protectedPath && !user) {
    const login = request.nextUrl.clone();
    login.pathname = '/entrar';
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }

  // Primeira visita ao painel: escolher Particular ou Profissional antes de seguir.
  const escolhaPath = '/painel/escolha-perfil';
  if (user && path.startsWith('/painel') && path !== escolhaPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_choice_made_at')
      .eq('id', user.id)
      .maybeSingle();
    if (profile && !profile.role_choice_made_at) {
      const escolha = request.nextUrl.clone();
      escolha.pathname = escolhaPath;
      return NextResponse.redirect(escolha);
    }
  }

  return response;
}

export const config = {
  // Roda em tudo, menos assets estáticos e imagens.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
