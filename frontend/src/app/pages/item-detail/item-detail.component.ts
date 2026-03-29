import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss',
})
export class ItemDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  item: any = null;
  loading = true;
  loadError = '';
  updatingStatus = false;
  deleting = false;
  currentPhotoIndex = 0;
  isFavorite = false;
  togglingFavorite = false;
  lightboxOpen = false;
  lightboxIndex = 0;
  contactingSeller = false;
  confirmDialog: { show: boolean; title: string; message: string; action: (() => void) | null } =
    { show: false, title: '', message: '', action: null };

  // Edit modal
  editOpen = false;
  editForm: any = {};
  editSaving = false;
  editError = '';
  categories: any[] = [];

  get currentUserId(): number | null { return this.api.getUserId(); }
  get isOwner(): boolean { return this.item?.seller_id === this.currentUserId; }
  get isLoggedIn(): boolean { return !!this.api.getToken(); }

  readonly CONDITION_LABELS: Record<string, string> = {
    new: 'New',
    like_new: 'Like new',
    good: 'Good',
    acceptable: 'Acceptable',
    for_parts: 'For parts',
  };

  readonly STATUS_LABELS: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getItem(id).subscribe({
      next: (res: any) => {
        this.item = res.data;
        this.loading = false;
        if (this.currentUserId && !this.isOwner) {
          this.api.getFavorites().subscribe({
            next: (favRes: any) => {
              this.isFavorite = (favRes.data ?? []).some((f: any) => f.id === this.item.id);
            },
            error: () => {},
          });
        }
      },
      error: () => {
        this.loadError = 'Could not load item.';
        this.loading = false;
      },
    });
    this.api.getCategories().subscribe({
      next: (res: any) => { this.categories = res.data ?? []; },
      error: () => {},
    });
  }

  formatWeight(grams: number): string {
    if (grams >= 1000) return `${+(grams / 1000).toFixed(3).replace(/\.?0+$/, '')} kg`;
    return `${grams} g`;
  }

  prevPhoto(): void {
    if (this.currentPhotoIndex > 0) this.currentPhotoIndex--;
  }

  nextPhoto(): void {
    if (this.currentPhotoIndex < this.item.photos.length - 1) this.currentPhotoIndex++;
  }

  setStatus(status: string): void {
    this.updatingStatus = true;
    this.api.updateItemStatus(this.item.id, status).subscribe({
      next: () => {
        this.item = { ...this.item, status };
        this.updatingStatus = false;
      },
      error: () => { this.updatingStatus = false; },
    });
  }

  toggleFavorite(): void {
    if (!this.currentUserId) { this.router.navigate(['/login']); return; }
    this.togglingFavorite = true;
    const action = this.isFavorite
      ? this.api.removeFavorite(this.item.id)
      : this.api.addFavorite(this.item.id);
    action.subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        this.togglingFavorite = false;
      },
      error: () => { this.togglingFavorite = false; },
    });
  }

  openEdit(): void {
    this.editForm = {
      name: this.item.name ?? '',
      description: this.item.description ?? '',
      price: this.item.price ?? '',
      category_id: this.item.category_id ?? null,
      condition: this.item.condition ?? '',
      weight_grams: this.item.weight_grams ?? '',
      dimensions: this.item.dimensions ?? '',
    };
    this.editError = '';
    this.editOpen = true;
  }

  closeEdit(): void {
    this.editOpen = false;
  }

  saveEdit(): void {
    if (!this.editForm.name?.trim() || !this.editForm.price) {
      this.editError = 'Name and price are required.';
      return;
    }
    this.editSaving = true;
    this.editError = '';
    const payload = {
      name: this.editForm.name.trim(),
      description: this.editForm.description || undefined,
      price: Number(this.editForm.price),
      category_id: this.editForm.category_id || null,
      condition: this.editForm.condition || undefined,
      weight_grams: this.editForm.weight_grams ? Number(this.editForm.weight_grams) : null,
      dimensions: this.editForm.dimensions || undefined,
    };
    this.api.updateItem(this.item.id, payload).subscribe({
      next: () => {
        this.item = { ...this.item, ...payload,
          category: this.categories.find(c => c.id === payload.category_id)?.name ?? this.item.category };
        this.editOpen = false;
        this.editSaving = false;
      },
      error: (err: any) => {
        this.editError = err?.error?.error || 'Error saving changes.';
        this.editSaving = false;
      },
    });
  }

  openConfirm(title: string, message: string, action: () => void): void {
    this.confirmDialog = { show: true, title, message, action };
  }

  doConfirm(): void {
    const action = this.confirmDialog.action;
    this.confirmDialog = { show: false, title: '', message: '', action: null };
    action?.();
  }

  closeConfirm(): void {
    this.confirmDialog = { show: false, title: '', message: '', action: null };
  }

  deleteItem(): void {
    this.openConfirm(
      'Delete listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      () => {
        this.deleting = true;
        this.api.deleteItem(this.item.id).subscribe({
          next: () => { this.router.navigate(['/items']); },
          error: () => { this.deleting = false; },
        });
      }
    );
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  lightboxPrev(): void {
    if (this.lightboxIndex > 0) this.lightboxIndex--;
  }

  lightboxNext(): void {
    if (this.lightboxIndex < this.item.photos.length - 1) this.lightboxIndex++;
  }

  contactSeller(): void {
    if (!this.currentUserId) { this.router.navigate(['/login']); return; }
    this.contactingSeller = true;
    this.api.startConversation(this.item.id).subscribe({
      next: (res: any) => {
        const convId = res.data?.id;
        this.router.navigate(['/messages'], convId ? { queryParams: { conv: convId } } : {});
      },
      error: () => {
        this.contactingSeller = false;
        this.router.navigate(['/messages']);
      },
    });
  }

  viewSellerProfile(): void {
    this.router.navigate(['/users', this.item.seller_id]);
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}
