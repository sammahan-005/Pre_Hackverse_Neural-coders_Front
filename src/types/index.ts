export interface User {
  id: number;
  pseudo: string;
  email: string;
  bio?: string;
  reputation_score: number;
  created_at: string;
  updated_at: string;
  requests?: Request[];
  answers?: Answer[];
  votes?: Vote[];
  subjects?: Subject[];
}

export interface Request {
  id: number;
  user_id: number;
  subject_id: number;
  best_answer_id?: number;
  priority_score: number;
  title: string;
  content: string;
  status: string;
  votes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  subject?: Subject;
  best_answer?: Answer;
  answers?: Answer[];
  votes?: Vote[];
}

export interface Answer {
  id: number;
  user_id: number;
  request_id: number;
  content: string;
  votes_count: number;
  is_best_answer: boolean;
  pertinence_score: number;
  created_at: string;
  updated_at: string;
  user?: User;
  request?: Request;
  votes?: Vote[];
}

export interface Subject {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: number;
  user_id: number;
  request_id?: number;
  answer_id?: number;
  type: 'like' | 'dislike';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
