declare class DTS {
    config: Config;
    dateFormat: string;
    timeFormat: string;
    dateFormatRegEx: RegExp;
    timeFormatRegEx: RegExp;
    inputElem: HTMLElement;
    dtbox: DTBox;

    constructor(elem: HTMLElement|string, config: Partial<Config>);
    setup(): void;
    inputElemHandler(e: any): void;
}

declare class DTBox {
  el: {};
  settings: DTS;
  elem: HTMLElement;
  year: number;
  month: any;
  bodyType: string;
  day: number;
  value: Date;

  constructor(elem: HTMLElement, settings: DTS);
  setup(): void;
  setupWrapper(): void;
  setPosition: (e: any) => void;
  setupHeader(): void;
  setHeaderContent(): void;
  setupBody(): void;
  setBodyContent(): void;
  onTimeChange(e: Event): void;
  setupFooter(): void;
  setFooterContent(): void;
  setInputValue(): void;
  onDateSelected(e: any): void;
  onMonthSelected(e: Event): void;
  onYearSelected(e: Event): void;
  onHeaderChange(e: Event): void;
}

declare function getOffset(elem: HTMLElement): {
    left: number;
    top: number;
};

declare function empty(e: HTMLElement): void;

declare function tryAppendChild(newChild: HTMLElement, refNode: Node): HTMLElement|undefined;

declare class hookFuncs {
    _funcs: Handlers;
    add(key: string, func: Function): void;
    get(key: string): Function[];
}

declare function sortByStringIndex(arr: string[], string: string): string[];

/**
* Remove keys from array that are not in format
* @param {string[]} keys
* @param {string} format
* @returns {string[]} new filtered array
*/
declare function filterFormatKeys(keys: string[], format: string): string[];

/**
* @template {StringNumObj} FormatObj
* @param {string} value
* @param {string} format
* @param {FormatObj} formatObj
* @param {function(Object.<string, hookFuncs>): null} setHooks
* @returns {FormatObj} formatObj
*/
declare function parseData<FormatObj extends {
    [x: string]: StringNum;
}>(
    value: string,
    format: string,
    formatObj: FormatObj,
    setHooks: (arg0: {[x: string]: hookFuncs;}) => null
  ): FormatObj;

   /**
* @param {String} value
* @param {DTS} settings
* @returns {Date} date object
*/
declare function parseDate(value: string, settings: DTS): Date;

declare function parseTime(value: string, settings: DTS): number;

declare function renderDate(value: Date, settings: DTS): string;

declare function renderTime(value: Date, settings: DTS): string;

declare function isEqualDate(date1: Date, date2: Date): boolean;

declare function padded(val: number, pad: number, default_val: any): string;

declare function appendAfter(newElem: HTMLElement, refNode: Node): void

declare function setDefaults<X, Y>(obj: X, objDefaults: Y): X | Y;

declare var BODYTYPES: string[];

declare var MONTHS: string[];

declare var WEEKDAYS: string[];

type Handlers = {
    [x: string]: Function[];
};

type AddHandler = (arg0: string, arg1: Function) => null;

type BodyType = ("DAYS" | "MONTHS" | "YEARS");

type StringNum = string | number;

type StringNumObj = {
    [x: string]: StringNum;
};

/**
* The local state
*/
type InstanceState = {
    value: Date;
    year: number;
    month: number;
    day: number;
    time: number;
    hours: number;
    minutes: number;
    seconds: number;
    bodyType: BodyType;
    visible: boolean;
    cancelBlur: number;
};

type Config = {
    dateFormat: string;
    timeFormat: string;
    showDate: boolean;
    showTime: boolean;
    paddingX: number;
    paddingY: number;
    defaultView: BodyType;
    direction: "TOP" | "BOTTOM";
};

declare namespace dtsel {
    export { DTS, DTBox as DTObj }
    export type { Config };
}

declare namespace dtsel.fn {
    export {
        empty,
        appendAfter,
        getOffset,
        parseDate,
        renderDate,
        parseTime,
        renderTime,
        setDefaults
    }
}

export default dtsel;
