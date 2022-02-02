"use strict";

let AppData

function showError(message) {
    let errorMessage = window.main.template.content.querySelector(".message--error")
    console.log(errorMessage)
    let newMessage = errorMessage.cloneNode(true)
    if (message) {
        newMessage.firstElementChild.textContent = message
    }

    window.main.mainBox.append(newMessage)
}

function getData (cb) {
    let url = "https://l1s-is.github.io/Quiz/db/quiz_db.json"
    let xhr = new XMLHttpRequest()
    xhr.responseType = "json"
    xhr.addEventListener("load", function () {
        switch (xhr.status) {
            case 200:
                cb(xhr.response)
                window.backend.AppData = xhr.response;
                break
            case 404:
                showError("Ошибка загрузки данных с сервера")
                break
            default:
                showError("Статус ответа: " + xhr.status + " " + xhr.statusText)
                break
        }
    })
    xhr.addEventListener("error", function () {
        showError("Произошла ошибка соединения")
    })
    xhr.addEventListener("timeout", function () {
        showError("Запрос не успел выполниться за " + xhr.timeout / 100 + "секунд")
    })
    xhr.timeout = 10000
    xhr.open("GET", url)
    xhr.send()
}
window.backend = {
    AppData: AppData
}