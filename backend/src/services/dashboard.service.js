const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');

/**
 * Thống kê màn Tổng quan.
 * - Doanh thu = tổng finalAmount của hóa đơn ĐÃ THANH TOÁN (paid), tính theo ngày paidAt.
 *   Hóa đơn pending/cancelled không được tính.
 * - Ngày/tuần/tháng tính theo giờ Việt Nam (UTC+7, không có DST) nên không phụ thuộc
 *   múi giờ của server.
 */
const TZ = 'Asia/Ho_Chi_Minh';
const OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const addDays = (date, n) => new Date(date.getTime() + n * DAY_MS);

// 00:00 (giờ VN) của ngày chứa `date`
const startOfDayVN = (date) =>
  new Date(Math.floor((date.getTime() + OFFSET_MS) / DAY_MS) * DAY_MS - OFFSET_MS);

// 00:00 thứ Hai của tuần hiện tại (giờ VN)
const startOfWeekVN = (date) => {
  const dayStart = startOfDayVN(date);
  const dow = new Date(dayStart.getTime() + OFFSET_MS).getUTCDay(); // 0 = CN
  return addDays(dayStart, -((dow + 6) % 7));
};

// 00:00 ngày mùng 1 của tháng hiện tại (giờ VN)
const startOfMonthVN = (date) => {
  const shifted = new Date(date.getTime() + OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1) - OFFSET_MS);
};

// 'YYYY-MM-DD' theo giờ VN
const dateKeyVN = (date) => new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 10);

const sumRevenue = async (from, to) => {
  const [row] = await Invoice.aggregate([
    { $match: { paymentStatus: 'paid', paidAt: { $gte: from, $lt: to } } },
    { $group: { _id: null, revenue: { $sum: '$finalAmount' } } },
  ]);
  return row ? row.revenue : 0;
};

// Lịch hẹn không tính các lịch đã hủy
const countAppointments = (from, to, extra = {}) =>
  Appointment.countDocuments({ date: { $gte: from, $lt: to }, status: { $ne: 'cancelled' }, ...extra });

const countNewCustomers = (from, to) =>
  Customer.countDocuments({ createdAt: { $gte: from, $lt: to } });

const getDayStats = async (from, to) => {
  const [appointments, completedAppointments, revenue, newCustomers] = await Promise.all([
    countAppointments(from, to),
    Appointment.countDocuments({ date: { $gte: from, $lt: to }, status: 'completed' }),
    sumRevenue(from, to),
    countNewCustomers(from, to),
  ]);
  return { appointments, completedAppointments, revenue, newCustomers };
};

// Doanh thu 7 ngày gần nhất (ngày không có hóa đơn = 0)
const getRevenueChart = async (todayStart, tomorrowStart) => {
  const from = addDays(todayStart, -6);
  const rows = await Invoice.aggregate([
    { $match: { paymentStatus: 'paid', paidAt: { $gte: from, $lt: tomorrowStart } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt', timezone: TZ } },
        revenue: { $sum: '$finalAmount' },
      },
    },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r.revenue]));

  return Array.from({ length: 7 }, (_, i) => {
    const key = dateKeyVN(addDays(todayStart, i - 6));
    return {
      date: `${key.slice(8, 10)}/${key.slice(5, 7)}`, // DD/MM
      fullDate: key,
      revenue: byDay.get(key) || 0,
    };
  });
};

// Top 5 dịch vụ theo số lượt (hóa đơn đã thanh toán, mặc định 30 ngày gần nhất)
const getTopServices = async (from, to) =>
  Invoice.aggregate([
    { $match: { paymentStatus: 'paid', paidAt: { $gte: from, $lt: to } } },
    { $unwind: '$services' },
    {
      $group: {
        _id: '$services.name',
        count: { $sum: { $ifNull: ['$services.quantity', 1] } },
        revenue: { $sum: { $multiply: ['$services.price', { $ifNull: ['$services.quantity', 1] }] } },
      },
    },
    { $sort: { count: -1, revenue: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, name: '$_id', count: 1, revenue: 1 } },
  ]);

const getDashboardStats = async (query = {}) => {
  const now = new Date();
  const todayStart = startOfDayVN(now);
  const tomorrowStart = addDays(todayStart, 1);
  const yesterdayStart = addDays(todayStart, -1);
  const weekStart = startOfWeekVN(now);
  const monthStart = startOfMonthVN(now);

  const days = Math.min(Math.max(parseInt(query.days, 10) || 30, 1), 365);
  const topFrom = addDays(todayStart, -(days - 1));

  const [today, yesterday, weekApts, weekRevenue, monthApts, monthRevenue, revenueChart, topServices] =
    await Promise.all([
      getDayStats(todayStart, tomorrowStart),
      getDayStats(yesterdayStart, todayStart),
      countAppointments(weekStart, tomorrowStart),
      sumRevenue(weekStart, tomorrowStart),
      countAppointments(monthStart, tomorrowStart),
      sumRevenue(monthStart, tomorrowStart),
      getRevenueChart(todayStart, tomorrowStart),
      getTopServices(topFrom, tomorrowStart),
    ]);

  return {
    today,
    yesterday, // để frontend tính xu hướng "so với hôm qua"
    week: { appointments: weekApts, revenue: weekRevenue },
    month: { appointments: monthApts, revenue: monthRevenue },
    revenueChart,
    topServices,
  };
};

module.exports = { getDashboardStats };