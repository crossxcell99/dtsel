import { HoursMinutesSeconds } from "../src/common";
import { DTS } from "../src/ui";
import type { Config } from "../src/ui";

const withTime = (hours = 0, minutes = 0, seconds = 0): HoursMinutesSeconds => {
  return { hours, minutes, seconds };
};

const cases: [string, HoursMinutesSeconds, string, string][] = [
  ["default time format", withTime(13, 30, 45), "HH:MM:SS", "13:30:45"],
];

const makeSettings = (settings: Partial<Config>) => {
  return new DTS({ element: document.createElement("input"), ...settings });
};

describe("Parse time", () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const { dts, config } = makeSettings({ timeFormat: format });
      expect(dts.lib.renderTime(given, config.timeFormat)).toEqual(expected);
    });
  });
});
