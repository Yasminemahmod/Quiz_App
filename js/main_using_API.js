let quiz = document.querySelector(".quiz-app");
let questionCount = document.querySelector(".question-count .count");
let questionsCat = document.querySelector(".quiz-cat .curr-cat");
let question = document.querySelector(".question");
let answers = document.querySelector(".answers");
let bulletsArea = document.querySelector(".bullets .spans");
let result = document.querySelector(".result");
let submitBtn = document.querySelector(".submit-btn");
let nextBtn = document.querySelector(".next-btn");
let timer = document.querySelector(".timer");
let quesArea = document.querySelector(".question-area");
let containers = Array.from(document.querySelectorAll(".cont"));

let currQ = 0;
let rightCount = 0;
let notFinish = true;
let intervalCount;


// Choose Category
function chooseCat() {
    let startBtns = Array.from(document.querySelectorAll(".start-btn"));
    startBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            let cat = this.parentElement.dataset.cat;
            showQuestion(cat);
            containers.forEach(cont => {
                cont.classList.toggle("d-none");
            });
        })
        
    })
}
chooseCat();


// Retrieving Data From JSON File
function showQuestion(cat) {
    const category = cat;
    let response = new XMLHttpRequest();

    response.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            let data = JSON.parse(response.responseText);
            let qCount = data.length;

            // Set Category of Questions
            questionsCat.innerText = category;

            // Show Asnwers
            displayAnswer(data[currQ], qCount);

            // Create Bullets
            actWithBullets(qCount);

            // Timer Count Down
            timerCountDown(qCount);

            // Check Answers
            submitBtn.addEventListener('click', () => {checkAnswers(data[currQ])});

            // Change Question
            nextBtn.addEventListener('click', () => {
                if(currQ === qCount - 1) {
                    // quesArea.classList.add("d-none");
                }
                currQ++;
                displayAnswer(data[currQ] , qCount);
                actWithBullets(qCount);
                submitBtn.removeAttribute("disabled");

                if(currQ === (qCount-1)) {
                    nextBtn.classList.replace("next-btn", "finish-btn");
                    nextBtn.innerText = "Finish";
                    document.querySelector(".finish-btn").addEventListener("click", () => {
                        showResult(qCount);
                        clearInterval(intervalCount);
                    });
                }
            });
        }
    }

    if(category != undefined){
        response.open("GET", `../${category}_question.json`, true);
        response.open("GET", `https://yasminemahmod.github.io/Quiz_App/${category}_question.json`, true);
        response.send();
    }
}


// Show Asnwers
function displayAnswer(apiData, count) {
    if(currQ < count) {
        // Show Question
        question.innerText = apiData.title;

         // Show Answers
        answers.innerHTML = ""; 
        for(let i=1; i<=4; i++) {
            // Create answer Div
            let answerDiv = document.createElement("div");
            answerDiv.className = "answer";

            // Create Radio Input and add to answer div
            let answerInput = document.createElement("input");
            answerInput.type ='radio';
            answerInput.name = 'answer';
            answerInput.id = `answer_${i}`;
            answerInput.dataset.answer = apiData[`answer_${i}`];
            answerDiv.appendChild(answerInput);

            // Create Label and add to answer div
            let answerLabel = document.createElement("label");
            answerLabel.htmlFor = `answer_${i}`;
            answerLabel.innerText = apiData[`answer_${i}`];
            answerDiv.appendChild(answerLabel);

            // Append div to container div
            answers.appendChild(answerDiv);
        }
    } 
}


// Act with bullets
function actWithBullets(length) {
    if(currQ < length) {
            // Set Question Count
        questionCount.innerText = length;

        // Create Bullets
        bulletsArea.innerHTML = '';
        for(let i=0; i<length; i++) {
            bulletsArea.innerHTML += `
                <span></spna>`
        }   
        let bullets = Array.from(document.querySelectorAll(".spans span")); 
        bullets[currQ].classList.add("active");
        for(let i =0; i<bullets.length; i++) {
            if(i<currQ) {
                bullets[i].classList.add("done");
            }
        }
    }
}


// Submit Answer 
function checkAnswers(dataApi) {
    let rightAnswer = dataApi.right_answer;
    let answers = Array.from(document.querySelectorAll("input[type='radio']"))
    answers.forEach(ans => {
        if(ans.checked) {
            if(ans.dataset.answer === rightAnswer) {
                ans.parentElement.classList.add("right");
                rightCount++;
                submitBtn.setAttribute("disabled", "disabled");
            } else {
                ans.parentElement.classList.add("wrong");
                answers.forEach(ans => {
                    if(ans.dataset.answer === rightAnswer) {
                        ans.parentElement.classList.add("right");
                    }
                });
                submitBtn.setAttribute("disabled", "disabled");
            }
            
        }
    });
}


// Show Result 
function showResult(totalQuestion, msg) {
    clearInterval(intervalCount);
    if(msg === undefined) {
        msg = rightCount === totalQuestion ? "perfect" : 
                        rightCount < totalQuestion && rightCount >= (totalQuestion / 2) ? "good" : "failed";
    }
        quesArea.remove();
        document.querySelector(".bullets").remove();
        let resultArea = document.querySelector(".result");
        msg = msg.split(",");
        if(msg.length > 1) {
            resultArea.innerHTML = `<p><span class="${msg[1]}">${msg[0]},</span> You Got <span class="mark">${rightCount}</span> from <span class="total">${totalQuestion}</span></p>`; 
        } else {
            resultArea.innerHTML = `<p><span class="${msg[0]}">${msg[0]},</span> You Got <span class="mark">${rightCount}</span> from <span class="total">${totalQuestion}</span></p>`; 
        }
}


// Count Down Of Timer
function timerCountDown(total) {
    let min = "03";
    let sec = "00";
    timer.innerHTML = `<span class="minutes">${min}</span> : 
    <span class="seconds">${sec}</span>`;
    let minutes = document.querySelector(".minutes");
    let seconds = document.querySelector(".seconds");

    intervalCount = setInterval(function() {        
        min = min < 10 ? `0${+min}`:min;
        sec = sec < 10 ? `0${+sec}`:sec;
        minutes.innerHTML = min;
        seconds.innerHTML = sec;
        sec--;
        if(sec < 0) {
            sec = "59";
            min--;
        }
        if(minutes.innerHTML === '00' && seconds.innerHTML === '00') {
            clearInterval(intervalCount);
            showResult(total, "Time Out,failed");
        }
    },1000);
}
