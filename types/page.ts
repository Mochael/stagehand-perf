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
  perform(
    locators: Locator[],
    method:
      | "click"
      | "dblclick"
      | "hover"
      | "focus"
      | "fill"
      | "press"
      | "check"
      | "uncheck"
      | "selectOption",
    timeout?: number,
    description?: string,
    inputValue?: string,
  ): Promise<void>;
  // Extraction without schema → returns string or undefined
  perform(
    locators: Locator[],
    method:
      | "innerText"
      | "textContent"
      | "inputValue"
      | "innerHTML"
      | "allTextContents"
      | "getAttribute",
    timeout?: number,
    description?: string,
    inputValue?: string,
  ): Promise<string | undefined>;
  // Extraction with schema → must also provide extractionTransform that maps string to schema type
  perform<T extends z.AnyZodObject>(
    locators: Locator[],
    method:
      | "innerText"
      | "textContent"
      | "inputValue"
      | "innerHTML"
      | "allTextContents"
      | "getAttribute",
    timeout: number | undefined,
    description: string | undefined,
    schema: T,
    extractionTransform: (raw: string) => z.infer<T> | Promise<z.infer<T>>,
    inputValue?: string,
  ): Promise<z.infer<T> | undefined>;

  on: {
    (event: "popup", listener: (page: Page) => unknown): Page;
  } & PlaywrightPage["on"];
}

// Empty type for now, but will be used in the future
export type BrowserContext = PlaywrightContext;

// Empty type for now, but will be used in the future
export type Browser = PlaywrightBrowser;
