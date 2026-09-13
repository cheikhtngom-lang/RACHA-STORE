"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const firstName = email.split("@")[0]?.split(/[._-]/)[0] ?? "Cliente";
    signIn({
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: "",
      email,
    });
    toast.success("Connexion réussie", { description: `Ravis de vous revoir` });
    router.push("/compte");
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-[85vh]">
      <div className="relative hidden lg:block bg-ink-dark">
        <Image src={img(pools.apparel[12], 1200, 1600)} alt="Racha Store" fill sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-ink-dark/20 to-transparent" />
        <div className="absolute bottom-16 left-12 right-12">
          <p className="font-display text-3xl text-cream leading-snug">
            &ldquo;L&apos;élégance est la seule beauté qui ne se fane jamais.&rdquo;
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="w-full max-w-sm">
          <p className="eyebrow text-gold mb-3">Bienvenue</p>
          <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">Connexion</h1>
          <p className="text-sm text-stone-light mb-10">Accédez à votre compte pour suivre vos commandes.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="login-email">Adresse e-mail</Label>
              <Input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox />
                <span className="text-xs text-stone">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-xs text-stone underline underline-offset-2 cursor-pointer hover:text-ink">
                Mot de passe oublié ?
              </button>
            </div>
            <Button type="submit" variant="primary" size="lg" className="mt-2">
              Se connecter
            </Button>
          </form>

          <p className="text-sm text-stone-light mt-8 text-center">
            Pas encore de compte ?{" "}
            <Link href="/compte/inscription" className="text-ink underline underline-offset-2">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
