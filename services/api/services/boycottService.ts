import { BoycottCompany, BoycottSearchParams, BoycottSearchResult } from '../models/BoycottCompany';
import { DocumentSnapshot } from 'firebase/firestore';

// Define interface for the API client to use Firestore methods
interface ApiClientInterface {
  getDocuments<T>(
    collectionName: string,
    filters?: { field: string; operator: any; value: any }[],
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    pagination?: { pageSize: number; startAfter?: DocumentSnapshot }
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot }>;
  
  getDocument<T>(collectionName: string, documentId: string): Promise<T | null>;
  
  addDocument<T>(collectionName: string, data: any): Promise<T>;
  
  updateDocument<T>(collectionName: string, documentId: string, data: any): Promise<T>;
  
  deleteDocument(collectionName: string, documentId: string): Promise<boolean>;
}

/**
 * Service for handling boycott-related operations
 */
export default class BoycottService {
  private apiClient: ApiClientInterface;
  private readonly COLLECTION_NAME = 'boycottCompanies';
  
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
      const { query = '', category, limit = 10, offset = 0 } = params;
      
      // Build filters based on parameters
      const filters = [];
      
      if (category) {
        filters.push({
          field: 'category',
          operator: '==',
          value: category
        });
      }
      
      // Add query filter if provided - note: this is a simplified approach
      // In a real implementation, you might use a more sophisticated search like
      // Firestore's array-contains or compound queries
      if (query) {
        // This will search for the query string in the name field
        // A more robust solution would use a search index or create
        // searchable tokens in the documents
        filters.push({
          field: 'name',
          operator: '>=',
          value: query
        });
        
        filters.push({
          field: 'name',
          operator: '<=',
          value: query + '\uf8ff'
        });
      }
      
      // Get all documents with the applied filters
      const result = await this.apiClient.getDocuments<BoycottCompany>(
        this.COLLECTION_NAME,
        filters,
        { field: 'name', direction: 'asc' },
        { pageSize: limit }
      );
      
      return {
        companies: result.data,
        total: result.data.length // This is an approximation, ideally we'd get the total count
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
      
      // Get the document from Firestore
      return await this.apiClient.getDocument<BoycottCompany>(
        this.COLLECTION_NAME, 
        stringId
      );
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
      // Get all documents to extract categories
      // This is a simplified approach - in a production app, 
      // you would likely have a separate collection for categories
      // or use a more efficient query
      const result = await this.apiClient.getDocuments<BoycottCompany>(
        this.COLLECTION_NAME,
        [],
        undefined,
        { pageSize: 100 } // Limit to prevent excessive reads
      );
      
      // Extract unique categories
      const categories = Array.from(
        new Set(result.data.map(company => company.category))
      );
      
      return categories;
    } catch (error) {
      console.error('Error getting boycott categories:', error);
      return [];
    }
  }
  
  /**
   * Adds a new boycott company
   * @param company Company data
   * @returns Added company
   */
  async addBoycottCompany(company: Omit<BoycottCompany, 'id'>): Promise<BoycottCompany> {
    try {
      return await this.apiClient.addDocument<BoycottCompany>(
        this.COLLECTION_NAME,
        company
      );
    } catch (error) {
      console.error('Error adding boycott company:', error);
      throw error;
    }
  }
  
  /**
   * Updates a boycott company
   * @param id Company ID
   * @param data Company data
   * @returns Updated company
   */
  async updateBoycottCompany(id: string, data: Partial<BoycottCompany>): Promise<BoycottCompany> {
    try {
      return await this.apiClient.updateDocument<BoycottCompany>(
        this.COLLECTION_NAME,
        id,
        data
      );
    } catch (error) {
      console.error(`Error updating boycott company with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Deletes a boycott company
   * @param id Company ID
   * @returns Success status
   */
  async deleteBoycottCompany(id: string): Promise<boolean> {
    try {
      return await this.apiClient.deleteDocument(this.COLLECTION_NAME, id);
    } catch (error) {
      console.error(`Error deleting boycott company with ID ${id}:`, error);
      throw error;
    }
  }
} 