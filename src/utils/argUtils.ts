import minimist from "minimist";
import { ProcessArgs } from "../types/ProcessArgs.js";

export const getArg = (): ProcessArgs => {
  const argv = minimist(process.argv.slice(2));
  return argv as ProcessArgs;
};
