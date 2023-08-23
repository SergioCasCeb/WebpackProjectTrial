/**
 * @file The `defaults.js` takes care of the main functionality for the 
 * Defaults feature within the console. This include initializing the editor,
 * connecting it to the local storage, as well as the main buttons within the Defaults
 * feature such as json, yaml conversion and the download option.
 */

import * as monaco from 'monaco-editor'
import { setFontSize, editorForm, fontSizeSlider } from './settings-menu'
import { generateTD, offerFileDownload } from './util'
import { getEditorData } from './editor'

/******************************************************************/
/*                    Defaults functionality                       */
/******************************************************************/

//Default Elements
const defaultTab = document.querySelector(".defaults-tab-btn")
const defaultsJsonBtn = document.querySelector("#defaults-json")
const defaultsYamlBtn = document.querySelector("#defaults-yaml")
const defaultsAddBtn = document.querySelector("#defaults-add")
const defaultsRemoveBtn = document.querySelector("#defaults-remove")
const defaultsDownload = document.querySelector("#defaults-download")
export const defaultsView = document.querySelector("#defaults-view")

