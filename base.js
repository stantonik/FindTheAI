export const panels = ["rules", "settings", "game"];

export function displayPanel(name) {
        panels.forEach((panel) => {
                if (panel === name) {
                        document.getElementById(panel).style.display = "block";
                }
                else {
                        document.getElementById(panel).style.display = "none";
                }
        });
}
