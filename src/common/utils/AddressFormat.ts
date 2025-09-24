export const resolveAddress = (
  city: string,
  district: string,
  ward: string,
  street: string,
) => {
  return `${street ? `${street}, ` : ''}${ward ? `${ward.split('|')[1]}, ` : ''}${district ? `${district.split('|')[1]}, ` : ''}${city ? `${city.split('|')[1]}` : ''}`;
};
