import { LlamaCpp } from "./llama-mt/llama.js" 

const canvasWidth = 1920;
const canvasHeight = 1080;
const model = "https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q3_K_M.gguf";

const canvas = document.getElementById("game-canvas");
const loadingModelDiv = document.getElementById("model-loading");
const chatForm = document.getElementById("chat");
const input = chatForm.querySelector("input");
const button = document.getElementById("button-action");

const personalities = ["anxious", "honest", "neutral", "offensive"];

var context;
var suspectNumber = 2;
const maxQuestionNumber = 2;
var currentSuspect;
var guilty;
var questionedPerson;
var suspectCount = 0;
var finished = false;

class Suspect
{
        constructor() {
                this.id = suspectCount;
                suspectCount++;

                if (guilty === this.id) {
                        this.role = "guilty";
                }
                else {
                        this.role = "innocent";
                }

                this.friend = "";
                this.personality = personalities[Math.floor(Math.random() * personalities.length)];
                this.log = [];

                this.inference = null;
                this.questionCount = 0;
                this.lastQuestion = "";
                this.lastAnswer = "";
        }

        onModelLoaded() {
                loadingModelDiv.setAttribute("hidden", "hidden");

                let prompt = `Instruct: ${context} You are ${this.role} and ${this.personality}.`;
                if (this.log.length > 0) {
                        prompt += `Last conversation: ${this.log.join()}`;
                }
                prompt = prompt.replace('\n', ' ');

                prompt += `Current question: ${this.lastQuestion}\nOutput:`;
                console.log(prompt);

                this.inference.run({
                        prompt: prompt,
                        ctx_size: 2048,
                        temp: 0.8,
                        top_k: 30,
                        no_display_prompt: true,
                });

                input.placeholder = `${questionedPerson} is thinking...`;
        }

        onMessageChunk(text) {
                this.lastAnswer += text;
                input.placeholder = `${questionedPerson} is talking...`;
                draw(canvas);
        }

        onComplete() {
                this.log.push(`Q:${this.lastQuestion}, A:${this.lastAnswer.replace('\n', ' ')}`);

                if (suspectCount >= suspectNumber)
                {
                        input.removeAttribute("disabled");
                        console.log("finish");
                        input.placeholder = "Take a choice now (ex: 1)";
                        input.type = "number";
                        finished = true;
                }
                else if (currentSuspect.questionCount >= maxQuestionNumber) {
                        input.setAttribute("hidden", "hidden");
                        button.innerHTML = "Next suspect";
                        button.removeAttribute("hidden");
                        input.placeholder = "";
                }
                else {
                        input.removeAttribute("hidden");
                        input.removeAttribute("disabled");
                        input.placeholder = `Type here to talk to ${questionedPerson}...`;
                        draw(canvas);
                }
        }

        anwser(question) {
                loadingModelDiv.removeAttribute("hidden");
                input.disabled = true;

                this.questionCount++;
                this.lastQuestion = question;
                this.lastAnswer = "";

                draw(canvas);

                if (this.inference) {
                        this.onModelLoaded();
                        return;
                }

                this.inference = new LlamaCpp(
                        model,
                        this.onModelLoaded.bind(this),
                        this.onMessageChunk.bind(this),
                        this.onComplete.bind(this)
                );
        }


}

function drawWrappedText(ctx, text, x, y, maxWidth) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';

                if (ctx.measureText(testLine).width > maxWidth && line) {
                        ctx.fillText(line, x, currentY);
                        line = words[n] + ' ';
                        currentY += parseInt(ctx.font) * 1.2;
                } 
                else {
                        line = testLine;
                }
        }

        if (line) {
                ctx.fillText(line, x, currentY);
        }
}

function loadImage(src) {
        return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(err);
        });
}

async function draw(canvas) {
        if (!canvas.getContext) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const silhouettes = await loadImage("./img/perso.webp");
        ctx.drawImage(silhouettes, (canvasWidth - 1000) / 4, 80, 1000, 1000);

        // User bubble
        ctx.fillStyle = "white";
        ctx.font = "34px arial";
        drawWrappedText(ctx, currentSuspect.lastQuestion, canvasWidth * 0.25, 100, 450);

        // Suspect bubble
        ctx.fillStyle = "white";
        ctx.font = "30px arial";
        drawWrappedText(ctx, currentSuspect.lastAnswer, canvasWidth * 0.65, 100, 600);

        // Suspect id
        ctx.fillStyle = "black";
        ctx.font = "48px arial";
        ctx.fillText(`${currentSuspect.id + 1}`, canvasWidth * 0.58, canvasHeight * 0.5);
}

export function start(config) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        switch (config.difficulty) {
                case "easy":
                        suspectNumber = 2;
                        break;
                case "medium":
                        suspectNumber = 3;
                        break;
                case "hard":
                        suspectNumber = 4;
                        break;
        }

        guilty = Math.floor(Math.random() * suspectNumber);

        const paramstr = Object.entries(config)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");

        context = `This is a RPG game. You are accused of a crime at ${paramstr}. Respond naturally to the following questions while staying consistent with your alibi.`;

        currentSuspect = new Suspect();

        questionedPerson = `Suspect ${currentSuspect.id + 1}`;
        input.placeholder = `Type here to talk to ${questionedPerson}...`;

        draw(canvas);

}

// Events
chatForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (finished) {
                let res = parseInt(input.value) - 1;
                input.value = "";
                input.disabled = "true";

                if (guilty == res) {
                        input.placeholder = "You win !";
                }
                else {
                        input.placeholder = "You loose !";
                }
        }
        else {
                currentSuspect.anwser(input.value);
                input.value = "";
        }
});

button.addEventListener("click", () => {
        if (button.innerHTML === "Restart") {
        }
        else if (button.innerHTML === "Next suspect") {
                currentSuspect = new Suspect();
                questionedPerson = `${""}Suspect ${currentSuspect.id + 1}`;


                input.removeAttribute("disabled");
                input.removeAttribute("hidden");
                input.placeholder = `Type here to talk to ${questionedPerson}...`;
                draw(canvas);
        }

        button.setAttribute("hidden", "hidden");
})
