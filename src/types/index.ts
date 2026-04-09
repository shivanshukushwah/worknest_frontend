// User roles
export enum UserRole {
  STUDENT = 'student',
  EMPLOYER = 'employer',
  WORKER = 'worker',
}

// Job types
export enum JobType {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

// Application status
export enum ApplicationStatus {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  HIRED = 'hired',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
}

// Job status
export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

// Wallet transaction types
export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
}

// Review status
export enum ReviewStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

// Authentication types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface OTPResponse {
  token: string;
  user: User;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface StudentProfileValidation {
  phoneVerified: boolean;
  age?: number;
  city?: string;
  state?: string;
  country?: string;
  skillsAdded: boolean;
  educationAdded: boolean;
}

export interface StudentProfile extends User {
  skillScore: number;
  skills: string[];
  education: Education[];
  experience: Experience[];
  walletBalance: number;
  completedJobsCount: number;
  // Validation fields
  age?: number;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  validation?: StudentProfileValidation;
}

export interface EmployerProfile extends User {
  businessName: string;
  businessType: string;
  businessLocation: {
    city: string;
    state: string;
  };
  walletBalance: number;
  activeJobsCount: number;
  jobsPostedCount?: number;
  bio?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// Job types
export interface Job {
  id: string;
  title: string;
  description: string;
  type: JobType;
  jobType?: JobType; // Support both naming conventions from backend
  salary: number;
  salaryType: 'fixed' | 'hourly' | 'range';
  positionsRequired: number;
  duration?: number; // Duration in hours/days
  location?: string | { address?: string; city?: string; state?: string; country?: string };
  skills: string[];
  deadline: string;
  status: JobStatus;
  employerId: string;
  employer: {
    id: string;
    name: string;
    businessName?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
  maxApplications?: number;
  profileUrlRequired?: boolean; // For online jobs
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  status: ApplicationStatus;
  appliedAt: string;
  profileUrl?: string; // For online jobs
  coverLetter?: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
    skillScore?: number;
  };
  job: Job;
}

export interface JobWithApplicationStatus extends Job {
  applicationStatus?: ApplicationStatus;
  applicationId?: string;
}

// Wallet types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description: string;
  relatedJobId?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  walletId: string;
  amount: number;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  processedAt?: string;
}

// Review types
export interface JobReview {
  id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  comment: string;
  employerResponse?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    [key: number]: number; // rating: count
  };
}

// Notification types
export enum NotificationType {
  JOB_POSTED = 'job_posted',
  APPLICATION_STATUS = 'application_status',
  JOB_COMPLETED = 'job_completed',
  NEW_REVIEW = 'new_review',
  PAYMENT_RECEIVED = 'payment_received',
  WITHDRAWAL_PROCESSED = 'withdrawal_processed',
  MESSAGE = 'message',
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

// Error types
export interface APIError {
  status: number;
  message: string;
  code?: string;
}

// Auth form types
export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  // Student/Worker
  age?: number;
  location?: string | { city: string; state: string; country: string };
  city?: string;
  state?: string;
  country?: string;
  // Student only
  skills?: string[];
  education?: Education[];
  // Worker only
  experience?: number | string;
  // Employer only
  businessName?: string;
  businessType?: string;
  businessLocation?: {
    city: string;
    state: string;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}
