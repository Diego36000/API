import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly NAME_KEY = 'user_name';
  private readonly USER_ID_KEY = 'user_id';
  private readonly IS_ADMIN_KEY = 'is_admin';

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }

  // ── Auth ──────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/users/login', { email, password });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post('/api/users/register', { name, email, password });
  }

  saveToken(token: string, name?: string, userId?: number, isAdmin?: boolean): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    if (name) localStorage.setItem(this.NAME_KEY, name);
    if (userId != null) localStorage.setItem(this.USER_ID_KEY, String(userId));
    if (isAdmin != null) localStorage.setItem(this.IS_ADMIN_KEY, isAdmin ? 'true' : 'false');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserName(): string {
    return localStorage.getItem(this.NAME_KEY) ?? '';
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id ? Number(id) : null;
  }

  isAdmin(): boolean {
    return localStorage.getItem(this.IS_ADMIN_KEY) === 'true';
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.NAME_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.IS_ADMIN_KEY);
  }

  // ── Users ─────────────────────────────────────────────
  getAllUsers(): Observable<any> {
    return this.http.get('/api/users', { headers: this.authHeaders() });
  }

  getUser(userId: number): Observable<any> {
    return this.http.get(`/api/users/${userId}`, { headers: this.authHeaders() });
  }

  updateUser(userId: number, data: {
    name: string; last_name?: string; username?: string; email: string;
    phone?: string; bio?: string; country_id?: number | null;
    city?: string; password?: string;
  }): Observable<any> {
    return this.http.put(`/api/users/${userId}`, data, { headers: this.authHeaders() });
  }

  setUserAdmin(userId: number, isAdmin: boolean): Observable<any> {
    return this.http.patch(`/api/users/${userId}/admin`, { is_admin: isAdmin }, { headers: this.authHeaders() });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`/api/users/${userId}`, { headers: this.authHeaders() });
  }

  uploadProfilePhoto(userId: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('photo', file);
    return this.http.post(`/api/users/${userId}/upload-photo`, fd, { headers: this.authHeaders() });
  }

  // ── Items ─────────────────────────────────────────────
  getItems(filters?: {
    search?: string; category_id?: number | null; status?: string | null;
    condition?: string | null; country?: string | null; page?: number; limit?: number;
  }): Observable<any> {
    const params: Record<string, string> = {};
    if (filters?.search)       params['search']      = filters.search;
    if (filters?.category_id)  params['category_id'] = String(filters.category_id);
    if (filters?.status)       params['status']       = filters.status;
    if (filters?.condition)    params['condition']    = filters.condition;
    if (filters?.country)      params['country']      = filters.country;
    if (filters?.page)         params['page']         = String(filters.page);
    if (filters?.limit)        params['limit']        = String(filters.limit);
    return this.http.get('/api/items', { params });
  }

  getItemSellerCountries(): Observable<any> {
    return this.http.get('/api/items/seller-countries');
  }

  getItem(itemId: number): Observable<any> {
    return this.http.get(`/api/items/${itemId}`);
  }

  createItem(item: {
    name: string; description: string; price: number;
    weight_grams?: number | null; dimensions?: string;
    condition?: string; category_id: number | null;
  }): Observable<any> {
    return this.http.post('/api/items', item, { headers: this.authHeaders() });
  }

  updateItem(itemId: number, data: {
    name: string; description?: string; price: number;
    category_id?: number | null; condition?: string;
    weight_grams?: number | null; dimensions?: string;
  }): Observable<any> {
    return this.http.put(`/api/items/${itemId}`, data, { headers: this.authHeaders() });
  }

  updateItemStatus(itemId: number, status: string): Observable<any> {
    return this.http.patch(`/api/items/${itemId}/status`, { status }, { headers: this.authHeaders() });
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`/api/items/${itemId}`, { headers: this.authHeaders() });
  }

  uploadItemPhotos(itemId: number, files: File[]): Observable<any> {
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    return this.http.post(`/api/items/${itemId}/upload-photos`, fd, { headers: this.authHeaders() });
  }

  // ── Favorites ─────────────────────────────────────────
  getFavorites(): Observable<any> {
    return this.http.get('/api/favorites', { headers: this.authHeaders() });
  }

  addFavorite(itemId: number): Observable<any> {
    return this.http.post(`/api/favorites/${itemId}`, {}, { headers: this.authHeaders() });
  }

  removeFavorite(itemId: number): Observable<any> {
    return this.http.delete(`/api/favorites/${itemId}`, { headers: this.authHeaders() });
  }

  // ── Categories ────────────────────────────────────────
  getCategories(): Observable<any> {
    return this.http.get('/api/categories');
  }

  createCategory(name: string): Observable<any> {
    return this.http.post('/api/categories', { name }, { headers: this.authHeaders() });
  }

  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete(`/api/categories/${categoryId}`, { headers: this.authHeaders() });
  }

  getItemsBySeller(sellerId: number): Observable<any> {
    return this.http.get(`/api/items/seller/${sellerId}`, { headers: this.authHeaders() });
  }

  // ── Conversations ──────────────────────────────────────
  getConversations(): Observable<any> {
    return this.http.get('/api/conversations', { headers: this.authHeaders() });
  }

  startConversation(itemId: number): Observable<any> {
    return this.http.post('/api/conversations', { item_id: itemId }, { headers: this.authHeaders() });
  }

  getMessages(conversationId: number): Observable<any> {
    return this.http.get(`/api/conversations/${conversationId}/messages`, { headers: this.authHeaders() });
  }

  sendMessage(conversationId: number, content: string): Observable<any> {
    return this.http.post(`/api/conversations/${conversationId}/messages`, { content }, { headers: this.authHeaders() });
  }

  // ── Locations ─────────────────────────────────────────
  getCountries(): Observable<any> {
    return this.http.get('/api/locations/countries');
  }
}
