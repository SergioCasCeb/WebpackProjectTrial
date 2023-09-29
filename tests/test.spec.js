const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
    await page.goto('/')
});

test.describe("Load initial state", () => {
    test('Has title', async ({ page }) => {
        await expect(page).toHaveTitle("TD Playground")
    })

    test('Has editor tab', async ({ page }) => {
        const editorTab = page.locator('#tab')
        await expect(editorTab).toHaveText("TDThing Template")
    })

    test('Has TD template', async ({ page }) => {
        const editor = page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"title": "Thing Template",' }).nth(4)
        await expect(editor).toHaveText('"title": "Thing Template",')
    })

    test('Validation tab is checked', async ({ page }) => {
        const validationTab = page.locator('#validation-tab')
        await expect(validationTab).toBeChecked()
    })

    test('Validation view is opened', async ({ page }) => {
        const validationView = page.locator('#validation-view')
        await expect(validationView).toHaveClass("console-view validation-view")
    })

    test('JSON button is checked', async ({ page }) => {
        const jsonBtn = page.locator('#file-type-json')
        await expect(jsonBtn).toBeChecked()
    })
})

test.describe("Check all links", () => {
    test("Check Thingweb logo link", async ({ page }) => {
        const thingwebPromise = page.waitForEvent('popup')
        await page.locator(".logo").click()
        const thingwebPage = await thingwebPromise
        await expect(thingwebPage).toHaveTitle("thingweb - thingweb")
        await expect(thingwebPage).toHaveURL("https://www.thingweb.io")
    })

    test("Check CLI link", async ({ page }) => {
        const cliPromise = page.waitForEvent('popup')
        await page.locator(".cli-link").click()
        const cliPage = await cliPromise
        await expect(cliPage).toHaveURL("https://github.com/eclipse-thingweb/playground/tree/master/packages/cli")
    })

    test("Check Github link", async ({ page }) => {
        const githubPromise = page.waitForEvent('popup')
        await page.locator(".git-link").click()
        const githubPage = await githubPromise
        await expect(githubPage).toHaveTitle(/GitHub - eclipse-thingweb/)
        await expect(githubPage).toHaveURL("https://github.com/eclipse-thingweb/playground")
    })

    test("Check Thingweb footer link", async ({ page }) => {
        await page.locator('#settings-btn').click()
        const thingwebPromise = page.waitForEvent('popup')
        await page.locator("#thingweb-link").click()
        const thingwebPage = await thingwebPromise
        await expect(thingwebPage).toHaveTitle("thingweb - thingweb")
        await expect(thingwebPage).toHaveURL("https://www.thingweb.io")
    })

    test("Check Eclipse footer link", async ({ page }) => {
        await page.locator('#settings-btn').click()
        const eclipsePromise = page.waitForEvent('popup')
        await page.locator("#eclipse-link").click()
        const eclipsePage = await eclipsePromise
        await expect(eclipsePage).toHaveTitle("The Community for Open Innovation and Collaboration | The Eclipse Foundation")
        await expect(eclipsePage).toHaveURL("https://www.eclipse.org")
    })

    test("Check privacy policy footer link", async ({ page }) => {
        await page.locator('#settings-btn').click()
        const privacyPromise = page.waitForEvent('popup')
        await page.locator("#privacy-link").click()
        const privacyPage = await privacyPromise
        await expect(privacyPage).toHaveTitle("Eclipse Foundation Website Privacy Policy | The Eclipse Foundation")
        await expect(privacyPage).toHaveURL("https://www.eclipse.org/legal/privacy.php")
    })

    test("Check terms of use footer link", async ({ page }) => {
        await page.locator('#settings-btn').click()
        const termsPromise = page.waitForEvent('popup')
        await page.locator("#terms-link").click()
        const termsPage = await termsPromise
        await expect(termsPage).toHaveTitle("Eclipse.org Terms of Use | The Eclipse Foundation")
        await expect(termsPage).toHaveURL("https://www.eclipse.org/legal/termsofuse.php")
    })

    test("Check copyright agent footer link", async ({ page }) => {
        await page.locator('#settings-btn').click()
        const copyrightPromise = page.waitForEvent('popup')
        await page.locator("#copyright-link").click()
        const copyrightPage = await copyrightPromise
        await expect(copyrightPage).toHaveTitle("Copyright Agent | The Eclipse Foundation")
        await expect(copyrightPage).toHaveURL("https://www.eclipse.org/legal/copyright.php")
    })

    test("Check legal footer link", async ({ page }) => {
        await page.locator('#settings-btn').click()
        const legalPromise = page.waitForEvent('popup')
        await page.locator("#legal-link").click()
        const legalPage = await legalPromise
        await expect(legalPage).toHaveTitle("Eclipse Foundation Legal Resources | The Eclipse Foundation")
        await expect(legalPage).toHaveURL("https://www.eclipse.org/legal/")
    })
})