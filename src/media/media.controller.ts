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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { DeleteMediaDto } from 'src/dto/request/media-delete.dto';
import { Media } from 'src/entity/media.entity';
import { UploadMediaFormUrl } from 'src/dto/request/media-upload-url.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse as ApiRes,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('/images/upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Tải lên nhiều ảnh từ form-data' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiRes({
    status: 200,
    description: 'Upload nhiều ảnh thành công',
    type: [Media],
  })
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
  @ApiOperation({ summary: 'Tải lên media từ file (1 file)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiRes({
    status: 200,
    description: 'Upload media file thành công',
    type: Media,
  })
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
  @ApiOperation({ summary: 'Tải lên media từ một URL' })
  @ApiRes({
    status: 200,
    description: 'Upload từ URL thành công',
    type: Media,
  })
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
  @ApiOperation({ summary: 'Xoá media theo ID' })
  @ApiRes({
    status: 200,
    description: 'Xoá media thành công',
  })
  async deleteImageMedia(@Param() dto: DeleteMediaDto, @Res() res: Response) {
    await this.mediaService.deleteMedia(dto.id);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponse('Delete image media successfully'));
  }
}
