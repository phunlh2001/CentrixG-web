import { Mail, MessageCircleMore, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { APP_CONFIG } from "../shared/contanst/appConfig";
import { openExternalLink } from "../shared/utils";
import MastercardPayIcon from "./icons/credits/mastercard.svg";
import MomoPayIcon from "./icons/credits/momo.svg";
import NapasPayIcon from "./icons/credits/napas.svg";
import FacebookIcon from "./icons/FacebookIcon";
import DiscordThumbnailIcon from "./icons/socials/discord_icon.svg";
import FacebookThumbnailIcon from "./icons/socials/facebook_icon.svg";
import TiktokThumbnailIcon from "./icons/socials/tiktok_icon.svg";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-16">
      {/* Top divider glow */}
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00D4FF40 30%, #7B2FBE40 70%, transparent)",
        }}
      />

      <div
        className="relative"
        style={{
          background: "#050510E6",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto px-6 lg:px-8 py-12 max-w-7xl">
          <div className="gap-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <p className="mb-5 font-semibold text-[var(--system-color-mist-lavender)]">
                {t("desktop.footer.brandTitle")}
              </p>
              <ul className="space-y-3 text-[#E8E8FF8C] text-sm">
                <li className="flex items-start gap-2.5">
                  <MessageCircleMore
                    size={15}
                    className="mt-0.5 text-[#00D4FF80] shrink-0"
                  />
                  <button
                    onClick={() =>
                      openExternalLink(APP_CONFIG.contact.discord ?? "#")
                    }
                    className="hover:text-[#00d4ff] text-left transition-colors cursor-pointer"
                  >
                    <span>{APP_CONFIG.contact.discordTitle}</span>
                  </button>
                </li>
                <li className="flex items-center gap-2.5">
                  <FacebookIcon className="w-4 h-4 text-[#00D4FF80] shrink-0" />
                  <button
                    onClick={() =>
                      openExternalLink(APP_CONFIG.contact.facebook ?? "#")
                    }
                    className="hover:text-[#00d4ff] text-left transition-colors cursor-pointer"
                  >
                    {APP_CONFIG.contact.tag} {t("desktop.footer.fanpage")}
                  </button>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={15} className="text-[#00D4FF80] shrink-0" />
                  <a
                    href={`mailto:${APP_CONFIG.contact.email}`}
                    className="hover:text-[#00d4ff] transition-colors"
                  >
                    {APP_CONFIG.contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Tag size={15} className="text-[#00D4FF80] shrink-0" />
                  <span>{APP_CONFIG.contact.tag}</span>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="mb-5 font-bold text-[var(--system-color-mist-lavender)] text-sm uppercase tracking-wider">
                {t("desktop.footer.colInformation")}
              </h3>
              <ul className="space-y-3 text-[#E8E8FF8C] text-sm">
                {[
                  { key: "linkIntro", href: "/introduction" },
                  { key: "linkStore", href: "/categories" },
                  { key: "linkEvents", href: "/blog" },
                  { key: "linkContact", href: "/contact" },
                ].map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      to={href}
                      className="group flex items-center gap-2 hover:text-[#00d4ff] transition-colors"
                    >
                      <span
                        className="rounded-full w-1 h-1 group-hover:scale-150 transition-all shrink-0"
                        style={{ background: "#00D4FF66" }}
                      />
                      {t(`desktop.footer.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policy */}
            <div>
              <h3 className="mb-5 font-bold text-[var(--system-color-mist-lavender)] text-sm uppercase tracking-wider">
                {t("desktop.footer.colPolicy")}
              </h3>
              <ul className="space-y-3 text-[#E8E8FF8C] text-sm">
                {["linkPrivacy", "linkTerms"].map((key) => (
                  <li key={key}>
                    <Link
                      to=""
                      className="group flex items-center gap-2 hover:text-[#00d4ff] transition-colors"
                    >
                      <span
                        className="rounded-full w-1 h-1 group-hover:scale-150 transition-all shrink-0"
                        style={{ background: "#00D4FF66" }}
                      />
                      {t(`desktop.footer.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment + Social */}
            <div>
              <h3 className="mb-5 font-bold text-[var(--system-color-mist-lavender)] text-sm uppercase tracking-wider">
                {t("desktop.footer.colPayment")}
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { src: MomoPayIcon, alt: "MoMo E-Wallet" },
                  { src: MastercardPayIcon, alt: "Mastercard" },
                  { src: NapasPayIcon, alt: "Normal Banking (SePay VietQR)" },
                ].map(({ src, alt }) => (
                  <div
                    key={alt}
                    title={alt}
                    className="hover:opacity-100 rounded-lg overflow-hidden transition-opacity cursor-pointer px-2 py-1 flex items-center justify-center"
                    style={{
                      border: "1px solid #00D4FF26",
                      background: "#FFFFFF0D",
                    }}
                  >
                    <img src={src} alt={alt} className="w-auto h-6 object-contain" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {[
                  {
                    src: DiscordThumbnailIcon,
                    alt: "Discord",
                    url: APP_CONFIG.contact.discord,
                  },
                  {
                    src: FacebookThumbnailIcon,
                    alt: "Facebook",
                    url: APP_CONFIG.contact.facebook ?? "#",
                  },
                  {
                    src: TiktokThumbnailIcon,
                    alt: "TikTok",
                    url: APP_CONFIG.contact.tiktok ?? "#",
                  },
                ].map(({ src, alt, url }) => (
                  <button
                    key={alt}
                    onClick={() => openExternalLink(url)}
                    className="flex justify-center items-center rounded-lg w-8 h-8 overflow-hidden hover:scale-110 transition-transform cursor-pointer"
                    style={{
                      border: "1px solid #00D4FF26",
                      background: "#00D4FF0F",
                    }}
                  >
                    <img
                      src={src.toString()}
                      alt={alt}
                      className="w-5 h-5 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-4 text-[#E8E8FF59] text-xs text-center"
          style={{ borderTop: "1px solid #00D4FF0F" }}
        >
          {t("desktop.footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
