import { FaLinkedin } from "react-icons/fa";
import { SiTiktok, SiWhatsapp, SiX, SiYoutube } from "react-icons/si";

import { SOCIAL_LINKS } from "@/lib/social";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WhatsApp: SiWhatsapp,
  TikTok: SiTiktok,
  YouTube: SiYoutube,
  X: SiX,
  LinkedIn: FaLinkedin,
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.name];
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-brand-600 hover:text-white"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
