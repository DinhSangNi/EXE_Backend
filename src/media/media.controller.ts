import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { Response } from 'express';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { CreateMediaDto } from 'src/dto/request/media-create.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('/upload/multiple')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateMediaDto,
    @Res() res: Response,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Upload media successfully',
          await this.mediaService.createMedia(body, files),
        ),
      );
  }
}
