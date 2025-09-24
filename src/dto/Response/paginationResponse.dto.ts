export class PaginationResponse<T> {
  page?: number;
  limit?: number;
  totalItems: number;
  totalAllItems?: number;
  totalPages?: number;
  data: T;

  constructor(
    totalItems: number,
    data: T,
    totalAllItems?: number,
    page?: number,
    limit?: number,
    totalPages?: number,
  ) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalAllItems = totalAllItems;
    this.totalPages = totalPages;
    this.data = data;
  }
}
