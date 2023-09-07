/*
 *  Copyright (c) 2023 Contributors to the Eclipse Foundation
 *
 *  See the NOTICE file(s) distributed with this work for additional
 *  information regarding copyright ownership.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Eclipse Public License v. 2.0 which is available at
 *  http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *  Document License (2015-05-13) which is available at
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 *
 *  SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 */

/**
 * @file The `util.js` contains the core
 * functionality the `@thing-description-playground/web` offers. It takes
 * care of integrating other playground packages
 * and offers a few utility functions.
 */

import * as monaco from 'monaco-editor'
import * as Validators from '@thing-description-playground/core/dist/web-bundle.min.js'
import tdToOpenAPI from '@thing-description-playground/td_to_openapi/dist/web-bundle.min.js'
import tdToAsyncAPI from '@thing-description-playground/td_to_asyncapi/dist/web-bundle.min.js'
import * as tdDefaults from '@thing-description-playground/defaults/dist/web-bundle.min.js'
import { autoValidateBtn, resetLoggingBtn, validateJsonLdBtn, tmConformanceBtn, sectionHeaders } from './validation'

/**
 * Fetch the TD from the given address and return the JSON object
 * @param {string} urlAddr url of the TD to fetch
 */
export function getTdUrl(urlAddr) {
    return new Promise(resolve => {

        fetch(urlAddr)
            .then(res => res.json())
            .then(data => {
                resolve(data)
            }, err => { alert("JSON could not be fetched from: " + urlAddr + "\n Error: " + err) })

    })
}

//TODO : Remove function?
// /**
//  * Fetch the File from the given address and return the content as string
//  * @param {string} urlAddr url of the TD to fetch
//  */
// function getTextUrl(urlAddr){
//     return new Promise( resolve => {

//         fetch(urlAddr)
//         .then(res => res.text())
//         .then(data => {
//             resolve(data)
//         }, err => {alert("Text could not be fetched from: " + urlAddr + "\n Error: " + err)})
//     })
// }


/**
 *  Offers a given content for download as a file.
 * @param {string} fileName The title of the csv file
 * @param {string} content The content of the csv file
 * @param {string} type The content-type to output, e.g., text/csv;charset=utf-8;
 */
export function offerFileDownload(fileName, content, type) {

    const blob = new Blob([content], { type });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, fileName);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", fileName)
            link.setAttribute("src", url.slice(5))
            link.style.visibility = "hidden";
            document.body.appendChild(link)
            link.click();
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }
    }

}

/**
 * Generates an TD instance from
 * the TD in the Editor
 * @param {"json"|"yaml"} fileType
 */
export function generateTD(fileType, editor) {
    return new Promise((res, rej) => {
        const tdToValidate = editor.getValue()

        if (tdToValidate === "") {
            rej("No TD given to generate TD instance")
        }
        else if (fileType !== "json" && fileType !== "yaml") {
            rej("Wrong content type required: " + fileType)
        }
        else {
            try {
                const content = fileType === "json"
                    ? JSON.stringify(JSON.parse(Validators.convertTDYamlToJson(tdToValidate)), undefined, 4)
                    : Validators.convertTDJsonToYaml(tdToValidate)

                monaco.editor.setModelLanguage(editor.getModel(), fileType)
                editor.setValue(content)
            } catch (err) {
                rej("TD generation problem: " + err)
            }
        }
    })
}

/**
 * Generates an OpenAPI instance from
 * the TD in the Editor
 * @param {"json"|"yaml"} fileType
 */
export function generateOAP(fileType, editor) {
    return new Promise((res, rej) => {
        const tdToValidate = fileType === "json"
            ? editor.getValue()
            : Validators.convertTDYamlToJson(editor.getValue())

        if (tdToValidate === "") {
            rej("No TD given to generate OpenAPI instance")
        }
        else if (fileType !== "json" && fileType !== "yaml") {
            rej("Wrong content type required: " + fileType)
        }
        else {
            tdToOpenAPI(JSON.parse(tdToValidate)).then(openAPI => {
                const content = fileType === "json" ? JSON.stringify(openAPI[fileType], undefined, 4) : openAPI[fileType]
                monaco.editor.setModelLanguage(window.openApiEditor.getModel(), fileType)
                window.openApiEditor.getModel().setValue(content)
            }, err => { rej("OpenAPI generation problem: " + err) })
        }
    })
}

