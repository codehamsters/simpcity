const puppeteer = require("puppeteer");
require("dotenv").config();

const username = process.env.INSTA_USERNAME;
const password = process.env.INSTA_PASSWORD;
const groupName = process.env.GROUP_NAME; // Change this to your Instagram group chat name

const welcomeMessages = [
  "Welcome @{username} to SimpCity! 🚀🔥",
  "Aree bhai! Ek aur simp aaya! 😆 Welcome @{username}! 🎉",
  "@{username} just entered the simp zone. Buckle up! 😂",
  "Ek naye simp ki entry hui hai! @{username}, welcome bhai! 💀🔥",
];

async function startBot() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log("🔹 Opening Instagram...");
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
    });

    console.log("🔹 Logging in...");
    await page.type("input[name='username']", username, { delay: 100 });
    await page.type("input[name='password']", password, { delay: 100 });

    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("✅ Logged in!");

    console.log("🔹 Navigating to Group...");
    await page.goto(`https://www.instagram.com/direct/t/`, {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(3000);
    await page.type("input[placeholder='Search']", groupName, { delay: 100 });
    await page.waitForTimeout(2000);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    await page.keyboard.press("Enter");

    console.log("✅ Group Opened!");

    let previousMembers = new Set();

    setInterval(async () => {
      console.log("🔹 Checking for new members...");
      let members = await page.evaluate(() => {
        let memberElements = document.querySelectorAll("._7UhW9");
        return Array.from(memberElements).map((el) => el.textContent);
      });

      let newMembers = members.filter((member) => !previousMembers.has(member));

      for (let newMember of newMembers) {
        let message = welcomeMessages[
          Math.floor(Math.random() * welcomeMessages.length)
        ].replace("{username}", newMember);

        await page.type("textarea", message, { delay: 50 });
        await page.keyboard.press("Enter");
        console.log(`✅ Welcomed ${newMember}`);
      }

      previousMembers = new Set(members);
    }, 10000); // Runs every 10 seconds
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

startBot();
