/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

import path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly configService: ConfigService) {}

  public async fileUpload(file: Express.Multer.File): Promise<string> {
    // Logic to upload file to AWS S3
    const bucketName = this.configService.get<string>(
      'app.aws.publicBucketName',
    );

    if (!bucketName) {
      throw new InternalServerErrorException(
        'AWS S3 bucket name is not configured',
      );
    }

    const s3 = new S3();
    try {
      const uploadResult = await s3
        .upload({
          Bucket: bucketName,
          Key: this.generateFileName(file),
          Body: file.buffer.toString(),
          ContentType: file.mimetype,
        })
        .promise();

      return uploadResult.Key;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to upload file to S3',
      );
    }
  }

  private generateFileName(file: Express.Multer.File): string {
    const name: string = file.originalname.split('.')[0];
    const ext: string = path.extname(file.originalname) || '';
    const timestamp = new Date().getTime().toString().trim();

    const sanitizedOriginalName = name
      .replace(/\s+/g, '-')
      .toLowerCase()
      .trim();
    return `${timestamp}-${sanitizedOriginalName}-${uuid()}.${ext}`;
  }
}
