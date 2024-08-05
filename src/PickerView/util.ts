type CountDownData = {label: string; value: string}[];
const HOURS = 23;
const MINUTES = 59;
const SECONDS = 59;

let CountDownTimeHour: CountDownData = [],
  CountDownTimeMinute: CountDownData = [],
  CountDownTimeSeconds: CountDownData = [],
  language = '';
export const getCountDownTimeData = () => {
  CountDownTimeHour = [];
  CountDownTimeMinute = [];
  CountDownTimeSeconds = [];
  // 计时器数据
  for (let i = 0; i <= HOURS; i++) {
    CountDownTimeHour.push({
      label: i + ' ' + '时',
      value: i + '',
    });
  }

  for (let i = 0; i <= MINUTES; i++) {
    CountDownTimeMinute.push({
      label: i + ' ' + '分',
      value: i + '',
    });
  }

  for (let i = 0; i <= SECONDS; i++) {
    CountDownTimeSeconds.push({
      label: i + ' ' + '秒',
      value: i + '',
    });
  }
  return [CountDownTimeHour, CountDownTimeMinute, CountDownTimeSeconds];
};
