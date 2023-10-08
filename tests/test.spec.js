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

test.describe("Editors and Tabs creation and deletion", () => {
    test("Adding a new editor and closing it", async ({ page }) => {
        const editorTabs = page.locator("#tab")
        const editors = page.locator(".editor")
        await expect(editorTabs).toHaveCount(1)
        await expect(editors).toHaveCount(1)

        const initialTab = page.locator("#tab").nth(0)
        await expect(initialTab).toHaveAttribute('data-tab-id', "1")
        await expect(initialTab).toHaveText("TDThing Template")
        await expect(initialTab).toHaveClass("active")

        const initialEditor = page.locator("#editor1")
        await expect(initialEditor).toHaveAttribute('data-ide-id', "1")
        await expect(initialEditor).toHaveClass("editor active")

        await page.locator("#ide-tab-add").click()
        await expect(editorTabs).toHaveCount(2)
        await expect(editors).toHaveCount(2)

        await expect(initialTab).toHaveClass("")
        await expect(initialEditor).toHaveClass("editor")

        const secondTab = page.locator("#tab").nth(1)
        await expect(secondTab).toHaveAttribute('data-tab-id', "2")
        await expect(secondTab).toHaveText("TDThing Template")
        await expect(secondTab).toHaveClass("active")

        const secondEditor = page.locator("#editor2")
        await expect(secondEditor).toHaveAttribute('data-ide-id', "2")
        await expect(secondEditor).toHaveClass("editor active")

        await page.locator("#tab").nth(1).locator(".close-tab").click()

        await expect(editorTabs).toHaveCount(1)
        await expect(editors).toHaveCount(1)

        await expect(initialTab).toHaveClass("active")
        await expect(initialEditor).toHaveClass("editor active")
    })

    test("Opening an example and closing initial editor", async ({ page }) => {
        const editorTabs = page.locator("#tab")
        const editors = page.locator(".editor")
        await expect(editorTabs).toHaveCount(1)
        await expect(editors).toHaveCount(1)

        const initialTab = page.locator("#tab").nth(0)
        await expect(initialTab).toHaveAttribute('data-tab-id', "1")
        await expect(initialTab).toHaveText("TDThing Template")
        await expect(initialTab).toHaveClass("active")

        const initialEditor = page.locator("#editor1")
        await expect(initialEditor).toHaveAttribute('data-ide-id', "1")
        await expect(initialEditor).toHaveClass("editor active")

        await page.locator("#examples-btn").click()
        await page.locator(".example").nth(0).click()
        await page.locator(".example").nth(0).getByRole("button", { name: /Apply/ }).click()

        await expect(editorTabs).toHaveCount(2)
        await expect(editors).toHaveCount(2)

        await expect(initialTab).toHaveClass("")
        await expect(initialEditor).toHaveClass("editor")

        const exampleTab = page.locator("#tab").nth(1)
        await expect(exampleTab).toHaveAttribute('data-tab-id', "2")
        await expect(exampleTab).toHaveText("TDMyLampThing")
        await expect(exampleTab).toHaveClass("active")

        const exampleEditor = page.locator("#editor2")
        await expect(exampleEditor).toHaveAttribute('data-ide-id', "2")
        await expect(exampleEditor).toHaveClass("editor active")

        await page.locator("#tab").nth(0).locator(".close-tab").click()

        await expect(editorTabs).toHaveCount(1)
        await expect(editors).toHaveCount(1)

        // await page.screenshot({ path: './test-screenshots/editors-tabs-creation-examples.png'})
    })
})

test.describe("JSON and YAML conversion", () => {
    test("JSON to YAML and YAML to JSON", async ({ page }) => {
        const editorTabs = page.locator("#tab")
        const editors = page.locator(".editor")
        await expect(editorTabs).toHaveCount(1)
        await expect(editors).toHaveCount(1)

        const jsonYamlPopup = page.locator('.json-yaml-warning')
        await expect(jsonYamlPopup).toHaveClass("json-yaml-warning closed")

        const initialEditor = page.locator("#editor1")
        const jsonBtn = page.locator('#file-type-json')
        const yamlBtn = page.locator('#file-type-yaml')

        await expect(initialEditor).toHaveAttribute('data-mode-id', "json")
        await expect(jsonBtn).toBeChecked({checked: true})
        await expect(yamlBtn).toBeChecked({checked: false})

        await yamlBtn.click()
        await expect(jsonYamlPopup).toHaveClass("json-yaml-warning")
        
        await page.locator('#yaml-confirm-btn').click()
        await expect(jsonYamlPopup).toHaveClass("json-yaml-warning closed")
        await expect(initialEditor).toHaveAttribute('data-mode-id', "yaml")
        await expect(jsonBtn).toBeChecked({checked: false})
        await expect(yamlBtn).toBeChecked({checked: true})

        await jsonBtn.click()
        await expect(initialEditor).toHaveAttribute('data-mode-id', "json")
        await expect(jsonBtn).toBeChecked({checked: true})
        await expect(yamlBtn).toBeChecked({checked: false})
    })

    test("Cancel YAML conversion", async ({ page }) => {
        const editorTabs = page.locator("#tab")
        const editors = page.locator(".editor")
        await expect(editorTabs).toHaveCount(1)
        await expect(editors).toHaveCount(1)

        const jsonYamlPopup = page.locator('.json-yaml-warning')
        const initialEditor = page.locator("#editor1")
        const jsonBtn = page.locator('#file-type-json')
        const yamlBtn = page.locator('#file-type-yaml')

        await expect(jsonYamlPopup).toHaveClass("json-yaml-warning closed")
        await expect(initialEditor).toHaveAttribute('data-mode-id', "json")
        await expect(jsonBtn).toBeChecked({checked: true})
        await expect(yamlBtn).toBeChecked({checked: false})

        await yamlBtn.click()
        await expect(jsonYamlPopup).toHaveClass("json-yaml-warning")
        
        await page.locator('#yaml-cancel-btn').click()
        await expect(jsonYamlPopup).toHaveClass("json-yaml-warning closed")
        await expect(initialEditor).toHaveAttribute('data-mode-id', "json")
        await expect(jsonBtn).toBeChecked({checked: true})
        await expect(yamlBtn).toBeChecked({checked: false})
    })
})


/*
2. json - yaml conversion
3. utilizing examples and checking for tm and td changes
4. save menu
5. settings menu
6. validation
7. openapi
8. async api
9. defaults
10. visualize
*/