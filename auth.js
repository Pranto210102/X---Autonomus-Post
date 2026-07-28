// Open browser window with playwrite to authenticate user in x.com and get the token and save it in a json file
import { chromium } from "playwright";

(async () => {
  // Launch a new browser instance
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Perform authentication steps here
  await page.goto('https://x.com/login');
  console.log('Please log in to x.com in the opened browser window.');

  //wait 2 minutes for the user to log in and for the token to be available in localStorage
    await page.waitForURL('https://x.com/home', { timeout: 120000 }); 

  // Save the token to a JSON file
  await context.storageState({ 
    path: 'auth-state.json'
  });
  console.log('Authentication state saved to auth-state.json');
  await browser.close();
})();