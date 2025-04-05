import i18n from "./i18n";

export const getDayNames = (): string[] => {
  return (
    (i18n.t("days.short", { returnObjects: true }) as string[]) || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]
  );
};



  export const getFullDayName = (dayIndex: number): string => {
    const names: string[] = (i18n.t("days.full", {
      returnObjects: true,
    }) as string[]) || [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return names[dayIndex];
  };