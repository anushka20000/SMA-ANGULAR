export interface ErrorResponse {
  success: boolean;
  error?: {
    [key: string]: string[];
  };
}
