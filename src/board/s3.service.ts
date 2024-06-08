import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Body: file.buffer,
        Key: `${Date.now()}-${file.originalname}`,
      })
      .promise();

    return uploadResult;
  }

  async deleteFile(key: string): Promise<AWS.S3.DeleteObjectOutput> {
    const deleteParams = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
    };

    const deleteResult = await this.s3.deleteObject(deleteParams).promise();
    return deleteResult;
  }
}
