import * as notifier from 'node-notifier'

// dropin replacement for puppeteer, allows plugin usage
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const stealth = require('puppeteer-extra-plugin-stealth')
puppeteer.use(stealth())


export const scrapeWalmart = async (config: { [key: string]: string }) => {
  const {
    cvv,
    walmartEmail,
    walmartPassword
  } = config

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080'],
    defaultViewport: null
  })

  try {
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    await page.setDefaultNavigationTimeout(0);

    page.on('request', async req => {
      if (req.resourceType() === 'image') {
        await req.abort()
      } else {
        await req.continue()
      }
    })

    // url placeholder for product
    let URL

    // controller url (used for testing)
    //URL = 'https://www.walmart.com/ip/Sony-PlayStation-5-DualSense-Wireless-Controller/615549727'

    // console url
    URL = 'https://www.walmart.com/ip/PlayStation-5-Console/363472942'
    
    // digital url
    //URL = 

    await page.goto(URL, { waitUntil: 'load', timeout: 0 })

    // keep refreshing until "Add to Cart" is available
    while (true) {
      try {
        await page.waitForSelector(
          'button[data-tl-id="ProductPrimaryCTA-cta_add_to_cart_button"]',
          {
            timeout: 10000
          }
        )
        break
      } catch (error) {
        await page.reload()
      }
    }

    const addToCartButton = await page.$('button[data-tl-id="ProductPrimaryCTA-cta_add_to_cart_button"]')
    await addToCartButton.click()

    await page.waitForTimeout(10000)

    const checkoutButton = await page.waitForSelector('button.checkoutBtn', { timeout: 0 })
    await checkoutButton.click()

    // without account
    // const continueWithoutAccountButton = await page.$(
    //   'button[data-tl-id="Wel-Guest_cxo_btn"]'
    // )

    // await continueWithoutAccountButton.click()

    // with account
    await page.waitForSelector('#sign-in-email', { timeout: 0 })
    await page.type('#sign-in-email', walmartEmail)
    await page.type('[name="password"]', walmartPassword)
    await page.keyboard.press('Enter')
    

    // delivery page
    const continueButton = await page.waitForSelector('button.cxo-continue-btn', { timeout: 0 })
    await continueButton.click()

    // confirm address page
    const addressContinueButton = await page.waitForSelector('button[aria-label="Continue to Payment Options"]', { timeout: 0 })
    await addressContinueButton.click()

    
    // check for delivery change based on address
    await page.waitForSelector('#fulfillment-options-changed', { timeout: 10000 }).then(async () => {
      // delivery page
      const continueButton = await page.waitForSelector('button.cxo-continue-btn', { timeout: 0 })
      await continueButton.click()

      // confirm address page
      const addressContinueButton = await page.waitForSelector('button[aria-label="Continue to Payment Options"]', { timeout: 0 })
      await addressContinueButton.click()
    }).catch(() => {
      console.log('No fulfillment errors.')
    }) 

    // Review Order
    const reviewOrderButton = await page.waitForSelector('button.fulfillment-opts-continue', { timeout: 0 })
    await page.type('input[name="cvv"]', cvv)
    await reviewOrderButton.click()

    
    // place order
    const placeOrderButton = await page.waitForSelector('button.auto-submit-place-order', { timeout: 0 })
    await placeOrderButton.click()

    console.log('WALMART ORDER PLACED! CHECK EMAIL FOR VERIFICATION.')

    notifier.notify({
      title: 'Walmart',
      message: 'Ready to place order!',
      sound: true
    })
  } catch (error) {
    console.log(error)
  } finally {
    // await browser.close();
  }
}
