/**
 * @file The `editor.js` contains the main functionality
 * for the generated monaco editors and the surrounding elements
 * such as the tab functionality. It utilizes mutiple other files and dependncies
 * such as the monaco-editor dependencie, the monochrome-theme file to add the custom 
 * theme, some util functions, the td and tm schemas from the core @thing-description-playground
 * as well as the "Validators" and the JsonSpellChecker from the json-spell-checker dependency
 */

import * as monaco from 'monaco-editor'
import { getEditorValue } from "./util"
import { setFontSize, editorForm, fontSizeSlider } from './settings'
import { jsonBtn, yamlBtn } from './json-yaml'
import tdSchema from '../../node_modules/@thing-description-playground/core/td-schema.json'
import tmSchema from '../../node_modules/@thing-description-playground/core/tm-schema.json'
import * as Validators from '@thing-description-playground/core/dist/web-bundle.min.js'
import * as JsonSpellChecker from '@thing-description-playground/json-spell-checker/dist/web-bundle.min.js'

/***********************************************************/
/*                    Editor and tabs                      */
/***********************************************************/

//Decalre all necessary item from the DOM
const addTab = document.querySelector(".ide__tabs__add")
const tabsLeftContainer = document.querySelector(".ide__tabs__left")
const ideContainer = document.querySelector(".ide__container")
let tabsLeft = document.querySelectorAll(".ide__tabs__left li:not(:last-child)")
// todo import the container/console values from console file
//console containers
const visualizationContainers = document.querySelectorAll(".console-view")
const visualizationOptions = document.querySelectorAll(".visualization__option")

//Editor list array where all the generated editor will be added and referenced from
export let editorList = []
let i = 1

//Initiate by generating the first editor and the respective tab
createIde(i)

/**
 * Funtion which creates a tab for the respective editor
 * and adds all other tab component such as the close button
 * @param {Number} tabNumber - the "id" number for the tab
 * @param {String} exampleName - the initial/default name shown in the tab
 * @param {String} thingType - the type of the object TD or TM
 */
function createTab(tabNumber, exampleName, thingType) {

  const newTab = document.createElement("li")
  //assign the tabNumber to the data-tab-id property
  newTab.setAttribute("data-tab-id", tabNumber)
  newTab.setAttribute('id', 'tab');

  //Add thing type icon to the tab
  const tabIcon = document.createElement("p")
  tabIcon.classList.add("tab-icon")
  if(thingType === "TM"){
    tabIcon.innerText = "TM"
  }else{
    tabIcon.innerText = "TD"
  }

  const tabContent = document.createElement("p")
  //If there is not specified example name give the default Thing Description + tabNumber
  //Else, if the the user uses TD/TM example use the example name as the tab name
  if(exampleName === undefined || exampleName === ""){
    tabContent.innerText = `Thing Description ${tabNumber}`
  }
  else{
    tabContent.innerText = exampleName
  }
  tabContent.classList.add("content-tab")
  //Add the close btn element
  const closeBtn = document.createElement("div")
  closeBtn.classList.add("close-tab")
  //Assign icon to the close btn
  const closeIcon = document.createElement("i")
  closeIcon.classList.add("fa-solid", "fa-xmark")

  closeBtn.appendChild(closeIcon)
  newTab.appendChild(tabIcon)
  newTab.appendChild(tabContent)
  newTab.appendChild(closeBtn)

  //Insert the newly created list at the end of the tab container but before the add new tab button
  tabsLeftContainer.insertBefore(newTab, tabsLeftContainer.children[(tabsLeftContainer.children.length) - 1])
  tabsLeft = document.querySelectorAll(".ide__tabs__left li:not(:last-child)")

  //Once the new tab is created remove "active class from all other tab" as well as the
  //contenteditable attribute and give the class "active to the new tab"
  tabsLeft.forEach(tab => {
    tab.classList.remove("active")
    tab.children[0].removeAttribute("contenteditable")
  })
  newTab.classList.add("active")
}

/**
 * Function which takes care of creating the new editor from monaco
 * and appends them to the DOM
 * @param {Number} ideNumber - the id which is assign to the editor in order to connect to the respective tab
 * @param {Object} exampleValue - the td or tm as a json object
 */
