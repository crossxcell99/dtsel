import {
  type DefaultObj,
  type DTFormatObj,
  type FullYearMonthDate,
  type HoursMinutesSeconds,
  type IDTSLib,
  type StrOrNum,
  padStart,
  defaultObj,
} from "./common";

// https://stackoverflow.com/a/52490977
type TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : TupleOf<T, N, [T, ...R]>;

export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : TupleOf<T, N, []>
  : never;

export type MonthsStr = Tuple<string, 12>;

export type WeekdaysStr = Tuple<string, 7>;

type Month = "month";

type Weekday = "weekday";

export type MonthOrWeekday = Month | Weekday;

type CanSkipHook<K extends string> = (o: DTFormatObj<K>) => boolean;

type UpdateValueHook<K extends string> = (params: {
  val: StrOrNum | undefined;
  formatObj: DTFormatObj<K>;
  valStart: number;
  stop: number;
}) => StrOrNum | undefined;

type ParseDataHooks<K extends string> = {
  canSkip: DefaultObj<CanSkipHook<K>[]>;
  updateValue: DefaultObj<UpdateValueHook<K>[]>;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DATE_FORMAT_REGEX = /yyyy|yy|mm|dd/gi;
const TIME_FORMAT_REGEX = /hh|mm|ss|a/gi;

const sortByStringIndex = (arr: string[], string: string): string[] => {
  return arr.sort((a, b) => {
    const h = string.indexOf(a);
    const l = string.indexOf(b);
    if (h !== l) return h < l ? -1 : 1;
    return b.length - a.length;
  });
};

const filterFormatKeys = (keys: string[], format: string): string[] => {
  let formatIdx = 0;
  return keys.filter((key) => {
    if (format.slice(formatIdx).indexOf(key) > -1) {
      formatIdx += key.length;
      return true;
    }
    return false;
  });
};

const parseData = <K extends string>(
  value: string,
  format: string,
  _formatObj: DTFormatObj<K>,
  setHooks: (arg0: ParseDataHooks<K>) => void,
): DTFormatObj<K> => {
  const formatObj = _formatObj;
  const hooks: ParseDataHooks<K> = {
    canSkip: defaultObj(() => []),
    updateValue: defaultObj(() => []),
  };
  const keys = sortByStringIndex(Object.keys(formatObj), format) as K[];
  const filterdKeys = filterFormatKeys(keys, format);
  if (setHooks) {
    setHooks(hooks);
  }

  let valStart = 0; // value start
  keys.forEach((key, i) => {
    const fstart = format.indexOf(key);
    let valStartInner = valStart; // next value start
    let val: StrOrNum | undefined;
    let canSkip = false;
    const canSkipHooks = hooks.canSkip[key];

    valStart = valStart || fstart;

    for (let j = 0; j < canSkipHooks.length; j += 1) {
      if (canSkipHooks[j](formatObj)) {
        canSkip = true;
        break;
      }
    }
    if (fstart > -1 && !canSkip) {
      let stop = valStart + key.length;
      let fnext = -1;
      let nextKeyIdx = i + 1;
      valStartInner += key.length; // set next value start if current key is found

      // get next format token used to determine separator
      while (fnext === -1 && nextKeyIdx < keys.length) {
        const nextKey = keys[nextKeyIdx];
        nextKeyIdx += 1;
        if (filterdKeys.indexOf(nextKey) !== -1) {
          fnext = nextKey ? format.indexOf(nextKey) : -1; // next format start
        }
      }
      if (fnext > -1) {
        const sep = format.slice(stop, fnext);
        if (sep) {
          const stopInner = value.slice(valStart).indexOf(sep);
          if (stopInner && stopInner > -1) {
            stop = stopInner + valStart;
            valStartInner = stop + sep.length;
          }
        }
      }

      val = parseInt(value.slice(valStart, stop), 10);
      hooks.updateValue[key].forEach((func) => {
        val = func({ val, formatObj, valStart, stop });
      });
    }
    formatObj[key] = { index: valStart, value: val };
    valStart = valStartInner; // set next value start
  });
  return formatObj;
};

export class DTSLib implements IDTSLib {
  /**
   * For a given returned value "-X." or "+X." or "X.0",
   *  X is the actual value, eg 23
   *  no prefix implies regular value
   *  "-" prefix implies the value is for previous set (date)
   *  "+" prefix implies the value is for next set (date)
   *  "." suffix implies the value is not allowed (eg outside range)
   *  ".0" suffix implies the value is active (eg selected)
   * @param start start Date
   * @param count number of entries to return
   * @returns the date values as string, eg "1", "-1", "+3."
   */
  // eslint-disable-next-line class-methods-use-this
  getDates(_year: number, _month: number, _date = Number.NaN) {
    // TODO: implement identification of disabled dates
    if (!(_year > 0)) return [];

    const oneDay = 24 * 60 * 60 * 1000;
    const start = new Date(Date.UTC(_year, _month, 1));
    let adjusted = new Date(start.getTime() - oneDay * start.getUTCDay());

    const dates: string[] = [];
    for (let i = 1; i < 7; i += 1) {
      for (let j = 0; j < 7; j += 1) {
        const month = adjusted.getUTCMonth();
        const date = adjusted.getUTCDate();
        let prefix = "";
        let suffix = "";

        if (month !== _month) {
          if (i === 6 && j === 0) {
            break;
          }
          prefix = month > _month ? "+" : "-";
        } else if (date === _date && adjusted.getUTCFullYear() === _year) {
          suffix = ".0";
        }

        dates.push(`${prefix}${date}${suffix}`);
        adjusted = new Date(adjusted.getTime() + oneDay);
      }
    }

    return dates;
  }

  /**
   * For a given returned value "-X." or "+X." or "X.0",
   *  X is the actual value, eg 7
   *  no prefix implies regular value
   *  "-" prefix implies the value is for previous set (month)
   *  "+" prefix implies the value is for next set (month)
   *  "." suffix implies the value is not allowed (eg outside range)
   *  ".0" suffix implies the value is active (eg selected)
   * @param _year The year to return months
   * @param _month the active month
   * @returns the month values as string of integers, eg "1", "-1", "+3."
   */
  // eslint-disable-next-line class-methods-use-this
  getMonths(_year: number, _month = Number.NaN) {
    // TODO: implement identification of disabled dates

    return Array.from(
      { length: 12 },
      (_, i) => `${i}${i === _month ? ".0" : ""}`,
    );
  }

  /**
   * For a given returned value "-X." or "+X." or "X.0",
   *  X is the actual value, eg 7
   *  no prefix implies regular value
   *  "-" prefix implies the value is for previous set (year)
   *  "+" prefix implies the value is for next set (year)
   *  "." suffix implies the value is not allowed (eg outside range)
   *  ".0" suffix implies the value is active (eg selected)
   * @param _refYear The reference year to return years for
   * @param _year the active year
   * @returns the month values as string of integers, eg "1", "-1", "+3."
   */
  // eslint-disable-next-line class-methods-use-this
  getYears(refYear: number, _year = Number.NaN) {
    const start = refYear - (refYear % 10) - 1;
    return Array.from(
      { length: 12 },
      (_, i) =>
        `${i ? `${i === 11 ? "+" : ""}` : "-"}${start + i}${
          start + i === _year ? ".0" : ""
        }`,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getMonthStr(month: number, short = false) {
    if (!(month >= 0 && month < 12)) return "";
    return short ? MONTHS[month].slice(0, 3) : MONTHS[month];
  }

  // eslint-disable-next-line class-methods-use-this
  getWeekdayStr(wkday: number, short = false) {
    if (!(wkday >= 0 && wkday < 7)) return "";
    return short ? WEEKDAYS[wkday].slice(0, 3) : WEEKDAYS[wkday];
  }

  // eslint-disable-next-line class-methods-use-this
  parseDate(value: string, Format: string): FullYearMonthDate {
    let fmtObj: DTFormatObj<"yyyy" | "yy" | "mm" | "dd"> = {
      yyyy: {},
      yy: {},
      mm: {},
      dd: {},
    };

    const format = (Format || "").toLowerCase();
    if (!format) {
      throw new TypeError(`dateFormat not found (${Format})`);
    }
    fmtObj = parseData(value, format, fmtObj, ({ canSkip, updateValue }) => {
      canSkip.yy.push((data) => {
        return !!data.yyyy.value;
      });
      updateValue.yy.push(({ val }) => {
        return typeof val === "number"
          ? 100 * Math.floor(new Date().getFullYear() / 100) + val
          : undefined;
      });
    });

    const { yyyy, yy, mm, dd } = fmtObj;
    const fullYear = Number(yyyy.value || yy.value) || 0;
    const month = typeof mm.value === "number" ? mm.value - 1 : 0;
    const date = Number(dd.value);
    return { fullYear, month, date };
  }

  // eslint-disable-next-line class-methods-use-this
  parseTime(value: string, Format: string): HoursMinutesSeconds {
    const format = (Format || "").toLowerCase();
    if (!format) {
      throw new TypeError(`timeFormat not found (${Format})`);
    }

    let formatObj: DTFormatObj<"hh" | "mm" | "ss" | "a"> = {
      hh: {},
      mm: {},
      ss: {},
      a: {},
    };
    formatObj = parseData(value, format, formatObj, ({ updateValue }) => {
      updateValue.a.push(({ valStart }) => {
        return value.slice(valStart, valStart + 2);
      });
    });
    let hours = Number(formatObj.hh.value) || 0;
    const minutes = Number(formatObj.mm.value) || 0;
    const seconds = Number(formatObj.ss.value) || 0;
    const amPm = formatObj.a.value;
    if (amPm) {
      const amPmLower = amPm.toString().toLowerCase();
      if (amPm && ["am", "pm"].indexOf(amPmLower) > -1) {
        if (amPmLower === "am" && hours === 12) {
          hours = 0;
        } else if (amPmLower === "pm") {
          hours += 12;
        }
      }
    }

    return { hours, minutes, seconds };
  }

  // eslint-disable-next-line class-methods-use-this
  renderDate(value: FullYearMonthDate, dateFormat: string): string {
    const format = dateFormat.toLowerCase();
    const { date, month, fullYear: year } = value;
    const yearShort = year % 100;
    const formatObj = {
      dd: date < 10 ? `0${date}` : date,
      mm: month < 9 ? `0${month + 1}` : month + 1,
      yyyy: year,
      yy: yearShort < 10 ? `0${yearShort}` : yearShort,
    };
    const str = format.replace(DATE_FORMAT_REGEX, (found) => {
      const val = formatObj[found as keyof typeof formatObj];
      return typeof val === "string" ? val : String(val ?? found);
    });
    return str;
  }

  // eslint-disable-next-line class-methods-use-this
  renderTime(value: HoursMinutesSeconds, Format: string): string {
    const format = Format.toLowerCase();
    const { hours, minutes, seconds } = value;
    let amPm = null;
    let hhAmPm = null;
    if (format.indexOf("a") > -1) {
      amPm = hours >= 12 ? "pm" : "am";
      amPm = Format.indexOf("A") > -1 ? amPm.toUpperCase() : amPm;
      if (hours === 0) hhAmPm = "12";
      else hhAmPm = hours > 12 ? hours % 12 : hours;
    }
    const formatObj = {
      hh: amPm ? hhAmPm : padStart(hours),
      mm: padStart(minutes),
      ss: padStart(seconds),
      a: amPm,
    };
    const str = format.replace(TIME_FORMAT_REGEX, (found) => {
      const val = formatObj[found as keyof typeof formatObj];
      return typeof val === "string" ? val : `${val ?? found}`;
    });
    return str;
  }
}

export default DTSLib;
