import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ProductGrid2x2Block, ProductItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../common/ProductCard';

interface ProductGrid2x2Props {
  block: ProductGrid2x2Block;
}

const ProductGrid2x2: React.FC<ProductGrid2x2Props> = React.memo(({ block }) => {
  const theme = useTheme();

  const headerStyle = useMemo(() => [
    styles.header,
    { color: theme.primary }
  ], [theme.primary]);

  // Define renderItem via useCallback to satisfy Performance Rule 4
  const renderItem = useCallback(({ item }: { item: ProductItem }) => {
    return <ProductCard product={item} />;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={headerStyle}>
        {block.title}
      </Text>
      <FlatList
        data={block.products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default ProductGrid2x2;