function createIde(ideNumber, exampleValue){
  clearConsole()
  const url = getEditorValue(window.location.hash.substring(1))
  // console.log("url:" + url);
  // console.log(window.location.hash.substring(1));
  let defaultValue = {}
  let editorLanguage = "json"

  if(url === ""){
    // If example value is empty utilize a preset of the most basic form of a td
    // else utilize the td/tm from the exampleValue
    if(exampleValue === undefined){
      defaultValue = {
        "@context": "https://www.w3.org/2022/wot/td/v1.1",
        "id": "urn:uuid:0804d572-cce8-422a-bb7c-4412fcd56f06",
        "@type": "Thing",
        "title": `My thing ${ideNumber}`,
        "description": "Thing Description for a Lamp thing",
        "securityDefinitions": {
            "basic_sc": {"scheme": "basic", "in": "header"}
        },
        "security": "basic_sc",
        "properties": {},
        "actions": {},
        "events": {}
      }
    }
    else{
      delete exampleValue["$title"]
      delete exampleValue["$description"]
      defaultValue = exampleValue
    }
  }
  else{
    if(url.substring(2,6) === "json"){
      const urlValue = JSON.parse(url.substring(6))
      defaultValue = urlValue
    }
    else{
      defaultValue = url.substring(6)
    }
    editorLanguage = url.substring(2,6)
    //remove the hash from the url to allow new editor to be created
    window.history.replaceState("", "", window.location.origin);
  }

  //Create the container for the new editor and add all necessary attributes for styling and identifiers
  const newIde = document.createElement("div")
  newIde.classList.add("editor")
  newIde.setAttribute('id', `editor${ideNumber}`)
  newIde.setAttribute("data-ide-id", ideNumber)
  ideContainer.appendChild(newIde)

  //New monaco editor is created
  initEditor(ideNumber, defaultValue, editorLanguage)

  //remove the active class from previous editor
  editorList.forEach(editor => {
    editor["_domElement"].classList.remove("active")
  })

  //Add active class to new editor
  newIde.classList.add("active")

  //Create the new tab depending if its a TM or TD
  if(defaultValue["@type"] === "tm:ThingModel"){
    createTab(ideNumber,defaultValue["title"],"TM")
  }
  else{
    createTab(ideNumber,defaultValue["title"],"TD")
  }
}

/**
 * Async funtion to initiate the editors
 * @param {Number} ideNumber 
 * @param {Object} defaultValue 
 * @param {String} editorLanguage 
 */
async function initEditor(ideNumber, editorValue, editorLanguage) {
  editorValue = JSON.stringify(editorValue, null, 2)

  var editor = monaco.editor.create(document.getElementById(`editor${ideNumber}`), {
      value: editorValue, 
      language: editorLanguage,
      automaticLayout: true,
      formatOnPaste: true
  })

  //Bind the font size slider from the settings to the editor(s) and assign the specified font size
  document.onload = setFontSize(editor)
  fontSizeSlider.addEventListener("input", () => {
    setFontSize(editor)
  })

  //Bind the reset button form the settings to the editor and assign the specied font size
  editorForm.addEventListener("reset", () => {
    setFontSize(editor)
  })

  editor.getModel().onDidChangeContent(_ => {
    clearConsole()

    try{
      const editorValues = checkThingType(editor)
      changeThingIcon(editorValues[1])

      //Only use the spell checker if file is json
      if(jsonBtn.checked === true){
        //Get if thing type and set the respective schema
        if(editorValues[0]["@type"] === "tm:ThingModel"){
          // Configure JSON language support with schemas and schema associations
          monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
              {
                fileMatch: [editor.getModel().uri.toString()],
                schema: tmSchema,
                uri: 'file:///tm-schema.json'
              }
            ]
          });
        }
        else{
          monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
              {
                fileMatch: [editor.getModel().uri.toString()],
                schema: tdSchema,
                uri: 'file:///td-schema.json'
              }
            ]
          });
        }

        markTypos(editor.getModel());
        //TODO add auto validate functionality
        // // util.validate('auto', autoValidate, docType);
      }
    }catch(err){
      console.error("Not a proper JSON object");
    }

  });

  editorList.push(editor)
}

/**
 * Marks the possible typos on the editor
 * @param {object} model - The model that represents the loaded Monaco editor
 */
function markTypos(model) {
	const markers = []

	JsonSpellChecker.configure()
	const typos = JsonSpellChecker.checkTypos(model.getValue())

	typos.forEach(typo => {
		markers.push({
			message: typo.message,
			severity: monaco.MarkerSeverity.Warning,
			startLineNumber: typo.startLineNumber,
			startColumn: typo.startColumn,
			endLineNumber: typo.endLineNumber,
			endColumn: typo.endColumn
		})
	})

	monaco.editor.setModelMarkers(model, 'typo', markers)
}

/**
 * Check for the content of the editor either json or yaml and return content and thing type
 * @param { monaco object } editor 
 * @returns [editorContent, thingType]
 */
function checkThingType(editor){
  let editorContent = ""
  let thingType = ""

  if(jsonBtn.checked === true){
    editorContent = JSON.parse(editor.getValue())
  }else{
    editorContent = JSON.parse(Validators.convertTDYamlToJson(editor.getValue()))
  }

  if(editorContent["@type"] === "tm:ThingModel"){
    thingType = "TM"
  }else{
    thingType = "TD"
  }

  return [editorContent, thingType]
}

/**
 * Finds the current active tab and modifies the icon accordingly
 * @param { string } thingType - TM or TD to modify the tab icon
 */
