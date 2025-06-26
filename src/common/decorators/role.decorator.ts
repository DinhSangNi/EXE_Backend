import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const roles = (...roles: string[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
