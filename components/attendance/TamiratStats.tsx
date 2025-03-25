import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface TamiratStatsProps {
  stats: {
    protestsAttended: number;
    badges: number;
    streak: number;
    rank: string;
    totalHours: number;
    verifiedAttendances: number;
    longestStreak: number;
    lastAttendance: string;
  };
  onSeeAllStats?: () => void;
}

export default function TamiratStats({ stats, onSeeAllStats }: TamiratStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.darkText]}>
        Tamirat İstatistiklerin
      </Text>

      <View style={styles.statsHighlights}>
        <View style={styles.statItem}>
          <MaterialIcons
            name="event-available"
            size={32}
            color={Colors[colorScheme || 'light'].tint}
          />
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.protestsAttended}
          </Text>
          <Text style={[styles.statLabel, isDark && styles.darkSubText]}>
            Tamirat
          </Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons
            name="emoji-events"
            size={32}
            color={Colors[colorScheme || 'light'].tint}
          />
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.badges}
          </Text>
          <Text style={[styles.statLabel, isDark && styles.darkSubText]}>
            Rozet
          </Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons
            name="local-fire-department"
            size={32}
            color={Colors[colorScheme || 'light'].tint}
          />
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.streak}
          </Text>
          <Text style={[styles.statLabel, isDark && styles.darkSubText]}>
            Haftalık Seri
          </Text>
        </View>
      </View>

      <View style={styles.rankContainer}>
        <Text style={[styles.rankLabel, isDark && styles.darkSubText]}>
          Mevcut rütben:
        </Text>
        <Text style={[styles.rankValue, isDark && styles.darkText]}>
          Deneyimli Tesisatçı
        </Text>
        {onSeeAllStats && (
          <TouchableOpacity onPress={onSeeAllStats}>
            <Text style={styles.seeAllStats}>
              Tüm İstatistikleri Gör
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailedStats}>
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
          Detaylı İstatistikler
        </Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statsCard, isDark && styles.darkStatsCard]}>
            <Text style={styles.statsValue}>
              {stats.protestsAttended}
            </Text>
            <Text style={styles.statsLabel}>
              Toplam Tamirat
            </Text>
          </View>

          <View style={[styles.statsCard, isDark && styles.darkStatsCard]}>
            <Text style={styles.statsValue}>
              {stats.verifiedAttendances}
            </Text>
            <Text style={styles.statsLabel}>
              Onaylanmış
            </Text>
          </View>

          <View style={[styles.statsCard, isDark && styles.darkStatsCard]}>
            <Text style={styles.statsValue}>
              {stats.totalHours}s
            </Text>
            <Text style={styles.statsLabel}>
              Toplam Saat
            </Text>
          </View>

          <View style={[styles.statsCard, isDark && styles.darkStatsCard]}>
            <Text style={styles.statsValue}>
              {stats.streak}
            </Text>
            <Text style={styles.statsLabel}>
              Mevcut Seri
            </Text>
          </View>

          <View style={[styles.statsCard, isDark && styles.darkStatsCard]}>
            <Text style={styles.statsValue}>
              {stats.longestStreak}
            </Text>
            <Text style={styles.statsLabel}>
              En Uzun Seri
            </Text>
          </View>

          <View style={[styles.statsCard, isDark && styles.darkStatsCard]}>
            <Text style={styles.statsValue}>
              {new Date(stats.lastAttendance).toLocaleDateString('tr-TR')}
            </Text>
            <Text style={styles.statsLabel}>
              Son Katılım
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  darkText: {
    color: '#ffffff',
  },
  darkSubText: {
    color: '#cccccc',
  },
  statsHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#404040',
    marginTop: 4,
    fontWeight: '500',
  },
  rankContainer: {
    marginBottom: 24,
  },
  rankLabel: {
    fontSize: 16,
    color: '#404040',
    marginBottom: 4,
    fontWeight: '500',
  },
  rankValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  seeAllStats: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  detailedStats: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  darkStatsCard: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  statsLabel: {
    fontSize: 16,
    color: '#cccccc',
    fontWeight: '500',
  },
}); 