declare module "table-master";
declare function printTable(
  printArray: Record<string, any>[],
  format: ?string,
  preProcessor: ?((any) => str),
): void;
