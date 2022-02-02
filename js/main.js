"use strict";

(function () {
    const themeList = document.querySelector(".theme__list")
    const template = document.querySelector("template")
    let boxQuestion = template.content.querySelector(".main__box--question")
    let templateAnswers = template.content.querySelector(".question__answer")
    const themeResult = template.content.querySelector(".theme__result")
    const mainTittle = document.querySelector(".main__title")
    const mainBox = document.querySelector(".main__box")
    let main = document.querySelector(".main")

    function createResult(id, parentNode, length) {
        const result = loadResult(id)
        if (result) {
            let newThemeResult = themeResult.cloneNode(true)
            let ratio = newThemeResult.querySelector(".theme__result--ratio")
            ratio.textContent = `${result}/${length}`
            parentNode.append(newThemeResult)
        }
    }

    function createTheme(AppData, i){
        let themeName = AppData[i].theme
        let id = AppData[i].id
        let length = AppData[i].list.length

        let li = document.createElement("li")
        li.className = "theme__item"
        let btn = document.createElement("button")
        btn.className = "btn btn--theme"
        btn.dataset.id = id
        btn.textContent = themeName
        li.append(btn)

        createResult(id, li, length)
        setTimeout( function () {
            showElement(li)
            themeList.append(li)
            if (++i < length-1) createTheme(AppData, i)
        }, 300)
    }

    function createThemeList (AppData) {
        themeList.textContent = ""
        let i = 0
        createTheme(AppData, i)
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

    function showElement(element) {
        let opacity = 0
        element.opacity = opacity
        element.style.display = ""

        function animation () {
            opacity += 0.05
            element.style.opacity = opacity
            if (opacity < 1) {
                requestAnimationFrame(animation)
            }
        }

        animation ()
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

        showElement(newBox)
        main.append(newBox)

        const btnBack = newBox.querySelector(".btn--result")
        btnBack.addEventListener("click", function () {
            hideElement(newBox, function () {
                showElement(mainTittle)
                showElement(mainBox)
            })

            const result = loadResult(currentTheme.id)
            const buttons = [...mainBox.querySelectorAll(".btn--theme")]
            buttons.forEach( btn => {
                if (+btn.dataset.id === +currentTheme.id) {
                    let ratio = btn.parentNode.querySelector(".theme__result--ratio")
                    if (ratio) {
                        ratio.textContent = `${result}/${currentTheme.list.length}`
                    } else {
                        createResult(currentTheme.id, btn.parentNode, currentTheme.list.length)
                    }
                }
            })
        })
    }

    function loadResult(id) {
        console.log(id)
        return localStorage.getItem(id)
    }

    function saveResult (result, id) {
        localStorage.setItem(id, result)
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
        showElement(newBox)
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

                if (++i < length) {
                    hideElement(newBox, () => createQuestion (i, currentTheme, result))

                } else {
                    hideElement(newBox, function () {
                        showResult(result, currentTheme)
                        saveResult(result, currentTheme.id)
                    })
                }
            } else {
                form.classList.add("form__question--error")
                setTimeout( () => form.classList.remove("form__question--error"), 1000)
            }
        })
    }

    function hideElement(element, cb) {
        let opacity = getComputedStyle(element).getPropertyValue("opacity")

        function animation () {
            opacity -= 0.05
            element.style.opacity = opacity
            if (opacity > 0) {
                requestAnimationFrame(animation)
            } else {
                element.style.display = "none"
                if (cb) cb()
            }
        }

        animation ()
    }

    function createQuiz(element) {
        let i = 0
        let result = 0
        hideElement(mainBox, () => createQuestion (i, element, result))
        hideElement(mainTittle)
    }

    function getData () {
        return fetch("https://l1s-is.github.io/Quiz/db/quiz_db.json").then(response => response.json())
    }

    async function initApp () {
        const AppData = await getData()
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
})()
