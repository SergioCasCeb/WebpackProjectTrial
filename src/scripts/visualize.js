import {collapseBtn, expandBtn, jsonldVis} from "./jsonld-vis.js"
import * as vVis from "./vega-vis.js"

export const visualizeView = document.querySelector("#visualize-view")
export const visualizeTab = document.querySelector("#visualize-tab")

export function visualize(editorValue) {
    let td
    collapseBtn.disabled = false
    expandBtn.disabled = false
    
    try {
        td = JSON.parse(editorValue)
        visualizeView.classList.remove("hidden")

        document.getElementById("visualized").innerHTML = "";
        jsonldVis(td, "#visualized", {
            h: document.getElementById("visualize-container").offsetHeight - 30,
            w: document.getElementById("visualize-container").offsetWidth - 20,
            maxLabelWidth: 200,
            scalingFactor: 5,
        })

    } catch (err) {
        alert(`Incorrect JSON: ${err}`);
        return false;
    }



    // if (visType === "graph") {
    //     document.getElementById("visualized").innerHTML = "";
    //     .jsonldVis(td, "#visualized", {
    //         h: document.getElementById("visualized-wrapper").offsetHeight,
    //         maxLabelWidth: 200,
    //         scalingFactor: 5,
    //     });
    // } else {
    //     vVis.vegaVis("#visualized", td);
    // }

    // // Alter visibility of related controls
    // document.querySelectorAll(`div[class*="controls-"]`).forEach((x) => {
    //     if (x.classList.contains(`controls-${visType}`) || x.classList.contains("controls-all")) {
    //         x.style.display = "block";
    //     } else {
    //         x.style.display = "none";
    //     }
    // });

    return true;
}