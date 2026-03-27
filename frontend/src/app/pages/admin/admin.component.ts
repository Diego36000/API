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
  get adminCount(): number { return this.users.filter(u => u.is_admin).length; }
  loadingUsers = false;
  usersError = '';
  deletingUserId: number | null = null;

  togglingAdminId: number | null = null;

  // Confirm dialog
  confirmDialog: { show: boolean; title: string; message: string; danger: boolean; action: (() => void) | null } =
    { show: false, title: '', message: '', danger: true, action: null };

  // Alert toast
  alertMsg = '';
  private alertTimer: any = null;

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
        this.loadingUsers = false;
        if (err.status === 403) {
          this.api.logout();
          this.router.navigate(['/login']);
        } else {
          this.usersError = err?.error?.error || 'Error loading users.';
        }
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

  openConfirm(title: string, message: string, danger: boolean, action: () => void): void {
    this.confirmDialog = { show: true, title, message, danger, action };
  }

  doConfirm(): void {
    const action = this.confirmDialog.action;
    this.confirmDialog = { show: false, title: '', message: '', danger: true, action: null };
    action?.();
  }

  closeConfirm(): void {
    this.confirmDialog = { show: false, title: '', message: '', danger: true, action: null };
  }

  showAlert(msg: string): void {
    this.alertMsg = msg;
    clearTimeout(this.alertTimer);
    this.alertTimer = setTimeout(() => { this.alertMsg = ''; }, 4000);
  }

  toggleAdmin(user: any): void {
    const newValue = !user.is_admin;
    const action = newValue ? 'grant admin to' : 'revoke admin from';
    this.openConfirm(
      newValue ? 'Grant admin access' : 'Revoke admin access',
      `Are you sure you want to ${action} "${user.name}"?`,
      !newValue,
      () => {
        this.togglingAdminId = user.id;
        this.api.setUserAdmin(user.id, newValue).subscribe({
          next: () => { user.is_admin = newValue; this.togglingAdminId = null; },
          error: (err: any) => {
            this.showAlert(err?.error?.error || 'Error updating admin status.');
            this.togglingAdminId = null;
          },
        });
      }
    );
  }

  deleteUser(userId: number, userName: string): void {
    this.openConfirm(
      'Delete user',
      `Delete "${userName}"? This action cannot be undone.`,
      true,
      () => {
        this.deletingUserId = userId;
        this.api.deleteUser(userId).subscribe({
          next: () => { this.users = this.users.filter(u => u.id !== userId); this.deletingUserId = null; },
          error: (err: any) => {
            this.showAlert(err?.error?.error || 'Error deleting user.');
            this.deletingUserId = null;
          },
        });
      }
    );
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
    this.openConfirm(
      'Delete category',
      `Delete category "${categoryName}"?`,
      true,
      () => {
        this.deletingCategoryId = categoryId;
        this.api.deleteCategory(categoryId).subscribe({
          next: () => { this.categories = this.categories.filter(c => c.id !== categoryId); this.deletingCategoryId = null; },
          error: (err: any) => {
            this.showAlert(err?.error?.error || 'Error deleting category.');
            this.deletingCategoryId = null;
          },
        });
      }
    );
  }

  goToItems(): void {
    this.router.navigate(['/items']);
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