/**
 * Generates an AsyncAPI instance from
 * the TD in the Editor
 * @param {"json"|"yaml"} fileType
 */
export function generateAAP(fileType, editor) {
    return new Promise((res, rej) => {
        const tdToValidate = fileType === "json"
            ? editor.getValue()
            : Validators.convertTDYamlToJson(editor.getValue())

        if (tdToValidate === "") {
            rej("No TD given to generate AsyncAPI instance")
        }
        else if (fileType !== "json" && fileType !== "yaml") {
            rej("Wrong content type required: " + fileType)
        }
        else {
            tdToAsyncAPI(JSON.parse(tdToValidate)).then(asyncAPI => {
                const content = fileType === "json" ? JSON.stringify(asyncAPI[fileType], undefined, 4) : asyncAPI[fileType]
                monaco.editor.setModelLanguage(window.asyncApiEditor.getModel(), fileType)
                window.asyncApiEditor.getModel().setValue(content)
            }, err => { rej("AsyncAPI generation problem: " + err) })
        }
    })
}

/**
 * applies adding unset default values
 * to the TD in the editor
 */
export function addDefaults(editor) {
    const tdToExtend = editor["_domElement"].dataset.modeId === "json"
        ? JSON.parse(editor.getValue())
        : JSON.parse(Validators.convertTDYamlToJson(editor.getValue()))
    tdDefaults.addDefaults(tdToExtend)
    window.defaultsEditor.getModel().setValue(JSON.stringify(tdToExtend, undefined, 4))
    monaco.editor.setModelLanguage(window.defaultsEditor.getModel(), editor["_domElement"].dataset.modeId)
    if (editor["_domElement"].dataset.modeId === "yaml") {
        generateTD("yaml", window.defaultsEditor)
    }
}

/**
 * applies removing explicitly given
 * default values from the TD
 * in the editor
 */
export function removeDefaults(editor) {
    const tdToReduce = editor["_domElement"].dataset.modeId === "json"
        ? JSON.parse(editor.getValue())
        : JSON.parse(Validators.convertTDYamlToJson(editor.getValue()))
    tdDefaults.removeDefaults(tdToReduce)
    window.defaultsEditor.getModel().setValue(JSON.stringify(tdToReduce, undefined, 4))
    monaco.editor.setModelLanguage(window.defaultsEditor.getModel(), editor["_domElement"].dataset.modeId)
    if (editor["_domElement"].dataset.modeId === "yaml") {
        generateTD("yaml", window.defaultsEditor)
    }
}


//TODO-------------------- Doing now ------------------------------

/**
 * Calls the Validator of the core package
 * @param {string} body Thing Description/Thing Model to validate
 * @param {string} docType "td" or "tm"
 * @param {*} source "manual" or "auto"
 */
