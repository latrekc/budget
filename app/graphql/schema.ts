import { builder } from "./builder";
import "./types/statistic";
import "./types/transaction";

export const schema = builder.toSchema();
