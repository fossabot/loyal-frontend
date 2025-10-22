import { IrysTableOfContents } from "./types";

export function createEmptyTableOfContents(): IrysTableOfContents {
  return {
    key: undefined,
    entries: [],
  };
}
