import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/vi'
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');
export const getDateNow = dayjs(dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'));

