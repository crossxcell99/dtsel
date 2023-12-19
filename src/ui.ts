import { DTSBase, type DTSBaseType, type DTSBaseTypeParams } from "./base";
import {
  type BodyTypeValue,
  type DefaultObj,
  type DTSValue,
  type Func,
  type RenderValue,
  type RenderValueSection,
  BodyType,
  padStart,
  defaultObj,
} from "./common";

export type Direction = "TOP" | "BOTTOM";

type HeaderClasses = {
  left?: string | string[];
  right?: string | string[];
  center?: string | string[];
  wrapper?: string | string[];
};

type GridColClasses = {
  /** base class for all columns */
  base?: string | string[];
  prev?: string | string[];
  next?: string | string[];
  selected?: string | string[];
  disabled?: string | string[];
};

type GridTypeClasses = {
  row?: string | string[];
  col?: GridColClasses;
  wrapper?: string | string[];
  firstRow?: string | string[];
};

type BodyClasses = GridTypeClasses & {
  wrapper?: string | string[];
  days: GridTypeClasses;
  months: GridTypeClasses;
  years: GridTypeClasses;
};

type FooterClasses = {
  wrapper?: string | string[];
  row?: string | string[];
  label?: string | string[];
  value?: string | string[];
  slider?: string | string[];
};

type CssClasses = {
  wrapper?: string | string[];
  header: HeaderClasses;
  body: BodyClasses;
  footer: FooterClasses;
};

export interface Config {
  /** default = 'yyyy-mm-dd' */
  dateFormat: string;
  /** default = 'HH:MM:SS' */
  timeFormat: string;
  /** default = true */
  showDate: boolean;
  /** default = false */
  showTime: boolean;
  /** default = 5 */
  paddingX: number;
  /** default = 5 */
  paddingY: number;
  /** default = 'DAYS' */
  defaultView: BodyTypeValue;
  /** default = 'TOP' */
  direction: Direction;
  /** css classes */
  classes: CssClasses;
}

const D = document;
const calNav = "cal-nav";
const calTime = "cal-time";
const calCell = "cal-cell";
const div = "div";
const rowCol: Partial<GridTypeClasses> = {
  row: ["cal-row"],
  col: {
    base: ["cal-cell"],
    prev: [`${calCell}-prev`],
    next: [`${calCell}-next`],
    selected: ["cal-value"],
    disabled: "disabled",
  },
};

export const defaultConfig: Readonly<Config> = {
  defaultView: BodyType.DATES,
  dateFormat: "yyyy-mm-dd",
  timeFormat: "HH:MM:SS",
  showDate: true,
  showTime: false,
  paddingX: 5,
  paddingY: 5,
  direction: "TOP",
  classes: {
    wrapper: ["date-selector-wrapper"],
    header: {
      left: [calNav, `${calNav}-prev`],
      right: [calNav, `${calNav}-next`],
      center: [calNav, `${calNav}-current`],
      wrapper: ["cal-header"],
    },
    body: {
      ...rowCol,
      wrapper: ["cal-body"],
      days: { wrapper: ["cal-days"], firstRow: ["cal-day-names"], ...rowCol },
      months: { wrapper: ["cal-months"], ...rowCol },
      years: { wrapper: ["cal-years"], ...rowCol },
    },
    footer: {
      wrapper: ["cal-footer"],
      row: [calTime],
      label: [`${calTime}-label`],
      value: [`${calTime}-value`],
      slider: [`${calTime}-slider`],
    },
  },
};

const getOffset = (elem: HTMLElement) => {
  const { left: boxLeft, top: boxTop } = elem.getBoundingClientRect();
  const { scrollX, scrollY } = window;
  const root = D.documentElement || D.body.parentNode || D.body;
  const [left, top] = [scrollX ?? root.scrollLeft, scrollY ?? root.scrollTop];
  return { left: boxLeft + left, top: boxTop + top };
};

const createEl = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] => D.createElement(tagName);

const createAndAppend = <K extends keyof HTMLElementTagNameMap>(
  parent: Element,
  tagName: K,
): HTMLElementTagNameMap[K] => parent.appendChild(createEl(tagName));

const addClass = (
  elem: Element,
  ..._tokens: (undefined | string | string[])[]
) => {
  const tokens = _tokens
    .flatMap((x) => (typeof x === "string" ? x.split(/\s+/) : x || []))
    .filter(Boolean);
  if (tokens.length > 0) elem.classList.add(...tokens);
};

const setText = <T extends HTMLElement>(el: T, txt: string) => {
  // eslint-disable-next-line no-param-reassign
  el.textContent = txt;
};

const empty = <T extends Element>(e: T): T => {
  for (; e.firstChild; ) e.removeChild(e.firstChild);
  return e;
};

