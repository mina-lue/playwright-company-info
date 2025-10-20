import { Page } from "playwright-core";
import * as dotenv from "dotenv";

dotenv.config();

export const pay = async (page: Page): Promise<Boolean> => {
  // card information from .env
  const cardOwnerName = process.env.CARD_OWNER_NAME || "Upwork";
  const cardNumber = process.env.CARD_NUMBER;
  const cardCVC = process.env.CARD_CVC;
  const cardExpYear = process.env.CARD_EXP_YEAR || 2028;
  const cardExpMonth = process.env.CARD_EXP_MONTH || 10;

  console.log("💳 Filling in payment details...");

  try {
    async function getANZFrame(page: Page, timeout = 15000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const frame = page
          .frames()
          .find((f) =>
            f
              .url()
              .includes(
                "payment.anzworldline-solutions.com.au/hostedtokenization"
              )
          );
        if (frame) return frame;
        await page.waitForTimeout(500); // check every 0.5s
      }
      throw new Error("ANZ payment iframe not found or not yet loaded");
    }

    const frame = await getANZFrame(page);

    page.waitForTimeout(3000);

    await frame.fill("#payment-cardnumber", cardNumber!);
    await frame.fill("#payment-cardholdername", cardOwnerName);
    await frame.selectOption(
      "#payment-cardexpirationmonth",
      cardExpMonth.toString()
    );
    await frame.selectOption(
      "#payment-cardexpirationyear",
      cardExpYear.toString()
    );

    await frame.fill("#payment-cvc", cardCVC!);



    // Wait for the iframe to appear
const frameEl = await page.waitForSelector('#bnConnectionTemplate\\:r1\\:3\\:payNowInline', { timeout: 30000 });
const frame2 = await frameEl.contentFrame();
if (!frame2) throw new Error("Payment iframe not loaded");

// Wait for the submit button inside the iframe
const submitBtn = await frame2.waitForSelector('a.af_button_link:has-text("Submit")', { timeout: 60000 });

// Scroll into view and click
await submitBtn.scrollIntoViewIfNeeded();
await submitBtn.click();


    await page.click('a.af_button_link:has-text("Submit")');

    console.log("✅ Payment details submitted.");
    return true;
  } catch (err) {
    console.log("⚠️ Could not make payment!", err);
    return false;
  }
};
