import { BoycottCompany, BoycottSearchParams, BoycottSearchResult } from '../models/BoycottCompany';

// Define a minimal interface for the API client
interface ApiClientInterface {
  get?: (url: string, config?: any) => Promise<any>;
  post?: (url: string, data?: any, config?: any) => Promise<any>;
}

/**
 * Service for handling boycott-related operations
 */
export default class BoycottService {
  private apiClient: ApiClientInterface;
  
  // Mock data for development
  private mockBoycottCompanies: BoycottCompany[] = [
    {
      id: '1',
      name: 'CoffeeMax',
      logo: 'https://via.placeholder.com/150',
      category: 'food',
      reason: 'Labor abuses and unfair working conditions',
      startDate: '2023-05-15',
      description: 'CoffeeMax has been documented to use exploitative labor practices in their supply chain, with workers being paid below living wage and forced to work excessive hours in poor conditions.',
      alternativeCompanies: ['Fair Trade Coffee', 'Local Brew'],
      link: 'https://example.com/coffeemax-issues'
    },
    {
      id: '2',
      name: 'TechGiant',
      logo: 'https://via.placeholder.com/150',
      category: 'tech',
      reason: 'Privacy violations and data exploitation',
      startDate: '2023-02-10',
      description: 'TechGiant has repeatedly violated user privacy, selling personal data without consent and implementing invasive tracking mechanisms across their platforms.',
      alternativeCompanies: ['PrivacyTech', 'OpenSource Solutions'],
      link: 'https://example.com/techgiant-privacy'
    },
    {
      id: '3',
      name: 'FastFashion Co',
      logo: 'https://via.placeholder.com/150',
      category: 'clothing',
      reason: 'Environmental damage and sweatshop conditions',
      startDate: '2022-11-22',
      description: 'FastFashion Co has been linked to severe environmental pollution in manufacturing countries and employs workers in dangerous sweatshop conditions with minimal pay.',
      alternativeCompanies: ['EthicalWear', 'Sustainable Clothing'],
      link: 'https://example.com/fastfashion-report'
    },
    {
      id: '4',
      name: 'OilCorp',
      logo: 'https://via.placeholder.com/150',
      category: 'energy',
      reason: 'Climate change denial and environmental destruction',
      startDate: '2021-08-30',
      description: 'OilCorp has funded climate change denial groups while continuing to expand fossil fuel extraction, leading to documented environmental disasters in protected areas.',
      alternativeCompanies: ['GreenEnergy', 'SustainablePower'],
      link: 'https://example.com/oilcorp-climate'
    },
    {
      id: '5',
      name: 'AgriGlobal',
      logo: 'https://via.placeholder.com/150',
      category: 'agriculture',
      reason: 'GMO controversies and farmer exploitation',
      startDate: '2022-03-14',
      description: 'AgriGlobal has been accused of forcing harmful contracts on small farmers, monopolizing seed markets, and causing ecological damage through aggressive pesticide use.',
      alternativeCompanies: ['OrganicFarms', 'LocalGrow'],
      link: 'https://example.com/agriglobal-practices'
    }
  ];
  
  constructor(apiClient: ApiClientInterface) {
    this.apiClient = apiClient;
  }

  /**
   * Searches for boycotted companies
   * @param params Search parameters
   * @returns Search results
   */
  async searchBoycottCompanies(params: BoycottSearchParams): Promise<BoycottSearchResult> {
    try {
      // In a real implementation, we would call the API
      // return this.apiClient.get('/boycott/search', { params });
      
      // For now, use mock data
      const { query = '', category, limit = 10, offset = 0 } = params;
      
      // Filter by query and category
      let filteredCompanies = this.mockBoycottCompanies;
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredCompanies = filteredCompanies.filter(company => 
          company.name.toLowerCase().includes(lowerQuery) || 
          company.description.toLowerCase().includes(lowerQuery)
        );
      }
      
      if (category) {
        filteredCompanies = filteredCompanies.filter(company => 
          company.category === category
        );
      }
      
      // Apply pagination
      const paginatedCompanies = filteredCompanies.slice(offset, offset + limit);
      
      return {
        companies: paginatedCompanies,
        total: filteredCompanies.length
      };
    } catch (error) {
      console.error('Error searching boycott companies:', error);
      return { companies: [], total: 0 };
    }
  }

  /**
   * Gets details for a specific boycotted company
   * @param companyId Company ID
   * @returns Company details
   */
  async getBoycottCompanyDetails(companyId: string | string[] | number | null | undefined): Promise<BoycottCompany | null> {
    try {
      // In a real implementation, we would call the API
      // return this.apiClient.get(`/boycott/company/${companyId}`);
      
      // For now, use mock data
      if (!companyId) return null;
      
      // Handle both string and array cases from router params
      let stringId = '';
      if (Array.isArray(companyId)) {
        // If companyId is an array, take the first item
        stringId = String(companyId[0] || '');
      } else {
        stringId = String(companyId);
      }
      
      if (!stringId) return null;
      
      const company = this.mockBoycottCompanies.find(c => c.id === stringId);
      return company || null;
    } catch (error) {
      console.error(`Error getting boycott company details for ID ${companyId}:`, error);
      return null;
    }
  }

  /**
   * Gets all boycott categories
   * @returns List of categories
   */
  async getBoycottCategories(): Promise<string[]> {
    try {
      // In a real implementation, we would call the API
      // return this.apiClient.get('/boycott/categories');
      
      // For now, use mock data
      const categories = Array.from(new Set(this.mockBoycottCompanies.map(c => c.category)));
      return categories;
    } catch (error) {
      console.error('Error getting boycott categories:', error);
      return [];
    }
  }
} 