export function validate(thingType, editorContent) {

    resetValidationStatus()

    const checkJsonLd = validateJsonLdBtn.checked
    const checkTmConformance = tmConformanceBtn.checked

    const validator = thingType === "td" ? Validators.tdValidator : Validators.tmValidator

    validator(editorContent, log, { checkDefaults: true, checkJsonLd, checkTmConformance })
        .then(result => {
            console.log(result)

            Object.keys(result.report).forEach(el => {
                const spotName = "spot-" + el
                const resultIcon = document.getElementById(spotName).children[0].children[0]
                if (result.report[el] === "passed") {
                    resultIcon.classList.remove("fa-spinner")
                    resultIcon.classList.add("fa-circle-check")
                }
                else if (result.report[el] === "warning") {
                    resultIcon.classList.remove("fa-spinner")
                    resultIcon.classList.add("fa-circle-exclamation")

                }
                else if (result.report[el] === "failed") {
                    resultIcon.classList.remove("fa-spinner")
                    resultIcon.classList.add("fa-circle-xmark")
                }
                else if (result.report[el] === null) {
                    // do nothing
                }
                else {
                    console.error("unknown report feedback value")
                }
            })

            Object.keys(result.details).forEach(el => {
                const detailsName = el + "-section"
                const detailsIcon = document.getElementById(detailsName).children[0].children[0]
                
                if (result.details[el] === "passed") {
                    detailsIcon.classList.remove("fa-spinner")
                    detailsIcon.classList.add("fa-circle-check")
                }
                else if (result.details[el] === "warning" || result.details[el] === "not-impl") {
                    detailsIcon.classList.remove("fa-spinner")
                    detailsIcon.classList.add("fa-circle-exclamation")
                }
                else if (result.details[el] === "failed") {
                    detailsIcon.classList.remove("fa-spinner")
                    detailsIcon.classList.add("fa-circle-xmark")
                }
                else if (result.details[el] === null) {
                    // do nothing
                }
                else {
                    console.error("unknown report feedback value")
                }
            })

            Object.keys(result.detailComments).forEach(el => {
                const detailsName = el + "-section"
                const detailsDesc = document.querySelector(`#${detailsName} .description`)
                
                detailsDesc.textContent = result.detailComments[el]
            })
        })
}

function resetValidationStatus(){
    sectionHeaders.forEach(header => {
        const headerIcon = header.children[0]
        if(!headerIcon.classList.contains("fa-spinner")){
            headerIcon.classList.remove("fa-circle-check", "fa-circle-exclamation", "fa-circle-xmark")
            headerIcon.classList.add("fa-spinner")
        }
    })
}
//TODO-------------------- Doing now ------------------------------

function log(message) {
    console.log(message);
}

/**
 * Save current TD/TM as a compressed string in URL fragment.
 * @param {string} docType "td" or "tm"
 * @param {string} format "json" or "yaml"
 */
export async function save(formatType, thingType, editorContent) {

    const value = JSON.stringify(editorContent)
    if (!value) {
        alert(`No ${thingType.toUpperCase()} provided`);
        return;
    }

    const data = thingType + formatType + value
    const compressed = Validators.compress(data)
    return `${window.location.href}#${compressed}`
}

/**
 * Save current TD/TM as a compressed string in URL fragment to be opened with ediTDor.
 * @param {string} docType "td" or "tm"
 * @param {string} format "json" or "yaml"
 */
export async function openEditdor(formatType, thingType, editor) {

    const value = formatType === "yaml" ? Validators.convertTDYamlToJson(editor.getValue()) : editor.getValue()
    if (!value) {
        alert(`No ${thingType.toUpperCase()} provided`)
        return;
    }
    const data = thingType + formatType + value
    const compressed = Validators.compress(data)
    const URL = `https://eclipse.github.io/editdor/?td=${compressed}`
    window.open(URL, '_blank')
}

/**
 * Given a URL fragment construct current value of an editor.
 */
export function getEditorValue(fragment) {
    const data = Validators.decompress(fragment)
    return data || '';
}

// Monaco Location Pointer

/**
 * Finds the location/path of the text in JSON from its Monaco Editor location
 * @param {string} The text/keyword which is searched on the editor
 * @param {ITextModel} The text model of Monaco editor
 */
export function findJSONLocationOfMonacoText(text, textModel) {
    const matches = textModel.findMatches(text, false, false, false, null, false)
    const results = []

    matches.forEach(match => {
        const path = searchPath(textModel, getEndPositionOfMatch(match))
        results.push({ match, path })
    })

    return results
}

const QUOTE = '"'
const LEFT_BRACKET = "{"
const RIGHT_BRACKET = "}"
const SEMICOLON = ":"
const LEFT_SQUARE_BRACKET = "["
const RIGHT_SQUARE_BRACKET = "]"
const COMMA = ","

