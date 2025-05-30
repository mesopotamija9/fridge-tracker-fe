export interface ApiErrorResponse {
  message: string;
  code: number;
}

export const isApiError = (response: any): response is ApiErrorResponse => {
  return response && typeof response.code === 'number' && response.code === 1;
}; 