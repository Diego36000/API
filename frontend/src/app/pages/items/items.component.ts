import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

const TO_GRAMS: Record<string, number> = { g: 1, kg: 1000, lb: 453.592, oz: 28.3495 };

const PAGE_SIZE = 25;

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  items: any[] = [];
  categories: any[] = [];
  availableCountries: string[] = [];
  total = 0;
  loadError = '';
  createError = '';
  createSuccess = '';
  loadingItems = false;
  submitting = false;
  showModal = false;

  // Filters
  searchQuery = '';
  selectedCategoryId: number | null = null;
  selectedStatus: string | null = null;
  selectedCondition: string | null = null;
  selectedCountry: string | null = null;

  // Pagination
  currentPage = 1;

  // User
  userName = '';
  userInitial = '';
  userPhoto = '';
  get isAdmin(): boolean { return this.api.isAdmin(); }

  // Create form
  selectedFiles: File[] = [];
  newItem = {
    name: '',
    description: '',
    price: 0,
    weightValue: null as number | null,
    weightUnit: 'kg',
    dimensions: '',
    condition: '',
    category_id: null as number | null,
  };

  readonly CONDITIONS = [
    { value: 'new',        label: 'New' },
    { value: 'like_new',   label: 'Like new' },
    { value: 'good',       label: 'Good' },
    { value: 'acceptable', label: 'Acceptable' },
    { value: 'for_parts',  label: 'For parts' },
  ];

  readonly STATUSES = [
    { value: 'available', label: 'Available' },
    { value: 'reserved',  label: 'Reserved' },
    { value: 'sold',      label: 'Sold' },
  ];

  readonly STATUS_LABELS: Record<string, string> = {
    available: 'Available', reserved: 'Reserved', sold: 'Sold',
  };

  readonly CONDITION_LABELS: Record<string, string> = {
    new: 'New', like_new: 'Like new', good: 'Good', acceptable: 'Acceptable', for_parts: 'For parts',
  };

  get activeFilterCount(): number {
    return [this.selectedCategoryId, this.selectedStatus, this.selectedCondition, this.selectedCountry]
      .filter(v => v != null).length + (this.searchQuery.trim() ? 1 : 0);
  }

  get totalPages(): number {
    return Math.ceil(this.total / PAGE_SIZE) || 1;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (this.currentPage > 3) pages.push(-1);
    for (let i = Math.max(2, this.currentPage - 1); i <= Math.min(total - 1, this.currentPage + 1); i++) pages.push(i);
    if (this.currentPage < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.selectedStatus = null;
    this.selectedCondition = null;
    this.selectedCountry = null;
    this.currentPage = 1;
    this.loadItems();
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId = this.selectedCategoryId === id ? null : id;
    this.currentPage = 1;
    this.loadItems();
  }

  selectStatus(v: string): void {
    this.selectedStatus = this.selectedStatus === v ? null : v;
    this.currentPage = 1;
    this.loadItems();
  }

  selectCondition(v: string): void {
    this.selectedCondition = this.selectedCondition === v ? null : v;
    this.currentPage = 1;
    this.loadItems();
  }

  onCountryChange(): void { this.currentPage = 1; this.loadItems(); }

  onSearch(): void { this.currentPage = 1; this.loadItems(); }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadItems();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    if (!this.api.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userName = this.api.getUserName();
    this.userInitial = this.userName ? this.userName[0].toUpperCase() : '?';
    this.loadItems();
    this.loadCategories();
    this.api.getItemSellerCountries().subscribe({
      next: (res: any) => { this.availableCountries = res.data ?? []; },
      error: () => {},
    });
    const userId = this.api.getUserId();
    if (userId) {
      this.api.getUser(userId).subscribe({
        next: (res: any) => {
          this.userPhoto = res.data?.photo ?? '';
          if (res.data?.is_admin != null) {
            localStorage.setItem('is_admin', res.data.is_admin ? 'true' : 'false');
          }
        },
        error: () => {},
      });
    }
  }

  loadItems(): void {
    this.loadingItems = true;
    this.loadError = '';
    this.api.getItems({
      search: this.searchQuery.trim() || undefined,
      category_id: this.selectedCategoryId,
      status: this.selectedStatus,
      condition: this.selectedCondition,
      country: this.selectedCountry,
      page: this.currentPage,
      limit: PAGE_SIZE,
    }).subscribe({
      next: (res: any) => {
        this.items = res.data ?? [];
        this.total = res.total ?? 0;
        this.loadingItems = false;
      },
      error: (err: any) => {
        this.loadError = err?.error?.error || 'Error loading items.';
        this.loadingItems = false;
        if (err.status === 401) {
          this.api.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res: any) => { this.categories = res.data ?? []; },
      error: () => { this.categories = []; },
    });
  }

  openModal(): void {
    this.createError = '';
    this.createSuccess = '';
    this.selectedFiles = [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.createError = '';
    this.createSuccess = '';
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];
  }

  onCreateItem(): void {
    this.createError = '';
    this.createSuccess = '';
    this.submitting = true;

    const weight_grams = this.newItem.weightValue == null
      ? null
      : Math.round(this.newItem.weightValue * TO_GRAMS[this.newItem.weightUnit] * 100) / 100;

    const payload = {
      name: this.newItem.name,
      description: this.newItem.description,
      price: this.newItem.price,
      weight_grams,
      dimensions: this.newItem.dimensions,
      condition: this.newItem.condition,
      category_id: this.newItem.category_id,
    };

    this.api.createItem(payload).subscribe({
      next: (res: any) => {
        if (this.selectedFiles.length > 0) {
          this.api.uploadItemPhotos(res.itemId, this.selectedFiles).subscribe({
            next: () => this.finishCreate('Item published with photos!'),
            error: () => this.finishCreate('Item published (error uploading photos).'),
          });
        } else {
          this.finishCreate('Item published successfully!');
        }
      },
      error: (err: any) => {
        this.createError = err?.error?.error || 'Error creating item.';
        this.submitting = false;
      },
    });
  }

  private finishCreate(msg: string): void {
    this.createSuccess = msg;
    this.newItem = { name: '', description: '', price: 0, weightValue: null, weightUnit: 'kg', dimensions: '', condition: '', category_id: null };
    this.selectedFiles = [];
    this.submitting = false;
    this.loadItems();
  }

  getCardGradient(id: number): string {
    return GRADIENTS[id % GRADIENTS.length];
  }

  openItem(id: number): void { this.router.navigate(['/items', id]); }
  goToProfile(): void { this.router.navigate(['/profile']); }
  goToFavorites(): void { this.router.navigate(['/favorites']); }
  goToMessages(): void { this.router.navigate(['/messages']); }
  logout(): void { this.api.logout(); this.router.navigate(['/login']); }
}
