import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { maxHeight: height * 0.85 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Gizlilik Politikası</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.importantNote}>
              Önemli Not: Uygulamamız herhangi bir email, telefon numarası, konum veya kişisel veri toplamamaktadır.
            </Text>

            <Text style={styles.sectionTitle}>
              Giriş
            </Text>
            <Text style={styles.paragraph}>
              Bu gizlilik politikası, Gompile uygulamasının kullanıcı verilerini nasıl işlediğini açıklamaktadır. Uygulamamız, tamirat etkinliklerini takip etmenize ve bu etkinlikler hakkında bilgi almanıza yardımcı olmak için tasarlanmıştır.
            </Text>

            <Text style={styles.sectionTitle}>
              Toplanan Veriler
            </Text>
            <Text style={styles.paragraph}>
              Uygulamamız, yalnızca sizin gönüllü olarak sağladığınız aşağıdaki bilgileri toplar:
              {'\n\n'}• Kullanıcı adınız
              {'\n'}• Tamirat katılım kayıtlarınız
              {'\n'}• Uygulama tercihleri (örn. bildirim ayarları)
            </Text>

            <Text style={styles.sectionTitle}>
              Konum ve Kişisel Veriler
            </Text>
            <Text style={styles.paragraph}>
              Uygulamamız, cihazınızdan herhangi bir konum verisi veya kişisel bilgi toplamamaktadır. Tamirat etkinliklerine katılım sırasında konum paylaşımı tamamen isteğe bağlıdır ve bu veriler cihazınızda saklanmaz.
            </Text>

            <Text style={styles.sectionTitle}>
              Veri Kullanımı
            </Text>
            <Text style={styles.paragraph}>
              Toplanan veriler yalnızca:
              {'\n\n'}• Tamirat istatistiklerinizi görüntülemek
              {'\n'}• Katılım geçmişinizi takip etmek
              {'\n'}• Uygulama deneyiminizi kişiselleştirmek
              {'\n\n'}için kullanılmaktadır.
            </Text>

            <Text style={styles.sectionTitle}>
              Veri Güvenliği
            </Text>
            <Text style={styles.paragraph}>
              Verileriniz güvenli sunucularda saklanmaktadır ve yalnızca gerekli olduğu durumlarda erişilebilir. Üçüncü taraflarla paylaşılmaz veya satılmaz.
            </Text>

            <Text style={styles.sectionTitle}>
              Kullanıcı Hakları
            </Text>
            <Text style={styles.paragraph}>
              Dilediğiniz zaman:
              {'\n\n'}• Verilerinize erişebilir
              {'\n'}• Verilerinizi düzeltebilir
              {'\n'}• Verilerinizi silebilir
              {'\n'}• Hesabınızı kapatabilirsiniz
            </Text>

            <Text style={styles.sectionTitle}>
              İletişim
            </Text>
            <Text style={styles.paragraph}>
              Gizlilik politikamız hakkında sorularınız için support@gompile.com adresinden bizimle iletişime geçebilirsiniz.
            </Text>

            <Text style={styles.lastUpdate}>
              Son güncelleme: 19 Mart 2024
            </Text>
          </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 0,
  },
  modalContent: {
    width: '94%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#DDDDDD',
    marginBottom: 16,
  },
  importantNote: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 24,
    fontWeight: '600',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
}); 