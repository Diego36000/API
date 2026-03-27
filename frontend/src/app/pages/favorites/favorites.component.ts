import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  items: any[] = [];
  loading = true;
  loadError = '';
  removingId: number | null = null;

  readonly STATUS_LABELS: Record<string, string> = {
    available: 'Available', reserved: 'Reserved', sold: 'Sold',
  };

  readonly CONDITION_LABELS: Record<string, string> = {
    new: 'New', like_new: 'Like new', good: 'Good', acceptable: 'Acceptable', for_parts: 'For parts',
  };

  ngOnInit(): void {
    if (!this.api.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.api.getFavorites().subscribe({
      next: (res: any) => {
        this.items = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Could not load favorites.';
        this.loading = false;
      },
    });
  }

  removeFavorite(event: Event, itemId: number): void {
    event.stopPropagation();
    this.removingId = itemId;
    this.api.removeFavorite(itemId).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== itemId);
        this.removingId = null;
      },
      error: () => { this.removingId = null; },
    });
  }

  openItem(id: number): void {
    this.router.navigate(['/items', id]);
  }

  getCardGradient(id: number): string {
    return GRADIENTS[id % GRADIENTS.length];
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}
