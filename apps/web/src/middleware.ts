import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['fr', 'mg'];
const DEFAULT_LOCALE = 'fr';

/**
 * Les pages vivent sous /[locale]/... mais les liens de l'app sont sans préfixe
 * (/feed, /sell...) : on réécrit en interne vers la langue par défaut.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Exclut l'API, les fichiers Next.js, les uploads et tout fichier statique (avec extension)
  matcher: ['/((?!api|_next|uploads|.*\..*).*)'],
};
