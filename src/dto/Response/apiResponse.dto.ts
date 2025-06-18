export class ApiResponse<T> {
  message: string;
  metadata?: T;

  constructor(message: string, metadata?: T) {
    (this.message = message), (this.metadata = metadata);
  }
}
