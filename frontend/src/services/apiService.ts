// src/api/apiService.ts

interface ApiServiceOptions {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * A utility class for making API requests with built-in error handling and URL construction.
 */
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Constructs the full URL for an API endpoint, including query parameters.
   * Special handling for 'url' parameter to prevent automatic encoding by URLSearchParams.
   * @param path The API endpoint path (e.g., "/videos").
   * @param params Optional query parameters.
   * @returns The full URL string.
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    let queryString = "";
    const otherParams = new URLSearchParams();
    let videoUrlParam = "";

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "url") {
            // Special handling for 'url' to prevent automatic encoding by URLSearchParams
            videoUrlParam = `${key}=${String(value)}`; // Append directly without encoding
          } else {
            // For all other parameters, let URLSearchParams handle encoding
            otherParams.append(key, String(value));
          }
        }
      });
    }

    const otherQueryString = otherParams.toString();

    if (videoUrlParam && otherQueryString) {
      queryString = `?${videoUrlParam}&${otherQueryString}`;
    } else if (videoUrlParam) {
      queryString = `?${videoUrlParam}`;
    } else if (otherQueryString) {
      queryString = `?${otherQueryString}`;
    }

    return `${this.baseUrl}${path}${queryString}`;
  }

  /**
   * Handles API responses, checking for `response.ok` and parsing error details.
   * @param response The Fetch API Response object.
   * @returns The parsed JSON data.
   * @throws An Error if the response is not OK.
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        response.statusText ||
        `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  }

  /**
   * Makes a GET request to the API.
   * @param path The API endpoint path.
   * @param options Request options including query parameters.
   * @returns A promise that resolves to the parsed JSON response.
   */
  public async get<T>(path: string, options?: ApiServiceOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService(BACKEND_URL);
