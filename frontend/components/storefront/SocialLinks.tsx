import { FaLinkedin } from "react-icons/fa";
import { SiTiktok, SiWhatsapp, SiX, SiYoutube } from "react-icons/si";

import { SOCIAL_LINKS } from "@/lib/social";
import { cn } from "@/lib/utils";

interface Brand {
  Icon: React.ComponentType<{ className?: string }>;
  /** The platform's own colour, applied on hover so the row stays calm at rest. */
  hover: string;
}

const BRANDS: Record<string, Brand> = {
  WhatsApp: { Icon: SiWhatsapp, hover: "hover:bg-[#25D366]" },
  TikTok: { Icon: SiTiktok, hover: "hover:bg-[#010101]" },
  YouTube: { Icon: SiYoutube, hover: "hover:bg-[#FF0000]" },
  X: { Icon: SiX, hover: "hover:bg-[#010101]" },
  LinkedIn: { Icon: FaLinkedin, hover: "hover:bg-[#0A66C2]" },
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {SOCIAL_LINKS.map((link) => {
        const brand = BRANDS[link.name];
        if (!brand) return null;

        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            title={link.name}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all",
              "hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-md",
              brand.hover
            )}
          >
            <brand.Icon className="h-[18px] w-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
