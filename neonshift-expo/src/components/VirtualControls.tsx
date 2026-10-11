import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';

interface VirtualControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump?: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onLeft,
  onRight,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onLeft}
          activeOpacity={0.6}
        >
          <Text style={styles.buttonText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onRight}
          activeOpacity={0.6}
        >
          <Text style={styles.buttonText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 15,
  },
  leftGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 16, 36, 0.65)',
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  buttonText: {
    color: Colors.neonCyan,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
});

