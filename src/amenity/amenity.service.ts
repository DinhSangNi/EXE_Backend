import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Amenity } from 'src/entity/amenity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AmenityService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  async getAllAmenities(): Promise<Amenity[]> {
    return await this.amenityRepository.find({
      order: { name: 'ASC' }, // optional: sắp xếp theo tên
    });
  }
}
