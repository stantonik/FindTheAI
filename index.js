import { start } from './game.js';

function displayPanel(name) {
        const panels = document.querySelectorAll('.panel');

        panels.forEach(panel => {
                if (panel.id === name) {
                        panel.classList.add('active');
                } else {
                        panel.classList.remove('active');
                }
        });
}

// Event listeners
document.getElementById("settings-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const config = {
                "type": e.target.querySelector("#type").value,
                "date": e.target.querySelector("#date").value,
                "hour": e.target.querySelector("#hour").value,
                "place": e.target.querySelector("#place").value,
                "difficulty": e.target.querySelector("#difficulty").value
        };

        displayPanel("game");
        start(config);
});

document.getElementById("goto-settings").addEventListener("click", () => {
        displayPanel("settings");
});

displayPanel("rules");

// displayPanel("game");
// start({
//         "theme": "fantasy",
//         "type": "murder",
//         "date": "22-11-2024",
//         "hour": "10:10",
//         "place": "lake",
//         "difficulty": "easy"
// });


