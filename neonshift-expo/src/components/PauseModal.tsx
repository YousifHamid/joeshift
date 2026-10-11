import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onMenu }) => {
  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onResume}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
      >
        <Text style={styles.title}>SIMULATION PAUSED</Text>
        <Text style={styles.subtext}>Tap empty screen or RESUME to continue</Text>

        <View style={styles.buttonStack}>
          <TouchableOpacity style={[styles.btn, styles.resumeBtn]} onPress={onResume} activeOpacity={0.8}>
            <Text style={styles.resumeBtnText}>RESUME</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={onRestart} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>RESTART RUN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={onMenu} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 6, 15, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  card: {
    width: '85%',
    maxWidth: 360,
    padding: 28,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 16, 36, 0.95)',
    borderWidth: 2,
    borderColor: Colors.neonPurple,
    alignItems: 'center',
    shadowColor: Colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '900',
    color: Colors.neonCyan,
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 24,
    letterSpacing: 1,
  },
  buttonStack: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBtn: {
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  resumeBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#06060F',
    letterSpacing: 2,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryBtnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
});
