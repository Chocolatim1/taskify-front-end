import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class CadastroComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  username: string = '';
  usernameExists: boolean = false;
  emailExists: boolean = false;

  private headers = new HttpHeaders({
    Authorization: `Basic ${btoa('user:user')}`,
    'Content-Type': 'application/json',
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}
  
  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  checkUsername() {
    if (this.username.trim() === '') {
      return;
    }

    this.http
      .get<boolean>(
        `https://taskify-back-end-4f08.onrender.com/api/usuarios/exists/usuario/${this.username}`,
        { headers: this.headers }
      )
      .subscribe(
        (exists: boolean) => {
          this.usernameExists = exists;
        },
        (error) => {
          console.error('Erro ao verificar nome de usuário:', error);
          alert('Erro ao verificar nome de usuário.');
        }
      );
  }

  checkEmail() {
    if (this.email.trim() === '' || !this.isValidEmail(this.email)) {
      return;
    }

    this.http
      .get<boolean>(
        `https://taskify-back-end-4f08.onrender.com/api/usuarios/exists/email/${this.email}`,
        { headers: this.headers }
      )
      .subscribe(
        (exists: boolean) => {
          this.emailExists = exists;
        },
        (error) => {
          console.error('Erro ao verificar email:', error);
          alert('Erro ao verificar email.');
        }
      );
  }

  register(): void {
    if (this.usernameExists) {
      alert('Nome de usuário já está em uso.');
      return;
    }

    if (this.emailExists) {
      alert('Email já está em uso.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      alert('Email inválido.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    const usuarioData = {
      email: this.email,
      senha: this.password,
      usuario: this.username,
      role: 'usuario',
    };

    this.authService.register(usuarioData).subscribe(
      (success: boolean) => {
        if (success) {
          alert('Cadastro realizado com sucesso!');
          this.router.navigate(['/login']);
        } else {
          alert('Erro ao realizar cadastro. Tente novamente.');
        }
      },
      (error) => {
        console.error('Erro ao cadastrar usuário:', error);
        alert(
          'Erro ao realizar cadastro. Verifique os dados e tente novamente.'
        );
      }
    );
  }
}
