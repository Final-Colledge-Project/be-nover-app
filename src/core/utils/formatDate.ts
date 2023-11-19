import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/vi'
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');
export const getDateNow = dayjs(dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'));
console.log("🚀 ~ file: formatDate.ts:9 ~ getDateNow:", getDateNow)
// Your time string
const timeString = 'T04:22:16.402+00:00';

// Parse the time
const timeObject = dayjs.utc(timeString);

// Format the time
const formattedTime = timeObject.format('HH:mm:ss.SSS');
console.log("🚀 ~ file: formatDate.ts:18 ~ formattedTime:", formattedTime)
