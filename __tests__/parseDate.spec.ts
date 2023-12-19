import { FullYearMonthDate } from "../src/common";
import { DTS } from "../src/ui";
import type { Config } from "../src/ui";

const cases: [string, string, string, FullYearMonthDate][] = [
  [
    "slash separator",
    "2012/12/12",
    "YYYY/MM/DD",
    { fullYear: 2012, month: 11, date: 12 },
  ],
  [
    "slash separator and 2 digit year",
    "12/12/12",
    "DD/MM/YY",
    { fullYear: 2012, month: 11, date: 12 },
  ],
  [
    "dash separator",
    "2012-12-31",
    "YYYY-MM-DD",
    { fullYear: 2012, month: 11, date: 31 },
  ],
  [
    "mixed casing",
    "12-31-19",
    "mm-DD-yY",
    { fullYear: 2019, month: 11, date: 31 },
  ],
];

const makeSettings = (settings: Partial<Config>) => {
  return new DTS({ element: document.createElement("input"), ...settings });
};

describe("Parse date", () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const { dts, config } = makeSettings({ dateFormat: format });
      expect(dts.lib.parseDate(given, config.dateFormat)).toEqual(expected);
    });
  });
});
