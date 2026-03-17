import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  activeTab: 'users' | 'categories' = 'users';

  // Users
  users: any[] = [];
  loadingUsers = false;
  usersError = '';
  deletingUserId: number | null = null;

  // Edit modal
  editingUser: any = null;
  editForm = { name: '', last_name: '', username: '', email: '', phone: '', bio: '', city: '' };
  savingUser = false;
  saveUserError = '';
  saveUserSuccess = false;

  // Countries (for edit form)
  countries: any[] = [];

  // Categories
  categories: any[] = [];
  loadingCategories = false;
  categoriesError = '';
  newCategoryName = '';
  addingCategory = false;
  addCategoryError = '';
  deletingCategoryId: number | null = null;

  get userName(): string { return this.api.getUserName(); }
  get userInitial(): string { return this.userName?.[0]?.toUpperCase() ?? 'A'; }

  ngOnInit(): void {
    if (!this.api.getToken() || !this.api.isAdmin()) {
      this.router.navigate(['/items']);
      return;
    }
    this.loadUsers();
    this.loadCategories();
    this.api.getCountries().subscribe({
      next: (res: any) => { this.countries = res.data ?? []; },
      error: () => {},
    });
  }

  setTab(tab: 'users' | 'categories'): void {
    this.activeTab = tab;
  }

  // ── Users ──────────────────────────────────────────────

  loadUsers(): void {
    this.loadingUsers = true;
    this.usersError = '';
    this.api.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res.data ?? [];
        this.loadingUsers = false;
      },
      error: (err: any) => {
        this.usersError = err?.error?.error || 'Error loading users.';
        this.loadingUsers = false;
      },
    });
  }

  openEdit(user: any): void {
    this.editingUser = user;
    this.editForm = {
      name: user.name ?? '',
      last_name: user.last_name ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      bio: user.bio ?? '',
      city: user.city ?? '',
    };
    this.saveUserError = '';
    this.saveUserSuccess = false;
  }

  closeEdit(): void {
    this.editingUser = null;
  }

  saveUser(): void {
    if (!this.editingUser) return;
    this.savingUser = true;
    this.saveUserError = '';
    this.saveUserSuccess = false;
    const payload = {
      name: this.editForm.name,
      last_name: this.editForm.last_name || undefined,
      username: this.editForm.username || undefined,
      email: this.editForm.email,
      phone: this.editForm.phone || undefined,
      bio: this.editForm.bio || undefined,
      city: this.editForm.city || undefined,
    };
    this.api.updateUser(this.editingUser.id, payload).subscribe({
      next: () => {
        Object.assign(this.editingUser, payload);
        this.savingUser = false;
        this.saveUserSuccess = true;
        setTimeout(() => { this.closeEdit(); }, 800);
      },
      error: (err: any) => {
        this.saveUserError = err?.error?.error || 'Error al guardar.';
        this.savingUser = false;
      },
    });
  }

  deleteUser(userId: number, userName: string): void {
    if (!confirm(`¿Eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) return;
    this.deletingUserId = userId;
    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.deletingUserId = null;
      },
      error: (err: any) => {
        alert(err?.error?.error || 'Error deleting user.');
        this.deletingUserId = null;
      },
    });
  }

  // ── Categories ─────────────────────────────────────────

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoriesError = '';
    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.data ?? [];
        this.loadingCategories = false;
      },
      error: (err: any) => {
        this.categoriesError = err?.error?.error || 'Error loading categories.';
        this.loadingCategories = false;
      },
    });
  }

  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.addingCategory = true;
    this.addCategoryError = '';
    this.api.createCategory(name).subscribe({
      next: (res: any) => {
        this.categories.push(res.data ?? { id: res.categoryId, name });
        this.newCategoryName = '';
        this.addingCategory = false;
      },
      error: (err: any) => {
        this.addCategoryError = err?.error?.error || 'Error creating category.';
        this.addingCategory = false;
      },
    });
  }

  deleteCategory(categoryId: number, categoryName: string): void {
    if (!confirm(`¿Eliminar la categoría "${categoryName}"?`)) return;
    this.deletingCategoryId = categoryId;
    this.api.deleteCategory(categoryId).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.deletingCategoryId = null;
      },
      error: (err: any) => {
        alert(err?.error?.error || 'Error deleting category.');
        this.deletingCategoryId = null;
      },
    });
  }

  goToItems(): void {
    this.router.navigate(['/items']);
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
