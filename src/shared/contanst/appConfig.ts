export const APP_CONFIG = {
  name: "Centrix G",
  download: {
    slug: "download",
    desktopInstaller: "/downloads/CentrixG-Setup.exe",
    label: {
      vi: "Tải xuống",
      en: "Download",
      zh: "下载",
    },
  },
  contact: {
    discordTitle: "CentrixG Community",
    discord: "https://discord.gg/fZAXKdYsQ",
    facebook: "https://facebook.com/centrixg",
    tiktok: "https://tiktok.com/@centrixg",
    email: "centrixg.gamingstore@gmail.com",
    tag: "Centrix G",
  },
  locale: {
    languages: ["en", "vi", "zh"],
    default: "en",
    dropdownItems: [
      {
        label: "EN (US)",
        value: "en",
      },
      {
        label: "VI (VN)",
        value: "vi",
      },
      {
        label: "ZH (CN)",
        value: "zh",
      },
    ],
  },
};

export const CATEGORIES = [
  { name: "Game Hot", id: "game-hot" },
  { name: "Capcom", id: "capcom" },
  { name: "Anime", id: "anime" },
  { name: "Simulator", id: "simulator" },
  { name: "Game Moi", id: "game-moi" },
  { name: "Ubisoft", id: "ubisoft" },
  { name: "Game", id: "game" },
  { name: "EA", id: "ea" },
  { name: "Pre-order", id: "pre-od" },
  { name: "Kinh Di", id: "kinh-di" },
  { name: "Game 18", id: "game-18" },
  { name: "Rockstar", id: "rockstar" },
  { name: "Sony", id: "sony" },
  { name: "Software", id: "software" },
];

export const MEGA_MENU = {
  home: {
    slug: "home",
    label: {
      vi: "Trang chủ",
      en: "Home",
      zh: "首页",
    },
  },
  introduction: {
    slug: "introduction",
    label: {
      vi: "Giới thiệu",
      en: "About Us",
      zh: "关于我们",
    },
  },
  categories: {
    slug: "categories",
    label: {
      vi: "Thể loại",
      en: "Categories",
      zh: "分类",
    },
  },
  // events: {
  //   slug: "blog",
  //   label: {
  //     vi: "Blog",
  //     en: "Blog",
  //     zh: "博客",
  //   },
  // },
  contact: {
    slug: "contact",
    label: {
      vi: "Liên hệ",
      en: "Contact",
      zh: "联系我们",
    },
  },
  download: {
    slug: "download",
    label: {
      vi: "Tải xuống",
      en: "Download",
      zh: "下载",
    },
  },
};

export const LOCALES = [
  { label: "English", localeCode: "en", locale: "en-US", currency: "USD" },
  { label: "Tiếng Việt", localeCode: "vi", locale: "vi-VN", currency: "VND" },
  { label: "中文", localeCode: "zh", locale: "zh-CN", currency: "CNY" },
];
