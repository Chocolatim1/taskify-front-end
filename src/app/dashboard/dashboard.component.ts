import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Responsavel } from '../models/responsavel.model';
import { Tarefa } from '../models/tarefa.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatDialogModule,
  ],
})
export class DashboardComponent implements OnInit {
  showForm: boolean = false;
  showList: boolean = false;
  showResponsavelForm: boolean = false;

  userId: number | null = null;

  panelOpenState: boolean = false;

  task = {
    title: '',
    description: '',
    responsible: '',
    priority: '',
    deadline: '',
  };

  responsaveis: Responsavel[] = [];
  tarefas: Tarefa[] = [];

  searchNumber: string = '';
  searchTitleDescription: string = '';
  selectedResponsavel: string = '';
  selectedSituacao: string = '';

  responsavelNome: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId === null) {
      alert('Usuário não está logado.');
      this.router.navigate(['/login']);
    } else {
      this.loadResponsaveis();
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.showList = false;
      this.showResponsavelForm = false;
      this.panelOpenState = false;
    }
  }

  toggleList() {
    this.showList = !this.showList;
    if (this.showList) {
      this.showForm = false;
      this.showResponsavelForm = false;
      this.panelOpenState = false;
      this.loadTarefas();
    }
  }

  toggleResponsavelForm() {
    this.showResponsavelForm = !this.showResponsavelForm;
    if (this.showResponsavelForm) {
      this.showForm = false;
      this.showList = false;
    }
  }

  onPanelOpened() {
    this.panelOpenState = true;
  }

  onPanelClosed() {
    this.panelOpenState = false;
  }

  loadResponsaveis(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      const headers = new HttpHeaders({
        Authorization: `Basic ${btoa('user:user')}`,
        'Content-Type': 'application/json',
      });

      this.http
        .get<Responsavel[]>(
          `https://taskify-back-end-4f08.onrender.com/api/responsaveis/usuario/${userId}`,
          { headers }
        )
        .subscribe(
          (data: Responsavel[]) => {
            this.responsaveis = data;
          },
          (error: HttpErrorResponse) => {
            alert('Ocorreu um erro ao carregar os responsáveis.');
          }
        );
    } else {
      alert('Usuário não está logado.');
    }
  }

  loadTarefas(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      const headers = new HttpHeaders({
        Authorization: `Basic ${btoa('user:user')}`,
        'Content-Type': 'application/json',
      });

      this.http
        .get<Tarefa[]>(
          `https://taskify-back-end-4f08.onrender.com/api/tarefas/usuario/${userId}`,
          {
            headers,
          }
        )
        .subscribe(
          (data: Tarefa[]) => {
            this.tarefas = data;
          },
          (error: HttpErrorResponse) => {
            alert('Ocorreu um erro ao carregar as tarefas.');
          }
        );
    } else {
      alert('Usuário não está logado.');
    }
  }

  onSubmit() {
    const userId = this.authService.getUserId();
    if (userId === null) {
      alert('Usuário não está logado.');
      return;
    }

    const tarefa = {
      usuario: { id: userId },
      titulo: this.task.title,
      descricao: this.task.description,
      prioridade: this.task.priority,
      deadline: this.task.deadline,
      responsavelId: this.task.responsible,
      situacao: 'Em andamento',
    };

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });

    this.http
      .post('https://taskify-back-end-4f08.onrender.com/api/tarefas', tarefa, {
        headers,
      })
      .subscribe(
        (response) => {
          alert('Tarefa cadastrada com sucesso!');
          this.loadTarefas();
        },
        (error: HttpErrorResponse) => {
          alert(
            'Ocorreu um erro ao cadastrar a tarefa: ' +
              (error.error.message || error.message)
          );
        }
      );

    this.resetTaskForm();
  }

  resetTaskForm() {
    this.task = {
      title: '',
      description: '',
      responsible: '',
      priority: '',
      deadline: '',
    };
    this.showForm = false;
  }

  searchTasks() {
    const userId = this.authService.getUserId();
    if (userId === null) {
      alert('Usuário não está logado.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });

    this.http
      .get<Tarefa[]>(
        `https://taskify-back-end-4f08.onrender.com/api/tarefas/usuario/${userId}`,
        {
          headers,
        }
      )
      .subscribe(
        (data: Tarefa[]) => {
          this.tarefas = data.filter((tarefa) => {
            const numberValue = Number(this.searchNumber);
            const matchesNumber = this.searchNumber
              ? tarefa.numero === numberValue
              : true;
            const matchesTitleOrDescription = this.searchTitleDescription
              ? tarefa.titulo.includes(this.searchTitleDescription) ||
                tarefa.descricao.includes(this.searchTitleDescription)
              : true;
            const responsavelValue = Number(this.selectedResponsavel);
            const matchesResponsavel = this.selectedResponsavel
              ? tarefa.responsavelId === responsavelValue
              : true;
            const matchesSituacao = this.selectedSituacao
              ? tarefa.situacao === this.selectedSituacao
              : true;

            return (
              matchesNumber &&
              matchesTitleOrDescription &&
              matchesResponsavel &&
              matchesSituacao
            );
          });
        },
        (error: HttpErrorResponse) => {
          alert('Ocorreu um erro ao buscar as tarefas.');
        }
      );
  }

  getResponsavelNome(responsavelId: number): string {
    const responsavel = this.responsaveis.find(
      (r) => r.idResponsaveis === responsavelId
    );
    return responsavel ? responsavel.nome : 'Desconhecido';
  }

  onSubmitResponsavel() {
    const userId = this.authService.getUserId();
    if (userId === null) {
      alert('Usuário não está logado.');
      return;
    }

    const responsavel = {
      nome: this.responsavelNome,
    };

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });

    this.http
      .post(
        `https://taskify-back-end-4f08.onrender.com/api/responsaveis/usuario/${userId}/criar`,
        responsavel,
        { headers }
      )
      .subscribe(
        (response) => {
          alert('Responsável cadastrado com sucesso!');
          this.loadResponsaveis();
        },
        (error: HttpErrorResponse) => {
          alert(
            'Ocorreu um erro ao cadastrar o responsável: ' +
              (error.error.message || error.message)
          );
        }
      );

    this.responsavelNome = '';
    this.showResponsavelForm = false;
  }

  deleteResponsavel(responsavelId: number): void {
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });

    this.http
      .get<boolean>(
        `https://taskify-back-end-4f08.onrender.com/api/tarefas/responsavel/${responsavelId}/existe`,
        { headers }
      )
      .subscribe(
        (exists) => {
          if (exists) {
            alert(
              'Não é possível deletar este responsável, pois ele está associado a alguma tarefa'
            );
          } else {
            this.http
              .delete(
                `https://taskify-back-end-4f08.onrender.com/api/responsaveis/${responsavelId}`,
                {
                  headers,
                  responseType: 'text',
                }
              )
              .subscribe(
                (response) => {
                  alert(response);
                  this.loadResponsaveis();
                },
                (error: HttpErrorResponse) => {
                  alert(
                    'Ocorreu um erro ao deletar o responsável: ' +
                      (error.error.message || error.message)
                  );
                }
              );
          }
        },
        (error: HttpErrorResponse) => {
          alert('Ocorreu um erro ao verificar o responsável.');
        }
      );
  }

  concluirTarefa(userId: number, idTarefa: number) {
    const confirmed = confirm(
      'Você tem certeza que deseja concluir esta tarefa?'
    );
    if (confirmed) {
      const headers = new HttpHeaders({
        Authorization: `Basic ${btoa('user:user')}`,
        'Content-Type': 'application/json',
      });

      this.http
        .put(
          `https://taskify-back-end-4f08.onrender.com/api/tarefas/${idTarefa}/concluir`,
          null,
          { headers, responseType: 'text' }
        )
        .subscribe({
          next: (response) => {
            const tarefaConcluida = this.tarefas.find(
              (tarefa) => tarefa.idTarefa === idTarefa
            );
            if (tarefaConcluida) {
              tarefaConcluida.situacao = 'Concluída';
            }
            alert(response);
          },
          error: (err: any) => {
            const errorMessage =
              err?.error?.message || err?.message || 'Erro desconhecido';
            alert('Ocorreu um erro ao concluir a tarefa: ' + errorMessage);

            if (err.status === 401) {
              alert('Sessão expirada. Redirecionando para a tela de login.');
              this.router.navigate(['/login']);
            }
          },
        });
    }
  }

  deletarTarefa(userId: number, idTarefa: number) {
    const confirmed = confirm(
      'Você tem certeza que deseja remover esta tarefa?'
    );
    if (confirmed) {
      const headers = new HttpHeaders({
        Authorization: `Basic ${btoa('user:user')}`,
        'Content-Type': 'application/json',
      });

      this.http
        .delete(
          `https://taskify-back-end-4f08.onrender.com/api/tarefas/${userId}/${idTarefa}`,
          {
            headers,
            responseType: 'text',
          }
        )
        .subscribe({
          next: (response) => {
            this.tarefas = this.tarefas.filter(
              (tarefa) => tarefa.idTarefa !== idTarefa
            );
            alert(response);
          },
          error: (err: any) => {
            const errorMessage =
              err?.error?.message || err?.message || 'Erro desconhecido';

            alert('Ocorreu um erro ao remover a tarefa: ' + errorMessage);
          },
        });
    } else {
    }
  }

  updateTarefa(tarefa: Tarefa) {
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa('user:user')}`,
      'Content-Type': 'application/json',
    });

    this.http
      .put(
        `https://taskify-back-end-4f08.onrender.com/api/tarefas/${tarefa.idTarefa}`,
        tarefa,
        {
          headers,
        }
      )
      .subscribe(
        (response) => {
          alert('Tarefa atualizada com sucesso!');
          this.loadTarefas();
        },
        (error: HttpErrorResponse) => {
          alert(
            'Ocorreu um erro ao atualizar a tarefa: ' +
              (error.error.message || error.message)
          );
        }
      );
  }

  editarTarefa(tarefa: Tarefa) {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '300px',
      data: tarefa,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateTarefa(result);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
