import * as monaco from 'monaco-editor'
import { setFontSize, editorForm, fontSizeSlider } from './settings-menu'
import { generateTD, offerFileDownload } from './util'
import { getEditorData } from './editor'

/******************************************************************/
/*                    AsyncAPI functionality                       */
/******************************************************************/

//AsyncAPI Elements
export const asyncApiTab = document.querySelector(".async-view-btn")
export const asyncApiJsonBtn = document.querySelector("#async-api-json")
export const asyncApiYamlBtn = document.querySelector("#async-api-yaml")
const asyncApiDownload = document.querySelector("#async-api-download")