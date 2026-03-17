import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;
    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.api.saveToken(res.token, res.name, res.userId, res.isAdmin);
        this.router.navigate([res.isAdmin ? '/admin' : '/items']);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.error || 'Error al iniciar sesión.';
        this.loading = false;
      },
    });
  }
}
