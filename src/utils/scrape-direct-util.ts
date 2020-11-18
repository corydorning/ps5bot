import * as puppeteer from 'puppeteer'
import * as notifier from 'node-notifier'

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
    // disable flags are for cc iframe
    args: ['--window-size=1920,1080', '--disable-features=site-per-process', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
    defaultViewport: null
  })

  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0); 

    // url placeholder for product
    let URL
    
    // controller url (used for testing)
    URL = 'https://direct.playstation.com/en-us/accessories/accessory/dualsense-wireless-controller.3005715'

    // console url
    //URL = 'https://direct.playstation.com/en-us/consoles/console/playstation5-console.3005816'
    
    // digital url
    //URL = 

    await page.goto(URL, { waitUntil: 'load', timeout: 0 })

    // login
    const login = '.js-topnav-desktop-signin-link'
    await page.waitForSelector(login, { timeout: 0 })
    await page.waitForTimeout(2000)
    waitAndClick(login, page)

    // input email
    const emailInput = '[type=email]'
    const emailButton = '.primary-button'
    await page.waitForSelector(emailInput, { timeout: 0 })
    await page.type(emailInput, sonyEmail)
    await page.$(emailButton)
    waitAndClick(emailButton, page)

    // input password
    const passwordInput = '[type=password]'
    const signinButton = '.primary-button'
    await page.waitForSelector(passwordInput, { timeout: 0 })
    await page.type(passwordInput, sonyPassword)
    await page.$(signinButton)
    waitAndClick(signinButton, page)

    // wait for product page
    await page.waitForSelector('.mini-cart-icon__white', { timeout: 0 })

    // keep refreshing until "Add to Cart" is available
    while (true) {
      try {
        await page.waitForSelector('.productHero-component .add-to-cart', { timeout: 10000 })
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

    // cart checkout
    const cartNextButton = '.cart-container .checkout-cta__next'
    await page.waitForSelector(cartNextButton, { timeout: 0 })
    waitAndClick(cartNextButton, page)

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

    // place order
    // const placeOrderButton = '.checkout-cta__place-order'
    // page.waitForSelector(placeOrderButton, { timeout: 0 })
    // waitAndClick(placeOrderButton, page)

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
