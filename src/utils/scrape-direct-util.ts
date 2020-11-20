import * as notifier from 'node-notifier'

// dropin replacement for puppeteer, allows plugin usage
//const puppeteer = require('puppeteer')
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
// const stealth = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(stealth())

async function waitAndClick(selector: string, page) {
  await page.evaluate((selector) => document.querySelector(selector).click(), selector);
}

export const scrapeDirect = async (config: { [key: string]: string }) => {
  const {
    firstName,
    lastName,
    creditCardNumber,
    expirationMonth,
    expirationYear,
    cvv,
    sonyEmail,
    sonyPassword
  } = config

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // disable flags are for cc iframe
    args: [
      '--window-size=1920,1080',
      '--disable-features=site-per-process',
      '--disable-web-security',
      // '--disable-features=IsolateOrigins,site-per-process',
      // '--no-sandbox',
      // '--disable-setuid-sandbox',
      // '--disable-infobars',
      // '--ignore-certifcate-errors',
      // '--ignore-certifcate-errors-spki-list',
      // '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ],
    defaultViewport: null,
    sloMo: 250
  })

  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0);

    // url placeholder for product
    let URL
    
    // controller url (used for testing)
    //URL = 'https://direct.playstation.com/en-us/accessories/accessory/dualsense-wireless-controller.3005715'

    // console url
    URL = 'https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005816'
    
    // digital url
    //URL = 

    await page.goto(URL, { waitUntil: 'load', timeout: 0 })

    // concurrency delay
    await page.waitForTimeout(3000)

    // login
    const login = '.js-topnav-desktop-signin-link'
    await page.waitForSelector(login, { timeout: 0 })
    await page.waitForTimeout(2000)
    waitAndClick(login, page)

    // concurrency delay
    await page.waitForTimeout(3000)

    // input email
    const emailInput = '[type=email]'
    const emailButton = '.primary-button'
    await page.waitForSelector(emailInput, { timeout: 0 })
    await page.type(emailInput, sonyEmail)
    await page.$(emailButton)
    waitAndClick(emailButton, page)

    // concurrency delay
    await page.waitForTimeout(3000)

    // input password
    const passwordInput = '[type=password]'
    const signinButton = '.primary-button'
    await page.waitForSelector(passwordInput, { timeout: 0 })
    await page.type(passwordInput, sonyPassword)
    await page.$(signinButton)
    waitAndClick(signinButton, page)

    // concurrency delay
    await page.waitForTimeout(3000)

    // wait for product page
    await page.waitForSelector('.mini-cart-icon__white', { timeout: 0 })

    // keep refreshing until "Add to Cart" is available
    while (true) {
      try {
        await page.waitForSelector('.productHero-component .add-to-cart:not(.hide)', { timeout: 10000 })
        break
      } catch (error) {
        await page.reload()
      }
    }

    // click add to cart
    const addToCartButton = '.productHero-component .add-to-cart'
    await page.$(addToCartButton)
    waitAndClick(addToCartButton, page)

    // mini cart slideout
    const checkoutButton = '.mini-cart-expanded__content-action-button a'
    await page.waitForSelector(checkoutButton, { timeout: 0 })
    waitAndClick(checkoutButton, page)

    // concurrency delay
    await page.waitForTimeout(3000)

    // cart checkout
    const cartNextButton = '.cart-container .checkout-cta__next'
    await page.waitForSelector(cartNextButton, { timeout: 0 })
    waitAndClick(cartNextButton, page)

    await page.waitForTimeout(3000)

    // concurrency delay
    await page.waitForTimeout(3000)

    // shipping page
    const shippingNextButton = '.shipping-container .checkout-cta__next'
    await page.waitForSelector(shippingNextButton, { timeout: 0 })
    waitAndClick(shippingNextButton, page)
    console.log('shipping container passed')

    await page.waitForTimeout(3000)

    // credit card details
    // wait for iframe
    const iframe = await page.waitForSelector('#cardNumber-container iframe')
    const frame = await iframe.contentFrame();
    const ccInput = '[name="credit-card-number"]'
    frame.type(ccInput, creditCardNumber);

    await page.waitForTimeout(5000)
    
    // page.frames().find(async frame => {
    //   // type cc number into iframe input
    //   const ccInput = '[name="credit-card-number"]'
    //   await frame.waitForSelector(ccInput)
    //   frame.type(ccInput, creditCardNumber, { delay: 100 });
    // })
    
    
    // type rest of cc details
    await page.type('#accountHolderName', `${firstName} ${lastName}`)
    await page.type('#expiryMonth', expirationMonth)
    await page.type('#expiryYear', expirationYear)
    await page.type('#cvvInput', cvv)
    waitAndClick('.checkout-cta__review-order-total', page)

    // concurrency delay
    await page.waitForTimeout(3000)

    // place order
    const placeOrderButton = '.checkout-cta__place-order'
    page.waitForSelector(placeOrderButton, { timeout: 0 })
    waitAndClick(placeOrderButton, page)

    notifier.notify({
      title: 'PlayStation Direct',
      message: 'Ready to place order!',
      sound: true
    })

    console.log('PS5 was ordered! Check your email!')
  } catch (error) {
    console.log(error)
  } finally {
    // await browser.close();
  }
}
