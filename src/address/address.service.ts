import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AddressService {
  async getProvinces() {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/`, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot get provinces');
    }
  }

  async getDistrictsByProvince(provinceCode: string) {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}/?depth=2`,
        {
          method: 'get',
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot get districts by province code: ${provinceCode}`,
      );
    }
  }

  async searchProvince(query: string) {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/search/?q=${query}`,
        {
          method: 'get',
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot search provinces');
    }
  }

  async getDistricts() {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/`, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot get districts');
    }
  }

  async searchDistrict(query: string, provinceCode?: string) {
    try {
      console.log(query, provinceCode);
      const res = await fetch(
        provinceCode
          ? `https://provinces.open-api.vn/api/d/search/?q=${query}&p=${provinceCode}`
          : `https://provinces.open-api.vn/api/d/search/?q=${query}`,
        {
          method: 'get',
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot search district');
    }
  }

  async getWards() {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/w/`, {
        method: 'get',
        headers: {
          'content-type': 'application/json',
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot get wards');
    }
  }

  async getWardsByDistrict(districtCode: string) {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}/?depth=2`,
        {
          method: 'get',
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Cannot get wards by district code: ${districtCode}`,
      );
    }
  }

  async searchWard(query: string) {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/w/search/?q=${query}`,
        {
          method: 'get',
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        return data;
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot search ward');
    }
  }
}