function changeThingIcon(thingType){
  tabsLeft.forEach(tab => {
    if(tab.classList.contains("active")){
      tab.children[0].innerText = thingType
    }
  })
}

/**
 * Create a new editor and respective tab when clicking on the plus tab
 * Always initialized the new added thing as a TD
 * Set the json btn to true
 */
addTab.addEventListener("click", () => {
  createIde(++i)
  jsonBtn.checked = true
})

/**
 * Getting and managing all event inside the tabs, such as closing and selecting each tab
 * @param {event} e - click event
 */
tabsLeftContainer.addEventListener("click", (e) => {
  //getting the initial target
  const selectedElement = e.target
  clearConsole()

  //Add the active styling when tab is clicked
  if (selectedElement.id == "tab" || selectedElement.parentElement.id == "tab") {

    //Removing the active style from all tabs and contenteditable attribute
    tabsLeft.forEach(tab => {
      tab.classList.remove("active")
      tab.children[0].removeAttribute("contenteditable")
    })
    //removing the active style from all editors
    editorList.forEach(ide => {
      ide["_domElement"].classList.remove("active")
    })

    //if the target element is the tab itself add the active class
    //else if the target element is a child of the element add the active calss to the parent element
    if (selectedElement.id == "tab") {
      selectedElement.classList.add("active")
    }
    else {
      selectedElement.parentElement.classList.add("active")
    }

    //Get the id of the element and setting the active style to the respective editor
    if(selectedElement.dataset.tabId){
      editorList.forEach(ide => {
        if(selectedElement.dataset.tabId === ide["_domElement"].dataset.ideId){
          ide["_domElement"].classList.add("active")
        }
      })
    }
    else{
      editorList.forEach(ide => {
        if(selectedElement.parentElement.dataset.tabId === ide["_domElement"].dataset.ideId){
          ide["_domElement"].classList.add("active")
        }
      })
    }
  }

  //Closing tabs only when the click event happens on the close icon of the tab
  if (selectedElement.className == "close-tab" && tabsLeft.length >= 1) {
    //If there is only one tab and its closed create a completely editor and tab and restart the counter
    //If not the last one adjust the styling accordingly and update the amount of tabs
    if (tabsLeft.length == 1) {
      i = 0
      editorList.forEach(ide => {
        if(selectedElement.parentElement.dataset.tabId === ide["_domElement"].dataset.ideId){
          //remove the editor from the editor list array and from the DOM
          const index = editorList.indexOf(ide)
          editorList.splice(index, 1)
          ide["_domElement"].remove()
        }
      })
      //remove tab
      selectedElement.parentElement.remove()
      //create new tab
      createIde(++i)
      jsonBtn.checked = true
    }
    else {
      editorList.forEach(ide => {
        if(selectedElement.parentElement.dataset.tabId === ide["_domElement"].dataset.ideId){
          const index = editorList.indexOf(ide)
          editorList.splice(index, 1)
          ide["_domElement"].remove()
        }
      })
      selectedElement.parentElement.remove()
      tabsLeft = document.querySelectorAll(".ide__tabs__left li:not(:last-child)")
      tabsLeft[0].classList.add("active")
      editorList[0]["_domElement"].classList.add("active")
    }
  }

  findFileType()
})

/**
 * Find if active editor is json or yaml and change the json/yaml btns repectively
 */
function findFileType(){
  editorList.forEach(editor => {
    if(editor["_domElement"].classList.contains("active")){
      if(editor["_domElement"].dataset.modeId === "json"){
        jsonBtn.checked = true
      }
      else{
        yamlBtn.checked = true
      }
    }
  })
}

/**
 * Unchecks all visualizatin btns and hiddes all visualization containers
 */
function clearConsole(){
  visualizationContainers.forEach(container => {
    container.classList.add("hidden")
  })
  visualizationOptions.forEach(option => {
    option.checked = false
  })
}


//TODO improve the change name functionality
// /**
//  * Event listener to allow the user to change the name of the name by double clicking
//  * @param {event} e - dblclick event
//  */
// tabsLeftContainer.addEventListener("dblclick", (e) => {
//   const selectedElement = e.target

//   //If target has the calss of content-tab set the attribute contenteditable to true and focus the element
//   if (selectedElement.className == "content-tab") {
//     selectedElement.setAttribute("contenteditable", "true")
//     selectedElement.focus()

//     //Once user presses enter disable the contenteditable attribute and stop focus
//     selectedElement.addEventListener("keypress", (e) => {
//       //If element is left empty add a default text
//       //else remove the content editable attribute and stop focus
//       if(e.key === "Enter"){
//         if(selectedElement.innerText === "\n"){
//           selectedElement.innerText = "My Thing"
//         }
//         else{
//           selectedElement.setAttribute("contenteditable", "false")
//           selectedElement.blur()
//         }
//       }
//     })
//   }
// })