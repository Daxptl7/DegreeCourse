export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  fullName?: string;
  schoolId?: string;
  approved?: boolean;
  [key: string]: any;
}

export interface Course {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  provider: string;
  price: number;
  thumbnail?: string;
  teacherId?: string;
  [key: string]: any;
}

export interface School {
  id: string;
  name: string;
  location: string;
  [key: string]: any;
}
