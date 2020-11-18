# PS5bot
NOTE: I am not responsible for any misuse of this script or for any purchases that may be made by this script. Use at your own risk. If you don't know what you are doing, this may not be for you.

Rewrite of [VVNoodle's bot](https://github.com/corydorning/PS5bot) to work with accounts to make things faster. I've rewritten most of the puppeteer rules for Sony and Walmart (haven't gotten around to Target yet) and they seem to be much more reliable. Will add additional sites if time permits. Also no longer requires `yarn`.

## Installation overview
Should work on Linux, macOS, or Windows.

### Installation
 1. [Install Node.js](https://nodejs.org/en/)
    1. version should be >12.9
 2. [Install git](https://git-scm.com/)
 3. open up terminal/command prompt and clone this project
    1. `git clone https://github.com/corydorning/PS5bot`
 4. go to project directory `cd PS5bot`
 6. Install dependencies by running `npm install`

## Site Setup
 1. Login to Walmart.com, sign into your account and setup:
   - A default delivery address
   - A default payment option

NOTE: Make sure no items are in your cart for any of the above accounts on that site. It will buy the item if it is.

## PS5Bot Setup
 1. Run ps5bot. You'll be prompted to fill in required checkout info  
    `npx ps5bot`
 2. Run scraper
    `npx ps5bot scrape`
    - you will be asked to select the sites to run the bot. If you don't select anything, it will try to run on all websites.

## Bot Configs
Configs are read in `config.json` file. You can either run `ps5bot` to generate a config file, or copy `configTemplate.json` and rename it to `config.json` and fill out the fields.

```js
{
  "firstName": "Qwer",
  "lastName" "Ty",
  "phoneNumber": "8011111111", // No spaces
  "email": "email@example.com",
  "state": "State",  // Full state name
  "city": "City", // Full city name
  "address": "2353 Running Water Ct.",
  "zipCode": "95054",
  "creditCardNumber": "0101101010101",
  "expirationMonth": "10", // MM format
  "expirationYear": "2022", // YYYY format
  "cvv": "000", // code on back of credit card
  "sonyEmail": "sony@gmail.com",
  "sonyPassword": "password123",
  "targetEmail": "target@gmail.com",
  "targetPassword": "password123",
  "walmartEmail": "walmart@gmail.com",
  "walmartPassword": "password123"
}
```

- Double quotes on text is required
- Anything after the `//` above, are comments for clarification. Remove the `//` and everything after it).

### Credit Cards supported

| Site               | Cards                                        |
|--------------------|----------------------------------------------|
| PlayStation Direct | MasterCard, Visa, Discover                   |
| Walmart            | MasterCard, Visa, Discover, American Express |
| Target             | MasterCard, Visa, Discover, American Express |

Make sure to run this script and keep the terminal open around the time of the schedule

## Notes
- Make sure not to use a VPN since it will possibly trigger captcha verification.
- There's a chance WalMart checkout ask for captcha after entering address. If this is the case, bot will pause. As soon as you complete them, bot will resume.

PS5bot exists to:
- practice web scraping and to
- buy a **single** PS5 for myself  
The second point is fair imo since it's pretty much an automated version of constantly clicking refresh to buy stuff.  
Also: This is not intended to scalp massive quantities of PS5s. That shit aint cool.