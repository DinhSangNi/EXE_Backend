import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { AddressService } from './address.service';
import { Response } from 'express';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/provinces')
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
