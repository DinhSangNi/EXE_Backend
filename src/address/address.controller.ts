import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { AddressService } from './address.service';
import { Response } from 'express';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiRes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/provinces')
  @ApiOperation({ summary: 'Lấy danh sách tỉnh/thành phố' })
  @ApiRes({ status: 200, description: 'Danh sách tỉnh/thành phố' })
  async getProvinces(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Get provinces successfully',
          await this.addressService.getProvinces(),
        ),
      );
  }

  @Get('/provinces/search')
  @ApiOperation({ summary: 'Tìm kiếm tỉnh/thành theo tên' })
  @ApiQuery({ name: 'q', required: true, description: 'Tên tỉnh cần tìm' })
  @ApiRes({ status: 200, description: 'Tìm kiếm tỉnh thành công' })
  async searchProvince(@Query('q') query: string, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Search province successfully',
          await this.addressService.searchProvince(query),
        ),
      );
  }

  @Get('/provinces/:id/districts')
  @ApiOperation({ summary: 'Lấy danh sách quận/huyện theo tỉnh' })
  @ApiParam({ name: 'id', description: 'ID tỉnh/thành phố' })
  @ApiRes({ status: 200, description: 'Danh sách quận/huyện theo tỉnh' })
  async getDistrictsByProvince(@Param('id') id: string, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          `Get districts by province ${id} successfully`,
          await this.addressService.getDistrictsByProvince(id),
        ),
      );
  }

  @Get('/districts')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách quận/huyện' })
  @ApiRes({ status: 200, description: 'Danh sách quận/huyện' })
  async getDistricts(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Get districts successfully',
          await this.addressService.getDistricts(),
        ),
      );
  }

  @Get('/districts/search')
  @ApiOperation({ summary: 'Tìm kiếm quận/huyện theo tên và ID tỉnh' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Tên quận/huyện cần tìm',
  })
  @ApiQuery({ name: 'p', required: false, description: 'ID tỉnh (tùy chọn)' })
  @ApiRes({ status: 200, description: 'Tìm kiếm quận/huyện thành công' })
  async searchDistrict(
    @Query()
    query: {
      q: string;
      p?: string;
    },
    @Res() res: Response,
  ) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Search district successfully',
          await this.addressService.searchDistrict(query.q, query.p),
        ),
      );
  }

  @Get('/wards')
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách phường/xã' })
  @ApiRes({ status: 200, description: 'Danh sách phường/xã' })
  async getWards(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Get districts successfully',
          await this.addressService.getWards(),
        ),
      );
  }

  @Get('/districts/:id/wards')
  @ApiOperation({ summary: 'Lấy danh sách phường/xã theo quận/huyện' })
  @ApiParam({ name: 'id', description: 'ID quận/huyện' })
  @ApiRes({ status: 200, description: 'Danh sách phường/xã theo quận/huyện' })
  async getWardsByDistrict(@Param('id') id: string, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          `Get wards by district ${id} successfully`,
          await this.addressService.getWardsByDistrict(id),
        ),
      );
  }

  @Get('/wards/search')
  @ApiOperation({ summary: 'Tìm kiếm phường/xã theo tên' })
  @ApiQuery({ name: 'q', required: true, description: 'Tên phường/xã cần tìm' })
  @ApiRes({ status: 200, description: 'Tìm kiếm phường/xã thành công' })
  async searchWard(@Query('q') query: string, @Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse(
          'Search ward successfully',
          await this.addressService.searchWard(query),
        ),
      );
  }
}
