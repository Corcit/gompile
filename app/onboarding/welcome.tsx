import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import RoundedButton from '../../components/ui/RoundedButton';
import { Ionicons } from '@expo/vector-icons';
import Mascot from '../../components/mascot/Mascot';

export default function WelcomeScreen() {
  const handleRegister = () => {
    // Navigate to login screen but with registration mode active
    router.push({
      pathname: '/login',
      params: { mode: 'register' }
    });
  };
  
  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mascotContainer}>
        <Mascot expression="happy" size="large" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Gompile'a Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>
          Bilinçli aktivizm ile fark yaratmamıza katılın
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.dark.primary} />
            <Text style={styles.featureText}>Protesto katılımınızı takip edin</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.dark.primary} />
            <Text style={styles.featureText}>Yerel aktivizm fırsatları bulun</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.dark.primary} />
            <Text style={styles.featureText}>Benzer düşünen aktivistlerle bağlantı kurun</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <RoundedButton 
          title="Hesap Oluştur"
          onPress={handleRegister}
          variant="secondary"
          size="large"
          style={styles.registerButton}
          icon={<Ionicons name="person-add" size={20} color={Colors.dark.text} style={{ marginLeft: 8 }} />}
        />
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Zaten bir hesabınız var mı?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginButton}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.secondary,
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginLeft: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  registerButton: {
    width: '100%',
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  loginButton: {
    color: Colors.dark.secondary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
}); 