const makeGrid = (
  rows: number,
  cols: number,
  classes: GridTypeClasses,
  clickHandler?: Func,
) => {
  const { wrapper: grid, row, col, firstRow } = classes;
  const gridEl = createEl(div);
  addClass(gridEl, grid);
  for (let i = 0; i < rows; i += 1) {
    const rowEl = createAndAppend(gridEl, div);
    addClass(rowEl, ...[row, ...(i === 0 ? firstRow || [] : [])]);

    for (let j = 0; j < cols; j += 1) {
      const colEl = createAndAppend(rowEl, div);
      addClass(colEl, col?.base);
      if (clickHandler) colEl.onclick = clickHandler;
    }
  }
  return gridEl;
};

const setGridContent = (
  bodyType: BodyTypeValue,
  _grid: HTMLElement,
  data: string[],
  classes?: GridColClasses,
) => {
  const grid = _grid;
  let x = 0;
  let i = bodyType === BodyType.DATES ? 1 : 0;
  let row = grid.children[i]?.children;
  const { prev, next, selected, disabled } = classes || {};

  const all = [prev, next, selected, disabled]
    .flatMap((itm) => itm || [])
    .filter(Boolean);
  while ((row?.length || 0) > 0 && x < data.length) {
    (grid.children[i] as HTMLElement).style.display = "";
    for (let j = 0; x < data.length && j < row.length; j += 1) {
      const col = row[j] as HTMLElement;
      const [val, prefix, v, suffix] =
        [...data[x].matchAll(/^(-|\+)?(\d+)(\.0?)?$/gi)][0] || [];
      col.dataset.value = val;
      setText(col, Math.abs(Number(v)).toFixed());
      x += 1;

      col.classList.remove(...all);
      addClass(
        col,
        prefix && (prefix === "+" ? next : prev),
        suffix && (suffix === "." ? disabled : selected),
      );
    }

    i += 1;
    row = grid.children[i]?.children;
  }
  while (i < grid.children.length) {
    (grid.children[i] as HTMLElement).style.display = "none";
    i += 1;
  }
};

const makeRow = (
  footer: HTMLElement,
  labelTxt: string,
  name: keyof DTSValue,
  range: number,
  classes: FooterClasses,
) => {
  const { row, label, value, slider } = classes;
  const rowElem = createAndAppend(footer, div);
  addClass(rowElem, row);

  const labelCol = createAndAppend(rowElem, div);
  addClass(labelCol, label);
  setText(labelCol, labelTxt);

  const valueCol = createAndAppend(rowElem, div);
  addClass(valueCol, value);
  setText(valueCol, "00");
  const setValueCol = (v: string) => {
    setText(valueCol, v);
  };

  const inputCol = createAndAppend(rowElem, div);
  addClass(inputCol, slider);
  const sliderElem = createAndAppend(inputCol, "input");
  sliderElem.step = "1";
  sliderElem.min = "0";
  sliderElem.max = `${range}`;
  sliderElem.name = name;
  sliderElem.type = "range";
  sliderElem.oninput = () => setValueCol(padStart(sliderElem.value));
  Object.defineProperty(footer, name, { value: sliderElem });
  Object.defineProperty(sliderElem, "setValueCol", { value: setValueCol });
};

type MakeDTSBase = [...DTSBaseTypeParams, Klass?: DTSBaseType];

const makeDts = (...args: MakeDTSBase) =>
  new (args[2] || DTSBase)(...[args[0], args[1]]);

type RemoveFirst<T extends any[]> = T extends [any, ...infer V] ? V : T;

function addHandler<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventType: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
): () => void;
function addHandler<K extends keyof WindowEventMap>(
  element: Window,
  eventType: K,
  handler: (ev: WindowEventMap[K]) => void,
): () => void;
function addHandler(
  element: HTMLElement | Window,
  eventType: string,
  handler: (ev: unknown) => void,
): () => void {
  element.addEventListener(eventType, handler);
  return () => element.removeEventListener(eventType, handler);
}

export class DTS {
  dts: DTSBase;

  elem: HTMLInputElement;

  wrapper: HTMLDivElement;

  header: HTMLDivElement;

  body: HTMLDivElement;

  footer: HTMLDivElement;

  visible: boolean;

  config: Config;

  cleanUpFuncs: DefaultObj<Func[]>;

