export interface CreateTodoRequest {
  title: string;
}

export interface CreateTodoResponse {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}
