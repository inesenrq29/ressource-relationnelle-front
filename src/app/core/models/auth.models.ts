export interface RoleDto {
  roleId: string;
  roleName: string;
}

export interface UserDto {
  appUserId: string;
  mail: string;
  pseudo: string;
  appUserIsActive: boolean;
  lastConnectionAt: string | null;
  role: RoleDto;
}

export interface RegisterRequest {
  email: string;
  pseudo: string;
  password: string;
  confirmPassword: string;
  areTermsAccepted: boolean;
  isPrivacyPolicyAccepted: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userDto: UserDto;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
}
