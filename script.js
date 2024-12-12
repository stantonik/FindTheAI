import { start } from './game.js';
import { displayPanel } from './base.js';

displayPanel("rules");

// start({
//         "theme": "fantaisy",
//         "type": "murder",
//         "date": "22-11-2024",
//         "hour": "10:10",
//         "place": "lake",
//         "difficulty": "easy"
// });


// Event listeners
document.getElementById("settings-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const config = {
                "theme": e.target.querySelector("#theme").value,
                "type": e.target.querySelector("#type").value,
                "date": e.target.querySelector("#date").value,
                "hour": e.target.querySelector("#hour").value,
                "place": e.target.querySelector("#place").value,
                "difficulty": e.target.querySelector("#difficulty").value
        };

        start(config);
});

[...document.getElementsByClassName("next-panel")].forEach((b) => {
        b.addEventListener("click", () => {
                displayPanel("settings");
        });
});
