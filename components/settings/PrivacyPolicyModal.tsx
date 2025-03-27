import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Gizlilik Politikası</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons
                name="close"
                size={24}
                color={Colors.dark.text}
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: Colors.dark.background,
    borderRadius: 20,
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
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark.text,
    marginBottom: 15,
  },
  importantNote: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark.text,
    marginBottom: 20,
    fontWeight: '600',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  lastUpdate: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
}); 