import { chromium, Download } from "playwright";

(async () => {
  // 1️⃣ Launch browser
  const browser = await chromium.launch({ headless: false }); // use true for background mode
  const context = await browser.newContext({
    acceptDownloads: true, // important for downloading
  });
  const page = await context.newPage();

  // 2️⃣ Navigate to the website
  await page.goto("https://connectonline.asic.gov.au/RegistrySearch/");

  // 3️⃣ Perform search (adjust selector & input as needed)
  await page.fill('input[name="search"]', "report 2025");
  await page.click('button[type="submit"]');

  // 4️⃣ Wait for results
  await page.waitForSelector(".results");

  // 5️⃣ Find and download files with a specific extension (.pdf, .xlsx, etc.)
  const links = await page.$$eval("a", (anchors) =>
    anchors
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((href) => href.endsWith(".pdf") || href.endsWith(".xlsx"))
  );

  console.log(`Found ${links.length} download links`);

  // 6️⃣ Download each file
  for (const link of links) {
    console.log(`Downloading: ${link}`);
    const [download] = await Promise.all([
      page.waitForEvent("download"), // wait for download to trigger
      page.click(`a[href="${link}"]`), // trigger the download
    ]);

    // Save to local folder
    const suggestedName = download.suggestedFilename();
    await download.saveAs(`downloads/${suggestedName}`);
  }

  await browser.close();
})();