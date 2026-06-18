import React from 'react';
import BannerHero from '../components/blocks/BannerHero';
import ProductGrid2x2 from '../components/blocks/ProductGrid2x2';
import DynamicCollection from '../components/blocks/DynamicCollection';

type BlockComponent = React.ComponentType<{ block: any }>;

const REGISTRY: Record<string, BlockComponent> = {
  BANNER_HERO: BannerHero,
  PRODUCT_GRID_2X2: ProductGrid2x2,
  DYNAMIC_COLLECTION: DynamicCollection,
};

export function resolveComponent(type: string): BlockComponent | null {
  const Component = REGISTRY[type];
  if (!Component) {
    console.warn(`[Registry] Unknown block type dropped silently: "${type}"`);
    return null;
  }
  return Component;
}

export function registerComponent(type: string, component: BlockComponent): void {
  REGISTRY[type] = component;
}
