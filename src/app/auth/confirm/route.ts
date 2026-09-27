import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { safeNextPath } from "@/lib/auth";

// Destination des liens envoyés par e-mail (confirmation d'inscription,
// mot de passe oublié). Ouvre la session puis redirige vers « next ».
// Accepte les deux formats de lien de Supabase :
// - token_hash + type : fonctionne même si l'e-mail est ouvert sur un autre appareil ;
// - code : format par défaut, valable seulement dans le navigateur d'origine.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");
  const next = safeNextPath(params.get("next"));

  const response = NextResponse.redirect(new URL(next, request.url));
  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([header, value]) => response.headers.set(header, value));
      },
    },
  });

  let error: unknown = new Error("Lien incomplet");
  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  }

  if (error) {
    return NextResponse.redirect(new URL("/compte/connexion?erreur=lien", request.url));
  }
  return response;
}
