import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { DynamicCollectionBlock, CollectionItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCartStore } from '../../context/CartContext';
import { dispatchAction } from '../../dispatcher/ActionDispatcher';

interface DynamicCollectionProps {
  block: DynamicCollectionBlock;
}

const CollectionItemCard: React.FC<{ item: CollectionItem }> = React.memo(({ item }) => {
  const theme = useTheme();

  // Subscription to cart state for only this specific product ID
  const cartItem = useCartStore(
    (s) => s.items.find((i) => i.productId === item.id)
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    dispatchAction({
      type: 'ADD_TO_CART',
      payload: { id: item.id, name: item.name }
    });
  };

  const handleRemove = () => {
    useCartStore.getState().removeItem(item.id);
  };

  // Memoize dynamic style objects to prevent anonymous recreation
  const cardStyle = useMemo(() => [
    styles.card,
    { borderColor: theme.accent || '#eeeeee' }
  ], [theme.accent]);

  const badgeStyle = useMemo(() => [
    styles.badge,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const qtyBtnPrimaryStyle = useMemo(() => [
    styles.qtyBtn,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  const qtyBtnAccentStyle = useMemo(() => [
    styles.qtyBtn,
    { backgroundColor: theme.accent || '#eeeeee' }
  ], [theme.accent]);

  const cardCtaStyle = useMemo(() => [
    styles.cardCta,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  return (
    <View style={cardStyle}>
      {item.badge && (
        <View style={badgeStyle}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
      <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text numberOfLines={1} style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardPrice}>₹{item.price}</Text>
        {quantity > 0 ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity style={qtyBtnAccentStyle} onPress={handleRemove}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity style={qtyBtnPrimaryStyle} onPress={handleAdd}>
              <Text style={styles.qtyBtnTextWhite}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={cardCtaStyle} onPress={handleAdd}>
            <Text style={styles.cardCtaText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}, (prev, next) => {
  return prev.item.id === next.item.id && prev.item.price === next.item.price;
});

const DynamicCollection: React.FC<DynamicCollectionProps> = React.memo(({ block }) => {
  const theme = useTheme();

  const headerStyle = useMemo(() => [
    styles.header,
    { color: theme.primary }
  ], [theme.primary]);

  // Define renderItem outside inline declaration to prevent recreate re-renders
  const renderItem = useCallback(({ item }: { item: CollectionItem }) => {
    return <CollectionItemCard item={item} />;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={headerStyle}>
        {block.theme_label}
      </Text>
      <FlatList
        horizontal
        data={block.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: 148, offset: 148 * index, index })}
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingLeft: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
  },
  listContainer: {
    paddingRight: 12,
  },
  card: {
    width: 140,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardContent: {
    padding: 8,
  },
  cardName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 6,
  },
  cardCta: {
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardCtaText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  qtyBtnTextWhite: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DynamicCollection;
