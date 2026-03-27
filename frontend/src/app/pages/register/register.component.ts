import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;

  onSubmit(): void {
    this.errorMessage = '';
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.api.register(this.name, this.email, this.password).subscribe({
      next: (res: any) => {
        this.api.saveToken(res.token, this.name, res.userId);
        this.router.navigate(['/items']);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.error || 'Error al registrarse.';
        this.loading = false;
      },
    });
  }
}
