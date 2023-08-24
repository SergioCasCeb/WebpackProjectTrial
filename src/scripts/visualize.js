import * as jVis from "./jsonld-vis.js"
import * as vVis from "./vega-vis.js"

export const visualizeView = document.querySelector("#visualize-view")

export function visualize(editorValue) {
    let td;
    try {
        td = JSON.parse(editorValue);
    } catch (err) {
        alert(`Incorrect JSON: ${err}`);
        return false;
    }

    document.getElementById("visualized").innerHTML = "";
    jVis.jsonldVis(td, "#visualized", {
        h: document.getElementById("visualize-container").offsetHeight - 30,
        w: document.getElementById("visualize-container").offsetWidth - 20,
        maxLabelWidth: 200,
        scalingFactor: 5,
    });

    // if (visType === "graph") {
    //     document.getElementById("visualized").innerHTML = "";
    //     jVis.jsonldVis(td, "#visualized", {
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