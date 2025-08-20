import { test } from "@playwright/test";
import { Stagehand, Page } from "@browserbasehq/stagehand";
import StagehandConfig from "@/evals/deterministic/stagehand.config";
import { z } from "zod/v3";

test.describe("StagehandPage - perform", () => {
  test("should extract heading text using perform()", async () => {
    const stagehand = new Stagehand(StagehandConfig);
    await stagehand.init();

    let page = stagehand.page;

    await page.goto("https://www.browserbase.com/");

    await page.perform({
      locators: [page.locator("header span:nth-of-type(2)")],
      method: "click",
      timeout: 5000,
      description: `Click the Hamburger menu in the navigation bar`,
    });

    // Prepare to capture popup and switch active page after click
    const popupPromise: Promise<Page> = new Promise((resolve) => {
      page.on("popup", async (newPage) => {
        await newPage.waitForLoadState();
        resolve(newPage);
      });
    });

    await page.perform({
      locators: [
        page.locator("role=navigation").locator('role=link[name="Docs"]'),
        page.locator(
          "xpath=/html[1]/body[1]/div[1]/main[1]/header[1]/div[1]/nav[1]/ul[1]/li[5]/a[1]",
        ),
      ],
      method: "click",
      timeout: 5000,
      description: `Click the Docs link`,
    });

    // Switch to the newly opened popup page
    page = await popupPromise;

    await page.perform({
      locators: [page.locator("#search-bar-entry")],
      method: "click",
      timeout: 5000,
      description: `Click the search bar`,
    });

    await page.perform({
      locators: [],
      method: "fill",
      timeout: 5000,
      description: `Fill the search bar with %inputValue%`,
      inputValue: "This is another test search value",
    });

    await page.perform({
      locators: [page.locator("#search-input")],
      method: "fill",
      timeout: 5000,
      description: `Fill the search bar with %inputValue%`,
      inputValue: "Testing search value",
    });

    await page.perform({
      locators: [page.locator("#search-input")],
      method: "press",
      timeout: 5000,
      description: `Press %inputValue% in the search bar`,
      inputValue: "Enter",
    });

    // await page
    //   .locator("role=navigation")
    //   .locator('role=link[name="Docs"]')
    //   .click();

    // await page.pause();

    await page.perform({
      locators: [
        // This should not work
        page.locator("#/use-cases/automating-form-submissions > a > div"),
      ],
      method: "click",
      timeout: 5000,
      description: `Click the Web Scraping link`,
    });

    await page.perform({
      locators: [
        // This should not work
        page.locator("#/use-cases/automating-form-submissions > a > div"),
        // This should work
        page.getByRole("link", { name: "Form Submissions" }).first(),
      ],
      method: "click",
      timeout: 5000,
      description: `Click the Form Submissions link`,
    });

    const value = await page.perform({
      locators: [
        page.locator(
          "xpath=/html[1]/body[1]/div[2]/div[2]/div[3]/div[2]/div[2]/span[1]",
        ),
        page.locator(
          "css=#content-area > div:nth-of-type(2) > span:nth-of-type(1)",
        ),
      ],
      method: "innerText",
      timeout: 5000,
      description: "Extract the inner text from the content area",
    });

    console.log("value", value);

    const value1 = await page.perform({
      locators: [page.locator("this is a fake locator")],
      method: "innerText",
      timeout: 5000,
      description: "Extract the inner text from the overview section",
    });

    console.log("value1", value1);

    const value2 = await page.perform({
      locators: [page.locator("this is a fake locator")],
      method: "innerText",
      timeout: 5000,
      description: "Extract the inner text from the overview section",
      schema: z.object({
        myExtraction: z.string(),
      }),
      extractionTransform: (raw: string) => ({ myExtraction: raw }),
    });

    console.log("value2", value2);

    const value3 = await page.perform({
      locators: [
        page.locator(
          "xpath=/html[1]/body[1]/div[2]/div[2]/div[3]/div[2]/div[2]/span[1]",
        ),
      ],
      method: "innerText",
      timeout: 5000,
      description: "Extract the inner text from the overview section",
      schema: z.object({
        myExtraction: z.string(),
      }),
      extractionTransform: (raw: string) => ({ myExtraction: raw }),
    });

    console.log("value", value);
    console.log("value1", value1);
    console.log("value2", value2);
    console.log("value3", value3);

    await stagehand.close();
  });
});
