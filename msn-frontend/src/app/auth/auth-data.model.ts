// Created Auth Data model instad of User Data
// We don't want to keep or attach the password on frontend
export interface AuthData {
  email: string;
  password: string;
}
