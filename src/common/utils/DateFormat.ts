import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatToVietnamTime = (
  utcDate: string | Date,
  formatStr: string = 'dddd, DD/MM/YYYY HH:mm',
): string => {
  return dayjs(utcDate).tz('Asia/Ho_Chi_Minh').format(formatStr);
};
