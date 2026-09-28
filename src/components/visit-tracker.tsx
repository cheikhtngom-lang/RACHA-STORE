"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

const VISIT_KEY = "rs-visit";

// Provenance d'une visite : paramètre utm_source d'abord (liens de campagne),
// sinon le site d'où vient le visiteur. Les applications (WhatsApp surtout)
// n'en transmettent souvent aucun : ces visites comptent en « direct ».
function visitSource() {
  const utm = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase() ?? "";
  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {}
  const from = `${utm} ${host}`;
  if (from.includes("instagram")) return "instagram";
  if (from.includes("tiktok")) return "tiktok";
  if (from.includes("facebook") || /(^|\s|\.)fb\./.test(from)) return "facebook";
  if (from.includes("whatsapp") || from.includes("wa.me")) return "whatsapp";
  if (from.includes("google")) return "google";
  if (!utm && (!host || host === window.location.hostname)) return "direct";
  return "autre";
}

// Mesure d'audience maison : un compteur par page et par jour dans Supabase
// (public.track_page_view). Ni cookie, ni identifiant, ni adresse IP.
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (navigator.webdriver || useAuthStore.getState().isAdmin) return;

    // Première page de la session de navigation = une visite.
    let newVisit = false;
    try {
      if (!sessionStorage.getItem(VISIT_KEY)) {
        sessionStorage.setItem(VISIT_KEY, "1");
        newVisit = true;
      }
    } catch {}

    createClient()
      .rpc("track_page_view", {
        p_path: pathname,
        p_new_visit: newVisit,
        p_source: newVisit ? visitSource() : null,
        p_device: newVisit ? (window.matchMedia("(max-width: 767px)").matches ? "mobile" : "ordinateur") : null,
      })
      .then(
        () => {},
        () => {}
      );
  }, [pathname]);

  return null;
}
