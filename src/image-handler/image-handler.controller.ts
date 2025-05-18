import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageHandlerService } from './image-handler.service';
import { Public } from '../common/utils/metadata';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('image-handler')
export class ImageHandlerController {
  constructor(private readonly imageHandlerService: ImageHandlerService) {}

  @Post('/image')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile('file') file?: Express.Multer.File): Promise<string> {
    return this.imageHandlerService.uploadImage(file);
  }
}
