"use strict";

const themeList = document.querySelector(".theme__list")
const template = document.querySelector("template")
let boxQuestion = template.content.querySelector(".main__box--question")
let templateAnswers = template.content.querySelector(".question__answer")
const mainTittle = document.querySelector(".main__title")
const mainBox = document.querySelector(".main__box")
let main = document.querySelector(".main")

function createTheme(themeName, parentNode){
    let li = document.createElement("li")
    li.className = "theme__item"
    let btn = document.createElement("button")
    btn.className = "btn btn--theme"
    btn.textContent = themeName
    li.append(btn)
    parentNode.append(li)
}

function createThemeList (AppData) {
    themeList.textContent = ""
    AppData.forEach(item => {
        createTheme(item.theme, themeList)
    })
}

function mixAnswers (arr) {
    const newArray = [...arr]

    for (let i = newArray.length - 1; i > 0; i--) {
        let k = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[k]] = [newArray[k], newArray[i]]
    }
    return newArray
}

function createKeyAnswers (questionType, answersList, correct) {
    const keys = []

    answersList.forEach( (item, i) => {
        if (questionType === "radio") {
            keys.push([item, !i])
        } else {
            keys.push([item, i < correct])
        }
    })
    return mixAnswers(keys)
}

function createAnswer (answer, questionType, i) {
    let newAnswer = templateAnswers.cloneNode(true)
    newAnswer.textContent = answer

    let input = document.createElement("input")
    input.className = "answer__" + questionType
    input.type = questionType
    input.name = "answer"
    input.value = i

    newAnswer.append(input)

    return newAnswer
}

function showResult(result, currentTheme) {
    const boxResult = template.content.querySelector(".main__box--result")
    let newBox = boxResult.cloneNode(true)
    let resultRatio = newBox.querySelector(".result__ratio")
    let resultText = newBox.querySelector(".result__text")

    resultRatio.textContent = `${result}/${currentTheme.list.length}`
    let percent = (result / currentTheme.list.length) * 100

    const rating = {
        0: "bad",
        1: "medium",
        2: "excellent"
    }

    if (percent < currentTheme.result[0][0]) {
        resultText.textContent = "Не расстраивайся, в следующий раз точно получится!";
    }

    currentTheme.result.forEach( (item, i) => {
        let k = i
        if (percent >= item[0]) {
            resultText.textContent = item[1];
            resultRatio.classList.add("result__ratio--" + rating[i])
        }
    })

    main.append(newBox)
}

function createQuestion (i, currentTheme, result) {
    let newBox = boxQuestion.cloneNode(true)
    let form = newBox.querySelector(".form__question")
    let questionTittle = newBox.querySelector(".question__title")
    let fieldset = newBox.querySelector(".question")
    let label = newBox.querySelector(".question__answer")
    let question = currentTheme.list[i]
    let length = currentTheme.list.length
    let questionType = question.type

    questionTittle.textContent = question.question

    form.dataset.count = `${i+1}/${length}`
    let answers = []
    let keys = []
    const keyAnswers = createKeyAnswers(questionType, question.answers, question.correct)

    keyAnswers.forEach( (item, i) => {
        let answer = createAnswer(item[0], questionType, i)
        fieldset.append(answer)
        answers.push(answer)
        keys.push(item[1])
    })

    const answersData = {
        answers,
        keys
    }

    label.remove()
    main.append(newBox)

    form.addEventListener("submit", function (evt) {
        evt.preventDefault()
        let isChecked = false
        const answer = [...form.querySelectorAll("input")].map(input => {
            if (input.checked){
                isChecked = true
            }
            return input.checked ? input.value : false
        })

        if (isChecked) {
            if (answer.every((result, i) => !!result === answersData.keys[i])){
                result++
            }
            hideThemeList(newBox)
            if (++i < length) {
                createQuestion (i, currentTheme, result)
            } else {
                showResult(result, currentTheme)
                console.log("конец")
            }
        } else {
            form.classList.add("form__question--error")
            setTimeout( () => form.classList.remove("form__question--error"), 1000)
        }
    })
}

function hideThemeList(element) {
    let opacity = getComputedStyle(element).getPropertyValue("opacity")

    function animation () {
        opacity -= 0.05
        element.style.opacity = opacity
        if (opacity > 0) {
            requestAnimationFrame(animation)
        } else {
            element.style.display = "none"
        }
    }
    animation ()
}

function createQuiz(element) {
    hideThemeList(mainBox)
    hideThemeList(mainTittle)
    let i = 0
    let result = 0

    //создать бокс из исходника, в нем записать вопрос и ответы из бд
    createQuestion (i, element, result)
}

function initApp () {
    const AppData = getData()
    console.log(AppData)

    createThemeList(AppData)

    themeList.addEventListener("click", function (evt) {
        AppData.forEach(item => {
            if (item.theme === evt.target.textContent) {
                createQuiz(item)
            }
        })
    })
}

initApp()
