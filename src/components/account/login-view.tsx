"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, safeNextPath } from "@/lib/auth";
import { toAccountUser, useAuthStore } from "@/store/auth-store";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackToShop } from "@/components/shared/back-to-shop";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const next = safeNextPath(requestedNext);
  const linkError = searchParams.get("erreur") === "lien";
  const status = useAuthStore((s) => s.status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const redirected = useRef(false);

  // Une fois connecté : la page demandée (ex. retour au paiement), sinon
  // l'administration pour un compte administrateur, sinon « Mon compte ».
  useEffect(() => {
    if (status !== "authenticated" || redirected.current) return;
    redirected.current = true;
    if (requestedNext) {
      router.replace(next);
      return;
    }
    createClient()
      .rpc("is_admin")
      .then(({ data }) => router.replace(data === true ? "/admin" : next));
  }, [status, requestedNext, next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { data, error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(authErrorMessage(error));
      setSubmitting(false);
      return;
    }
    // La redirection est faite par l'effet ci-dessus, qui réagit à ce changement.
    useAuthStore.setState({ status: "authenticated", user: toAccountUser(data.user) });
    toast.success("Connexion réussie");
  }

  return (
    <div className="w-full max-w-sm">
      <BackToShop />
      <p className="eyebrow text-gold mb-3">Bienvenue</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">Connexion</h1>
      <p className="text-sm text-stone-light mb-10">Accédez à votre compte pour suivre vos commandes.</p>

      {linkError && (
        <p className="text-sm text-danger border border-danger/30 p-4 mb-6">
          Ce lien n&apos;est plus valide ou a déjà été utilisé. Connectez-vous, ou demandez un nouveau lien.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="login-email">Adresse e-mail</Label>
          <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="login-password">Mot de passe</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link href="/compte/mot-de-passe-oublie" className="self-end text-xs text-stone underline underline-offset-2 hover:text-ink">
          Mot de passe oublié ?
        </Link>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" variant="primary" size="lg" className="mt-2" disabled={submitting}>
          {submitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="text-sm text-stone-light mt-8 text-center">
        Pas encore de compte ?{" "}
        <Link href="/compte/inscription" className="text-ink underline underline-offset-2">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

// Page /compte/connexion. La photo, choisie dans /admin/parametres, est lue par la page serveur.
export function LoginView({ photo }: { photo: string }) {
  return (
    <div className="grid lg:grid-cols-2 min-h-[85vh]">
      <div className="relative hidden lg:block bg-ink-dark">
        <Image src={photo} alt="Racha Store" fill sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-ink-dark/20 to-transparent" />
        <div className="absolute bottom-16 left-12 right-12">
          <p className="font-display text-3xl text-cream leading-snug">
            &ldquo;L&apos;élégance est la seule beauté qui ne se fane jamais.&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:py-24">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
