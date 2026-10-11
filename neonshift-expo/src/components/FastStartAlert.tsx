import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';

interface FastStartAlertProps {
  visible: boolean;
  onDismiss?: () => void;
}

export const FastStartAlert: React.FC<FastStartAlertProps> = ({ visible, onDismiss }) => {
  const translateYAnim = useRef(new Animated.Value(10)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Fade in the alert
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      // Continuous upward motion loop showing "moving to up"
      const moveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(translateYAnim, {
            toValue: -16,
            duration: 650,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 10,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );
      moveLoop.start();

      // Gentle glow pulse
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // Fast auto-dismiss timer after 3.2s
      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          onDismiss?.();
        });
      }, 3200);

      return () => {
        clearTimeout(timer);
        moveLoop.stop();
        pulseLoop.stop();
      };
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.card}>
        {/* Animated Moving Up Indicator */}
        <Animated.View
          style={[
            styles.animatedArrowBox,
            { transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <Text style={styles.animatedArrow}>▲</Text>
          <Text style={styles.animatedArrowSub}>▲</Text>
        </Animated.View>

        {/* Action Copy */}
        <View style={styles.textStack}>
          <Text style={styles.primaryAction}>▲ SWIPE UP TO JUMP</Text>
          <Text style={styles.secondaryAction}>HOLD UP TO NITRO BOOST (+60%)</Text>
        </View>

        {/* Bottom Cyber Corner Brackets */}
        <View style={styles.bracketLeft} />
        <View style={styles.bracketRight} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '22%',
    alignSelf: 'center',
    zIndex: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 340,
  },
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 26, 0.92)',
    borderColor: Colors.neonCyan,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 14,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  animatedArrowBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: Colors.neonCyan,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedArrow: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 18,
  },
  animatedArrowSub: {
    fontSize: 10,
    color: Colors.neonCyan,
    fontWeight: 'bold',
    marginTop: -4,
  },
  textStack: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  primaryAction: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  secondaryAction: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 2,
    opacity: 0.9,
  },
  bracketLeft: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.neonGold,
  },
  bracketRight: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: Colors.neonGold,
  },
});