/**
 * Looks for specific characters on the model to figure out the path of the position/search text
 * @param {ITextModel} textModel The text model of Monaco Edtior
 * @param {IPosition} position The position on Monaco editor which consists of column and line number
 * @returns A string that is the path of the searched text. Search is done with the text's position on the editor
 */
function searchPath(textModel, position) {
    let path = '/'
    let parentKey = ''
    const stack = []
    let recordingParent = false
    let isValue = true
    let commaCount = 0

    for (let i = position.lineNumber; i > 0; i--) {
        const currentColumnIndex = (i === position.lineNumber ? position.column : textModel.getLineLength(i)) - 1
        const lineContent = textModel.getLineContent(i)
        for (let j = currentColumnIndex; j >= 0; j--) {
            const currentChar = lineContent[j]

            if (recordingParent) {
                if (currentChar === QUOTE) {
                    if (stack[stack.length - 1] === QUOTE) {
                        stack.pop()
                        path = "/" + parentKey + path
                        parentKey = ""
                        recordingParent = false
                    } else {
                        stack.push(currentChar)
                        continue
                    }
                }

                if (stack[stack.length - 1] === QUOTE) {
                    parentKey = currentChar + parentKey
                    continue
                }
            } else {
                if (currentChar === SEMICOLON) {
                    recordingParent = isValue

                    if (stack.length > 0) {
                        const top = stack[stack.length - 1]

                        if (top === LEFT_SQUARE_BRACKET) {
                            parentKey = "/" + commaCount.toString()
                            stack.pop()
                            recordingParent = true
                        }

                        if (top === LEFT_BRACKET) {
                            stack.pop()
                            recordingParent = true
                        }
                    }
                }

                if (currentChar === LEFT_SQUARE_BRACKET) {
                    isValue = false
                    if (stack.length > 0) {
                        if (stack[stack.length - 1] === RIGHT_SQUARE_BRACKET) {
                            stack.pop()
                        }

                        if (stack[stack.length - 1] === LEFT_BRACKET) {
                            stack.pop()
                            stack.push(currentChar)
                        }
                    } else {
                        commaCount = 0
                        stack.push(currentChar)
                    }
                }

                if (currentChar === LEFT_BRACKET) {
                    isValue = false
                    if (stack.length > 0 && stack[stack.length - 1] === RIGHT_BRACKET) {
                        stack.pop()
                    } else {
                        commaCount = 0
                        stack.push(currentChar)
                    }
                }

                if (currentChar === COMMA) {
                    isValue = false
                    if (stack.length <= 1) {
                        commaCount++
                    }
                }

                if (currentChar === RIGHT_SQUARE_BRACKET) {
                    isValue = false
                    stack.push(currentChar)
                }

                if (currentChar === RIGHT_BRACKET) {
                    isValue = false
                    stack.push(currentChar)
                }
            }
        }
    }

    return path
}

/**
 * Gets the end position of a match
 * @param {FindMatch} match
 * @returns The object contains the end column and line number of a match
 */
function getEndPositionOfMatch(match) {
    return {
        column: match.range.endColumn,
        lineNumber: match.range.endLineNumber
    }
}

/**
 * Finds the location of the text in Monaco Editor from its JSON location/path
 * @param {string} jsonPath The JSON path of the searched text
 * @param {string} text The text that is being searched
 * @param {ITextModel} textModel The text model of Monaco editor
 * @returns The location of the text on Monaco editor by describing its column and line number range
 */
export function findMonacoLocationOfJSONText(jsonPath, text, textModel) {
    const results = findJSONLocationOfMonacoText(text, textModel)
    let monacoLocation = {}

    if (results) {
        results.forEach(result => {
            if (jsonPath.localeCompare(result.path) === 0) {
                monacoLocation = result.match.range
                return
            }
        })
    }

    return monacoLocation
}