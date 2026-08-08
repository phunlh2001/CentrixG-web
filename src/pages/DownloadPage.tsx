import {
  APP_CONFIG,
  BaseButton,
  DiscordIcon,
  FacebookIcon,
} from "@/shared";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import MainLayout from "../components/MainLayout";
import CentrixGBanner from "./../assets/centrixg-removebg.png";

export default function DownloadPage() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="relative flex flex-col justify-center items-center px-4 py-8 min-h-[calc(100vh-14rem)] cg-background-image">
        <div className="flex flex-col justify-center items-center space-y-8 w-full max-w-4xl">
          <div className="mb-3 w-auto h-40">
            <img
              src={CentrixGBanner}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center">
            <h2 className="mb-4 text-gray-300 text-4xl leading-relaxed">
              {t("website.homePage.welcome")}
            </h2>
            <p className="text-gray-300 text-xl leading-relaxed">
              {t("website.homePage.description")}
            </p>
          </div>

          <div className="flex md:flex-row flex-col justify-center gap-4">
            <BaseButton
              component="a"
              href={APP_CONFIG.download.desktopInstaller}
              download
              variant="secondary"
              size="xl"
              className="w-full md:w-auto text-on-primary transition-[background,border-color,box-shadow] duration-200 cg-install-btn"
              endIcon={<ArrowUpRight className="w-6 h-6" />}
            >
              {t("website.homePage.buttons.installApp")}
            </BaseButton>
            <BaseButton
              component="a"
              href={APP_CONFIG.contact.discord}
              target="_blank"
              variant="primary"
              size="xl"
              startIcon={<DiscordIcon className="w-6 h-6" />}
            >
              {t("website.homePage.buttons.discordLink")}
            </BaseButton>
            <BaseButton
              component="a"
              href={APP_CONFIG.contact.facebook}
              target="_blank"
              variant="secondary"
              size="xl"
              startIcon={<FacebookIcon className="w-6 h-6" />}
            >
              {t("website.homePage.buttons.facebookLink")}
            </BaseButton>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
