"use client";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export interface CartItem {
	productId: string;
	name: string;
	price: number;
	quantity: number;
	imageUrl?: string | null;
}

interface CartContextValue {
	items: CartItem[];
	addItem: (
		item: Omit<CartItem, "quantity"> & {
			quantity?: number;
			inventory?: number;
		},
	) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	total: number;
	itemCount: number;
	hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "amgclub:cart";

function loadCart(): CartItem[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]) {
	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setItems(loadCart());
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (hydrated) {
			saveCart(items);
		}
	}, [items, hydrated]);

	const addItem = useCallback(
		(
			item: Omit<CartItem, "quantity"> & {
				quantity?: number;
				inventory?: number;
			},
		) => {
			const { inventory, quantity = 1, ...product } = item;
			setItems((prev) => {
				const existing = prev.find((i) => i.productId === product.productId);
				if (existing) {
					const next = existing.quantity + quantity;
					return prev.map((i) =>
						i.productId === product.productId
							? { ...i, quantity: inventory ? Math.min(next, inventory) : next }
							: i,
					);
				}
				return [
					...prev,
					{
						...product,
						quantity: inventory ? Math.min(quantity, inventory) : quantity,
					},
				];
			});
		},
		[],
	);

	const removeItem = useCallback((productId: string) => {
		setItems((prev) => prev.filter((i) => i.productId !== productId));
	}, []);

	const updateQuantity = useCallback((productId: string, quantity: number) => {
		if (quantity <= 0) {
			setItems((prev) => prev.filter((i) => i.productId !== productId));
			return;
		}
		setItems((prev) =>
			prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
		);
	}, []);

	const clearCart = useCallback(() => setItems([]), []);

	const total = useMemo(
		() => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
		[items],
	);
	const itemCount = useMemo(
		() => items.reduce((sum, i) => sum + i.quantity, 0),
		[items],
	);

	const value = useMemo<CartContextValue>(
		() => ({
			items,
			addItem,
			removeItem,
			updateQuantity,
			clearCart,
			total,
			itemCount,
			hydrated,
		}),
		[
			items,
			addItem,
			removeItem,
			updateQuantity,
			clearCart,
			total,
			itemCount,
			hydrated,
		],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used within CartProvider");
	return ctx;
}
