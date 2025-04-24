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
  }
  
  export enum UserRole {
    ADMIN = "admin",
    EMPLOYEE = "employee",
    CUSTOMER = "customer", // Add other roles if needed
  }
  