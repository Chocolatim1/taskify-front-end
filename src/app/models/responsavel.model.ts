export interface Responsavel {
    idResponsaveis: number;
    usuario: {
      id: number;
      usuario: string;
      email: string;
      role: string;
    };
    nome: string;
  }  