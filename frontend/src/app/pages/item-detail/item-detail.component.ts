import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
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

  get currentUserId(): number | null { return this.api.getUserId(); }
  get isOwner(): boolean { return this.item?.seller_id === this.currentUserId; }

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

  deleteItem(): void {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    this.deleting = true;
    this.api.deleteItem(this.item.id).subscribe({
      next: () => { this.router.navigate(['/items']); },
      error: () => { this.deleting = false; },
    });
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}
