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
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import RoundedCard from '../../components/ui/RoundedCard';
import { attendanceService, userService } from '../../services/api';
import { AttendanceStats } from '../../services/api/models/Attendance';

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
    rank: 'Experienced Activist',
    badges: 5,
    streak: 3,
    totalHours: 36,
    lastAttendance: '2023-05-15',
    verifiedAttendances: 10,
    longestStreak: 5,
  };

  // Load attendance data
  const loadAttendanceData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get attendance stats
      const stats = await attendanceService.getAttendanceStats();
      setAttendanceStats(stats);
      
      // Generate calendar data
      generateCalendarData(stats);
      
    } catch (error) {
      console.error("Error loading attendance data:", error);
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
    await loadAttendanceData();
  }, [loadAttendanceData]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadAttendanceData();
    }, [loadAttendanceData])
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

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeTitle}>Merhaba!</Text>
          <Text style={styles.welcomeSubtitle}>Ready to make a difference today?</Text>
        </View>
        <Image
          source={require('../../assets/images/mascot.png')}
          style={styles.mascotImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Activism Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="event-available" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={styles.statValue}>{userStats.protestsAttended}</Text>
            <Text style={styles.statLabel}>Protests</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={styles.statValue}>{userStats.badges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="local-fire-department" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            <Text style={styles.statValue}>{userStats.streak}</Text>
            <Text style={styles.statLabel}>Week Streak</Text>
          </View>
        </View>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>
            Your current rank: <Text style={styles.rankValue}>{userStats.rank}</Text>
          </Text>
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>See All Stats</Text>
            <MaterialIcons name="arrow-forward" size={16} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'stats' && styles.activeTabButton]} 
          onPress={() => setActiveTab('stats')}
        >
          <MaterialIcons 
            name="bar-chart" 
            size={20} 
            color={activeTab === 'stats' ? "#fff" : "#aaa"} 
          />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Stats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'calendar' && styles.activeTabButton]} 
          onPress={() => setActiveTab('calendar')}
        >
          <MaterialIcons 
            name="calendar-today" 
            size={20} 
            color={activeTab === 'calendar' ? "#fff" : "#aaa"} 
          />
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      {activeTab === 'stats' && (
        <RoundedCard style={styles.detailedStatsContainer}>
          <Text style={styles.detailedStatsTitle}>My Attendance Stats</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          ) : (
            <>
              <View style={styles.detailedStatsRow}>
                <View style={styles.detailedStatItem}>
                  <Text style={styles.detailedStatValue}>{userStats.protestsAttended}</Text>
                  <Text style={styles.detailedStatLabel}>Total Protests</Text>
                </View>
                <View style={styles.detailedStatItem}>
                  <Text style={styles.detailedStatValue}>{userStats.verifiedAttendances}</Text>
                  <Text style={styles.detailedStatLabel}>Verified</Text>
                </View>
              </View>
              
              <View style={styles.detailedStatsRow}>
                <View style={styles.detailedStatItem}>
                  <Text style={styles.detailedStatValue}>{userStats.totalHours}h</Text>
                  <Text style={styles.detailedStatLabel}>Total Hours</Text>
                </View>
                <View style={styles.detailedStatItem}>
                  <Text style={styles.detailedStatValue}>{userStats.streak}</Text>
                  <Text style={styles.detailedStatLabel}>Current Streak</Text>
                </View>
              </View>
              
              <View style={styles.detailedStatsRow}>
                <View style={styles.detailedStatItem}>
                  <Text style={styles.detailedStatValue}>{userStats.longestStreak}</Text>
                  <Text style={styles.detailedStatLabel}>Longest Streak</Text>
                </View>
                <View style={styles.detailedStatItem}>
                  <Text style={styles.detailedStatValue}>{new Date(userStats.lastAttendance).toLocaleDateString()}</Text>
                  <Text style={styles.detailedStatLabel}>Last Attendance</Text>
                </View>
              </View>
            </>
          )}
        </RoundedCard>
      )}
      
      {activeTab === 'calendar' && (
        <RoundedCard style={styles.calendarContainer}>
          <Text style={styles.calendarTitle}>My Attendance History</Text>
          
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
                No attendance history yet
              </Text>
              <Text style={styles.emptyCalendarSubtext}>
                Start attending protests to build your history
              </Text>
            </View>
          )}
        </RoundedCard>
      )}

      <View style={styles.tipContainer}>
        <MaterialIcons name="tips-and-updates" size={24} color="#FFD700" />
        <Text style={styles.tipText}>
          Remember to charge your phone and bring water to protests!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  mascotImage: {
    width: 70,
    height: 70,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    paddingTop: 15,
  },
  rankText: {
    fontSize: 14,
    color: '#666',
  },
  rankValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: 14,
    color: '#3498db',
    marginRight: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: '#222',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#222',
  },
  activeTabButton: {
    backgroundColor: Colors.dark.tint,
  },
  tabText: {
    marginLeft: 5,
    color: '#aaa',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  detailedStatsContainer: {
    margin: 10,
    padding: 15,
  },
  detailedStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  detailedStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailedStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  detailedStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailedStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  calendarContainer: {
    margin: 10,
    padding: 15,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
  tipContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    marginBottom: 20,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
});
