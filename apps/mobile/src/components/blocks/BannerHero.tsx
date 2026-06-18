import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BannerHeroBlock } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { dispatchAction } from '../../dispatcher/ActionDispatcher';

interface BannerHeroProps {
  block: BannerHeroBlock;
}

const BannerHero: React.FC<BannerHeroProps> = React.memo(({ block }) => {
  const theme = useTheme();
  const width = Dimensions.get('window').width;
  const [imgUrl, setImgUrl] = useState(block.image_url);

  const handlePress = () => {
    dispatchAction(block.action);
  };

  // Memoized styles to satisfy performance rules
  const containerStyle = useMemo(() => [
    styles.container,
    { width, height: 200 }
  ], [width]);

  const ctaStyle = useMemo(() => [
    styles.cta,
    { backgroundColor: theme.primary }
  ], [theme.primary]);

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri: imgUrl }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImgUrl('https://picsum.photos/seed/fallback_banner/800/400')}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {block.title}
        </Text>
        {block.subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {block.subtitle}
          </Text>
        )}
        <TouchableOpacity
          style={ctaStyle}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 4,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 10,
    opacity: 0.9,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default BannerHero;
