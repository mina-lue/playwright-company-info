import { chromium, Download } from "playwright";

(async () => {
  // 1️⃣ Launch browser
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext({
    acceptDownloads: true, 
  });
  const page = await context.newPage();

  const ACN = '050293626'
  await page.goto(`https://connectonline.asic.gov.au/RegistrySearch/faces/landing/panelSearch.jspx?searchTab=search&searchText=${ACN}&searchType=OrgAndBusNm`);


  const cbxId = 'bnConnectionTemplate:r1:1:t1:1:sbc3::content';
  const cartId = 'bnConnectionTemplate:r1:1:addToCartButton';
  const checkoutId = 'bnConnectionTemplate:r1:1:cb6';

  const checkBox = page.locator(`id=${cbxId}`);
  const addToCartBtn = page.locator(`id=${cartId}`);
  const checkoutBtn = page.locator(`id=${checkoutId}`);


  try {
      await checkBox.check();
  } catch (error ) {
    console.log('error : ', error)
  }


  await browser.close();
})();