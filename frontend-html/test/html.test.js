import puppeteer from "puppeteer";

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(0);

// Navigate the page to a URL
await page.goto("http://localhost:5500/", {
  waitUntil: "load",
  timeout: 5000,
});

// Set screen size (change headless to false to see the window)
await page.setViewport({ width: 1080, height: 1024 });

// Current dialog window answer
let removalAnswer = "dismiss";
let showedDialog = false;

// Monitor dialog window appearance
page.on("dialog", async (dialog) => {
  if (
    dialog.type() === "confirm" &&
    dialog.message() === "Are you sure you want to remove this article?"
  ) {
    removalAnswer === "accept" ? await dialog.accept() : await dialog.dismiss();
  }
  if (dialog.message() === "The article requires title and body.") {
    await dialog.accept();
    showedDialog = true;
  }
});

// Tests for the Page UI (HTML)
describe("Page UI", () => {
  // Check page title
  it("should have the correct title", async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toEqual("Article Management System");
  });

  // Check h1 text content
  it("should have the correct heading", async () => {
    const heading = await page.waitForSelector("h1");
    const headingValue = await heading.evaluate((el) => el.textContent);
    expect(headingValue).toEqual("Article Management System");
  });

  // Check if New article button exists
  it("should show the new article button", async () => {
    await page.locator("#btn-new").wait();
  });

  // Check if input fields appear after clicking on the New article button
  it("should show new article input fields", async () => {
    await page.locator("#btn-new").click();
    await page.locator('.title[data-article-id="new"]').wait();
    await page.locator('.body[data-article-id="new"]').wait();
    await page.locator('.published[data-article-id="new"]').wait();
  });

  // Check if cancel button hides the new div
  it("should hide the new article div", async () => {
    await page.locator("#btn-cancel").click();
    await page.waitForSelector('.article[data-article-id="new"]', {
      hidden: true,
    });
  });

  // Check if the new article is properly saved
  it("should save the new article", async () => {
    let lastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset?.articleId
    );
    await page.locator("#btn-new").click();
    await page.locator('.title[data-article-id="new"]').fill("Test title");
    await page.locator('.body[data-article-id="new"]').fill("Test body");
    await page.locator("#btn-save").click();
    await page.waitForResponse((response) => response.status() === 201);
    let newLastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset.articleId
    );
    expect(lastId).not.toEqual(newLastId);
  });

  // Check if the dialog is showed when the article title or body is missing
  it("should show a dialog window when the title or body is missing", async () => {
    await page.locator("#btn-new").click();
    await page.locator("#btn-save").click();
    expect(showedDialog).toEqual(true);
    await page.locator("#btn-cancel").click();
  });

  // Check if editing article saves the changes
  it("should save an edited article", async () => {
    let lastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset?.articleId
    );
    let title = await page.waitForSelector(
      `.title[data-article-id="${lastId}"]`
    );
    let currentTitle = await page.evaluate((el) => el.textContent, title);
    let body = await page.waitForSelector(`.body[data-article-id="${lastId}"]`);
    let currentBody = await page.evaluate((el) => el.textContent, body);

    await page.locator(`#btn-edit-${lastId}`).click();
    await page
      .locator(`.title[data-article-id="${lastId}"]`)
      .fill(currentTitle + 2);
    await page
      .locator(`.body[data-article-id="${lastId}"]`)
      .fill(currentBody + 2);
    await page.locator("#btn-save").click();
    await page.waitForResponse((response) => response.status() === 200);
    title = await page.waitForSelector(`p.title[data-article-id="${lastId}"]`);
    body = await page.waitForSelector(`p.body[data-article-id="${lastId}"]`);
    let newTitle = await page.evaluate((el) => el.textContent, title);
    let newBody = await page.evaluate((el) => el.textContent, body);
    expect(newTitle).toEqual(currentTitle + 2);
    expect(newBody).toEqual(currentBody + 2);
  });

  // Check if canceling article removal works (dialog box)
  it("should cancel article removal", async () => {
    removalAnswer = "dismiss";

    let lastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset?.articleId
    );
    await page.locator(`#btn-remove-${lastId}`).click();

    let newLastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset?.articleId
    );
    expect(lastId).toEqual(newLastId);
  });

  // Check if article removal works (dialog box)
  it("should remove an article", async () => {
    removalAnswer = "accept";

    let lastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset?.articleId
    );
    await page.locator(`#btn-remove-${lastId}`).click();
    await page.waitForResponse((response) => response.status() === 204);
    let newLastId = await page.$$eval(
      ".article",
      (articles) => articles[articles.length - 1]?.dataset?.articleId
    );
    expect(lastId).not.toEqual(newLastId);
    await browser.close();
  });
});
