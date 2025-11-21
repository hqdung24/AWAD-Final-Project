import { Module } from '@nestjs/common';
import { PaginationProvider } from './providers/offset-pagination.provider';
import { CursorPaginationProvider } from './providers/cursor-pagination.provider';

@Module({
  providers: [PaginationProvider, CursorPaginationProvider],
  exports: [PaginationProvider, CursorPaginationProvider],
})
export class PaginationModule {}
