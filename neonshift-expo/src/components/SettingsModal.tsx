import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { GameSettings } from '../data/LocalGameRepository';

interface SettingsModalProps {
  visible: boolean;
  settings: GameSettings;
  gamerTag: string;
  onSave: (settings: GameSettings, tag: string) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  settings,
  gamerTag,
  onSave,
  onClose,
}) => {
  const [currentTag, setCurrentTag] = useState(gamerTag);
  const [music, setMusic] = useState(settings.musicEnabled);
  const [sfx, setSfx] = useState(settings.sfxEnabled);
  const [haptics, setHaptics] = useState(settings.hapticsEnabled);
  const [controlScheme, setControlScheme] = useState(settings.controlScheme);

  const handleSave = () => {
    onSave(
      {
        ...settings,
        musicEnabled: music,
        sfxEnabled: sfx,
        hapticsEnabled: haptics,
        controlScheme,
      },
      currentTag
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>SYSTEM CONFIG</Text>

          {/* Gamer Tag Input */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>// PILOT IDENTITY</Text>
            <Text style={styles.label}>CALLSIGN</Text>
            <TextInput
              style={styles.input}
              value={currentTag}
              onChangeText={(text) =>
                setCurrentTag(text.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16).toUpperCase())
              }
              placeholder="CALLSIGN"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              maxLength={16}
              autoCapitalize="characters"
            />
          </View>

          {/* Audio & Haptic Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>// AUDIO & SENSORY</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelWrap}>
                <Text style={styles.toggleLabel}>BACKGROUND MUSIC</Text>
                <Text style={styles.toggleHelp}>Cyber synthwave melody</Text>
              </View>
              <Switch
                value={music}
                onValueChange={setMusic}
                trackColor={{ false: '#22223a', true: Colors.neonCyan }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelWrap}>
                <Text style={styles.toggleLabel}>SOUND EFFECTS (SFX)</Text>
                <Text style={styles.toggleHelp}>Engines, lasers & collisions</Text>
              </View>
              <Switch
                value={sfx}
                onValueChange={setSfx}
                trackColor={{ false: '#22223a', true: Colors.neonCyan }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelWrap}>
                <Text style={styles.toggleLabel}>HAPTIC FEEDBACK</Text>
                <Text style={styles.toggleHelp}>Vibrations on shifts & jumps</Text>
              </View>
              <Switch
                value={haptics}
                onValueChange={setHaptics}
                trackColor={{ false: '#22223a', true: Colors.neonMagenta }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Control Scheme Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>// CONTROL INTERFACE</Text>
            <View style={styles.controlRow}>
              {(['gestures', 'hybrid', 'buttons'] as const).map((scheme) => (
                <TouchableOpacity
                  key={scheme}
                  style={[
                    styles.schemeBtn,
                    controlScheme === scheme && styles.schemeBtnActive,
                  ]}
                  onPress={() => setControlScheme(scheme)}
                >
                  <Text
                    style={[
                      styles.schemeText,
                      controlScheme === scheme && styles.schemeTextActive,
                    ]}
                  >
                    {scheme.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.schemeHelp}>
              {controlScheme === 'gestures' && 'Swipe left/right to shift lanes, swipe up to jump.'}
              {controlScheme === 'hybrid' && 'Gestures + on-screen action controls.'}
              {controlScheme === 'buttons' && 'Dedicated on-screen arrow pads & jump trigger.'}
            </Text>
          </View>

          {/* Save / Close */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 16, 36, 0.98)',
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    padding: 22,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(6, 6, 15, 0.85)',
    borderWidth: 1.5,
    borderColor: Colors.neonPurple,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabelWrap: {
    flex: 1,
    paddingRight: 10,
  },
  toggleLabel: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  toggleHelp: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 2,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  schemeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
  },
  schemeBtnActive: {
    borderColor: Colors.neonCyan,
    backgroundColor: 'rgba(0, 245, 255, 0.18)',
  },
  schemeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  schemeTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  schemeHelp: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 6,
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
  },
  saveText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
