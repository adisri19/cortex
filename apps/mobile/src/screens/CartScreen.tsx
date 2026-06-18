import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useCartStore } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';

const CartScreen: React.FC = () => {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const count = useCartStore((s) => s.count);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const theme = useTheme();

  const handleIncrement = useCallback((item: CartItem) => {
    addItem({
      id: item.productId,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      action: { type: 'DEEP_LINK', payload: { url: '/cart' } }
    });
  }, [addItem]);

  const handleDecrement = useCallback((item: CartItem) => {
    removeItem(item.productId);
  }, [removeItem]);

  // Memoized dynamic styles to satisfy Performance Rule 7
  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.background }
  ], [theme.background]);

  const titleStyle = useMemo(() => [
    styles.title,
    { color: theme.primary }
  ], [theme.primary]);

  const qtyBtnPrimaryStyle = useMemo(() => [
    styles.qtyBtn,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const checkoutBtnStyle = useMemo(() => [
    styles.checkoutBtn,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  // Define renderItem outside inline declaration to prevent recreate re-renders
  const renderItem = useCallback(({ item }: { item: CartItem }) => {
    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>
        <View style={styles.qtyContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrement(item)}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={qtyBtnPrimaryStyle} onPress={() => handleIncrement(item)}>
            <Text style={styles.qtyBtnTextWhite}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [handleDecrement, handleIncrement, qtyBtnPrimaryStyle]);

  return (
    <View style={containerStyle}>
      <Text style={titleStyle}>Your Cart ({count} items)</Text>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="basket-outline" size={60} color="#999999" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            renderItem={renderItem}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
            <TouchableOpacity style={checkoutBtnStyle}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eeeeee',
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
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 16,
    paddingBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;
