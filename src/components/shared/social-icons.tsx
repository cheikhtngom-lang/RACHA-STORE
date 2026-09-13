import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 9.5V7.2c0-.9.5-1.4 1.4-1.4H17V3h-2.6C11.9 3 10.5 4.6 10.5 7v2.5H8V12h2.5v9h3v-9H16l.5-2.5h-2.5z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4l7.2 8.6L4.4 20H6.9l5.7-6.3L17 20h3l-7.5-9 6.5-7h-2.5l-5.2 5.8L7 4z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={1.3}>
      <path d="M14 3v10.5a3 3 0 1 1-2.4-2.94" />
      <path d="M14 3c.4 2.4 2.1 4.2 4.5 4.5" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none">
      <path d="M4 20l1.3-3.8A7.9 7.9 0 1 1 8.3 19L4 20z" />
      <path
        d="M9 9.3c0-.5.4-1 .9-1h.5c.3 0 .5.2.6.4l.6 1.4c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.4.8 1.3 1.7 2.1 2.1.2.1.4.1.5 0l.6-.5c.2-.1.4-.2.6-.1l1.4.6c.2.1.4.3.4.6v.5c0 .5-.5.9-1 .9-2.9 0-5.6-2.7-5.6-5.6z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
