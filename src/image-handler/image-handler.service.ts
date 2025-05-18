import { Injectable, UploadedFile } from '@nestjs/common';
import { S3Service } from '../thirdParty/s3/s3.service';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';

@Injectable()
export class ImageHandlerService {
  constructor(private readonly s3Service: S3Service) {}


  async uploadImage(@UploadedFile('file') file?: Express.Multer.File) {
    if (!file) {
      throw new AppException(ErrorCode.FILE_INVALID);
    }
    const key = `${Date.now()}-${file.originalname}`;
    // Upload to S3
    const imageUrl = await this.s3Service.uploadFile(key, file.buffer, file.mimetype);

    return imageUrl;
  }

}
