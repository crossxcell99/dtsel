import {
  type DTSStateKey,
  type HandlerFn,
  type HeaderDataType,
  type RenderValue,
  type DTSState,
  type BodyTypeValue,
  makeDebounceHandler,
  randStr,
  HEADER_DATA,
  BodyType,
  IDTSLib,
  defaultObj,
} from "./common";
import { DTSLib } from "./lib";

const makeDTSState = (dts: DTSBase, init: Partial<DTSState> = {}) => {
  const handler = makeDebounceHandler();
  const now = new Date();
  const state: DTSState = {
    fullYear: init.fullYear || now.getUTCFullYear(),
    month: init.month || now.getUTCMonth(),
    date: init.date || now.getUTCDate(),
    hours: init.hours || now.getUTCHours(),
    minutes: init.minutes || now.getUTCMinutes(),
    seconds: init.seconds || now.getUTCSeconds(),
    bodyType: init.bodyType || BodyType.DATES,
    prev: undefined,
  };

  return new Proxy(state, {
    set<K extends DTSStateKey>(_obj: DTSState, key: K, val: DTSState[K]) {
      if (_obj[key] !== val) {
        const prevState = { ..._obj };
        const obj = _obj;
        obj[key] = val;
        handler(prevState, { ...obj }, dts.getHandlers(key));
      }
      return true;
    },
  });
};

export type DTSBaseTypeParams = ConstructorParameters<typeof DTSBase>;

export type DTSBaseType = typeof DTSBase & {
  new (...args: DTSBaseTypeParams): DTSBase;
};

export class DTSBase {
  #state: DTSState;

  #handlers: Record<DTSStateKey, [id: string, fn: HandlerFn][]>;

  lib: IDTSLib;

  constructor(_init: Partial<DTSState>, lib?: IDTSLib) {
    this.lib = lib || new DTSLib();
    this.#handlers = defaultObj(() => []);
    this.#state = makeDTSState(this, _init);
  }

  save() {
    const { prev, ...rest } = this.#state;
    this.#state.prev = rest;
  }

  addHandler(keys: DTSStateKey[], handlerFn: HandlerFn) {
    const handlers = this.#handlers;
    const id = randStr();

    keys.forEach((key) => {
      handlers[key].push([id, handlerFn]);
    });

    let removed = false;
    const remove = () => {
      if (!removed) {
        keys.forEach((key) => {
          handlers[key] = handlers[key].filter(([_id]) => _id !== id);
        });
        removed = true;
      }
    };
    return remove;
  }

  getHandlers(key: keyof DTSState) {
    return [...(this.#handlers[key] || [])];
  }

  get state(): Readonly<DTSState> {
    return { ...this.#state };
  }

  updateState(update: Partial<DTSState>) {
    Object.entries(update).forEach(([key, value]) => {
      this.#state[key as DTSStateKey] = value as any;
    });
  }

  handleHeaderChange(_val: string) {
    const val = _val as HeaderDataType;
    const { bodyType, month, fullYear } = this.#state;
    const sign = val === HEADER_DATA.RIGHT ? 1 : -1;

    const handleLeftRight = () => {
      let [newMonth, newYear] = [month, fullYear];

      switch (bodyType) {
        case BodyType.DATES:
          newMonth += sign;
          break;
        case BodyType.MONTHS:
          newYear += sign;
          break;
        case BodyType.YEARS:
          newYear += sign * 10;
          break;
        default: // do nothing
      }

      if (newMonth < 0) {
        const abs = Math.abs(newMonth);
        newMonth = 12 - (abs % 12);
        newYear -= Math.ceil(abs / 12);
      } else if (newMonth > 11) {
        newYear += Math.floor(newMonth / 12);
        newMonth %= 12;
      }
      this.#state.month = newMonth;
      this.#state.fullYear = newYear;
    };

    switch (val) {
      case HEADER_DATA.LEFT:
      case HEADER_DATA.RIGHT:
        handleLeftRight();
        break;
      case HEADER_DATA.CENTRE:
        if (bodyType < BodyType.YEARS)
          this.#state.bodyType = (bodyType + 1) as BodyTypeValue;
        break;
      default: // do nothing
    }
  }

  handleBodyChange(_val: string) {
    const val = Math.abs(Number(_val));
    const { bodyType, fullYear, month } = this.#state;

    switch (bodyType) {
      case BodyType.DATES: {
        let [nYear, nMonth] = [fullYear, month];
        if (_val.startsWith("+")) nMonth += 1;
        else if (_val.startsWith("-")) nMonth -= 1;

        // TODO: move to DTLib
        if (nMonth < 0) {
          const abs = Math.abs(nMonth);
          nMonth = 12 - (abs % 12);
          nYear -= Math.ceil(abs / 12);
        } else if (nMonth > 11) {
          nYear += Math.floor(nMonth / 12);
          nMonth %= 12;
        }

        this.#state.date = val;
        this.#state.fullYear = nYear;
        this.#state.month = nMonth;
        break;
      }
      case BodyType.MONTHS:
        this.#state.bodyType = BodyType.DATES;
        this.#state.month = val;
        break;
      case BodyType.YEARS:
        this.#state.bodyType = BodyType.MONTHS;
        this.#state.fullYear = val;
        break;
      default: // do nothing
    }
  }

  handleFooterChange(_val: string) {
    const parts = _val.split(":", 2);
    if (parts.length === 2) {
      const val = Number(parts[1]);
      switch (parts[0]) {
        case "0":
          this.#state.hours = val;
          break;
        case "1":
          this.#state.minutes = val;
          break;
        case "2":
          this.#state.seconds = val;
          break;
        default: // do nothing;
      }
    }
  }

  getHeaderValues(): RenderValue {
    return {
      section: "header",
      data: Object.values(HEADER_DATA),
      handler: this.handleHeaderChange.bind(this),
    };
  }

  getBodyValues(): RenderValue {
    const { lib } = this;
    const { fullYear, month, date, bodyType } = this.#state;

    let data: string[];
    switch (bodyType) {
      case BodyType.DATES:
        data = lib.getDates(fullYear, month, date);
        break;
      case BodyType.MONTHS:
        data = lib.getMonths(fullYear, month);
        break;
      case BodyType.YEARS:
        data = lib.getYears(fullYear, fullYear);
        break;
      default:
        throw new Error("Invalid body type");
    }

    return {
      data,
      section: "body",
      handler: this.handleBodyChange.bind(this),
    };
  }

  getFooterValues(): RenderValue {
    const { hours, minutes, seconds } = this.#state;
    return {
      section: "footer",
      data: [`${hours}`, `${minutes}`, `${seconds}`],
      handler: this.handleFooterChange.bind(this),
    };
  }
}

export default DTSBase;
