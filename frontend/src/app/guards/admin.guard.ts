import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const adminGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  if (api.isAdmin()) return true;
  router.navigate(['/items']);
  return false;
};
