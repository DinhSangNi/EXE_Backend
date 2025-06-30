import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AmenityService } from './amenity.service';
import { Amenity } from 'src/entity/amenity.entity';
import { Response } from 'express';
import { ApiResponse } from 'src/dto/Response/apiResponse.dto';

@Controller('amenity')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Get('/')
  async getAll(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponse<Amenity[]>(
          'Get all amenities successfully',
          await this.amenityService.getAllAmenities(),
        ),
      );
  }
}
