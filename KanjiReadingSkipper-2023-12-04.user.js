// ==UserScript==
// @name         KanjiReadingSkipper
// @namespace    https://www.wanikani.com/
// @version      2023-12-04
// @description  Skips wanikani kanji readings question by automatically inserting and submitting the correct answer
// @author       Marcel Schwegler
// @match        https://www.wanikani.com/subjects/review
// @match        https://www.wanikani.com/subject-lessons
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

function getCurrentJsonElement(questionChars, queueJson) {
  return queueJson.filter(
      function(data){ return data.characters == questionChars }
  );
}

function extractQueueAsJson(queueContent) {
    // Remove all whitespaces for matching easier
    queueContent = queueContent.replaceAll(/\s/g,'');

    // Strip front
    var index = queueContent.indexOf("[");
    var fronstStripped = queueContent.substring(index);

    // Strip back
    index = fronstStripped.indexOf("][");
    var queueStr = fronstStripped.substring(0, index + 1);

    // Get current item as json
    var queueJson = JSON.parse(queueStr);

    return queueJson;
}

function getQueryAnswer(currentItemJson, quizType) {
    var answer;
    if(quizType === "reading" && currentItemJson.subject_category !== "Vocabulary") {
       if(currentItemJson.primary_reading_type === "onyomi") {
           answer = currentItemJson.onyomi[0];
       }
       else {
           answer = currentItemJson.kunyomi[0];
       }

    }
    else if(quizType === "reading" && currentItemJson.subject_category === "Vocabulary") {
       answer = currentItemJson.readings[0].reading;
    }
    else {
       answer = currentItemJson.meanings[0];
    }

    return answer;
}


function mainLoop() {
    // Extract html objects for automatically filling the answer
    const submitButton = $('.quiz-input__submit-button');
    const answerInput = $('#user-response');

    // Extract question and type of question
    const targetElement = $(".quiz-input__question-type-container");
    var questionChars = $(".character-header__characters").text()
    var quizType = targetElement.attr("data-question-type");

    // Get current item as json
    var queueJson = extractQueueAsJson($("#quiz-queue").text());
    var currentItemJson = getCurrentJsonElement(questionChars, queueJson)[0];
    console.log(currentItemJson);

    // Get answer to current query
    var answer = getQueryAnswer(currentItemJson, quizType);

    console.log("Quiz-Type: " + quizType);
    console.log("Answer: " + answer);

    // Answer question after loading is completed
    setTimeout(function() {
        answerInput.val(answer);
        submitButton.click();
    }, 1000);


    // Continue and restore to default scenario
    setTimeout(function() {
        submitButton.click();
        answerInput.blur();
    }, 2000);
}


(function() {
    'use strict';

    setInterval(function(){
        mainLoop();
    }, 3000);

})();