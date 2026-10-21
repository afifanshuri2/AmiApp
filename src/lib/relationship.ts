// Work with calendar dates rather than elapsed milliseconds, avoiding DST drift.
export function todayDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function relationshipDuration(start: string, today = todayDate()) {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = today.split("-").map(Number);
  if (start > today) return "";
  const startDay = Date.UTC(sy, sm - 1, sd);
  const endDay = Date.UTC(ey, em - 1, ed);
  let months = (ey - sy) * 12 + em - sm;
  function anniversary(offset: number) {
    const year = sy + Math.floor((sm - 1 + offset) / 12);
    const month = (sm - 1 + offset) % 12;
    return Date.UTC(
      year,
      month,
      Math.min(sd, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()),
    );
  }
  if (anniversary(months) > endDay) months--;
  const days = Math.round((endDay - anniversary(months)) / 86400000);
  const parts = [
    [Math.floor(months / 12), "year"],
    [months % 12, "month"],
    [days, "day"],
  ] as const;
  return (
    parts
      .filter(([value]) => value > 0)
      .map(([value, unit]) => `${value} ${unit}${value === 1 ? "" : "s"}`)
      .join(", ") || (startDay === endDay ? "Our first day" : "")
  );
}
