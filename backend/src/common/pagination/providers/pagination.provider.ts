import { Injectable, Inject } from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import { type Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Paginated } from '../interfaces/paginated.interface';
@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
    options: FindManyOptions<T> = {},
  ): Promise<Paginated<T>> {
    const limit = paginationQuery?.limit || 10;
    const page = paginationQuery?.page || 1;
    const results = await repository.find({
      skip: limit * (page - 1) || 0,
      take: limit || 10,
      ...options,
    });

    const baseUrl = `${this.request.protocol}://${this.request.get('host')}${
      this.request.path
    }`;
    const newUrl = new URL(baseUrl);
    console.log(newUrl);

    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = paginationQuery.page === totalPages ? null : page + 1;
    const previousPage = page === 1 ? null : page - 1;
    const currentPage = page;
    const paginatedResult: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: currentPage,
      },
      links: {
        first: `${newUrl}?page=1&limit=${limit}`,
        last: `${newUrl}?page=${totalPages}&limit=${limit}`,
        previous: previousPage
          ? `${newUrl}?page=${previousPage}&limit=${limit}`
          : null,
        next: nextPage ? `${newUrl}?page=${nextPage}&limit=${limit}` : null,
        current: `${newUrl}?page=${currentPage}&limit=${limit}`,
      },
    };
    console.log('paginatedResult', paginatedResult);
    return paginatedResult;
  }
}
