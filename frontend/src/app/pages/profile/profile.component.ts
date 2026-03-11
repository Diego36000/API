import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  user: any = null;
  loading = true;
  saving = false;
  uploadingPhoto = false;

  saveSuccess = '';
  saveError = '';

  countries: any[] = [];

  editData = {
    name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    country_id: null as number | null,
    city: '',
    password: '',
  };

  get userInitial(): string {
    return this.user?.name?.[0]?.toUpperCase() ?? '?';
  }

  get userDisplayName(): string {
    if (this.user?.last_name) return `${this.user.name} ${this.user.last_name}`;
    return this.user?.name ?? '';
  }

  ngOnInit(): void {
    const userId = this.api.getUserId();
    if (!userId || !this.api.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.api.getCountries().subscribe({
      next: (res: any) => { this.countries = res.data ?? []; },
      error: () => {},
    });

    this.api.getUser(userId).subscribe({
      next: (res: any) => {
        this.user = res.data;
        this.editData = {
          name: this.user.name ?? '',
          last_name: this.user.last_name ?? '',
          username: this.user.username ?? '',
          email: this.user.email ?? '',
          phone: this.user.phone ?? '',
          bio: this.user.bio ?? '',
          country_id: this.user.country_id ?? null,
          city: this.user.city ?? '',
          password: '',
        };
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  onSave(): void {
    this.saveError = '';
    this.saveSuccess = '';
    this.saving = true;
    const userId = this.api.getUserId();
    if (!userId) return;
    const payload: any = {
      name: this.editData.name,
      last_name: this.editData.last_name || undefined,
      username: this.editData.username || undefined,
      email: this.editData.email,
      phone: this.editData.phone || undefined,
      bio: this.editData.bio || undefined,
      country_id: this.editData.country_id || undefined,
      city: this.editData.city || undefined,
    };
    if (this.editData.password) payload['password'] = this.editData.password;

    this.api.updateUser(userId, payload).subscribe({
      next: () => {
        this.saveSuccess = 'Profile updated successfully.';
        this.saving = false;
        this.editData.password = '';
        const token = this.api.getToken();
        if (token) this.api.saveToken(token, this.editData.name, userId);
        this.user = { ...this.user, ...payload, password: this.user.password };
      },
      error: (err: any) => {
        this.saveError = err?.error?.error || 'Error saving changes.';
        this.saving = false;
      },
    });
  }

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingPhoto = true;
    const userId = this.api.getUserId();
    if (!userId) return;
    this.api.uploadProfilePhoto(userId, file).subscribe({
      next: () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.user = { ...this.user, photo: e.target?.result };
          this.uploadingPhoto = false;
        };
        reader.readAsDataURL(file);
      },
      error: () => { this.uploadingPhoto = false; },
    });
  }

  goBack(): void {
    this.router.navigate(['/items']);
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
