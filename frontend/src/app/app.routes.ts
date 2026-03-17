import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ItemsComponent } from './pages/items/items.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ItemDetailComponent } from './pages/item-detail/item-detail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
];
