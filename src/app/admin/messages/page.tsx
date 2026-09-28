"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Loading, LoadError, EmptyState, ConfirmDialog } from "@/components/admin/ui";
import { dbErrorMessage, formatDateTime } from "@/lib/admin/utils";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    createClient()
      .from("contact_messages")
      .select("id, first_name, last_name, email, subject, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setMessages(data as Message[]);
      });
  }, []);

  async function setRead(message: Message, isRead: boolean) {
    const { error } = await createClient().from("contact_messages").update({ is_read: isRead }).eq("id", message.id);
    if (error) {
      toast.error(dbErrorMessage(error, "Le message n'a pas pu être mis à jour."));
      return;
    }
    setMessages((list) => list?.map((m) => (m.id === message.id ? { ...m, is_read: isRead } : m)) ?? null);
  }

  function toggle(message: Message) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && !message.is_read) setRead(message, true);
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const { error } = await createClient().from("contact_messages").delete().eq("id", deleting.id);
    setPending(false);
    if (error) {
      toast.error(dbErrorMessage(error, "Le message n'a pas pu être supprimé."));
    } else {
      setMessages((list) => list?.filter((m) => m.id !== deleting.id) ?? null);
      toast.success("Message supprimé");
    }
    setDeleting(null);
  }

  const unread = messages?.filter((m) => !m.is_read).length ?? 0;
  const visible = (messages ?? []).filter((m) => !onlyUnread || !m.is_read);

  return (
    <>
      <PageHeader title="Messages" description="Envoyés depuis la page Contact du site." />

      <div className="flex gap-6 border-b border-line mb-6">
        {[
          { value: false, label: "Tous" },
          { value: true, label: `Non lus (${unread})` },
        ].map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setOnlyUnread(f.value)}
            className={cn(
              "font-sans-wide text-[0.68rem] uppercase pb-3 -mb-px border-b-2 transition-colors cursor-pointer",
              onlyUnread === f.value ? "border-gold text-ink" : "border-transparent text-stone-light hover:text-ink"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {failed && <LoadError>Impossible de charger les messages. Actualisez la page.</LoadError>}
      {!failed && !messages && <Loading />}
      {messages && visible.length === 0 && <EmptyState>{onlyUnread ? "Aucun message non lu." : "Aucun message pour le moment."}</EmptyState>}
      {visible.length > 0 && (
        <ul className="dash-card overflow-hidden divide-y divide-line">
          {visible.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => toggle(m)}
                  aria-expanded={open}
                  className="w-full flex items-start gap-3 px-5 sm:px-6 py-4 text-left hover:bg-sand/50 transition-colors cursor-pointer"
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", m.is_read ? "bg-transparent" : "bg-gold")} />
                  <span className="flex-1 min-w-0">
                    <span className="flex justify-between gap-4">
                      <span className={cn("text-sm truncate", m.is_read ? "text-stone" : "text-ink font-medium")}>
                        {m.first_name} {m.last_name}
                      </span>
                      <span className="text-xs text-stone-light shrink-0">{formatDateTime(m.created_at)}</span>
                    </span>
                    <span className={cn("block text-sm mt-0.5", open ? "" : "truncate", m.is_read ? "text-stone-light" : "text-stone")}>
                      {m.subject}
                    </span>
                  </span>
                </button>
                {open && (
                  <div className="px-5 sm:px-6 pb-5 pl-10 sm:pl-11">
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-line border-l-2 border-line pl-4">{m.message}</p>
                    <p className="text-xs text-stone-light mt-4 break-all">{m.email}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                        className="inline-flex items-center gap-2 h-9 px-4 bg-ink text-cream font-sans-wide text-[0.65rem] uppercase hover:bg-ink-hover transition-colors"
                      >
                        <Mail size={14} strokeWidth={1.5} />
                        Répondre
                      </a>
                      <button type="button" onClick={() => setRead(m, false)} className="text-xs text-stone hover:text-ink underline underline-offset-2 cursor-pointer">
                        Marquer comme non lu
                      </button>
                      <button type="button" onClick={() => setDeleting(m)} className="text-xs text-danger underline underline-offset-2 cursor-pointer">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer ce message ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        pending={pending}
      >
        Le message de {deleting?.first_name} {deleting?.last_name} sera définitivement supprimé.
      </ConfirmDialog>
    </>
  );
}
