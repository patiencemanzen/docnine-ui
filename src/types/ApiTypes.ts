import { User } from "./UserTypes";

export interface ApiError {
  code: string;
  message: string;
  fields?: Array<{ field: string; message: string }>;
}

export class ApiException extends Error {
  status: number;
  code: string;
  fields?: ApiError["fields"];

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiException";
    this.status = status;
    this.code = error.code;
    this.fields = error.fields;
  }
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
}
