import { builder } from "./builder";
import "./types/category";
import "./types/rates";
import "./types/statistic";
import "./types/transaction";

export const schema = builder.toSchema();
