export interface Tarefa {
  idTarefa: number;
  usuario: {
    id: number;
  };
  responsavelId: number;
  titulo: string;
  descricao: string;
  prioridade: string;
  deadline: string;
  situacao: string;
  numero: number;
  responsavelNome: string;
  isEditing: boolean;
}