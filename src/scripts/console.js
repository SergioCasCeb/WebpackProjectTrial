import { openApiTab, openApiJsonBtn, openApiYamlBtn, openApiView } from './open-api'
import { asyncApiTab, asyncApiJsonBtn, asyncApiYamlBtn, asyncApiView } from './async-api'
import { defaultsView, defaultsJsonBtn, defaultsYamlBtn } from './defaults'
import { visualizeView, visualize } from './visualize'
import { convertTDYamlToJson, detectProtocolSchemes } from '@thing-description-playground/core/dist/web-bundle.min.js'
import { generateOAP, generateAAP, addDefaults } from './util'
import { editorList } from './editor'

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

        //OpenAPI console behaviour
        if (option.id === "open-api-tab") {
            editorList.forEach(editor => {
                if (editor["_domElement"].classList.contains("active")) {
                    let td = editor.getValue()
                    if (editor["_domElement"].dataset.modeId === "yaml") {
                        td = convertTDYamlToJson(td)
                        openApiJsonBtn.disabled = false
                        openApiYamlBtn.disabled = true
                    } else {
                        openApiJsonBtn.disabled = true
                        openApiYamlBtn.disabled = false
                    }
                    if (JSON.parse(td)["@type"] === "tm:ThingModel") {
                        errorTxt.innerText = "This function is only allowed for Thing Descriptions!"
                        errorContainer.classList.remove("hidden")
                    } else {
                        errorContainer.classList.add("hidden")
                        enableAPIConversionWithProtocol(editor)
                    }
                }
            })
        }

        //AsyncAPI console behaviour
        if (option.id === "async-api-tab") {
            editorList.forEach(editor => {
                if (editor["_domElement"].classList.contains("active")) {
                    let td = editor.getValue()
                    if (editor["_domElement"].dataset.modeId === "yaml") {
                        td = convertTDYamlToJson(td)
                        asyncApiJsonBtn.disabled = false
                        asyncApiYamlBtn.disabled = true
                    } else {
                        asyncApiJsonBtn.disabled = true
                        asyncApiYamlBtn.disabled = false
                    }

                    if (JSON.parse(td)["@type"] === "tm:ThingModel") {
                        errorTxt.innerText = "This function is only allowed for Thing Descriptions!"
                        errorContainer.classList.remove("hidden")
                    } else {
                        errorContainer.classList.add("hidden")
                        enableAPIConversionWithProtocol(editor)
                    }
                }
            })
        }

        //Defaults console behaviour
        if (option.id === "defaults-tab") {
            editorList.forEach(editor => {
                if (editor["_domElement"].classList.contains("active")) {
                    let td = editor.getValue()
                    if (editor["_domElement"].dataset.modeId === "yaml") {
                        td = convertTDYamlToJson(td)
                        defaultsJsonBtn.disabled = false
                        defaultsYamlBtn.disabled = true
                    } else {
                        defaultsJsonBtn.disabled = true
                        defaultsYamlBtn.disabled = false
                    }
                    if (JSON.parse(td)["@type"] === "tm:ThingModel") {
                        errorTxt.innerText = "This function is only allowed for Thing Descriptions!"
                        errorContainer.classList.remove("hidden")
                    } else {
                        errorContainer.classList.add("hidden")
                        addDefaults(editor)
                        defaultsView.classList.remove("hidden")
                    }
                }
            })
        }

        //Visualize console behaviour
        if (option.id === "visualize-tab") {
            editorList.forEach(editor => {
                if (editor["_domElement"].classList.contains("active")) {
                    const editorValue = editor["_domElement"].dataset.modeId === "yaml" ? convertTDYamlToJson(editor.getValue()) : editor.getValue()
                    
                    if(editorValue){
                        visualizeView.classList.remove("hidden")
                        visualize(editorValue)
                    }
                }
            })
        }

    })
})

/***********  Visualizations  ***********/

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
                errorTxt.innerText = "Please insert a TD which uses HTTP!"
                errorContainer.classList.remove("hidden")
            }
        }

        if (asyncApiTab.checked === true) {
            if (["mqtt", "mqtts"].some(p => protocolSchemes.includes(p))) {
                generateAAP(editor["_domElement"].dataset.modeId, editor)
                asyncApiView.classList.remove("hidden")
            } else {
                errorTxt.innerText = "Please insert a TD which uses MQTT!"
                errorContainer.classList.remove("hidden")
            }
        }
    }
}