import { ActionSchema } from '../types';
import { useCartStore } from '../context/CartContext';

type ActionHandler = (payload: any) => void;

export let navigationRef: any = null;

export function setNavigationRef(ref: any) {
  navigationRef = ref;
}

const ACTION_HANDLERS: Record<string, ActionHandler> = {
  ADD_TO_CART: (payload) => {
    // Map minimal product item payload to ProductItem
    const product = {
      id: payload.id,
      name: payload.name || 'Product',
      price: payload.price || 299,
      image_url: payload.image_url || 'https://picsum.photos/seed/product/400/400',
      action: { type: 'DEEP_LINK', payload: { url: '/cart' } } as ActionSchema
    };
    useCartStore.getState().addItem(product);
    console.log('[Cart] Item added:', payload.id);
  },

  DEEP_LINK: (payload) => {
    console.log('[Nav] Navigating to:', payload.url);
    if (navigationRef && payload.url) {
      if (payload.url.includes('/campaign')) {
        navigationRef.navigate('CampaignPreview', { campaignId: payload.url.split('/').pop() });
      } else if (payload.url.includes('/cart')) {
        navigationRef.navigate('Cart');
      } else {
        navigationRef.navigate('Home');
      }
    }
  },

  APPLY_MYSTERY_GIFT_COUPON: (payload) => {
    console.log('[Promo] Applying coupon:', payload.coupon_code);
  },

  BOOK_EVENT: (payload) => {
    console.log('[Event] Booking event:', payload.event_id);
    if (navigationRef) {
      navigationRef.navigate('Home');
    }
  },
};

export function dispatchAction(action: ActionSchema): void {
  const handler = ACTION_HANDLERS[action.type];
  if (!handler) {
    console.warn('[Dispatcher] No handler registered for:', action.type);
    return;
  }
  try {
    handler(action.payload);
  } catch (err) {
    console.error('[Dispatcher] Handler threw error:', err);
  }
}
