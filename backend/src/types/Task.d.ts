export type Task = {
  title: string;
  description: string;
  createdAt: number;
  lastModifiedAt: number;
  status: 'to_do' | 'in_progress' | 'done';
  username: string;
};
