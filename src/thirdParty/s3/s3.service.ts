import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class S3Service {

  private s3: S3Client;
  private bucket: string;
  private cloudFront: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })

    this.bucket = process.env.AWS_S3_BUCKET!;
    this.cloudFront = process.env.AWS_CLOUDFRONT!
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    });

    await this.s3.send(command);
    return `https://${this.cloudFront}/${key}`;
  }

  async downloadFile(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3.send(command);
    return response.Body as Readable;
  }

}
