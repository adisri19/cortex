import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ProductItem } from '../../types';
import { useCartStore } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { dispatchAction } from '../../dispatcher/ActionDispatcher';

interface ProductCardProps {
  product: ProductItem;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const theme = useTheme();
  
  // Subscription to local cart state for ONLY this item to prevent redundant parent list triggers.
  const cartItem = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)
  );
  
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    dispatchAction({
      type: 'ADD_TO_CART',
      payload: { id: product.id, name: product.name }
    });
  };

  const handleRemove = () => {
    useCartStore.getState().removeItem(product.id);
  };

  // Memoized dynamic styles to prevent anonymous object creation on re-render
  const cardStyle = useMemo(() => [
    styles.card,
    { backgroundColor: '#ffffff', borderColor: theme.accent || '#eeeeee' }
  ], [theme.accent]);

  const nameStyle = useMemo(() => [
    styles.name,
    { color: theme.text || '#1A1A1A' }
  ], [theme.text]);

  const qtyBtnPrimaryStyle = useMemo(() => [
    styles.qtyBtn,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const qtyBtnAccentStyle = useMemo(() => [
    styles.qtyBtn,
    { backgroundColor: theme.accent || '#eeeeee' }
  ], [theme.accent]);

  const addButtonStyle = useMemo(() => [
    styles.addButton,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  return (
    <View style={cardStyle}>
      <Image
        source={{ uri: product.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text numberOfLines={1} style={nameStyle}>
          {product.name}
        </Text>
        <Text style={styles.price}>₹{product.price}</Text>
        
        {quantity > 0 ? (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={qtyBtnAccentStyle}
              onPress={handleRemove}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={qtyBtnPrimaryStyle}
              onPress={handleAdd}
            >
              <Text style={styles.qtyBtnTextWhite}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={addButtonStyle}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}, (prev, next) => {
  return (
    prev.product.id === next.product.id &&
    prev.product.price === next.product.price
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  addButton: {
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  qtyBtnTextWhite: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default ProductCard;
