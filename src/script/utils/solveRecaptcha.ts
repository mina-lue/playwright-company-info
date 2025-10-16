import { Solver } from '2captcha';
import { Page } from 'playwright-core';
import sharp from "sharp"
import "dotenv/config"

export async function mergeCaptchaFrames(frames: Buffer[]): Promise<Buffer> {
  const images = await Promise.all(
    frames.map((frame) => sharp(frame).ensureAlpha().raw().toBuffer({ resolveWithObject: true })),
  )

  const { info } = images[0]!
  const { width, height, channels } = info
  const totalLength = width * height * channels

  // Accumulate float32 buffer
  const accum = new Float32Array(totalLength)

  for (const { data } of images) {
    for (let i = 0; i < totalLength; i += channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if(!(a && r && g && b)) break;
      const alphaFactor = a / 255
      const isMostlyWhite = r > 200 && g > 200 && b > 200

      accum[i]! += isMostlyWhite ? 0 : r * alphaFactor * 1.5 // R
      accum[i + 1]! += isMostlyWhite ? 0 : g * alphaFactor * 0.5 // G
      accum[i + 2]! += isMostlyWhite ? 0 : b * alphaFactor * 0.5 // B
      accum[i + 3]! += a
    }
  }

  // Normalize and convert to output buffer
  const output = Buffer.alloc(totalLength)
  for (let i = 0; i < totalLength; i++) {
    output[i] = Math.min(255, accum[i]! / frames.length)
  }

  return sharp(output, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toBuffer()
}

async function captureCaptchaFrames(page: Page, selector: string, count = 5, delay = 300): Promise<Buffer[]> {
  await page.waitForTimeout(3000)
  const frame = page.frameLocator('iframe[name^="c-"]')

  const captchaImg = frame.locator(selector).first()
  await captchaImg.waitFor({ state: "visible", timeout: 10000 });

  await captchaImg.scrollIntoViewIfNeeded()
  await page.waitForTimeout(100)

  const box = await captchaImg.boundingBox()
  if (!box) throw new Error("Could not determine bounding box for captcha image")

  const frames: Buffer[] = []

  for (let i = 0; i < count; i++) {
    try {
      const frame = await page.screenshot({ clip: box })
      frames.push(frame)
    } catch (e) {
      console.error(`Failed to capture frame #${i + 1}:`, e)
    }
    await page.waitForTimeout(delay)
  }
  if (frames.length < 2) throw new Error("Not enough frames captured.")
  return frames
}

export async function solveCaptcha(page: Page): Promise<boolean> {
  const TwoCaptchaApiKey = await process.env.TWOCAPTCHA_API_KEY;
  const solver = new Solver(TwoCaptchaApiKey || "")

  for (let attempts = 0; attempts < 5; attempts++) {
    try {
      if (await page.locator('tr:has-text("Current and historical company information")').isVisible({ timeout: 2000 })) {
        return true
      }

      console.log(`Attempting to solve captcha, attempt #${attempts + 1}`)

      const frames = await captureCaptchaFrames(page, "img.rc-image-tile-33", 5, 300)
      const merged = await mergeCaptchaFrames(frames)

      const captchaBase64 = merged.toString("base64")
      const result = await solver.imageCaptcha(captchaBase64)
      const captchaCode = result.data

      console.log(`Captcha solved: ${captchaCode}`)

      //await page.fill("#captchaCode", captchaCode)
      await page.click('#recaptcha-verify-button')


      try {
        await page.waitForSelector("#quickSearchSelect", { timeout: 5000 })
        return true
      } catch {
        console.log("Captcha submit failed, retrying...")
      }
    } catch (err) {
      console.error(`Captcha attempt #${attempts + 1} failed:`, err)
    }
  }

  throw new Error("Max captcha attempts reached.")
}