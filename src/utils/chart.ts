export const buildRevenueChart = (
  revenueByDate: {
    date: string;
    revenue: number;
  }[],
  type: "week" | "month",
  daysInMonth?: number,
) => {
  if (type === "week") {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = Array(7).fill(0);
    revenueByDate.forEach((item) => {
      const day = new Date(item.date).getDay();
      const index = day === 0 ? 6 : day - 1;
      data[index] = item.revenue;
    });
    return {
      labels,
      datasets: [{ data }],
    };
  }
  const labels = ["W1", "W2", "W3", "W4", "W5"];
  const data = [0, 0, 0, 0, 0];
  revenueByDate.forEach((item) => {
    const day = new Date(item.date).getDate();
    let weekIndex = 0;
    if (day <= 7) weekIndex = 0;
    else if (day <= 14) weekIndex = 1;
    else if (day <= 21) weekIndex = 2;
    else if (day <= 28) weekIndex = 3;
    else weekIndex = 4;
    data[weekIndex] += Number(item.revenue);
  });
  return {
    labels,
    datasets: [
      {
        data,
      },
    ],
  };
};
export const getCurrentWeekRange = () => {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    startDate: monday.toISOString(),
    endDate: sunday.toISOString(),
  };
};

export const getMonthRange = (month: number) => {
  const year = new Date().getFullYear();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return {
    startDateInMonth: start.toISOString(),
    endDateInMonth: end.toISOString(),
    daysInMonth: end.getDate(),
  };
};
