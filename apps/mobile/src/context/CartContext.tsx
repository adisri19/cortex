import { create } from 'zustand';
import { CartState, ProductItem, CartItem } from '../types';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  count: 0,
  total: 0,

  addItem: (product: ProductItem) => {
    const items = get().items;
    const existingIndex = items.findIndex(i => i.productId === product.id);
    let updatedItems: CartItem[] = [];

    if (existingIndex > -1) {
      updatedItems = items.map((item, idx) => 
        idx === existingIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        },
      ];
    }

    const count = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
    const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    set({ items: updatedItems, count, total: parseFloat(total.toFixed(2)) });

    // Background sync: POST /cart/add
    fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    }).catch(err => console.error('[Cart Store] background add failed:', err));
  },

  removeItem: (productId: string) => {
    const items = get().items;
    const existingIndex = items.findIndex(i => i.productId === productId);
    if (existingIndex === -1) return;

    let updatedItems: CartItem[] = [];
    const existingItem = items[existingIndex];

    if (existingItem.quantity > 1) {
      updatedItems = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    } else {
      updatedItems = items.filter((_, idx) => idx !== existingIndex);
    }

    const count = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
    const total = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    set({ items: updatedItems, count, total: parseFloat(total.toFixed(2)) });

    // Background sync: DELETE /cart/remove
    fetch(`${API_BASE_URL}/cart/remove`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId }),
    }).catch(err => console.error('[Cart Store] background remove failed:', err));
  },

  clearCart: () => {
    set({ items: [], count: 0, total: 0 });
  },
}));

// Hydration helper for app launch
export async function hydrateCart(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      const items = data.items.map((i: any) => ({
        productId: i.product_id,
        name: i.name,
        price: i.price,
        image_url: i.image_url,
        quantity: i.quantity,
      }));
      const count = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
      const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
      useCartStore.setState({ items, count, total: parseFloat(total.toFixed(2)) });
    }
  } catch (err) {
    console.error('[Cart Store] Hydration failed:', err);
  }
}
