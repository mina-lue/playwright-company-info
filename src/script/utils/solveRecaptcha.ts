import { Solver } from '2captcha';
import { Page } from 'playwright-core';
import "dotenv/config"


export async function solveRecaptcha(page: Page): Promise<void> {
  // Create 2Captcha solver
  console.log("🧠 Creating 2Captcha solver instance...");
  const solver = new Solver(process.env.TWOCAPTCHA_API_KEY || "");
  if (!process.env.TWOCAPTCHA_API_KEY) {
    throw new Error("Please set TWOCAPTCHA_API_KEY in your environment.");
  }

  // Find the reCAPTCHA sitekey on the page
  const siteKey = await page.getAttribute('div[data-sitekey], .g-recaptcha', 'data-sitekey').catch(() => null);
  if (!siteKey) throw new Error("Could not find reCAPTCHA sitekey on page.");
  console.log("🧩 Found sitekey:", siteKey);

  // Send to 2Captcha for solving
  console.log("⏳ Sending CAPTCHA to 2Captcha...");
  const response = await solver.recaptcha(
    siteKey,
     page.url()
  );

  const captchaToken = response.data;
  console.log("🟢 Captcha solved, token received (truncated):", captchaToken.slice(0, 20) + "...");

  // Inject token into page
  await page.evaluate((token) => {
    let textarea = document.querySelector<HTMLTextAreaElement>('#g-recaptcha-response');
    if (!textarea) {
      textarea = document.createElement('textarea');
      textarea.id = 'g-recaptcha-response';
      document.body.appendChild(textarea);
    }
    textarea.style.display = 'block';
    textarea.value = token;
  }, captchaToken);

  // Optionally, trigger the form submission if necessary
  const submitBtn = await page.$('button:has-text("Verify")');
  if (submitBtn) {
    console.log("🧾 Submitting form...");
    await submitBtn.click();
  } else {
    await triggerSiteAfterToken(page, captchaToken);
  }
}

// call this after injecting the token into #g-recaptcha-response
async function triggerSiteAfterToken(page: Page, token: string): Promise<boolean> {
  // 1) If page has element with data-callback, call that callback with the token
  const callbackResult = await page.evaluate((tkn) => {
    try {
      // prefer the element that contains the data-callback attribute (common pattern)
      const el = document.querySelector<HTMLElement>('[data-callback]');
      const cbName = el?.getAttribute('data-callback');
      if (cbName && typeof (window as any)[cbName] === 'function') {
        (window as any)[cbName](tkn);
        return { invoked: true, name: cbName };
      }

      // some pages store callback on grecaptcha widget id, try grecaptcha if available
      if ((window as any).grecaptcha && typeof (window as any).grecaptcha.execute === 'function') {
        // try to execute; many implementations rely on grecaptcha.execute() to open/complete flow
        try { (window as any).grecaptcha.execute(); return { invoked: true, name: 'grecaptcha.execute' }; } catch {}
      }

      return { invoked: false };
    } catch (e) {
      return { invoked: false, error: String(e) };
    }
  }, token);

  if (callbackResult && (callbackResult as any).invoked) {
    console.log('✅ Called page callback:', (callbackResult as any).name ?? '<unknown>');
    return true;
  }

  // 2) Set any custom hidden token field 
  await page.evaluate((tkn) => {
    const alt = document.querySelector<HTMLInputElement>('#recaptcha-token');
    if (alt) {
      alt.value = tkn;
      alt.dispatchEvent(new Event('input', { bubbles: true }));
      alt.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, token);

  // any of the common fallback selectors to try clicking
  const fallbackSelectors = [
    '#recaptcha-verify-button',
    'button:has-text("Verify")',
    'button:has-text("Submit")',
    'button:has-text("Continue")',
    'button[type="submit"]',
    'input[type="submit"]',
    'a.af_button_link:has-text("OK")'
  ];

  for (const sel of fallbackSelectors) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      // scroll and try click
      try { await el.scrollIntoViewIfNeeded(); } catch {}
      try {
        await el.click({ force: true });
        console.log('✅ Clicked fallback selector:', sel);
        await page.waitForTimeout(300); // allow site to react
        return true;
      } catch (clickErr) {
        // attempt JS fallback click
        try {
          const handle = await el.evaluateHandle((e: any) => e);
          await page.evaluate((e: HTMLElement) => (e as any).click(), handle);
          console.log('✅ JS-clicked fallback selector:', sel);
          await page.waitForTimeout(300);
          return true;
        } catch {}
      }
    } catch (e) {
      // ignore and continue to next selector
    }
  }

  console.log('⚠️ Token injected but no callback or submit control was triggered.');
  return false;
}

