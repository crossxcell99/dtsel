import { HoursMinutesSeconds } from "../src/common";
import { DTS } from "../src/ui";
import type { Config } from "../src/ui";

const getTime = (
  timeTuple: [hours?: number, minutes?: number, seconds?: number],
): HoursMinutesSeconds => {
  let [hours, minutes, seconds] = timeTuple;
  hours = hours || 0;
  minutes = minutes || 0;
  seconds = seconds || 0;
  return { hours, minutes, seconds };
};

const cases: [string, string, string, HoursMinutesSeconds][] = [
  ["default time format", "13:30:45", "HH:MM:SS", getTime([13, 30, 45])],
];

const makeSettings = (settings: Partial<Config>) => {
  return new DTS({ element: document.createElement("input"), ...settings });
};

describe("Parse time", () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const { dts, config } = makeSettings({ timeFormat: format });
      expect(dts.lib.parseTime(given, config.timeFormat)).toEqual(expected);
    });
  });
});
