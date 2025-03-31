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
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import RoundedCard from '../../components/ui/RoundedCard';
import { attendanceService, userService } from '../../services/api';
import { AttendanceStats } from '../../services/api/models/Attendance';
import TamiratStats from '../../components/attendance/TamiratStats';
import { useAuth } from '../../services/api/AuthContext';
import { useRouter } from 'expo-router';

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

  // Map attendance stats to the format expected by TamiratStats
  const mapStatsForUI = (stats: AttendanceStats | null) => {
    if (!stats) {
      // Return zeros instead of mock data when no stats available
      return {
        protestsAttended: 0,
        rank: 'Yeni Başlayan',
        badges: 0,
        streak: 0,
        totalHours: 0,
        lastAttendance: '',
        verifiedAttendances: 0,
        longestStreak: 0,
      };
    }

    // Calculate rank based on total attendance
    let rank = 'Yeni Başlayan';
    if (stats.totalAttended >= 20) {
      rank = 'Uzman Aktivist';
    } else if (stats.totalAttended >= 10) {
      rank = 'Deneyimli Aktivist';
    } else if (stats.totalAttended >= 5) {
      rank = 'Deneyimli Tesisatçı';
    } else if (stats.totalAttended >= 1) {
      rank = 'Başlangıç Tesisatçı';
    }

    // Map the stats
    return {
      protestsAttended: stats.totalAttended,
      rank: rank,
      badges: Math.floor(stats.totalAttended / 3), // Estimate: 1 badge per 3 attendances
      streak: stats.streakCurrent,
      totalHours: stats.totalAttended * 3, // Estimate: 3 hours per attendance
      lastAttendance: stats.lastAttendance ? stats.lastAttendance.toISOString().split('T')[0] : '',
      verifiedAttendances: stats.verified,
      longestStreak: stats.streakLongest,
    };
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
        <Text style={{fontSize: 12, color: '#fff', marginBottom: 5}}>{formatDate(item.date)}</Text>
        <View style={[
          {
            width: 30, 
            height: 30, 
            borderRadius: 15, 
            justifyContent: 'center', 
            alignItems: 'center'
          },
          item.attended ? styles.attendedDay : {backgroundColor: 'rgba(255, 255, 255, 0.1)'},
          item.verified && styles.verifiedDay
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
      {/* Tabs for stats and calendar */}
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <View style={[styles.tabsContainer, isDark && styles.darkTabsContainer]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'stats' && styles.activeTab,
              isDark && styles.darkTab,
              activeTab === 'stats' && isDark && styles.darkActiveTab
            ]}
            onPress={() => setActiveTab('stats')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'stats' && styles.activeTabText,
                isDark && styles.darkTabText,
                activeTab === 'stats' && isDark && styles.darkActiveTabText
              ]}
            >
              Tamiratlar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'calendar' && styles.activeTab,
              isDark && styles.darkTab,
              activeTab === 'calendar' && isDark && styles.darkActiveTab
            ]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'calendar' && styles.activeTabText,
                isDark && styles.darkTabText,
                activeTab === 'calendar' && isDark && styles.darkActiveTabText
              ]}
            >
              Araçlar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'stats' ? (
        <>
          <TamiratStats
            stats={mapStatsForUI(attendanceStats)}
            isDark={isDark}
            onSeeAllStats={() => console.log('View all stats')}
          />
          
          {/* Calendar moved to Tamiratlar tab */}
          <RoundedCard style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>Takvimin</Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            ) : (
              <View style={styles.calendarContentContainer}>
                {/* Month navigation */}
                <View style={styles.monthNavigation}>
                  <TouchableOpacity>
                    <MaterialIcons name="chevron-left" size={32} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>March 2025</Text>
                  <TouchableOpacity>
                    <MaterialIcons name="chevron-right" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                {/* Days of week */}
                <View style={styles.daysOfWeekRow}>
                  <Text style={styles.dayOfWeekText}>P</Text>
                  <Text style={styles.dayOfWeekText}>S</Text>
                  <Text style={styles.dayOfWeekText}>Ç</Text>
                  <Text style={styles.dayOfWeekText}>P</Text>
                  <Text style={styles.dayOfWeekText}>C</Text>
                  <Text style={styles.dayOfWeekText}>C</Text>
                  <Text style={styles.dayOfWeekText}>P</Text>
                </View>
                
                {/* Calendar grid - just showing a static representation for now */}
                <View style={styles.monthCalendarGrid}>
                  {/* Week 1 */}
                  <View style={styles.calendarWeekRow}>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.calendarDay}>
                      <View style={[styles.dayCircle, styles.attendedDay]}>
                        <Text style={styles.badgeIndicator}>B</Text>
                      </View>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>2</Text>
                    </View>
                  </View>
                  
                  {/* Week 2 */}
                  <View style={styles.calendarWeekRow}>
                    <View style={styles.calendarDay}>
                      <View style={[styles.dayCircle, styles.attendedDay]}>
                        <Text style={styles.badgeIndicator}>B</Text>
                      </View>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>4</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>5</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>6</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>7</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>8</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>9</Text>
                    </View>
                  </View>
                  
                  {/* Week 3 */}
                  <View style={styles.calendarWeekRow}>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>10</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>11</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>12</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>13</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>14</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>15</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>16</Text>
                    </View>
                  </View>
                  
                  {/* Week 4 */}
                  <View style={styles.calendarWeekRow}>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>17</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>18</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>19</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <View style={[styles.dayCircle, styles.attendedDay]}>
                        <Text style={styles.dayNumber}>20</Text>
                      </View>
                    </View>
                    <View style={styles.calendarDay}>
                      <View style={[styles.dayCircle, styles.attendedDay]}>
                        <Text style={styles.dayNumber}>21</Text>
                      </View>
                    </View>
                    <View style={styles.calendarDay}>
                      <View style={[styles.dayCircle, styles.attendedDay]}>
                        <Text style={styles.dayNumber}>22</Text>
                      </View>
                    </View>
                    <View style={styles.calendarDay}>
                      <View style={[styles.dayCircle, styles.verifiedDay]}>
                        <Text style={styles.dayNumber}>23</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Week 5 */}
                  <View style={styles.calendarWeekRow}>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>24</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>25</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>26</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>27</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>28</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>29</Text>
                    </View>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>30</Text>
                    </View>
                  </View>
                  
                  {/* Week 6 (partial) */}
                  <View style={styles.calendarWeekRow}>
                    <View style={styles.calendarDay}>
                      <Text style={styles.dayNumber}>31</Text>
                    </View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                    <View style={styles.emptyDay}></View>
                  </View>
                </View>
              </View>
            )}
          </RoundedCard>
        </>
      ) : (
        <>
          {/* Location buttons remain in Araçlar tab */}
          <View style={styles.homeButtonsContainer}>
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: Colors.light.error }]}
              onPress={() => openWebsite('https://halkharita.com')}
            >
              <MaterialIcons name="location-on" size={24} color="white" />
              <Text style={styles.locationButtonText}>Gözaltı Kremi{'\n'}Lokasyonları</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: Colors.light.tint }]}
              onPress={() => openWebsite('https://ozgurlukharitasi.com')}
            >
              <MaterialIcons name="map" size={24} color="white" />
              <Text style={styles.locationButtonText}>Tamirat{'\n'}Lokasyonları</Text>
            </TouchableOpacity>
          </View>
        </>
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
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
  },
  calendarContentContainer: {
    backgroundColor: '#2D3355', // Dark navy blue background
    padding: 20,
  },
  calendarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fff',
    padding: 16,
    backgroundColor: '#2D3355', // Dark navy blue background
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  dayOfWeekText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    width: 40,
    textAlign: 'center',
  },
  monthCalendarGrid: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emptyDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly visible light background
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendedDay: {
    backgroundColor: '#4CAF50', // Green
  },
  verifiedDay: {
    backgroundColor: '#F5BD42', // Yellow/orange
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  badgeIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  homeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
    marginTop: 16,
    marginBottom: 80, // Add extra space at the bottom so buttons are visible above navigation tabs
  },
  locationButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
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
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
