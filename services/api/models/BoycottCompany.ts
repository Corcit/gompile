/**
 * BoycottCompany model
 * Represents a company that is being boycotted
 */
export interface BoycottCompany {
  id: string;          // Unique identifier for the company
  name: string;        // Name of the company
  logo?: string;       // URL to company logo (optional)
  category: string;    // Category of the company (e.g., "food", "tech", "clothing")
  reason: string;      // Reason for boycotting
  startDate: string;   // Date when the boycott started
  description: string; // Detailed description of why the company is being boycotted
  alternativeCompanies?: string[]; // List of alternative companies (optional)
  link?: string;       // Link to more information (optional)
}

/**
 * BoycottSearch parameters
 * Represents search parameters for finding boycotted companies
 */
export interface BoycottSearchParams {
  query?: string;      // Search query
  category?: string;   // Filter by category
  limit?: number;      // Number of results to return (default: 10)
  offset?: number;     // Offset for pagination (default: 0)
}

/**
 * BoycottSearchResult
 * Represents the result of a search for boycotted companies
 */
export interface BoycottSearchResult {
  companies: BoycottCompany[];  // List of companies
  total: number;                // Total number of results
} 