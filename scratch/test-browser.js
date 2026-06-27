const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const artifactDir = 'C:/Users/HP/.gemini/antigravity-cli/brain/33983cb0-118b-4ebb-88c5-6b47a25b7f07';

// Ensure artifact directory exists
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(executablePath)) {
    console.log("Chrome not found at standard path, trying Edge...");
    executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  }
  
  console.log("Launching browser using:", executablePath);
  
  const browser = await puppeteer.launch({
    executablePath: executablePath,
    headless: true, // Run headlessly to run reliably in sandbox
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ==========================================
    // STEP 1: Guest Menu & Add items to cart
    // ==========================================
    console.log("=== Guest Ordering flow ===");
    const guestPage = await browser.newPage();
    await guestPage.setViewport({ width: 1280, height: 800 });
    
    guestPage.on('console', msg => console.log('[GUEST BROWSER LOG]:', msg.text()));
    guestPage.on('requestfailed', req => console.log(`[GUEST REQ FAILED]: ${req.url()} - ${req.failure()?.errorText || 'Error'}`));
    guestPage.on('response', res => {
      if (res.status() >= 400) {
        console.log(`[GUEST HTTP ERROR]: ${res.url()} returned status ${res.status()}`);
      }
    });
    
    console.log("Navigating to guest menu...");
    await guestPage.goto('http://localhost:3000/guest/order/menu?propertyId=1&location=11', { waitUntil: 'networkidle2' });
    await sleep(3000);
    
    console.log("Waiting for menu items to load...");
    await guestPage.waitForSelector('button[aria-label^="Add "]', { timeout: 15000 });
    
    await guestPage.screenshot({ path: path.join(artifactDir, 'step1_menu_page.png') });
    
    console.log("Adding 'Red Wine' and 'Sparkling Water' to cart...");
    await guestPage.click('button[aria-label="Add Red Wine"]');
    await sleep(500);
    await guestPage.click('button[aria-label="Add Sparkling Water"]');
    await sleep(1000);
    
    // ==========================================
    // STEP 2: Checkout Page
    // ==========================================
    console.log("Navigating to checkout...");
    await guestPage.goto('http://localhost:3000/guest/order/checkout', { waitUntil: 'networkidle2' });
    await sleep(3000);
    
    await guestPage.waitForSelector('input[placeholder="Your Full Name *"]', { timeout: 15000 });
    await guestPage.screenshot({ path: path.join(artifactDir, 'step2_checkout_page.png') });
    
    console.log("Filling in checkout details...");
    await guestPage.type('input[placeholder="Your Full Name *"]', 'QA Walk-In Guest');
    await guestPage.type('input[placeholder="Phone Number *"]', '0771234567');
    await guestPage.type('#kitchen-instructions textarea', 'No ice in wine please, extra lemon slice');
    await sleep(500);
    
    await guestPage.screenshot({ path: path.join(artifactDir, 'step3_checkout_filled.png') });
    
    console.log("Placing order...");
    const placeOrderBtn = await guestPage.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Confirm & Place Order'));
    });
    if (placeOrderBtn) {
      await placeOrderBtn.click();
    } else {
      throw new Error("Confirm & Place Order button not found");
    }
    
    console.log("Waiting for confirmation page...");
    await guestPage.waitForSelector('a[href="/guest/order/track"]', { timeout: 20000 });
    await sleep(2000);
    
    await guestPage.screenshot({ path: path.join(artifactDir, 'step4_confirmation_page.png') });
    
    const orderId = await guestPage.evaluate(() => {
      const p = Array.from(document.querySelectorAll('p')).find(el => el.textContent.includes('#ORD-'));
      return p ? p.textContent.trim() : null;
    });
    console.log("Placed Order ID:", orderId);
    if (!orderId) {
      throw new Error("Could not find order ID on confirmation page");
    }
    
    console.log("Navigating to track order...");
    await guestPage.click('a[href="/guest/order/track"]');
    await sleep(3000);
    
    await guestPage.waitForSelector('h3', { timeout: 15000 });
    await guestPage.screenshot({ path: path.join(artifactDir, 'step5_guest_tracking_placed.png') });
    
    // ==========================================
    // STEP 3: Staff Login & Dashboard
    // ==========================================
    console.log("=== Staff Dashboard flow ===");
    const staffPage = await browser.newPage();
    await staffPage.setViewport({ width: 1280, height: 800 });
    
    staffPage.on('console', msg => console.log('[STAFF BROWSER LOG]:', msg.text()));
    staffPage.on('requestfailed', req => console.log(`[STAFF REQ FAILED]: ${req.url()} - ${req.failure()?.errorText || 'Error'}`));
    staffPage.on('response', res => {
      if (res.status() >= 400) {
        console.log(`[STAFF HTTP ERROR]: ${res.url()} returned status ${res.status()}`);
      }
    });
    
    console.log("Navigating to login...");
    await staffPage.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
    await sleep(3000);
    
    await staffPage.waitForSelector('input[type="email"]', { timeout: 15000 });
    console.log("Typing staff credentials...");
    await staffPage.type('input[type="email"]', 'staff@primestay.com');
    await staffPage.type('input[type="password"]', 'password123');
    await sleep(500);
    
    console.log("Submitting login form...");
    const loginBtn = await staffPage.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Log In') || el.textContent.includes('Login'));
    });
    if (loginBtn) {
      await loginBtn.click();
    } else {
      throw new Error("Login button not found");
    }
    
    await sleep(4000);
    
    console.log("Navigating to staff orders...");
    await staffPage.goto('http://localhost:3000/staff/orders', { waitUntil: 'networkidle2' });
    await sleep(4000);
    
    await staffPage.screenshot({ path: path.join(artifactDir, 'step6_staff_orders_received.png') });
    
    // ==========================================
    // STEP 4: Staff Accept Order
    // ==========================================
    console.log("Accepting order in staff page using DOM-climbing...");
    const accepted = await staffPage.evaluate((ordId) => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const idEl = allElements.find(el => el.children.length === 0 && el.textContent.includes(ordId));
      if (!idEl) return false;
      
      let parent = idEl.parentElement;
      while (parent) {
        const acceptBtn = Array.from(parent.querySelectorAll('button')).find(b => b.textContent.trim().includes('Accept'));
        if (acceptBtn) {
          acceptBtn.click();
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    }, orderId);
    
    console.log("Order Accept Clicked:", accepted);
    if (!accepted) {
      throw new Error("Could not click Accept button for order " + orderId);
    }
    
    await sleep(3000);
    await staffPage.screenshot({ path: path.join(artifactDir, 'step7_staff_orders_accepted.png') });
    
    // ==========================================
    // STEP 5: Verify Live SSE Update on Guest Side
    // ==========================================
    console.log("Switching to Guest tab to check live status update (SSE)...");
    await guestPage.bringToFront();
    await sleep(4000); // Give it plenty of time
    await guestPage.screenshot({ path: path.join(artifactDir, 'step8_guest_tracking_accepted.png') });
    
    const guestTimelineItems = await guestPage.evaluate(() => {
      return Array.from(document.querySelectorAll('h4')).map(el => el.textContent.trim());
    });
    console.log("Guest page timeline headers:", guestTimelineItems);
    
    const guestStatusText = await guestPage.evaluate(() => {
      const heroTitle = document.querySelector('.bg-gradient-to-br h2');
      return heroTitle ? heroTitle.textContent.trim() : null;
    });
    console.log("Guest tracking status text after staff accept:", guestStatusText);
    
    // ==========================================
    // STEP 6: Staff Start Preparation (In-Progress)
    // ==========================================
    console.log("Switching to Staff tab...");
    await staffPage.bringToFront();
    
    const staffButtons = await staffPage.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
    });
    console.log("All buttons found on staff page:", staffButtons);
    
    console.log("Clicking the 'In-Progress' tab...");
    const clickedTab = await staffPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const inProgressTab = tabs.find(t => t.textContent.includes('In-Progress') || t.textContent.includes('Preparing'));
      if (inProgressTab) {
        inProgressTab.click();
        return true;
      }
      return false;
    });
    console.log("Clicked In-Progress tab:", clickedTab);
    
    await sleep(3000);
    await staffPage.screenshot({ path: path.join(artifactDir, 'step9_staff_orders_preparing.png') });
    
    const visibleOrderIds = await staffPage.evaluate(() => {
      return Array.from(document.querySelectorAll('span')).filter(el => el.textContent.includes('#ORD-')).map(el => el.textContent.trim());
    });
    console.log("Visible order IDs on current staff page tab:", visibleOrderIds);
    
    console.log("Clicking 'Set to Ready'...");
    const readied = await staffPage.evaluate((ordId) => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const idEl = allElements.find(el => el.children.length === 0 && el.textContent.includes(ordId));
      if (!idEl) return false;
      
      let parent = idEl.parentElement;
      while (parent) {
        const readyBtn = Array.from(parent.querySelectorAll('button')).find(b => b.textContent.trim().includes('Set to Ready'));
        if (readyBtn) {
          readyBtn.click();
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    }, orderId);
    
    console.log("Set to Ready clicked:", readied);
    if (!readied) {
      throw new Error("Could not click Set to Ready button for order " + orderId);
    }
    
    await sleep(3000);
    await staffPage.screenshot({ path: path.join(artifactDir, 'step10_staff_orders_ready.png') });
    
    // Switch to guest tab
    await guestPage.bringToFront();
    await sleep(2000);
    await guestPage.screenshot({ path: path.join(artifactDir, 'step11_guest_tracking_ready.png') });
    
    // ==========================================
    // STEP 7: Staff Mark Delivered
    // ==========================================
    console.log("Switching to Staff tab to go to Ready tab...");
    await staffPage.bringToFront();
    await staffPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const readyTab = tabs.find(t => t.textContent.includes('Ready'));
      if (readyTab) readyTab.click();
    });
    await sleep(3000);
    
    console.log("Clicking 'Mark Delivered'...");
    const delivered = await staffPage.evaluate((ordId) => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const idEl = allElements.find(el => el.children.length === 0 && el.textContent.includes(ordId));
      if (!idEl) return false;
      
      let parent = idEl.parentElement;
      while (parent) {
        const deliverBtn = Array.from(parent.querySelectorAll('button')).find(b => b.textContent.trim().includes('Mark Delivered'));
        if (deliverBtn) {
          deliverBtn.click();
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    }, orderId);
    
    console.log("Mark Delivered clicked:", delivered);
    if (!delivered) {
      throw new Error("Could not click Mark Delivered button for order " + orderId);
    }
    await sleep(3000);
    await staffPage.screenshot({ path: path.join(artifactDir, 'step12_staff_orders_delivered.png') });
    
    // Switch to guest tab
    await guestPage.bringToFront();
    await sleep(2000);
    await guestPage.screenshot({ path: path.join(artifactDir, 'step13_guest_tracking_delivered.png') });
    
    console.log("Browser test flow finished successfully.");
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await browser.close();
  }
}

runTest();
