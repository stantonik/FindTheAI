import { HfInference } from "https://cdn.jsdelivr.net/npm/@huggingface/inference@2.8.1/+esm";
import { displayPanel } from './base.js';

export const canvasWidth = 1920;
export const canvasHeight = 1080;

var suspect_count = 0;

class Suspect
{
        constructor(context, role, personality) {
                this.id = suspect_count;
                suspect_count++;

                this.role = role;
                this.friend = "";
                this.personality = personality;
                this.context = context;
                this.log = [];
                this.inference = new HfInference("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");
                this.lastAnswer = "";
        }

        talk(question) {
                return new Promise((resolve, reject) => {
                        // Memory simulation
                        let content = this.context + `You are ${this.role} and ${this.personality}`;
                        this.log.forEach((msg) => { content += `Q:${msg['Q']}, A:${msg['A']}`; });
                        content += `Current question : ${question}, Anwser:`;

                        console.log(content);

                        this.inference.chatCompletion({
                                model: "meta-llama/Llama-3.2-1B-Instruct",
                                messages: [
                                        {
                                                role: "user",
                                                content: content
                                        }
                                ],
                                max_tokens: 200
                        })
                                .then((res) => {
                                        this.lastAnswer = res.choices[0].message.content;
                                        this.log.push({'Q': question, 'A': this.lastAnswer});
                                        resolve(this.lastAnswer);
                                })
                                .catch((error) => { reject(error); })
                });
        }
}

const canvas = document.getElementById("game-canvas");

const suspectNumber = 3;
const maxQuestionNumber = 5;

var currentSuspect;
var lastUserInput = "";

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

        const silhouettes = await loadImage("./static/img/perso.webp");
        ctx.drawImage(silhouettes, (canvasWidth - 1000) / 4, 80, 1000, 1000);

        // User bubble
        ctx.fillStyle = "white";
        ctx.font = "34px arial";
        drawWrappedText(ctx, lastUserInput, canvasWidth * 0.25, 100, 450);

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
        displayPanel("game");

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = `This is a RPG game. You are [suspect_name], accused of a crime at ${JSON.stringify(config)}. Your alibi is [alibi]. Respond naturally to the following questions while staying consistent with your alibi.`;
        currentSuspect = new Suspect(context, "guilty", "anxious");
        let questionCount = 0;


        document.getElementById("chat").addEventListener("submit", (e) => {
                e.preventDefault();

                const input = e.target.querySelector("input");
                const questionedPersonne = `${""} suspect ${currentSuspect.id}`;
                input.placeholder = `Type here to talk to ${questionedPersonne}...`;
                lastUserInput = input.value;
                draw(canvas);

                if (questionCount < maxQuestionNumber) {
                        currentSuspect.talk(lastUserInput).then(() => draw(canvas));
                        questionCount++;
                        e.target.querySelector("input").value = "";
                }
                else {
                        questionCount = 0;
                        currentSuspect++;
                        if (currentSuspect >= suspectNumber)
                        {
                                console.log("finish");
                        }
                }
        });

        draw(canvas);
}

