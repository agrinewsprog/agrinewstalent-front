export type Role = 'student' | 'company' | 'university' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Student
export interface Student extends User {
  role: 'student';
  universityId?: string;
  university?: University;
  profileCompleted: boolean;
}

// Company
export interface Company extends User {
  role: 'company';
  companyName: string;
  cif: string;
  sector?: string;
  verified: boolean;
}

// University
export interface University extends User {
  role: 'university';
  universityName: string;
  code: string;
  verified: boolean;
}

// Admin
export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// Offer
export interface Offer {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company?: Company;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'freelance';
  salary?: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Application
export interface Application {
  id: string;
  offerId: string;
  offer?: Offer;
  studentId: string;
  student?: Student;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  coverLetter?: string;
  timeline: ApplicationTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationTimeline {
  id: string;
  status: Application['status'];
  note?: string;
  createdAt: string;
}

// Program
export interface Program {
  id: string;
  title: string;
  description: string;
  universityId: string;
  university?: University;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

// Promotion
export interface Promotion {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company?: Company;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
