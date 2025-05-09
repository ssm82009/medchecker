export interface User {
  id: string;
  email: string;
  role: string;
  plan_code?: string;
  auth_uid?: string;
  password?: string;
} 