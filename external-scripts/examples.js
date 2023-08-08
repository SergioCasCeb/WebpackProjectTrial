/**
 * @file The `examples.js` contains generates a json file
 * with all the links to the respective raw links in the 
 * main github repository utilizing the examples folder
 */

const fs = require('fs');
const path = require('path');
//path to where all the td/tm examples
const initialPath = "./examples";
//path to the get the raw files from the github
const rawFilePath = "https://raw.githubusercontent.com/eclipse-thingweb/playground/master/examples"
let files = fs.readdirSync(initialPath);

let examplesPaths = {}

files.forEach(file => {
    //initializing the object by creating a td and a tm object
    examplesPaths[file] = {}
    
    //getting all the cattegories from the td/tm files
    let categories = fs.readdirSync(initialPath+"/"+file)

    //sorting them by the first number in their name
    categories.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    categories.forEach(category => {

        let examples = fs.readdirSync(initialPath+"/"+file+"/"+category)
        
        //for each category, create a description with the path to the readMe file, and an examples object to store all the respective exampele
        examplesPaths[file][category] = {
            "description": "",
            "examples": {}
        }

        examples.forEach(example => {
            //for each category, get the readMe file to be used as the description
            if(path.extname(example) == ".txt"){
                examplesPaths[file][category]["description"] = `${rawFilePath}/${file}/${category}/${example}`
            }

            //for each category get the .jsonld files to use as the examples
            if(path.extname(example) == ".jsonld"){
                examplesPaths[file][category]["examples"][example] = {
                    "path": `${rawFilePath}/${file}/${category}/${example}`
                }
            }
        })
    })
})

//Creating the json file to be used by the application
fs.writeFile("./src/examples/examples-paths.json", JSON.stringify(examplesPaths, null, 2), 'utf-8', (err) => {
    if(err){
        console.log(err)
    }else{
        console.log("File created succesfully");
    }
})
