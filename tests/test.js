const playwright = require("playwright")
const fs = require("fs");
const express = require('express')

const arg = process.argv[2]
const options = arg === "-d" || arg === "--debug" ? { headless: false, slowMo: 1000 } : {};
const testDir = "./tests-results"

const port = 3000
const app = express()
//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', express.static('./dist/'))

//Init server
const server = app.listen(port, () => console.log(`Server started on port ${port}`))

//Init test
initTest()

async function initTest() {

    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir)
    }

    const browserList = [];
    browserList.push("chromium")
    browserList.push("firefox")
    browserList.push("webkit")

    for (const browserType of browserList) {
        const browser = await playwright[browserType].launch(options);
        const context = await browser.newContext({ acceptDownloads: true });
        const page = await context.newPage();

        if (browserType === "chromium") {
            await page.goto("http://localhost:3000");
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
            await page.locator('#file-type-yaml').check();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '\'@type\': Thing' }).nth(4).click();
            await page.locator('#file-type-yaml').check();
            await page.locator('#file-type-json').check();
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
        }
        else if (browserType === "firefox") {
            await page.goto("http://localhost:3000");
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
            await page.locator('#file-type-yaml').check();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '\'@type\': Thing' }).nth(4).click();
            await page.locator('#file-type-yaml').check();
            await page.locator('#file-type-json').check();
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
        }
        else if (browserType === "webkit") {
            await page.goto("http://localhost:3000");
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
            await page.locator('#file-type-yaml').check();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '\'@type\': Thing' }).nth(4).click();
            await page.locator('#file-type-yaml').check();
            await page.locator('#file-type-json').check();
            await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
        }

        await browser.close();
        console.log("Finished testing with: " + browserType);
    }

    server.close(() => {
        console.log("Server has been closed");
    })
}
