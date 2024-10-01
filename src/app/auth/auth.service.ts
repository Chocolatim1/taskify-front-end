import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://taskify-back-end-4f08.onrender.com/api/usuarios/validate';
  private registerUrl = 'https://taskify-back-end-4f08.onrender.com/api/usuarios';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });

    const body = {
      usernameOrEmail: username,
      password: password,
    };

    return this.http
      .post<string>(this.apiUrl, body, {
        headers,
        responseType: 'text' as 'json',
      })
      .pipe(
        switchMap((responseBody: string) => {
          if (responseBody === 'Credenciais válidas.') {
            return this.http.get<{ id: number; username: string }>(
              `https://taskify-back-end-4f08.onrender.com/api/usuarios/username/${username}`,
              { headers }
            ).pipe(
              map(user => {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({ id: user.id, username }));
                return true;
              }),
              catchError((error) => {
                return of(false);
              })
            );
          }
          return of(false);
        }),
        catchError((error) => {
          return of(false);
        })
      );
  }

  register(usuario: Usuario): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });
  
    return this.http.post<boolean>(this.registerUrl, usuario, { headers }).pipe(
      map((response) => {
        return response;
      }),
      catchError((error) => {
        return of(false);
      })
    );
  }  

  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user ? user.id : null;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
