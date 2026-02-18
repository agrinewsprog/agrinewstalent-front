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
  degree?: string;
  graduationYear?: string;
}

// Company
export interface Company extends User {
  role: 'company';
  companyName: string;
  cif: string;
  sector?: string;
  description?: string;
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
  programId?: string;
  applicationsCount?: number;
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
  name: string;
  description: string;
  universityId: string;
  university?: University;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  offersCount?: number;
  companiesCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'offer' | 'program' | 'course' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

// Promotion
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  companyId?: string;
  company?: Company;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Course
export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; // "2 horas", "1 semana"
  imageUrl?: string;
  videoUrl?: string;
  required: boolean; // Si es obligatorio para acceder a bolsa
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  course?: Course;
  studentId: string;
  student?: Student;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
