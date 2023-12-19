import { FullYearMonthDate } from "../src/common";
import { DTS } from "../src/ui";
import type { Config } from "../src/ui";

const cases: [string, FullYearMonthDate, string, string][] = [
  [
    "default date format",
    { fullYear: 2011, month: 11, date: 25 },
    "DD/MM/YY",
    "25/12/11",
  ],
];

const makeSettings = (settings: Partial<Config>) => {
  return new DTS({ element: document.createElement("input"), ...settings });
};

describe("Parse date", () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const { dts, config } = makeSettings({ dateFormat: format });
      expect(dts.lib.renderDate(given, config.dateFormat)).toEqual(expected);
    });
  });
});
