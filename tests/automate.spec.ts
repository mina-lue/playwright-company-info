import { test, expect } from '@playwright/test';

test('purchase document', async ({ page }) => {
  const ACN = '050293626'
  await page.goto(`https://connectonline.asic.gov.au/RegistrySearch/faces/landing/panelSearch.jspx?searchTab=search&searchText=${ACN}&searchType=OrgAndBusNm`);

  const cbxId = 'bnConnectionTemplate:r1:1:t1:1:sbc3::content';
  const cartId = 'bnConnectionTemplate:r1:1:addToCartButton';
  const checkoutId = 'bnConnectionTemplate:r1:1:cb6';


  const checkBox = page.locator(`id=${cbxId}`);
  const addToCartBtn = page.locator(`id=${cartId}`);
  const checkoutBtn = page.locator(`id=${checkoutId}`);

  await addToCartBtn.waitFor({ state: 'visible', timeout: 30000 });
  

  await checkBox.check({ force: true });
  await expect(checkBox).toBeChecked();




  // await expect(page).toHaveTitle(/Search/);

  /*
    await expect(selectLocator).toBeVisible();

    console.log("Selecting option with value '1'...");
    await selectLocator.selectOption({ value: '1' });

    const selectedValue = await selectLocator.inputValue();
    await expect(selectedValue).toBe('1');

    */


});

/*

test('find company', async ({ page }) => {
  await page.goto("https://connectonline.asic.gov.au/RegistrySearch/");

  const selectId = 'bnConnectionTemplate:pt_s5:templateSearchTypesListOfValuesId::content';
  const selectLocator = page.locator(`#${selectId}`);


    await expect(selectLocator).toBeVisible();

    console.log("Selecting option with value '2'...");
    await selectLocator.selectOption({ value: '2' });

    const selectedValue = await selectLocator.inputValue();
    await expect(selectedValue).toBe('2');
  //await page.fill('input[name="search"]', "report 2025");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Search Company/);
});

*/
/*
test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
*/
