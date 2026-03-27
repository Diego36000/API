import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-user-profile',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  user: any = null;
  items: any[] = [];
  loading = true;
  loadError = '';
  startingConv = false;

  get currentUserId(): number | null { return this.api.getUserId(); }
  get isOwnProfile(): boolean { return this.user?.id === this.currentUserId; }
  get isLoggedIn(): boolean { return !!this.api.getToken(); }
  get locationStr(): string { return [this.user?.city, this.user?.country].filter(v => !!v).join(', '); }

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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getUser(id).subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.loading = false;
        this.api.getItemsBySeller(id).subscribe({
          next: (r: any) => { this.items = r.data ?? []; },
          error: () => {},
        });
      },
      error: () => {
        this.loadError = 'User not found.';
        this.loading = false;
      },
    });
  }

  getCardGradient(id: number): string {
    return GRADIENTS[id % GRADIENTS.length];
  }

  openItem(id: number): void {
    this.router.navigate(['/items', id]);
  }

  contactUser(): void {
    const firstAvailable = this.items.find(i => i.status === 'available') ?? this.items[0];
    if (!firstAvailable) return;
    this.startingConv = true;
    this.api.startConversation(firstAvailable.id).subscribe({
      next: (res: any) => {
        const convId = res.data?.id;
        this.router.navigate(['/messages'], convId ? { queryParams: { conv: convId } } : {});
      },
      error: () => {
        this.startingConv = false;
        this.router.navigate(['/messages']);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }
}
