import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const CartBadge: React.FC = () => {
  const count = useCartStore((s) => s.count);
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          speed: 50,
          bounciness: 15,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();
    }
  }, [count, scaleAnim]);

  const iconColor = useMemo(() => theme.text || '#1A1A1A', [theme.text]);

  // Memoized style to satisfy Performance Rule 7
  const badgeStyle = useMemo(() => [
    styles.badge,
    {
      backgroundColor: '#D32F2F',
      transform: [{ scale: scaleAnim }],
    },
  ], [scaleAnim]);

  return (
    <View style={styles.container}>
      <Ionicons name="cart-outline" size={26} color={iconColor} />
      {count > 0 && (
        <Animated.View style={badgeStyle}>
          <Text style={styles.badgeText}>{count}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CartBadge;
