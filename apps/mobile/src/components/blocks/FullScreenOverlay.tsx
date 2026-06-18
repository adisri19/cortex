import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { FullScreenOverlayBlock } from '../../types';

class LottieErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('[LottieOverlay] Animation failed to load/render:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface FullScreenOverlayProps {
  block: FullScreenOverlayBlock | null;
}

const FullScreenOverlay: React.FC<FullScreenOverlayProps> = ({ block }) => {
  if (!block || !block.animation_url) return null;

  return (
    <LottieErrorBoundary>
      <View style={styles.overlay} pointerEvents="none">
        <LottieView
          source={{ uri: block.animation_url }}
          style={styles.lottie}
          autoPlay
          loop
        />
      </View>
    </LottieErrorBoundary>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

export default FullScreenOverlay;
