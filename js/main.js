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

function createAnswer (answer, questionType) {
    let newAnswer = templateAnswers.cloneNode(true)
    newAnswer.textContent = answer

    let input = document.createElement("input")
    input.className = "answer__" + questionType
    input.type = questionType
    input.name = questionType

    newAnswer.append(input)

    return newAnswer
}

function createQuestion (question, i, length) {
    let newBox = boxQuestion.cloneNode(true)
    let form = newBox.querySelector(".form__question")
    let questionTittle = newBox.querySelector(".question__title")
    let fieldset = newBox.querySelector(".question")
    let label = newBox.querySelector(".question__answer")
    let questionType = question.type

    questionTittle.textContent = question.question

    form.dataset.count = `${i+1}/${length}`
    //let answers = []
    question.answers.forEach(item => {
        let answer = createAnswer(item, questionType)
        fieldset.append(answer)
        //answers.push(answer)
    })
    //fieldset.append(...answers)
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
        console.log(answer)

        if (isChecked) {
            console.log(answer)
        } else {
            console.error("не выбран ни один ответ")
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

    //создать бокс, в нем вопрос и ответы из бд
    let i = 0
    //createQuestion (element.list[i], i)

    /*let btn = document.querySelector(".btn--question")
    btn.addEventListener("click", function () {
        createQuestion (element.list[i])
        btn = document.querySelector(".btn--question")
        i++
    })*/

    element.list.forEach(item => {
        createQuestion(item, i, element.list.length)
        i++
    })
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
