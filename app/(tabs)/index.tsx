import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import RoundedCard from '../../components/ui/RoundedCard';
import { attendanceService, userService } from '../../services/api';
import { AttendanceStats } from '../../services/api/models/Attendance';
import TamiratStats from '../../components/attendance/TamiratStats';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Create a calendar day interface
interface CalendarDay {
  date: Date;
  attended: boolean;
  verified?: boolean;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'stats' | 'calendar'>('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Placeholder data until API is connected
  const userStats = {
    protestsAttended: 12,
    rank: 'Deneyimli Aktivist',
    badges: 5,
    streak: 3,
    totalHours: 36,
    lastAttendance: '2023-05-15',
    verifiedAttendances: 10,
    longestStreak: 5,
  };

  // Load attendance data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const stats = await attendanceService.getAttendanceStats();
      setAttendanceStats(stats);
      
      // Generate calendar data
      generateCalendarData(stats);
      
    } catch (error) {
      console.error('Error loading attendance stats:', error);
      // Fall back to placeholder data
      generateCalendarData(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Generate calendar data
  const generateCalendarData = (stats: AttendanceStats | null) => {
    const today = new Date();
    const days: CalendarDay[] = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Check if this date is in the attendance history
      // This is simplified - in a real app, we'd use the actual attendance data
      const attended = i % 3 === 0; // Every 3rd day as an example
      const verified = i % 6 === 0; // Every 6th day is verified
      
      days.push({ date, attended, verified });
    }
    
    setCalendarDays(days);
  };

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render a calendar day
  const renderCalendarDay = (item: CalendarDay, index: number) => {
    return (
      <View key={index} style={styles.calendarDay}>
        <Text style={styles.calendarDayText}>{formatDate(item.date)}</Text>
        <View style={[
          styles.calendarDayIndicator, 
          item.attended ? styles.calendarDayAttended : styles.calendarDayMissed,
          item.verified && styles.calendarDayVerified
        ]}>
          {item.attended && (
            <MaterialIcons 
              name={item.verified ? "verified" : "check"} 
              size={14} 
              color="#fff" 
            />
          )}
        </View>
      </View>
    );
  };

  const openWebsite = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme || 'light'].tint} />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDark && styles.darkContainer]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors[colorScheme || 'light'].tint]}
          tintColor={Colors[colorScheme || 'light'].tint}
        />
      }
    >
      {/* Location Buttons */}
      <View style={styles.locationButtonsContainer}>
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: Colors.light.error }]}
          onPress={() => openWebsite('https://halkharita.com')}
        >
          <MaterialIcons name="location-on" size={24} color="white" />
          <Text style={styles.locationButtonText}>Gözaltı Kremi Lokasyonları</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: Colors.light.tint }]}
          onPress={() => openWebsite('https://ozgurlukharitasi.com')}
        >
          <MaterialIcons name="map" size={24} color="white" />
          <Text style={styles.locationButtonText}>Tamirat Lokasyonları</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.header, isDark && styles.darkHeader]}>
        <View style={[styles.tabsContainer, isDark && styles.darkTabsContainer]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'stats' && styles.activeTab,
              isDark && styles.darkTab,
              activeTab === 'stats' && isDark && styles.darkActiveTab,
            ]}
            onPress={() => setActiveTab('stats')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'stats' && styles.activeTabText,
                isDark && styles.darkTabText,
                activeTab === 'stats' && isDark && styles.darkActiveTabText,
              ]}
            >
              İstatistikler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'calendar' && styles.activeTab,
              isDark && styles.darkTab,
              activeTab === 'calendar' && isDark && styles.darkActiveTab,
            ]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'calendar' && styles.activeTabText,
                isDark && styles.darkTabText,
                activeTab === 'calendar' && isDark && styles.darkActiveTabText,
              ]}
            >
              Takvim
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'stats' ? (
        <TamiratStats
          stats={userStats}
          onSeeAllStats={() => {/* Navigate to detailed stats */}}
        />
      ) : (
        <RoundedCard style={styles.calendarContainer}>
          <Text style={styles.calendarTitle}>Katılım Geçmişim</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          ) : calendarDays.length > 0 ? (
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => renderCalendarDay(day, index))}
            </View>
          ) : (
            <View style={styles.emptyCalendar}>
              <MaterialIcons name="event-busy" size={50} color="#ccc" />
              <Text style={styles.emptyCalendarText}>
                Henüz katılım geçmişi yok
              </Text>
              <Text style={styles.emptyCalendarSubtext}>
                Tamirat etkinliklerine katılarak geçmişinizi oluşturun
              </Text>
            </View>
          )}
        </RoundedCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginTop: 10,
  },
  header: {
    padding: 16,
  },
  darkHeader: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: '#f0f0f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 4,
  },
  darkTabsContainer: {
    backgroundColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  darkTab: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  darkActiveTab: {
    backgroundColor: '#363636',
  },
  tabText: {
    fontWeight: '600',
    color: '#404040',
  },
  darkTabText: {
    color: '#d0d0d0',
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: '700',
  },
  darkActiveTabText: {
    color: Colors.dark.tint,
    fontWeight: '700',
  },
  calendarContainer: {
    padding: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '20%', // 5 days per row
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarDayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  calendarDayIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  calendarDayAttended: {
    backgroundColor: '#4CAF50', // Green
  },
  calendarDayMissed: {
    backgroundColor: '#E0E0E0', // Gray
  },
  calendarDayVerified: {
    backgroundColor: '#F5BD42', // Yellow (matching the app's theme)
  },
  emptyCalendar: {
    alignItems: 'center',
    padding: 30,
  },
  emptyCalendarText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    color: '#666',
  },
  emptyCalendarSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  locationButtonsContainer: {
    padding: 16,
    gap: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
