import { chromium } from "playwright";

export const fetchDocument = async (ACN : string ) : Promise<string> => {
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  page.setDefaultTimeout(160000);

  console.log("🌐 Navigating to ASIC Registry...");
  await page.goto("https://connectonline.asic.gov.au/RegistrySearch");

  await page.waitForTimeout(100);
  console.log("⏳ Waiting 100ms before typing search text...");

  // Select search type
  await page
    .locator(
      '#bnConnectionTemplate\\:pt_s5\\:templateSearchTypesListOfValuesId\\:\\:content'
    )
    .selectOption({ label: "Organisation and Business Names" });

  await page.waitForTimeout(100);
  console.log("⌨️ Filling search text...");

  const searchInput = page.locator(
    "id=bnConnectionTemplate:pt_s5:templateSearchInputText::content"
  );
  await searchInput.fill(ACN);

  await page.waitForTimeout(1000);
  console.log("🔍 Searching...");
  await searchInput.press("Enter");

  console.log('✅ Clicked "Go". Waiting for results table...');

  await page
    .getByText("Information for purchase", { exact: false })
    .waitFor({ state: "visible", timeout: 90000 });

  console.log("✅ 'Information for purchase' section is visible!");

  const row = page.locator(
    'tr:has-text("Current and historical company information")'
  );
  await row.waitFor({ state: "visible", timeout: 60000 });

  const label = row.locator("label.af_selectBooleanCheckbox_item-text");
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  try {
    await label.click({ timeout: 5000 });
    console.log("✅ Label clicked normally");
  } catch {
    console.warn("⚠️ Normal click failed, retrying with JavaScript...");
    const elHandle = await label.elementHandle();
    await page.evaluate((el) => el && (el as HTMLElement).click(), elHandle);
    console.log("✅ Label clicked via JS fallback");
  }

  await page.waitForTimeout(1500);

  const addToCartBtn = page.locator(
    "button#bnConnectionTemplate\\:r1\\:0\\:addToCartButton"
  );
  await addToCartBtn.waitFor({ state: "visible", timeout: 30000 });
  await addToCartBtn.click({ force: true });
  console.log("✅ 'Add To Cart' button clicked!");

  await page.waitForSelector('div[id*="ok"]:visible', { timeout: 60000 });
  const visibleOkButton = page.locator(
    'div:visible a.af_button_link:has-text("OK")'
  );
  await visibleOkButton.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(500);

  try {
    await visibleOkButton.click({ force: true });
    console.log("🟢 Clicked visible OK button successfully");
  } catch {
    console.warn("⚠️ Normal click failed, retrying with JavaScript...");
    await page.evaluate(
      (el) => el && (el as HTMLElement).click(),
      await visibleOkButton.elementHandle()
    );
    console.log("✅ Clicked visible OK button via JS fallback");
  }

  const checkoutBtn = page.locator("button#bnConnectionTemplate\\:r1\\:0\\:cb6");
  await checkoutBtn.waitFor({ state: "visible", timeout: 60000 });
  await page.waitForTimeout(800);
  await checkoutBtn.click({ force: true });
  console.log("✅ 'Checkout' button clicked!");

  await page
    .locator(
      "text=You are making a payment to the Australian Securities and Investments Commission"
    )
    .waitFor({ state: "visible", timeout: 60000 });
  console.log("✅ Payment page rendered");

  const payNowBtn = page.locator("button#bnConnectionTemplate\\:r1\\:1\\:cb6");
  await payNowBtn.waitFor({ state: "visible", timeout: 60000 });
  await payNowBtn.click({ force: true });
  console.log("💰 'Pay Now' button clicked successfully!");

  const emailInput = page.locator(
    "input#bnConnectionTemplate\\:r1\\:2\\:emailAddress\\:\\:content"
  );
  await emailInput.waitFor({ state: "visible", timeout: 60000 });
  await emailInput.fill("test@example.com");

  const emailCopyInput = page.locator(
    "input#bnConnectionTemplate\\:r1\\:2\\:emailAddressCopy\\:\\:content"
  );
  await emailCopyInput.waitFor({ state: "visible", timeout: 60000 });
  await emailCopyInput.fill("test@example.com");

  const nextButton = page.locator('button:has-text("Next")');
  await nextButton.waitFor({ state: "visible", timeout: 60000 });
  await nextButton.scrollIntoViewIfNeeded();
  await nextButton.click({ force: true });
  console.log("✅ 'Next' button clicked successfully!");

  const okButton = page.locator('div:visible a.af_button_link:has-text("OK")');
  await okButton.waitFor({ state: "visible", timeout: 60000 });
  await page.waitForTimeout(300);
  await okButton.click({ force: true });
  console.log("✅ Clicked the visible 'OK' button successfully");

  
  await nextButton.waitFor({ state: "visible", timeout: 60000 });
  await nextButton.click({ force: true });
  console.log("✅ 'Next' button clicked successfully!");

  console.log("🎉 Done! Script finished successfully.");
  await browser.close();

  return await 'file_path' // the path the document downloaded
}