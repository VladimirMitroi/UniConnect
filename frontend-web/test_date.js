const { parse, addDays, startOfWeek } = require('date-fns');

const academic_start_date = "2024-10-01";
const startDate = parse(academic_start_date, 'yyyy-MM-dd', new Date());
console.log(startDate);
