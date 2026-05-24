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
    const widthValue = apiVariant?.width?.value ?? apiVariant?.width ?? '-';
    const thicknessValue = apiVariant?.thickness ?? '-';
    const lengthValue = apiVariant?.length ?? '-';

    return {
      id: String(apiVariant?.id ?? ''),
      dimensions: `${thicknessValue}x${widthValue}x${lengthValue}`,
      woodType: apiVariant?.surface?.name || apiVariant?.surface || product?.category || '—',
      grade: apiVariant?.grade?.name || apiVariant?.grade || '—',
      price: Number(apiVariant?.price_per_m3 ?? apiVariant?.price ?? 0),
      stock: Number(apiVariant?.sheets_per_pack ?? 0),
      unit: 'м³',
    };
  }

  private mapProduct(apiProduct: any, type: string): Product {
    const variants = Array.isArray(apiProduct?.variants)
      ? apiProduct.variants.map((v: any) => this.mapVariant(v, apiProduct))
      : [];

    return {
      id: apiProduct?.id,
      name: apiProduct?.name || '',
      image: apiProduct?.image || '',
      description: apiProduct?.description || '',
      variants,
      category: apiProduct?.category || type,
      isActive: apiProduct?.is_active,
    };
  }

  async getProducts(): Promise<Product[]> {
    const [boards, chips, plywoods] = await Promise.all([
      this.request('/table1/').catch(() => []),
      this.request('/table2/').catch(() => []),
      this.request('/table3/').catch(() => [])
    ]);

    const boardsList = Array.isArray(boards) ? boards : boards.results || [];
    const chipsList = Array.isArray(chips) ? chips : chips.results || [];
    const plywoodsList = Array.isArray(plywoods) ? plywoods : plywoods.results || [];

    return [
      ...boardsList.map((item: any) => this.mapProduct(item, 'Пиломатериалы')),
      ...chipsList.map((item: any) => this.mapProduct(item, 'Щепа/Шпон')),
      ...plywoodsList.map((item: any) => this.mapProduct(item, 'Фанера'))
    ];
  }

  async getProductVariants(productId: number): Promise<any[]> {
    try {
      const data = await this.request(`/table1/${productId}/variants/`);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  async getCarousel(): Promise<any[]> {
    const data = await this.request('/carousel/');
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  }

  // Публичные документы (без токена) — для страницы /documents
  async getPublicDocs(): Promise<any[]> {
    const data = await this.request('/documentation/');
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return Array.isArray(data) ? data : [];
  }

  // Публичные настройки (без токена) — для футера, карты
  async getPublicSettings(): Promise<any> {
    const data = await this.request('/settings/');
    if (data && data.results && data.results.length > 0) {
      return data.results[0];
    }
    return data;
  }

  // Админские настройки (с токеном) — для админки
  async getSettings(): Promise<any> {
    const data = await this.requestWithSession('/settings/');
    if (data && data.results && data.results.length > 0) {
      return data.results[0];
    }
    return data;
  }

  async updateSettings(settings: any): Promise<any> {
    const data = await this.requestWithSession('/settings/');
    const id = data.results?.[0]?.id || data.id;
    if (!id) throw new Error('Settings not found');
    return this.requestWithSession(`/settings/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  private mapCartItem(apiItem: any): CartItem {
    const variant = apiItem?.variant || {};
    const widthValue = variant?.width?.value ?? variant?.width ?? '-';
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
      woodType: variant?.surface?.name || variant?.surface || '—',
      grade: variant?.grade?.name || variant?.grade || '—',
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
    
    const data = await this.requestWithSession('/cart/add_item/', {
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
    const data = await this.requestWithSession(`/cart/items/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return this.mapCartResponse(data);
  }

  async removeCartItem(itemId: string): Promise<CartItem[]> {
    const data = await this.requestWithSession(`/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
    return this.mapCartResponse(data);
  }

  async clearCart(): Promise<CartItem[]> {
    const data = await this.requestWithSession('/cart/clear/', {
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
    return this.requestWithSession('/orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();