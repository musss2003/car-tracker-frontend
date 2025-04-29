export interface User {
    id: string;
    name?: string;
    username: string;
    email: string;
    citizenshipId?: string;
    profilePhotoUrl?: string;
    password?: string;
    role: UserRole;
    lastLogin?: Date;
    phone?: string;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
    avatar?: string;
  }
  
  export enum UserRole {
    ADMIN = "admin",
    EMPLOYEE = "employee",
    USER = "user", // Add other roles if needed
  }
  