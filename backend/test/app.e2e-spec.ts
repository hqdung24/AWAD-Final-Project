import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    console.log('Current Environment: ', process.env.NODE_ENV);
    console.log('S3 BUCKET: ', process.env.S3_BUCKET);
    return request(app.getHttpServer()).get('/').expect(404);
  });

  afterAll(async () => {
    await app.close();

    // Nếu dùng Prisma:
    // const prisma = app.get(PrismaService);
    // await prisma.$disconnect();

    // Nếu dùng TypeORM (DataSource được inject toàn cục):
    // const ds = app.get(DataSource);
    // await ds.destroy();
  });
});
