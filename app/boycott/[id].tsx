import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { BoycottCompany } from '../../services/api/models/BoycottCompany';
import BoycottService from '../../services/api/services/boycottService';

// Using dark theme as required by the app
const colorScheme = 'dark';
const colors = Colors[colorScheme];

const boycottService = new BoycottService({});

export default function BoycottDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  
  const router = useRouter();
  const [company, setCompany] = useState<BoycottCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyDetails();
  }, [id]);

  const loadCompanyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError('Firma kimliği bulunamadı');
        return;
      }

      const companyData = await boycottService.getBoycottCompanyDetails(id);
      
      if (!companyData) {
        setError('Firma bilgileri bulunamadı');
        return;
      }
      
      setCompany(companyData);
    } catch (error) {
      console.error('Failed to load company details:', error);
      setError('Firma bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!company) return;
    
    try {
      await Share.share({
        message: `${company.name} - Boykot Nedeni: ${company.reason}\n\nDaha fazla bilgi için: ${company.link}`,
        title: `${company.name} Boykot Bilgisi`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`URL açılamıyor: ${url}`);
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={styles.loadingText}>Bilgiler yükleniyor...</Text>
      </View>
    );
  }

  if (error || !company) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text} />
        <Text style={styles.errorText}>{error || 'Bir hata oluştu'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCompanyDetails}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: company.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color={colors.tint} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ uri: company.logo }} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.category}>
              <Ionicons name="pricetag-outline" size={14} color={colors.text} /> {company.category}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Boykot Başlangıç:</Text>
            <Text style={styles.infoValue}>{formatDate(company.startDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boykot Nedeni</Text>
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonText}>{company.reason}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detaylı Bilgi</Text>
          <Text style={styles.descriptionText}>{company.description}</Text>
        </View>

        {company.alternativeCompanies && company.alternativeCompanies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternatif Markalar</Text>
            <View style={styles.alternativesContainer}>
              {company.alternativeCompanies.map((alternative, index) => (
                <View key={index} style={styles.alternativeItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  <Text style={styles.alternativeText}>{alternative}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daha Fazla Bilgi</Text>
          {company.link ? (
            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => openLink(company.link as string)}
            >
              <Ionicons name="globe-outline" size={18} color="#fff" />
              <Text style={styles.linkButtonText}>Kaynak Linki</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noLinkContainer}>
              <Text style={styles.noLinkText}>Kaynak linki bulunmamaktadır</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Not: Tüm boykot bilgileri tamamen tesisatçılar tarafından sağlanmaktadır. 
            Bilgiler kamuya açık haberlerden derlenmiştir.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.dark.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    padding: 16,
  },
  errorText: {
    color: Colors.dark.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.dark.tint,
    fontSize: 16,
  },
  shareButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    margin: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: Colors.dark.text + '80',
  },
  infoContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.text + '80',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  reasonContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.tint,
  },
  reasonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '500',
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.dark.text,
    lineHeight: 22,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  alternativesContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 15,
    color: Colors.dark.text,
    marginLeft: 8,
  },
  linkButton: {
    backgroundColor: Colors.dark.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    margin: 16,
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.dark.text + '60',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noLinkContainer: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  noLinkText: {
    color: Colors.dark.text + '80',
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 