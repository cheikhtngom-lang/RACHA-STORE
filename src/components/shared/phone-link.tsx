"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Phone } from "lucide-react";
import { WhatsAppIcon } from "./social-icons";
import { phone, type PhoneNumber } from "@/lib/site";
import { cn } from "@/lib/utils";

export function PhoneLink({
  className,
  iconSize = 14,
  showIcon = true,
  number = phone,
}: {
  className?: string;
  iconSize?: number;
  showIcon?: boolean;
  number?: PhoneNumber;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn("flex items-center gap-2 cursor-pointer", className)}
        >
          {showIcon && <Phone size={iconSize} strokeWidth={1.5} className="shrink-0" />}
          {number.display}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 min-w-[200px] bg-cream border border-line shadow-xl py-1.5 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out"
        >
          <DropdownMenu.Item asChild>
            <a
              href={`tel:${number.tel}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors cursor-pointer outline-none"
            >
              <Phone size={15} strokeWidth={1.5} className="text-gold" />
              Appeler
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <a
              href={`https://wa.me/${number.tel.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors cursor-pointer outline-none"
            >
              <WhatsAppIcon size={15} className="text-gold" />
              WhatsApp
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
