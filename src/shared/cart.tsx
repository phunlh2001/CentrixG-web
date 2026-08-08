import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "centrix-cart";

export type CartItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  discount?: number;
  categoryName?: string;
  quantity: number;
};

type AddCartItem = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: AddCartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  const updateItems = useCallback((updater: (items: CartItem[]) => CartItem[]) => {
    setItems((currentItems) => {
      const nextItems = updater(currentItems);
      storeCart(nextItems);
      return nextItems;
    });
  }, []);

  const addItem = useCallback(
    (item: AddCartItem) => {
      updateItems((currentItems) => {
        const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
          return currentItems.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + (item.quantity ?? 1),
                }
              : cartItem,
          );
        }

        return [...currentItems, { ...item, quantity: item.quantity ?? 1 }];
      });
    },
    [updateItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems((currentItems) =>
        currentItems.filter((cartItem) => cartItem.id !== id),
      );
    },
    [updateItems],
  );

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  const isInCart = useCallback(
    (id: string) => items.some((cartItem) => cartItem.id === id),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      addItem,
      removeItem,
      clearCart,
      isInCart,
    }),
    [addItem, clearCart, isInCart, items, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
