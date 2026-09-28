"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/compte/nouveau-mot-de-passe`,
    });
    setSubmitting(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16 sm:py-24 min-h-[70vh]">
      <p className="eyebrow text-gold mb-3">Mon compte</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4">Mot de passe oublié</h1>

      {sent ? (
        <p className="text-sm text-stone leading-relaxed">
          Si un compte existe pour <span className="text-ink">{email}</span>, vous allez recevoir un e-mail avec un
          lien pour choisir un nouveau mot de passe. Pensez à regarder dans les courriers indésirables.
        </p>
      ) : (
        <>
          <p className="text-sm text-stone-light mb-10">
            Indiquez l&apos;adresse e-mail de votre compte. Nous vous envoyons un lien pour choisir un nouveau mot de passe.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="forgot-email">Adresse e-mail</Label>
              <Input id="forgot-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p className="text-sm text-[#6E2A32]">{error}</p>}
            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? "Envoi…" : "Recevoir le lien"}
            </Button>
          </form>
        </>
      )}

      <p className="text-sm text-stone-light mt-8">
        <Link href="/compte/connexion" className="text-ink underline underline-offset-2">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
