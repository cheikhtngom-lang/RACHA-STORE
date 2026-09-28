"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackToShop } from "@/components/shared/back-to-shop";

// On arrive ici depuis le lien « mot de passe oublié » : /auth/confirm a déjà ouvert la session.
export default function NewPasswordPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    toast.success("Mot de passe modifié");
    router.push("/compte");
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16 sm:py-24 min-h-[70vh]">
      <BackToShop />
      <p className="eyebrow text-gold mb-3">Mon compte</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4">Nouveau mot de passe</h1>

      {status === "anonymous" ? (
        <p className="text-sm text-stone leading-relaxed">
          Ce lien a expiré ou a déjà été utilisé.{" "}
          <Link href="/compte/mot-de-passe-oublie" className="text-ink underline underline-offset-2">
            Demandez un nouveau lien
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          <div>
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-stone-light mt-2">8 caractères minimum.</p>
          </div>
          <div>
            <Label htmlFor="new-password-confirm">Confirmer le mot de passe</Label>
            <Input
              id="new-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-[#6E2A32]">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={submitting || status === "loading"}>
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      )}
    </div>
  );
}
