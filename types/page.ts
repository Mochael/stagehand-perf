import type {
  Browser as PlaywrightBrowser,
  BrowserContext as PlaywrightContext,
  Page as PlaywrightPage,
  Locator,
} from "playwright";
import { z } from "zod/v3";
import type {
  ActOptions,
  ActResult,
  ExtractOptions,
  ExtractResult,
  ObserveOptions,
  ObserveResult,
} from "./stagehand";

export const defaultExtractSchema = z.object({
  extraction: z.string(),
});

export const pageTextSchema = z.object({
  page_text: z.string(),
});

export interface Page extends Omit<PlaywrightPage, "on"> {
  act(action: string): Promise<ActResult>;
  act(options: ActOptions): Promise<ActResult>;
  act(observation: ObserveResult): Promise<ActResult>;

  extract(
    instruction: string,
  ): Promise<ExtractResult<typeof defaultExtractSchema>>;
  extract<T extends z.AnyZodObject>(
    options: ExtractOptions<T>,
  ): Promise<ExtractResult<T>>;
  extract(): Promise<ExtractResult<typeof pageTextSchema>>;

  observe(): Promise<ObserveResult[]>;
  observe(instruction: string): Promise<ObserveResult[]>;
  observe(options?: ObserveOptions): Promise<ObserveResult[]>;

  /**
   * Performs an action or extraction on the first available element from a list of selectors.
   */
  // Action methods → always return void
  perform(options: PerformActionOptions): Promise<void>;
  // Extraction without schema (options) → returns string or undefined
  perform(options: PerformExtractStringOptions): Promise<string | undefined>;
  // Extraction with schema (options) → returns shaped type or undefined
  perform<T extends z.AnyZodObject>(
    options: PerformExtractSchemaOptions<T>,
  ): Promise<z.infer<T> | undefined>;

  on: {
    (event: "popup", listener: (page: Page) => unknown): Page;
  } & PlaywrightPage["on"];
}

// Empty type for now, but will be used in the future
export type BrowserContext = PlaywrightContext;

// Empty type for now, but will be used in the future
export type Browser = PlaywrightBrowser;

// New options-style APIs for named-like args
export type PerformActionOptions = {
  locators: Locator[];
  method:
    | "click"
    | "dblclick"
    | "hover"
    | "focus"
    | "fill"
    | "press"
    | "check"
    | "uncheck"
    | "selectOption";
  description?: string;
  inputValue?: string;
  timeout?: number;
};

export type PerformExtractBase = {
  locators: Locator[];
  method:
    | "innerText"
    | "textContent"
    | "inputValue"
    | "innerHTML"
    | "allTextContents"
    | "getAttribute";
  description?: string;
  inputValue?: string; // used as attribute name for getAttribute
};

export type PerformExtractStringOptions = PerformExtractBase & {
  schema?: undefined;
  extractionTransform?: undefined;
  timeout?: number;
};

export type PerformExtractSchemaOptions<T extends z.AnyZodObject> =
  PerformExtractBase & {
    schema: T;
    extractionTransform: (raw: string) => z.infer<T> | Promise<z.infer<T>>;
    timeout?: number;
  };