  constructor(
    arg0: { element: string | HTMLInputElement } & Partial<Config>,
    arg1?: DTSBase | MakeDTSBase[0],
    ...args: RemoveFirst<MakeDTSBase>
  ) {
    const { element: elemArg, ...rest } = arg0;
    const dts = arg1 instanceof DTSBase ? arg1 : makeDts(arg1 || {}, ...args);

    let elem: HTMLInputElement | null;
    if (typeof elemArg === "string") {
      elem = D.querySelector(elemArg);
      if (!elem) throw Error(`"${elemArg}" not found.`);
    } else {
      elem = elemArg;
    }

    const wrapper = createEl(div);
    this.config = { ...defaultConfig, ...rest };
    this.dts = dts;
    this.elem = elem;
    this.visible = false;
    this.wrapper = wrapper;
    this.header = createAndAppend(wrapper, div);
    this.body = createAndAppend(wrapper, div);
    this.footer = createAndAppend(wrapper, div);
    this.cleanUpFuncs = defaultObj(() => []);
    this.init();
  }

  inputElemHandler(e: FocusEvent) {
    const { type, relatedTarget } = e;
    const { wrapper, visible, elem, dts, config } = this;

    if (type === "focus" && !visible) {
      this.handleVisible(true);
      const parts = elem.value.split(/\s*,\s*/);
      const [datePart, timePart] = [parts.at(0), parts.at(-1)];
      if (datePart && config.showDate) {
        dts.updateState(dts.lib.parseDate(datePart, config.dateFormat));
      }
      if (timePart && config.showTime) {
        dts.updateState(dts.lib.parseTime(timePart, config.timeFormat));
      }
    } else if (type === "blur" && visible) {
      if (!(relatedTarget && wrapper.contains(relatedTarget as Node))) {
        // TODO: remove setTimeout, not necessar
        setTimeout(() => {
          this.handleVisible(false);
          dts.save();
          elem.blur();
        }, 100);
      }
    }
  }

  setPosition() {
    const { config, wrapper, elem } = this;
    const htmlRoot = D.firstElementChild as HTMLHtmlElement;
    const minTopSpace = 300;
    const { top: boxTop, left: boxLeft } = getOffset(elem);

    const { paddingX, paddingY, direction } = config;
    const top = boxTop + elem.offsetHeight + paddingY || 5;
    const left = boxLeft + paddingX || 5;
    const bottom = htmlRoot.clientHeight - boxTop + paddingY || 5;

    wrapper.style.left = `${left}px`;
    if (boxTop > minTopSpace && direction !== "BOTTOM") {
      wrapper.style.bottom = `${bottom}px`;
      wrapper.style.top = "";
    } else {
      wrapper.style.top = `${top}px`;
      wrapper.style.bottom = "";
    }
  }

  handleVisible(show: boolean) {
    const { wrapper, dts } = this;

    if (show && !D.contains(wrapper)) {
      this.render(dts.getHeaderValues());
      this.render(dts.getBodyValues());
      this.render(dts.getFooterValues());
      D.body.appendChild(wrapper);
      this.visible = true;
    } else if (!show && D.contains(wrapper)) {
      D.body.removeChild(wrapper);
      this.visible = false;
    }
  }

  setInputValue() {
    const { config, dts } = this;
    const { bodyType, ...value } = dts.state;
    const strings: string[] = [];
    if (config.showDate) {
      strings.push(dts.lib.renderDate(value, config.dateFormat));
    }
    if (config.showTime) {
      strings.push(dts.lib.renderTime(value, config.timeFormat));
    }

    this.elem.value = strings.join(", ");
  }

  setEventHandlers() {
    const { dts, cleanUpFuncs, config, elem, wrapper } = this;
    const { funcs } = cleanUpFuncs;
    funcs.forEach((func) => func());

    const focusHandler = this.inputElemHandler.bind(this);
    const mouseHandler = () => {
      setTimeout(() => this.elem.focus(), 50);
    };

    funcs.push(
      addHandler(elem, "focus", focusHandler),
      addHandler(elem, "blur", focusHandler),
      addHandler(wrapper, "mouseup", mouseHandler),
      addHandler(wrapper, "touchend", mouseHandler),
      addHandler(window, "resize", this.setPosition.bind(this)),

      dts.addHandler(["date"], () => {
        if (config.showDate) this.setInputValue();
      }),
      dts.addHandler(["hours", "minutes", "seconds"], () => {
        this.render(dts.getFooterValues());
        if (config.showTime) this.setInputValue();
      }),
      dts.addHandler(["bodyType", "fullYear", "month"], () => {
        this.render(dts.getHeaderValues());
        this.render(dts.getBodyValues());
      }),
    );
  }

  getBodyDateGrid(onDateClick: Func) {
    let dateGrid = (this.body as any).dateGrid as HTMLDivElement | undefined;
    if (!dateGrid) {
      dateGrid = makeGrid(7, 7, this.config.classes.body.days, onDateClick);
      for (let i = 0; i < 7; i += 1) {
        const el = dateGrid.children[0].children[i] as HTMLElement;
        setText(el, this.dts.lib.getWeekdayStr(i).slice(0, 2));
        el.onclick = null;
      }
      (this.body as any).dateGrid = dateGrid;
    }
    return dateGrid;
  }

