import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const TIPS = [
  "Tamirata giderken telefonunuzu şarj etmeyi ve su almayı unutmayın!",
  "Tamirat sırasında sıcağa dayanıklı eldiven veya örgü eldiven kullanmayı ihmal etmeyin!",
  "Tamirat öncesi talsit hazırlamayı unutmayın, gözlerin yaşarmasın.",
  "Tamiratta 2-3 kişilik gruplar halinde birbirinizi kaybetmeden durmayı unutmayın.",
  "Acil durumlar için yakınlarınıza konum atmayı unutmayın!",
  "Bulabildiğiniz en ucuz deniz gözlüğünü yanınıza aldığınızdan emin olun.",
  "Tamirata giderken rahat ve hızlı hareket edebileceğiniz kıyafetler giyin."
];

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
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % TIPS.length);
    }, 5000); // Rotate tips every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.tipContainer, isDark && styles.darkTipContainer]}>
        <MaterialIcons
          name="lightbulb"
          size={24}
          color={isDark ? Colors.dark.text : Colors.light.text}
          style={styles.tipIcon}
        />
        <Text style={[styles.tipText, isDark && styles.darkText]}>
          {TIPS[currentTipIndex]}
        </Text>
      </View>

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
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkTipContainer: {
    backgroundColor: '#1e1e1e',
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
}); 