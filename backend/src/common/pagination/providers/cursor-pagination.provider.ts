/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CursorPaginated } from '../interfaces/paginated.interface';
import { Message } from '@/modules/messages/entities/message.entity';
import { CursorQueryDto } from '../dtos/pagination-query.dto';
import {
  Repository,
  FindManyOptions,
  LessThan,
  FindOptionsWhere,
} from 'typeorm';
import { Conversation } from '@/modules/conversations/entities/conversation.entity';
@Injectable()
export class CursorPaginationProvider {
  public async paginateMessages(
    paginationQuery: CursorQueryDto,
    // repository: Repository<Messages>,
    messagesRepo: Repository<Message>,
    options: FindManyOptions<Message> = {},
  ): Promise<CursorPaginated<Message>> {
    //Find messages based on cursor pagination and options
    const limit = paginationQuery?.limit || 10;
    const cursor = paginationQuery?.cursor;

    // Decode the cursor if it exists
    const cursorSeq: number | null = cursor ? parseInt(cursor, 10) : null;

    // baseWhere: where gốc từ options (ví dụ: { conversationId })
    const baseWhere = (options.where as any) || {};

    // merge where với điều kiện seq < cursorSeq (nếu có cursor)
    const where =
      cursorSeq !== null
        ? { ...baseWhere, seq: LessThan(cursorSeq) }
        : baseWhere;

    // Build the query conditions
    const queryConditions: FindManyOptions<Message> = {
      take: limit + 1, // Fetch one extra to determine if there's a next page
      order: { seq: 'DESC' },
      where: where,
    };

    const results = await messagesRepo.find(queryConditions);

    const hasMore = results.length > limit;
    const data = results.slice(0, limit);

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const last = data[data.length - 1];
      nextCursor = String(last.seq); // chuẩn hoá cursor thành string
    }

    // Implementation for cursor-based pagination for Messages entity
    return {
      data: results.slice(0, limit),
      meta: {
        limit: limit,
        hasMore: hasMore,
        nextCursor: nextCursor,
        previousCursor: null,
      },
    };
  }
  public async paginateConversations(
    paginationQuery: CursorQueryDto,
    conversationsRepo: Repository<Conversation>,
    options: FindManyOptions<Conversation> = {},
  ): Promise<CursorPaginated<Conversation>> {
    const limit = paginationQuery?.limit || 10;
    const cursor = paginationQuery?.cursor;

    // baseWhere: where gốc từ options (ví dụ filter theo participant, type,...)
    const baseWhere = (options.where as FindOptionsWhere<Conversation>) || {};

    let where:
      | FindOptionsWhere<Conversation>
      | FindOptionsWhere<Conversation>[]
      | undefined = baseWhere;

    // Nếu có cursor thì decode ra { lastMessageAt, id }
    if (cursor) {
      let decoded: { lastMessageAt: string; id: string };

      try {
        decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
      } catch {
        decoded = null as any;
      }

      if (decoded) {
        const lastAtDate = new Date(decoded.lastMessageAt);

        // (lastMessageAt, id) < (cursor.lastMessageAt, cursor.id)
        // -> lastMessageAt < cursor.lastMessageAt
        // OR (lastMessageAt = cursor.lastMessageAt AND id < cursor.id)
        where = [
          {
            ...baseWhere,
            lastMessageAt: LessThan(lastAtDate),
          },
          {
            ...baseWhere,
            lastMessageAt: lastAtDate,
            id: LessThan(decoded.id),
          },
        ];
      }
    }

    const order = {
      lastMessageAt: 'DESC' as const,
      id: 'DESC' as const,
      ...(options.order || {}),
    };

    const queryOptions: FindManyOptions<Conversation> = {
      ...options,
      where,
      order,
      take: limit + 1, // lấy dư 1 để check hasMore
    };

    const rows = await conversationsRepo.find(queryOptions);

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const last = data[data.length - 1];

      const payload = {
        lastMessageAt:
          last.lastMessageAt?.toISOString?.() ?? last.lastMessageAt,
        id: last.id,
      };

      nextCursor = Buffer.from(JSON.stringify(payload), 'utf8').toString(
        'base64url',
      );
    }

    return {
      data,
      meta: {
        limit,
        hasMore,
        nextCursor,
        previousCursor: null,
      },
    };
  }
}
