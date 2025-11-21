interface OffsetMeta {
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface CursorMeta {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
  previousCursor: string | null;
}

export interface OffsetPaginated<T> {
  data: T[];
  meta: OffsetMeta;
  links: {
    first: string;
    last: string;
    previous: string | null;
    next: string | null;
    current: string;
  };
}

export interface CursorPaginated<T> {
  data: T[];
  meta: CursorMeta;
}
