import { DTS, defaultConfig } from "./ui";
import { DTSLib } from "./lib";
import { DTSBase } from "./base";

import "./dtsel.css";

if (typeof window !== "undefined") {
  (window as any).dtsel = {
    DTS,
    DTSLib,
    DTSBase,
    defaultConfig,
  };
}
