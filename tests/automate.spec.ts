import { test, expect } from "@playwright/test";

test("search ASIC Registry and wait for results table", async ({ page }) => {
  test.setTimeout(160000); // In case  network is slower!
  await page.goto("https://connectonline.asic.gov.au/RegistrySearch");

    // 🔄 Add a short delay before interacting
  await page.waitForTimeout(100); // <-- 1 second pause
  console.log('⏳ Waiting 1s before typing search text...');

  // Select search type
await page.locator(
  '#bnConnectionTemplate\\:pt_s5\\:templateSearchTypesListOfValuesId\\:\\:content'
).selectOption({ label: 'Organisation and Business Names' });


    // 🔄 Add a short delay before interacting
  await page.waitForTimeout(100); // <-- 1 second pause
  console.log('⏳ Waiting 1s before typing search text...');
  // Fill search input

  const searchInput = page.locator(
    "id=bnConnectionTemplate:pt_s5:templateSearchInputText::content"
  );
  await searchInput.fill('050293626')

    // 🔄 Add a short delay before interacting
  await page.waitForTimeout(1000); // <-- 1 second pause
  console.log('⏳ Waiting 1s before typing search text...');

  // Click Go
  await searchInput.press("Enter");
  console.log('✅ Clicked "Go". Waiting for results table...');


  await expect(page.getByText("Information for purchase", { exact: false }))
  .toBeVisible({ timeout: 90000 });

console.log("✅ 'Information for purchase' section is visible!");


// Wait for the table row to appear 
const row = page.locator('tr:has-text("Current and historical company information")'); 
/*
await row.waitFor({ state: 'visible', timeout: 60000 }); 
// Locate the checkbox input inside that row 
const checkbox = row.locator('input.af_selectBooleanCheckbox_native-input'); 
// Ensure it exists and is attached to DOM await 
checkbox.waitFor({ state: 'attached', timeout: 20000 }); 
// Scroll the checkbox into view (very important for ADF UIs) 
await checkbox.scrollIntoViewIfNeeded(); 

// Click the checkbox using JavaScript, simulating a real browser event 
await checkbox.click(); 
console.log('✅ Checkbox clicked via JS event');


await page.waitForTimeout(100); // <-- 1 second pause
  console.log('⏳ Waiting 1s before typing search text...');


// Now click it
await checkbox.click();
await page.waitForTimeout(900); // <-- 1 second pause
  console.log('⏳ Waiting 1s before typing search text...');

await checkbox.click();
console.log("✅ Checkbox clicked");
*/

await row.waitFor({ state: 'visible', timeout: 60000 });

// Find the label inside the row
const label = row.locator('label.af_selectBooleanCheckbox_item-text');

// Scroll the row (not just the label) into view
await row.scrollIntoViewIfNeeded();

// Small pause to allow ADF’s internal scrolling animations
await page.waitForTimeout(500);

// Try clicking the label normally
try {
  await label.click({ timeout: 5000 });
  console.log("✅ Label clicked normally");
} catch (e) {
  console.warn("⚠️ Normal click failed, retrying with JavaScript...");
  // Use JavaScript to dispatch a real DOM click
  const elHandle = await label.elementHandle();
  await page.evaluate((el: HTMLElement) => el.click(), elHandle);
  console.log("✅ Label clicked via JS fallback");
}

// Wait for ADF to re-render button states
await page.waitForTimeout(1500);




await page.waitForTimeout(300); // <-- 1 second pause
  console.log('⏳ Waiting 1s before clicking add to cart...');



  

  // Locate the button by its ID
  const addToCartBtn = page.locator(
    'button#bnConnectionTemplate\\:r1\\:0\\:addToCartButton'
  );

  // Wait until button is attached and visible
  await addToCartBtn.waitFor({ state: "visible", timeout: 30000 });

  await expect(addToCartBtn).toBeEnabled();

  //await expect(addToCartBtn).toBeEnabled();
  // Click the button (force in case of overlays)
  await addToCartBtn.click({ force: true });

  console.log("✅ 'Add To Cart' button clicked!");


// 🟡 Wait for any confirmation dialog to appear (ADF usually adds one dynamically)
await page.waitForSelector('div[id*="ok"]:visible', { timeout: 60000 });

// Find the visible OK button within a visible dialog
const visibleOkButton = page.locator(
  'div:visible a.af_button_link:has-text("OK")'
);

// Confirm it’s visible and interactable
await visibleOkButton.waitFor({ state: "visible", timeout: 30000 });

// Small pause for ADF fade-in animations
await page.waitForTimeout(500);

// Click OK using JS and fallback if Playwright’s click is ignored
try {
  await visibleOkButton.click({ force: true });
  console.log("🟢 Clicked visible OK button successfully");
} catch (err) {
  console.warn("⚠️ Normal click failed, retrying with JavaScript...");
  await page.evaluate((el) => el.click(), await visibleOkButton.elementHandle());
  console.log("✅ Clicked visible OK button via JS fallback");
}

  
  const checkoutBtn = page.locator(
    'button#bnConnectionTemplate\\:r1\\:0\\:cb6'
  );

  await expect(checkoutBtn).toBeEnabled();

  await page.waitForTimeout(400); // <-- 1 second pause
   console.log('⏳ Waiting 1s before clicking checkout...');

  await checkoutBtn.click({force: true});

  console.log("✅ 'Checkout' button clicked!");
 
  
  // 🕒 Wait for the payment page to render
await expect(
  page.locator('text=You are making a payment to the Australian Securities and Investments Commission')
).toBeVisible({ timeout: 60000 });
console.log("✅ Payment page rendered");

// 🟡 Wait for Pay Now button to become available
const payNowBtn = page.locator('button#bnConnectionTemplate\\:r1\\:1\\:cb6');

// Wait until it's attached, visible, and enabled
await payNowBtn.waitFor({ state: 'visible', timeout: 60000 });
await expect(payNowBtn).toBeEnabled();

// Small delay to let ADF finish animations
await page.waitForTimeout(500);

// Click the Pay Now button
await payNowBtn.click({ force: true });
console.log("💰 'Pay Now' button clicked successfully!");



// Email Address input
const emailInput = page.locator('input#bnConnectionTemplate\\:r1\\:2\\:emailAddress\\:\\:content');
await emailInput.waitFor({ state: 'visible', timeout: 60000 });
await emailInput.fill('test@example.com');

// Confirm Email input
const emailCopyInput = page.locator('input#bnConnectionTemplate\\:r1\\:2\\:emailAddressCopy\\:\\:content');
await emailCopyInput.waitFor({ state: 'visible', timeout: 60000 });
await emailCopyInput.fill('test@example.com');

// Locate the Next button directly by its correct ID
const nextButton = page.locator('button:has-text("Next")');

// Wait for it to be visible and enabled
await nextButton.waitFor({ state: 'visible', timeout: 60000 });
await expect(nextButton).toBeEnabled();

// Scroll into view to avoid viewport issues
await nextButton.scrollIntoViewIfNeeded();

// Click the button
await nextButton.click({ force: true });

console.log("✅ 'Next' button clicked successfully!");


// Wait for any visible dialog that might contain the OK button
const okButton = page.locator('div:visible a.af_button_link:has-text("OK")');

// Wait until it's visible and enabled
await okButton.waitFor({ state: 'visible', timeout: 60000 });

// Small pause for ADF animations
await page.waitForTimeout(300);

// Click the OK button using Playwright
await okButton.click({ force: true });

console.log("✅ Clicked the visible 'OK' button successfully");



  await page.pause();
});
