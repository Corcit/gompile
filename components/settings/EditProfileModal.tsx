import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  useColorScheme,
  FlatList,
  Image,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import RoundedButton from '../ui/RoundedButton';
import RoundedCard from '../ui/RoundedCard';

// Interface for Avatar
interface Avatar {
  id: string;
  name: string;
  filename: string;
  category: string;
  colorScheme: string;
  imageUrl: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (nickname: string, avatarId: string) => Promise<void>;
  currentNickname: string;
  currentAvatarId: string;
  isLoading: boolean;
}

export default function EditProfileModal({
  visible,
  onClose,
  onSave,
  currentNickname,
  currentAvatarId,
  isLoading,
}: EditProfileModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [nickname, setNickname] = useState(currentNickname);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarId || '');
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);

  useEffect(() => {
    if (visible) {
      setNickname(currentNickname);
      setSelectedAvatar(currentAvatarId);
      loadAvatars();
    }
  }, [visible, currentNickname, currentAvatarId]);

  const loadAvatars = () => {
    setLoadingAvatars(true);
    // Generate avatars with color scheme
    const colorOptions = [
      Colors.dark.primary,
      Colors.dark.secondary,
      Colors.dark.accent,
      Colors.dark.success,
      Colors.dark.info,
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
    ];
    
    const fallbackAvatars: Avatar[] = colorOptions.map((color, index) => ({
      id: `avatar-${index + 1}`,
      name: `Avatar ${index + 1}`,
      filename: '',
      category: 'fallback',
      colorScheme: color,
      imageUrl: '' // We'll use the color directly
    }));
    
    setAvatars(fallbackAvatars);
    setLoadingAvatars(false);
    
    // Set default avatar if none selected
    if (!selectedAvatar && fallbackAvatars.length > 0) {
      setSelectedAvatar(fallbackAvatars[0].id);
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a nickname');
      return;
    }

    if (!selectedAvatar) {
      Alert.alert('Error', 'Please select an avatar');
      return;
    }

    try {
      await onSave(nickname.trim(), selectedAvatar);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const renderAvatar = ({ item }: { item: Avatar }) => {
    const isSelected = selectedAvatar === item.id;
    const avatarColor = item.colorScheme || Colors.dark.accent;
    
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent,
          isDark && styles.darkModalContent
        ]}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              isDark && styles.darkText
            ]}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              isDark && styles.darkInput
            ]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            placeholderTextColor={isDark ? '#888' : '#666'}
            maxLength={20}
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.cancelButton, isDark && styles.darkCancelButton]} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, isDark && styles.darkButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.disabledSaveButton]} 
              onPress={handleSave}
              disabled={isLoading || !nickname.trim() || !selectedAvatar}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={[
              styles.label,
              isDark && styles.darkText,
              {marginTop: 20}
            ]}>Choose Avatar</Text>
            
            {loadingAvatars ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.dark.secondary} />
                <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading avatars...</Text>
              </View>
            ) : (
              <RoundedCard style={[styles.avatarContainer, isDark && styles.darkAvatarContainer]}>
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
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  darkModalContent: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  closeButtonContainer: {
    padding: 5,
  },
  form: {
    marginBottom: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  darkInput: {
    borderColor: '#444',
    color: '#fff',
    backgroundColor: '#2a2a2a',
  },
  avatarContainer: {
    padding: 10,
    marginTop: 10,
    maxHeight: 300,
  },
  darkAvatarContainer: {
    backgroundColor: '#222',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  avatarGrid: {
    paddingVertical: 10,
  },
  avatarItem: {
    width: 70,
    height: 70,
    margin: 6,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedAvatarItem: {
    borderWidth: 3,
    borderColor: Colors.dark.secondary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  darkCancelButton: {
    backgroundColor: '#333',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.dark.secondary,
  },
  disabledSaveButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  darkButtonText: {
    color: '#fff',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  }
}); 