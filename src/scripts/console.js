import { openApiTab, openApiJsonBtn, openApiYamlBtn, openApiView } from './open-api'
import { asyncApiTab, asyncApiJsonBtn, asyncApiYamlBtn, asyncApiView } from './async-api'
import { defaultsView, defaultsJsonBtn, defaultsYamlBtn, defaultsAddBtn } from './defaults'
import { visualize } from './visualize'
import { validationView } from './validation'
import { convertTDYamlToJson, detectProtocolSchemes } from '@thing-description-playground/core/dist/web-bundle.min.js'
import { generateOAP, generateAAP, addDefaults, validate } from './util'
import { editorList, getEditorData } from './editor'

/******************************************************************/
/*                    Console functionality                       */
/******************************************************************/

//Main console elements
const errorContainer = document.querySelector(".console__content #console-error")
const errorTxt = document.querySelector(".console-error__txt")
const eraseConsole = document.querySelector(".console__tabs .trash")
export const visualizationOptions = document.querySelectorAll(".visualization__option")
export const visualizationContainers = document.querySelectorAll(".console-view")

// const validatorView = document.querySelector("#validation-view")


visualizationOptions.forEach(option => {
    option.checked = false
})

eraseConsole.addEventListener("click", () => {
    clearConsole()
})

/**
 * Unchecks all visualizatin btns and hiddes all visualization containers
 */
export function clearConsole() {
    visualizationContainers.forEach(container => {
        container.classList.add("hidden")
    })
    visualizationOptions.forEach(option => {
        option.checked = false
    })

    clearVisualizationEditors()
}

function clearVisualizationEditors() {
    window.openApiEditor.getModel().setValue('')
    window.asyncApiEditor.getModel().setValue('')
    window.defaultsEditor.getModel().setValue('')
}


visualizationOptions.forEach(option => {
    option.addEventListener("click", () => {
        clearVisualizationEditors()
        visualizationContainers.forEach(container => {
            container.classList.add("hidden")
        })

        editorList.forEach(editor => {
            if (editor["_domElement"].classList.contains("active")) {
                const editorValue = editor["_domElement"].dataset.modeId === "yaml" ? convertTDYamlToJson(editor.getValue()) : editor.getValue()
                try {
                    let td = JSON.parse(editorValue)
                    hideConsoleError()

                    if ((td["@type"] === "tm:ThingModel" && option.id === "open-api-tab") || (td["@type"] === "tm:ThingModel" && option.id === "async-api-tab") || (td["@type"] === "tm:ThingModel" && option.id === "defaults-tab")) {
                        showConsoleError("This function is only allowed for Thing Descriptions!")
                    } else {
                        switch (option.id) {
                            case "open-api-tab":
                                if (editor["_domElement"].dataset.modeId === "yaml") {
                                    openApiJsonBtn.disabled = false
                                    openApiYamlBtn.disabled = true
                                } else {
                                    openApiJsonBtn.disabled = true
                                    openApiYamlBtn.disabled = false
                                }

                                if (td["@type"] !== "tm:ThingModel") {
                                    enableAPIConversionWithProtocol(editor)
                                }

                                break;

                            case "async-api-tab":
                                if (editor["_domElement"].dataset.modeId === "yaml") {
                                    asyncApiJsonBtn.disabled = false
                                    asyncApiYamlBtn.disabled = true
                                } else {
                                    asyncApiJsonBtn.disabled = true
                                    asyncApiYamlBtn.disabled = false
                                }

                                if (td["@type"] !== "tm:ThingModel") {
                                    enableAPIConversionWithProtocol(editor)
                                }

                                break;

                            case "defaults-tab":
                                if (editor["_domElement"].dataset.modeId === "yaml") {
                                    defaultsJsonBtn.disabled = false
                                    defaultsYamlBtn.disabled = true
                                } else {
                                    defaultsJsonBtn.disabled = true
                                    defaultsYamlBtn.disabled = false
                                }
                                if (td["@type"] !== "tm:ThingModel") {
                                    addDefaults(editor)
                                    defaultsAddBtn.disabled = true
                                    defaultsView.classList.remove("hidden")
                                }

                                break;

                            case "visualize-tab":
                                visualize(td)

                                break;

                            case "validation-tab":
                                validationView.classList.remove("hidden")
                                const editorData = getEditorData(editor)
                                validate(editorData[1], editorValue)

                                break;

                            default:
                                break;
                        }

                    }

                }
                catch (err) {
                    console.error(err);
                    errorTxt.innerText = "Invalid or Empty document"
                    errorContainer.classList.remove("hidden")
                }
            }
        })
    })
})


/**
 * Enable Open/Async API elements according to the protocol schemes of a TD
 * @param {object} editor - currently active monaco editor
 */
function enableAPIConversionWithProtocol(editor) {
    let td = editor.getValue()
    if (editor["_domElement"].dataset.modeId === "yaml") {
        td = convertTDYamlToJson(td)
    }

    const protocolSchemes = detectProtocolSchemes(td)

    if (protocolSchemes) {

        if (openApiTab.checked === true) {
            if (["http", "https"].some(p => protocolSchemes.includes(p))) {
                generateOAP(editor["_domElement"].dataset.modeId, editor)
                openApiView.classList.remove("hidden")
            } else {
                showConsoleError("Please insert a TD which uses HTTP!")
            }
        }

        if (asyncApiTab.checked === true) {
            if (["mqtt", "mqtts"].some(p => protocolSchemes.includes(p))) {
                generateAAP(editor["_domElement"].dataset.modeId, editor)
                asyncApiView.classList.remove("hidden")
            } else {
                showConsoleError("Please insert a TD which uses MQTT!")
            }
        }
    }
}

function showConsoleError(msg) {
    errorTxt.innerText = msg
    errorContainer.classList.remove("hidden")
}

function hideConsoleError() {
    errorTxt.innerText = ""
    errorContainer.classList.add("hidden")
}