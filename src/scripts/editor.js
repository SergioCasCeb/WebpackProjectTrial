import * as monaco from 'monaco-editor';
import themeData from './monochrome-theme';

/***********************************************************/
/*              Set New Theme Monaco editor                */
/***********************************************************/
monaco.editor.defineTheme('monochrome', themeData)

/***********************************************************/
/*                    Editor and tabs                      */
/***********************************************************/

//Decalre all necessary item from the DOM
const addTab = document.querySelector(".ide__tabs__add")
const tabsLeftContainer = document.querySelector(".ide__tabs__left")
const ideContainer = document.querySelector(".ide__container")
let tabsLeft = document.querySelectorAll(".ide__tabs__left li:not(:last-child)")
//Editor list array where all the generated editor will be added and referenced from
let editorList = []
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
  // const url = util.getEditorValue(window.location.hash.substring(1));
  let defaultValue = {}
  let editorLanguage = "json"

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
async function initEditor(ideNumber, defaultValue, editorLanguage) {
    defaultValue = JSON.stringify(defaultValue, null, 2)

    var editor = monaco.editor.create(document.getElementById(`editor${ideNumber}`), {
        value: defaultValue, 
        language: editorLanguage,
        automaticLayout: true,
        formatOnPaste: true
    })

    editorList.push(editor)
}