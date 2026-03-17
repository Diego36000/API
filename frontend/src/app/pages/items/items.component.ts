import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
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

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, TitleCasePipe],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class ItemsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  items: any[] = [];
  categories: any[] = [];
  loadError = '';
  createError = '';
  createSuccess = '';
  loadingItems = false;
  submitting = false;
  showModal = false;
  searchQuery = '';
  selectedFiles: File[] = [];

  userName = '';
  userInitial = '';
  userPhoto = '';
  isAdmin = false;

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

  get filteredItems(): any[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void {
    if (!this.api.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userName = this.api.getUserName();
    this.userInitial = this.userName ? this.userName[0].toUpperCase() : '?';
    this.isAdmin = this.api.isAdmin();
    this.loadItems();
    this.loadCategories();
    const userId = this.api.getUserId();
    if (userId) {
      this.api.getUser(userId).subscribe({
        next: (res: any) => { this.userPhoto = res.data?.photo ?? ''; },
        error: () => {},
      });
    }
  }

  loadItems(): void {
    this.loadingItems = true;
    this.loadError = '';
    this.api.getItems().subscribe({
      next: (res: any) => {
        this.items = res.data ?? res;
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

  openItem(id: number): void {
    this.router.navigate(['/items', id]);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
