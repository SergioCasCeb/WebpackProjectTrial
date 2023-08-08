/**
 * @file The `json-yaml.js` contains the main functionality
 * for converting json to yaml and vice versa, utilizing the util's 
 * funcions and the editorList array from the editor file.
 */
import { editorList } from './editor.js'
import { generateTD } from './util.js'

/***********************************************************/
/*                   Yaml functionality                    */
/***********************************************************/

export const yamlBtn = document.querySelector("#file-type-yaml")
export const jsonBtn = document.querySelector("#file-type-json")
const yamlWarning = document.querySelector('.json-yaml-warning')
const yamlConfirmBtn = document.querySelector("#yaml-confirm-btn")
const yamlCancelBtn = document.querySelector("#yaml-cancel-btn")
jsonBtn.checked = true


//Click event to show the warning text before converting the td/tm
yamlBtn.addEventListener("click", ()=> {
  editorList.forEach(editor => {
    if(editor["_domElement"].classList.contains("active")){
      try{
        JSON.parse(editor.getValue())
      }
      catch(err){
        alert('TD is not a valid JSON object');
        jsonBtn.checked = true
        return
      }
      yamlWarning.classList.remove('closed')
    }
  })
})

//Close the warning without converting
yamlCancelBtn.addEventListener("click", () => {
  yamlWarning.classList.add('closed')
  jsonBtn.checked = true
})

//Confirm the json to yaml convertion
yamlConfirmBtn.addEventListener("click", () => {
  yamlWarning.classList.add('closed')
  convertJsonYaml()
})

jsonBtn.addEventListener("click", ()=> {
  convertJsonYaml()
})

/**
 * Get the currently active editor and its value and convert to json or yaml
 */
function convertJsonYaml(){
  editorList.forEach(editor => {
    if(editor["_domElement"].classList.contains("active")){
      generateTD(jsonBtn.checked === true ? "json" : "yaml", editor)
    }
  })
}