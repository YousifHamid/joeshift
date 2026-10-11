import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { LocalRecord } from '../data/LocalGameRepository';

interface LeaderboardModalProps {
  visible: boolean;
  records: LocalRecord[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  visible,
  records,
  onClose,
}) => {
  const renderItem = ({ item, index }: { item: LocalRecord; index: number }) => {
    const dateStr = item.timestampMillis
      ? new Date(item.timestampMillis).toLocaleDateString()
      : '';

    return (
      <View style={styles.row}>
        <View style={styles.rankCol}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.gamerTag}>{item.gamerTag || 'PLAYER'}</Text>
          <Text style={styles.subStats}>
            {item.distanceMeters}m · {item.shardsCollected} shards · x{item.maxCombo?.toFixed(1) || '1.0'}
            {dateStr ? ` · ${dateStr}` : ''}
          </Text>
        </View>

        <View style={styles.scoreCol}>
          <Text style={styles.scoreText}>{item.score.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>LOCAL ARCHIVES</Text>
            <Text style={styles.subtitle}>TOP 25 RUNS</Text>
          </View>

          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>NO DATA LOGGED YET</Text>
              <Text style={styles.emptySubtext}>Initiate a run to record flight telemetry.</Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.runId}
              renderItem={renderItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    backgroundColor: 'rgba(16, 16, 36, 0.98)',
    borderWidth: 2,
    borderColor: Colors.neonPurple,
    padding: 20,
    shadowColor: Colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 47, 255, 0.3)',
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  list: {
    flexGrow: 0,
    maxHeight: 380,
  },
  listContent: {
    gap: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 6, 15, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rankCol: {
    width: 36,
  },
  rankText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
  },
  gamerTag: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subStats: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 2,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  emptySubtext: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  closeBtnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
