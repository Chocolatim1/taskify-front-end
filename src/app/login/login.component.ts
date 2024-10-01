import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../models/usuario.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  email: string = '';
  confirmPassword: string = '';
  isSignUpMode: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  login(): void {
    if (!this.username || !this.password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      (isValid: boolean) => {
        if (isValid) {
          this.router.navigate(['/dashboard']);
        } else {
          alert('Credenciais inválidas');
        }
      },
      (error: HttpErrorResponse) => {
        alert('Ocorreu um erro ao realizar o login.');
      }
    );
  }

  register(): void {
    if (this.password !== this.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (this.email && this.username && this.password) {
      const usuario: Usuario = {
        usuario: this.username,
        email: this.email,
        senha: this.password,
        role: 'ROLE_USER'
      };

      this.authService.register(usuario).subscribe(
        (isRegistered: boolean) => {
          if (isRegistered) {
            alert('Cadastro realizado com sucesso');
            this.router.navigate(['/dashboard']);
          } else {
            alert('Erro ao cadastrar usuário.');
          }
        },
        (error: HttpErrorResponse) => {
          alert('Ocorreu um erro ao registrar o usuário.');
        }
      );
    } else {
      alert('Por favor, preencha todos os campos');
    }
  }

  toggleSignUpMode(): void {
    this.isSignUpMode = !this.isSignUpMode;
  }
}
