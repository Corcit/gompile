import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { BoycottCompany, BoycottSearchParams } from '../../services/api/models/BoycottCompany';
import BoycottService from '../../services/api/services/boycottService';

export default function BoycottScreen() {
  // Using dark theme as required by the app
  const colorScheme = 'dark';
  const colors = Colors[colorScheme];
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<BoycottCompany[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // Initialize services
  const boycottService = new BoycottService({});

  useEffect(() => {
    // Load categories and initial companies
    loadCategories();
    searchCompanies();
  }, []);

  const loadCategories = async () => {
    try {
      const categoryList = await boycottService.getBoycottCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const searchCompanies = async () => {
    try {
      setLoading(true);
      const params: BoycottSearchParams = {
        query: searchQuery,
        category: selectedCategory || undefined,
        limit: 20,
        offset: 0
      };

      const result = await boycottService.searchBoycottCompanies(params);
      setCompanies(result.companies);
      setTotalResults(result.total);
    } catch (error) {
      console.error('Failed to search companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleCompanyPress = (company: BoycottCompany) => {
    // Use the correct path format for navigation with params object
    router.push({
      pathname: '/boycott/[id]',
      params: { id: company.id }
    } as any);  // Type assertion to avoid TypeScript errors
  };

  const renderCompanyItem = ({ item }: { item: BoycottCompany }) => (
    <TouchableOpacity 
      style={styles.companyCard}
      onPress={() => handleCompanyPress(item)}
    >
      <Image 
        source={{ uri: item.logo }} 
        style={styles.companyLogo}
        resizeMode="contain"
      />
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>{item.name}</Text>
        <Text style={styles.companyCategory}>
          <Ionicons name="pricetag-outline" size={14} color={colors.text} /> {item.category}
        </Text>
        <Text style={styles.companyReason} numberOfLines={2}>{item.reason}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.tint} />
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.selectedCategoryChip
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daha da Gelmem</Text>
        <Text style={styles.subtitle}>Tamirat sırasında boykot edilen markalar</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Marka ara..."
            placeholderTextColor={colors.text + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchCompanies}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                searchCompanies();
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={searchCompanies}>
          <Text style={styles.searchButtonText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContent}
        />
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {totalResults} sonuç bulundu
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={companies}
          renderItem={renderCompanyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.companiesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.text + '40'} />
              <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
              <Text style={styles.emptySubtext}>Farklı arama terimleri deneyin veya filtreleri temizleyin</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    height: '100%',
  },
  searchButton: {
    marginLeft: 12,
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesList: {
    maxHeight: 40,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: Colors.dark.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.dark.tint,
  },
  categoryText: {
    color: Colors.dark.text,
    fontSize: 13,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    color: Colors.dark.text + '80',
    fontSize: 13,
  },
  companiesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  companyCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  companyCategory: {
    fontSize: 12,
    color: Colors.dark.text + '80',
    marginBottom: 4,
  },
  companyReason: {
    fontSize: 13,
    color: Colors.dark.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    textAlign: 'center',
  },
}); 