  getBodyMonthGrid(onMonthClick: Func) {
    let monthGrid = (this.body as any).monthGrid as HTMLDivElement | undefined;
    if (!monthGrid) {
      const { dts, config } = this;
      monthGrid = makeGrid(3, 4, config.classes.body.months, onMonthClick);
      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 4; j += 1) {
          const el = monthGrid.children[i].children[j] as HTMLElement;
          const val = 4 * i + j;
          setText(el, dts.lib.getMonthStr(val, true));
          el.dataset.value = val.toFixed();
        }
      }
      (this.body as any).monthGrid = monthGrid;
    }
    return monthGrid;
  }

  getBodyYearGrid(oneYearClick: Func) {
    let yearGrid = (this.body as any).yearGrid as HTMLDivElement | undefined;
    if (!yearGrid) {
      yearGrid = makeGrid(3, 4, this.config.classes.body.years, oneYearClick);
      (this.body as any).yearGrid = yearGrid;
    }
    return yearGrid;
  }

  init() {
    const { wrapper, header, body, footer, config } = this;
    const { header: hCls, body: bCls, footer: fCls } = config.classes;

    // wrapper
    wrapper.tabIndex = -1;
    addClass(wrapper, config.classes.wrapper || []);
    this.setPosition();

    // header
    empty(header);
    const headerClasses = [hCls.left, hCls.center, hCls.right];
    addClass(header, hCls.wrapper);
    for (let i = 0; i < 3; i += 1) {
      const cell = createAndAppend(header, div);
      addClass(cell, headerClasses[i]);
    }
    header.children[0].innerHTML = "&lt;";
    header.children[2].innerHTML = "&gt;";

    // bod
    addClass(body, bCls.wrapper || []);

    // footer
    makeRow(footer, "HH:", "hours", 23, fCls);
    makeRow(footer, "MM:", "minutes", 59, fCls);
    makeRow(footer, "SS:", "seconds", 59, fCls);
    addClass(footer, fCls.wrapper);

    this.setEventHandlers();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderHeader(_val: RenderValueSection) {
    const { data, handler } = _val;
    const { header } = this;
    if (!header.children[1]) throw new Error("Header not initialized");

    const { YEARS, MONTHS } = BodyType;
    const { state, lib } = this.dts;
    const { bodyType: type, month, fullYear: year } = state;
    let txt = "";
    if (type === YEARS) {
      const start = year + 10 - (year % 10);
      txt = `${start - 10}-${start - 1}`;
    } else if (type) {
      txt = type === MONTHS ? `${year}` : `${lib.getMonthStr(month)} ${year}`;
    }
    for (let i = 0; i < 3; i += 1) {
      const child = header.children[i] as HTMLElement;
      child.onclick = () => handler(data[i]);
      if (i === 1) setText(child, txt);
    }
  }

  renderBody(val: RenderValueSection) {
    const { data, handler } = val;

    const { bodyType } = this.dts.state;
    const handlerr = (e: Event) => {
      const el = e.target as HTMLElement;
      handler(el.dataset.value || "");
    };

    const grid: HTMLElement | undefined = (
      {
        [BodyType.DATES]: () => this.getBodyDateGrid(handlerr),
        [BodyType.MONTHS]: () => this.getBodyMonthGrid(handlerr),
        [BodyType.YEARS]: () => this.getBodyYearGrid(handlerr),
      }[bodyType] || (() => {})
    )();
    if (!grid) throw new Error(`Invalid bodyType "${bodyType}"`);

    if (bodyType !== BodyType.MONTHS)
      setGridContent(bodyType, grid, data, this.config.classes.body.col);
    empty(this.body).appendChild(grid);
  }

  renderFooter(_val: RenderValueSection) {
    const { footer } = this;

    if (!this.config.showTime) {
      footer.style.display = "none";
    } else {
      const { data, handler } = _val;

      const children = footer.querySelectorAll("input");
      for (let i = 0; i < data.length && i < children.length; i += 1) {
        const child = children[i];
        child.value = data[i];
        (child as any).setValueCol(padStart(data[i]));
        child.onchange = () => {
          handler(`${i}:${child.value}`);
        };
      }
    }
  }

  render(val: RenderValue) {
    const { section, ...rest } = val;
    const func = {
      header: () => this.renderHeader(rest),
      body: () => this.renderBody(rest),
      footer: () => this.renderFooter(rest),
    }[section];
    if (func) func();
  }
}

export default DTS;
