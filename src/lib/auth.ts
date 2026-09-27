import type { AuthError } from "@supabase/supabase-js";

const messages: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_confirmed: "Confirmez d'abord votre adresse e-mail avec le lien reçu par e-mail.",
  user_already_exists: "Un compte existe déjà avec cette adresse e-mail.",
  email_exists: "Un compte existe déjà avec cette adresse e-mail.",
  weak_password: "Mot de passe trop faible : 8 caractères minimum.",
  same_password: "Le nouveau mot de passe doit être différent de l'ancien.",
  email_address_invalid: "Adresse e-mail invalide.",
  over_email_send_rate_limit: "Trop d'e-mails envoyés. Réessayez dans quelques minutes.",
  over_request_rate_limit: "Trop de tentatives. Réessayez dans quelques minutes.",
  signup_disabled: "Les inscriptions sont momentanément fermées.",
  // Service d'e-mail de test de Supabase : n'écrit qu'aux membres de l'équipe du projet.
  email_address_not_authorized: "Impossible d'envoyer un e-mail à cette adresse pour le moment. Contactez-nous.",
};

export function authErrorMessage(error: AuthError) {
  return (error.code && messages[error.code]) || "Une erreur est survenue. Réessayez dans un instant.";
}

// N'accepte qu'un chemin interne au site, pour éviter les redirections vers un autre site.
export function safeNextPath(next: string | null | undefined, fallback = "/compte") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
