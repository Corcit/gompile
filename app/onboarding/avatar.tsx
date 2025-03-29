import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoundedButton from '../../components/ui/RoundedButton';
import RoundedCard from '../../components/ui/RoundedCard';
import Mascot from '../../components/mascot/Mascot';

// Interface for Avatar
interface Avatar {
  id: string;
  name: string;
  filename: string;
  category: string;
  colorScheme: string;
  imageUrl: string;
}

export default function AvatarSelectionScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      // This would be replaced with your actual API endpoint
      // const apiUrl = 'http://localhost:5000/api/avatars';
      // const response = await fetch(apiUrl);
      
      // if (!response.ok) {
      //   throw new Error('Failed to fetch avatars');
      // }
      
      // const data = await response.json();
      // setAvatars(data);
      
      // Use dummy data for now
      useFallbackAvatars();
    } catch (error) {
      console.error('Error fetching avatars:', error);
      // In a real app, handle error gracefully
      Alert.alert('Error', 'Failed to load avatars. Please try again.');
      // Use dummy avatars as fallback
      useFallbackAvatars();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackAvatars = () => {
    // Generate more visually appealing avatars with our color scheme
    const colorOptions = [
      Colors.dark.primary,
      Colors.dark.secondary,
      Colors.dark.accent,
      Colors.dark.success,
      Colors.dark.info,
      // Generate more variations
      '#723333', // darker red
      '#a75151', // lighter red
      '#c9a038', // darker gold
      '#f7cb68', // lighter gold
      '#2c5a89', // darker blue
      '#4c96e1', // lighter blue
      '#0d0e16', // darker navy
      '#1d2033', // lighter navy
      '#252944', // darker purple
      '#3e4772', // lighter purple
      '#8a9199', // darker gray
      '#cbd3dc', // lighter gray
      '#d9d9d9', // darker white
      '#ffffff', // white
      '#582424', // very dark red
    ];
    
    const fallbackAvatars: Avatar[] = colorOptions.map((color, index) => ({
      id: `fallback-${index + 1}`,
      name: `Avatar ${index + 1}`,
      filename: '',
      category: 'fallback',
      colorScheme: color,
      imageUrl: '' // We'll use the color directly
    }));
    
    setAvatars(fallbackAvatars);
    
    if (fallbackAvatars.length > 0) {
      setSelectedAvatar(fallbackAvatars[0].id);
    }
  };

  const handleContinue = async () => {
    if (!selectedAvatar) {
      Alert.alert('Selection Required', 'Please select an avatar to continue');
      return;
    }

    try {
      setSubmitting(true);
      
      // Save the selected avatar ID
      await AsyncStorage.setItem('@user:avatarId', selectedAvatar);
      
      // In a real app, you might want to update this on the server
      // For now, we'll just move to the next screen
      router.push('/onboarding/experience');
    } catch (error) {
      console.error('Error saving avatar selection:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAvatar = ({ item }: { item: Avatar }) => {
    const isSelected = selectedAvatar === item.id;
    const avatarColor = item.colorScheme || (item.id.includes('fallback') ? 
      colorFromId(item.id) : Colors.dark.accent);
    
    return (
      <TouchableOpacity
        style={[
          styles.avatarItem,
          { backgroundColor: avatarColor },
          isSelected && styles.selectedAvatarItem,
        ]}
        onPress={() => setSelectedAvatar(item.id)}
        activeOpacity={0.7}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.fallbackText}>
            {item.name.substring(0, 2).toUpperCase()}
          </Text>
        )}
        
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.dark.secondary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Helper function to get a color from fallback ID
  const colorFromId = (id: string): string => {
    const parts = id.split('-');
    if (parts.length > 1) {
      const num = parseInt(parts[1], 10);
      const colors = [
        Colors.dark.primary,
        Colors.dark.secondary,
        Colors.dark.accent,
        Colors.dark.info,
        Colors.dark.success
      ];
      return colors[num % colors.length];
    }
    return Colors.dark.accent;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{width: 30}} />
        <Text style={styles.appName}>Gompile</Text>
        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.activeDot]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
      </View>

      <View style={styles.mascotContainer}>
        <Mascot expression="happy" size="small" />
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Avatarınızı Seçin</Text>
        <Text style={styles.subtitle}>
          Toplulukta sizi temsil edecek bir avatar seçin
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.secondary} />
          <Text style={styles.loadingText}>Avatarlar yükleniyor...</Text>
        </View>
      ) : (
        <RoundedCard style={styles.avatarContainer}>
          <FlatList
            data={avatars}
            renderItem={renderAvatar}
            keyExtractor={item => item.id}
            numColumns={4}
            contentContainerStyle={styles.avatarGrid}
            showsVerticalScrollIndicator={false}
          />
        </RoundedCard>
      )}

      <View style={styles.navigation}>
        <RoundedButton
          title="Devam Et"
          onPress={handleContinue}
          disabled={!selectedAvatar || submitting}
          loading={submitting}
          variant="secondary"
          size="large"
          style={styles.continueButton}
          icon={<MaterialIcons name="arrow-forward" size={24} color={Colors.dark.text} style={{ marginLeft: 8 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.tint + '30',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.tint,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.lightGray,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.dark.lightGray,
  },
  avatarContainer: {
    flex: 1,
    marginVertical: 10,
    padding: 10,
  },
  avatarGrid: {
    paddingVertical: 10,
  },
  avatarItem: {
    width: '22%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAvatarItem: {
    borderColor: Colors.dark.secondary,
    borderWidth: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 2,
  },
  navigation: {
    marginTop: 20,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
  },
}); 