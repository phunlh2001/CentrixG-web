import type { IProduct } from "../api/productApi";

const createProduct = (
  product: Pick<IProduct, "id" | "name" | "imageUrl" | "categories"> & {
    price: number;
  },
): IProduct => ({
  ...product,
  appId: 0,
  description: "",
  pricing: {
    vnd: String(product.price),
    usd: String(product.price),
    cny: String(product.price),
  },
  releaseDate: "",
  developer: "",
  publisher: "",
  platforms: [],
  dlcs: [],
  disabled: false,
  isDelete: false,
  invisible: false,
  createdAt: "",
  updatedAt: "",
});

export const HOT_GAMES: IProduct[] = [
  createProduct({
    id: "hot-5",
    categories: ["game-hot", "Action"],
    name: "Black Myth: Wukong",
    imageUrl:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg?t=1760601605",
    price: 299000,
  }),
  createProduct({
    id: "hot-1",
    categories: ["game-hot", "RPG"],
    name: "ELDEN RING",
    imageUrl:
      "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    price: 349000,
  }),
  createProduct({
    id: "hot-2",
    categories: ["game-hot", "Action"],
    name: "Cyberpunk 2077",
    imageUrl:
      "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    price: 299000,
  }),
];

export const NEW_GAMES: IProduct[] = [
  createProduct({
    id: "new-1",
    categories: ["game-moi", "Action"],
    name: "Helldivers 2",
    imageUrl:
      "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    price: 199000,
  }),
  createProduct({
    id: "new-2",
    categories: ["game-moi", "Adventure"],
    name: "Palworld",
    imageUrl:
      "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg",
    price: 149000,
  }),
];

export const DENUVO_GAMES: IProduct[] = [
  createProduct({
    id: "denuvo-1",
    categories: ["denuvo", "Action"],
    name: "Persona 3 Reload",
    imageUrl:
      "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2161700/header.jpg",
    price: 399000,
  }),
];
