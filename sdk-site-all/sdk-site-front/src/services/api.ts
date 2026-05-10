import config from '../config/api';
import type { CartItem, Product, ProductVariant } from '@types';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = config.api.baseURL;
    this.timeout = config.api.timeout;
    
    if (!this.baseURL) {
      console.error('VITE_API_BASE_URL is not defined');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] Ошибка ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private getSessionKey(): string {
    return localStorage.getItem('session_key') || '';
  }

  private setSessionKey(sessionKey: string) {
    if (sessionKey) {
      localStorage.setItem('session_key', sessionKey);
    }
  }

  private async requestWithSession(endpoint: string, options: RequestInit = {}) {
    const sessionKey = this.getSessionKey();
    const headers = {
      ...(options.headers || {}),
      ...(sessionKey ? { 'X-Session-Key': sessionKey } : {}),
    };

    return this.request(endpoint, {
      ...options,
      headers,
    });
  }

  private mapVariant(apiVariant: any, product: any): ProductVariant {
    const widthValue = apiVariant?.width?.value ?? '-';
    const thicknessValue = apiVariant?.thickness ?? '-';
    const lengthValue = apiVariant?.length ?? '-';

    return {
      id: String(apiVariant?.id ?? ''),
      dimensions: `${thicknessValue}x${widthValue}x${lengthValue}`,
      woodType: apiVariant?.surface?.name || product?.category || '—',
      grade: apiVariant?.grade?.name || '—',
      price: Number(apiVariant?.price_per_m3 ?? 0),
      stock: Number(apiVariant?.sheets_per_pack ?? 0),
      unit: 'м³',
    };
  }

  private mapProduct(apiProduct: any): Product {
    const variants = Array.isArray(apiProduct?.variants)
      ? apiProduct.variants.map((v: any) => this.mapVariant(v, apiProduct))
      : [];

    return {
      id: apiProduct?.id,
      name: apiProduct?.name || '',
      image: apiProduct?.image || '',
      description: apiProduct?.description || '',
      variants,
      category: apiProduct?.category,
      isActive: apiProduct?.is_active,
    };
  }

  async getProducts(): Promise<Product[]> {
    const data = await this.request(config.api.endpoints.products);

    const rawList = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
          ? data.data
          : [];

    return rawList.map((item: any) => this.mapProduct(item));
  }

  async getProductVariants(productId: number): Promise<any[]> {
    const data = await this.request(`/products/${productId}/variants/`);
    return data;
  }

  async getCarousel(): Promise<any[]> {
    const data = await this.request('/carousel/');
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  }

  private mapCartItem(apiItem: any): CartItem {
    const variant = apiItem?.variant || {};
    const widthValue = variant?.width?.value ?? '-';
    const thicknessValue = variant?.thickness ?? '-';
    const lengthValue = variant?.length ?? '-';

    return {
      id: String(apiItem?.id ?? ''),
      productId: apiItem?.product_id ?? variant?.product_id ?? 0,
      variantId: String(apiItem?.variant_id ?? variant?.id ?? ''),
      name: apiItem?.product_name || '',
      price: Number(apiItem?.price_at_moment ?? 0),
      quantity: Number(apiItem?.quantity ?? 0),
      dimensions: `${thicknessValue}x${widthValue}x${lengthValue}`,
      woodType: variant?.surface?.name || '—',
      grade: variant?.grade?.name || '—',
      maxStock: Number(variant?.sheets_per_pack ?? 0),
    };
  }

  private mapCartResponse(data: any): CartItem[] {
    const cart = data?.cart || data;
    const items = Array.isArray(cart?.items) ? cart.items : [];
    return items.map((item: any) => this.mapCartItem(item));
  }

  async addToCart(variantId: string, quantity: number): Promise<CartItem[]> {
    const variantIdNum = parseInt(variantId, 10);
    if (isNaN(variantIdNum)) {
      console.error('Ошибка: variantId не число:', variantId);
      throw new Error('Invalid variantId');
    }
    
    const payload = { 
      variant_id: variantIdNum, 
      quantity: Number(quantity) 
    };
    
    console.log('[API] addToCart payload:', payload);
    
    const data = await this.requestWithSession('/api/cart/add_item/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('[API] addToCart response:', data);

    if (data?.session_key) {
      this.setSessionKey(data.session_key);
    }

    return this.mapCartResponse(data);
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem[]> {
    const data = await this.requestWithSession(`/api/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return this.mapCartResponse(data);
  }

  async removeCartItem(itemId: string): Promise<CartItem[]> {
    const data = await this.requestWithSession(`/api/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
    return this.mapCartResponse(data);
  }

  async clearCart(): Promise<CartItem[]> {
    const data = await this.requestWithSession('/api/cart/clear/', {
      method: 'DELETE',
    });
    return this.mapCartResponse(data);
  }

  async createOrder(payload: {
    client_name: string;
    client_surname: string;
    client_patronymic?: string;
    phone: string;
    email?: string;
    comment?: string;
  }) {
    console.log('[API] createOrder payload:', payload);
    return this.requestWithSession('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();