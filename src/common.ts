/** all values are in UTC, naming from Date.getUTC<name> */
export interface FullYearMonthDate {
  fullYear: number;
  month: number;
  date: number;
}

/** all values are in UTC, naming from Date.getUTC<name> */
export interface HoursMinutesSeconds {
  hours: number;
  minutes: number;
  seconds: number;
}

/** all values are in UTC, naming from Date.getUTC<name> */
export interface DTSValue extends FullYearMonthDate, HoursMinutesSeconds {}

type IBodyType = typeof BodyType;

export type BodyTypeValue = IBodyType[keyof IBodyType];

export interface DTSState extends DTSValue {
  bodyType: BodyTypeValue;
  /** saved value used to compare changes */
  prev?: Omit<DTSState, "prev">;
}

export type Func = (...a: any[]) => any;

/** mapping from string to array of functions */
export type Handlers<T extends Func = Func> = Record<string, T[]>;

export type StrOrNum = string | number;

export type DTFormatItem = {
  index?: number | null;
  value?: StrOrNum;
};

export type DTFormatObj<K extends string = string> = Record<K, DTFormatItem>;

/** string that can be converted to a valid number using {@link Number} */
export type NumberString = string;

export interface IDTSLib {
  getDates(_year: number, _month: number, _date?: number): NumberString[];
  getMonths(_year: number, _month?: number): NumberString[];
  getYears(refYear: number, _year?: number): NumberString[];
  getMonthStr(month: number, short?: boolean): string;
  getWeekdayStr(wkday: number, short?: boolean): string;
  parseDate(value: string, Format: string): FullYearMonthDate;
  parseTime(value: string, Format: string): HoursMinutesSeconds;
  renderDate(value: FullYearMonthDate, dateFormat: string): string;
  renderTime(value: HoursMinutesSeconds, Format: string): string;
}

export type DTSLibCTor = {
  new (): IDTSLib;
};

export type RenderSection = "header" | "body" | "footer";

export type RenderValue = {
  section: RenderSection;
  data: NumberString[];
  handler: (v: NumberString) => void;
};

export type RenderValueSection = Omit<RenderValue, "section">;

export type HeaderDataType = (typeof HEADER_DATA)[keyof typeof HEADER_DATA];

export type DTSStateKey = keyof DTSState;

export type HandlerFn = (
  val: Partial<DTSState>,
  prev: Partial<DTSState>,
) => void;

export type HandlerFnPair = [id: string, fn: HandlerFn];

export type DefaultObj<T> = Record<string | symbol, T>;

export const defaultObj = <T>(factory: () => T) => {
  const store: Record<string | symbol, T> = {};

  return new Proxy(store, {
    get(target, p) {
      // eslint-disable-next-line no-param-reassign
      if (!(p in target)) target[p] = factory();
      return target[p];
    },
  });
};

export const BodyType = {
  DATES: 1,
  MONTHS: 2,
  YEARS: 3,
} as const;

export const HEADER_DATA = {
  LEFT: "-1",
  CENTRE: "0",
  RIGHT: "1",
} as const;

export const RENDER_SECTIONS: RenderSection[] = ["header", "body", "footer"];

export const randStr = () => (Math.random() * 1000_000_000).toFixed();

export const makeDebounceHandler = () => {
  // combine multiple consecutive handler calls
  let timeoutId = 0;
  let firstPrev: Partial<DTSState> | undefined;
  let allHandlers: { [id: string]: HandlerFn } = {};

  return (prev: DTSState, nxt: DTSState, handlers: HandlerFnPair[]) => {
    window.clearTimeout(timeoutId);

    if (!firstPrev) firstPrev = prev;
    for (let i = 0; i < handlers.length; i += 1) {
      const [id, fn] = handlers[i];
      allHandlers[id] = fn;
    }

    timeoutId = window.setTimeout(() => {
      const pre = firstPrev;
      firstPrev = undefined;
      const funcs = Object.values(allHandlers);
      allHandlers = {};
      funcs.forEach((func) => func(pre || {}, nxt));
    }, 5);
  };
};

export const padStart = (_val: StrOrNum, length = 2, pad = "0") => {
  const val = typeof _val === "number" ? _val.toFixed() : _val;
  return val.padStart(length, pad);
};
