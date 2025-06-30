import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { Response } from 'express';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import { UploadImageMediaDto } from 'src/dto/request/media-image-upload.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { DeleteMediaDto } from 'src/dto/request/media-delete.dto';
import { Media } from 'src/entity/media.entity';
import { UploadMediaFormUrl } from 'src/dto/request/media-upload-url.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('/images/upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImageMedias(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: { user: { userId: string } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.OK).json(
      new ApiResponse(
        'Upload images successfully',
        await this.mediaService.createMultipleImageMediasFromFiles({
          files: files,
          userId: userId,
        }),
      ),
    );
  }

  @Post('/upload/file')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadMediaFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { userId: string } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.OK).json(
      new ApiResponse<Media>(
        'Upload media successfully',
        await this.mediaService.createMediaFromFile({
          file: file,
          userId: userId,
        }),
      ),
    );
  }

  @Post('/upload/url')
  @UseGuards(AuthGuard('jwt'))
  async uploadMediaFromUrl(
    @Body() body: UploadMediaFormUrl,
    @Req() req: { user: { userId: string } },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<Media>(
          'Upload media successfully',
          await this.mediaService.createMediaFromUrl(body.url, userId),
        ),
      );
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteImageMedia(@Param() dto: DeleteMediaDto, @Res() res: Response) {
    await this.mediaService.deleteMedia(dto.id);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse('Delete image media successfully'));
  }
}
