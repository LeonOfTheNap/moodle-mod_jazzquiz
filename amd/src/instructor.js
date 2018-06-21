// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package   mod_jazzquiz
 * @author    Sebastian S. Gundersen <sebastsg@stud.ntnu.no>
 * @copyright 2014 University of Wisconsin - Madison
 * @copyright 2018 NTNU
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery', 'mod_jazzquiz/core'], function ($, Jazz) {

    const Quiz = Jazz.Quiz;
    const Question = Jazz.Question;
    const Ajax = Jazz.Ajax;
    const setText = Jazz.setText;

    class ResponseView {

        /**
         * @param {Quiz} quiz
         */
        constructor(quiz) {
            this.quiz = quiz;
            this.currentResponses = [];
            this.showVotesUponReview = false;
            this.respondedCount = 0;
            this.showResponses = false;
            this.totalStudents = 0;
            $(document).on('click', '#jazzquiz_undo_merge', this.undoMerge.bind(this));
            let self = this;
            $(document).on('click', function (event) {
                // Clicking a row to merge.
                if (event.target.classList.contains('bar')) {
                    self.startMerge(event.target.id);
                } else if (event.target.parentNode && event.target.parentNode.classList.contains('bar')) {
                    self.startMerge(event.target.parentNode.id);
                }
            });
            $(document).on('click', '#review_show_normal_results', function () {
                self.refresh(false);
            });
            $(document).on('click', '#review_show_vote_results', function () {
                self.refreshVotes();
            });
        }

        /**
         * Clear, but not hide responses.
         */
        clear() {
            Quiz.responses.html('');
            Quiz.responseInfo.html('');
        }

        /**
         * Hides the responses
         */
        hide() {
            Quiz.uncheck(Instructor.control('responses'));
            Quiz.hide(Quiz.responses);
            Quiz.hide(Quiz.responseInfo);
        }

        /**
         * Shows the responses
         */
        show() {
            Quiz.check(Instructor.control('responses'));
            Quiz.show(Quiz.responses);
            Quiz.show(Quiz.responseInfo);
            if (this.showVotesUponReview) {
                this.refreshVotes();
                this.showVotesUponReview = false;
            } else {
                this.refresh(false);
            }
        }

        /**
         * Toggle whether to show or hide the responses
         */
        toggle() {
            this.showResponses = !this.showResponses;
            if (this.showResponses) {
                this.show();
            } else {
                this.hide();
            }
        }

        /**
         * End the response merge.
         */
        endMerge() {
            $('.merge-into').removeClass('merge-into');
            $('.merge-from').removeClass('merge-from');
        }

        /**
         * Undo the last response merge.
         */
        undoMerge() {
            Ajax.post('undo_merge', {}, () => this.refresh(true));
        }

        /**
         * Merges responses based on response string.
         * @param {string} from
         * @param {string} into
         */
        merge(from, into) {
            Ajax.post('merge_responses', {from: from, into: into}, () => this.refresh(false));
        }

        /**
         * Start a merge between two responses.
         * @param {string} fromRowBarId
         */
        startMerge(fromRowBarId) {
            const $barCell = $('#' + fromRowBarId);
            let $row = $barCell.parent();
            if ($row.hasClass('merge-from')) {
                this.endMerge();
                return;
            }
            if ($row.hasClass('merge-into')) {
                const $fromRow = $('.merge-from');
                this.merge($fromRow.data('response'), $row.data('response'));
                this.endMerge();
                return;
            }
            $row.addClass('merge-from');
            let $table = $row.parent().parent();
            $table.find('tr').each(function () {
                const $cells = $(this).find('td');
                if ($cells[1].id !== $barCell.attr('id')) {
                    $(this).addClass('merge-into');
                }
            });
        }

        /**
         * Create controls to toggle between the responses of the actual question and the vote that followed.
         * @param {string} name Can be either 'vote_response' or 'current_response'
         */
        createControls(name) {
            if (!this.quiz.question.hasVotes) {
                Quiz.hide(Quiz.responseInfo);
                return;
            }
            // Add button for instructor to change what to review.
            if (this.quiz.state === 'reviewing') {
                let $showNormalResult = $('#review_show_normal_results');
                let $showVoteResult = $('#review_show_vote_results');
                Quiz.show(Quiz.responseInfo);
                if (name === 'vote_response') {
                    if ($showNormalResult.length === 0) {
                        setText(Quiz.responseInfo.html('<h4 class="inline"></h4>').children('h4'), 'showing_vote_results');
                        Quiz.responseInfo.append('<button id="review_show_normal_results" class="btn btn-primary"></button><br>');
                        setText($('#review_show_normal_results'), 'click_to_show_original_results');
                        $showVoteResult.remove();
                    }
                } else if (name === 'current_response') {
                    if ($showVoteResult.length === 0) {
                        setText(Quiz.responseInfo.html('<h4 class="inline"></h4>').children('h4'), 'showing_original_results');
                        Quiz.responseInfo.append('<button id="review_show_vote_results" class="btn btn-primary"></button><br>');
                        setText($('#review_show_vote_results'), 'click_to_show_vote_results');
                        $showNormalResult.remove();
                    }
                }
            }
        }

        /**
         * Create a new and unsorted response bar graph.
         * @param {Array.<Object>} responses
         * @param {string} name
         * @param {string} targetId
         * @param {string} graphId
         * @param {boolean} rebuild If the table should be completely rebuilt or not
         */
        createBarGraph(responses, name, targetId, graphId, rebuild) {
            let target = document.getElementById(targetId);
            if (target === null) {
                return;
            }
            let total = 0;
            for (let i = 0; i < responses.length; i++) {
                total += parseInt(responses[i].count); // In case count is a string.
            }
            if (total === 0) {
                total = 1;
            }

            // Remove the rows if it should be rebuilt.
            if (rebuild) {
                target.innerHTML = '';
            }

            // Prune rows.
            for (let i = 0; i < target.rows.length; i++) {
                let prune = true;
                for (let j = 0; j < responses.length; j++) {
                    if (target.rows[i].dataset.response === responses[j].response) {
                        prune = false;
                        break;
                    }
                }
                if (prune) {
                    target.deleteRow(i);
                    i--;
                }
            }

            this.createControls(name);

            name += graphId;

            // Add rows.
            for (let i = 0; i < responses.length; i++) {
                const percent = (parseInt(responses[i].count) / total) * 100;

                // Check if row with same response already exists.
                let rowIndex = -1;
                let currentRowIndex = -1;
                for (let j = 0; j < target.rows.length; j++) {
                    if (target.rows[j].dataset.response === responses[i].response) {
                        rowIndex = target.rows[j].dataset.row_i;
                        currentRowIndex = j;
                        break;
                    }
                }

                if (rowIndex === -1) {
                    rowIndex = target.rows.length;
                    let row = target.insertRow();
                    row.dataset.response_i = i;
                    row.dataset.response = responses[i].response;
                    row.dataset.percent = percent;
                    row.dataset.row_i = rowIndex;
                    row.dataset.count = responses[i].count;
                    row.classList.add('selected-vote-option');

                    const countHtml = '<span id="' + name + '_count_' + rowIndex + '">' + responses[i].count + '</span>';
                    let responseCell = row.insertCell(0);
                    responseCell.onclick = function () {
                        $(this).parent().toggleClass('selected-vote-option');
                    };

                    let barCell = row.insertCell(1);
                    barCell.classList.add('bar');
                    barCell.id = name + '_bar_' + rowIndex;
                    barCell.innerHTML = '<div style="width:' + percent + '%;">' + countHtml + '</div>';

                    const latexId = name + '_latex_' + rowIndex;
                    responseCell.innerHTML = '<span id="' + latexId + '"></span>';
                    Quiz.addMathjaxElement(latexId, responses[i].response);
                    if (responses[i].qtype === 'stack') {
                        Quiz.renderMaximaEquation(responses[i].response, latexId);
                    }
                } else {
                    target.rows[currentRowIndex].dataset.row_i = rowIndex;
                    target.rows[currentRowIndex].dataset.response_i = i;
                    target.rows[currentRowIndex].dataset.percent = percent;
                    target.rows[currentRowIndex].dataset.count = responses[i].count;
                    let countElement = document.getElementById(name + '_count_' + rowIndex);
                    if (countElement !== null) {
                        countElement.innerHTML = responses[i].count;
                    }
                    let barElement = document.getElementById(name + '_bar_' + rowIndex);
                    if (barElement !== null) {
                        barElement.firstElementChild.style.width = percent + '%';
                    }
                }
            }
        };

        /**
         * Sort the responses in the graph by how many had the same response.
         * @param {string} targetId
         */
        static sortBarGraph(targetId) {
            let target = document.getElementById(targetId);
            if (target === null) {
                return;
            }
            let isSorting = true;
            while (isSorting) {
                isSorting = false;
                for (let i = 0; i < (target.rows.length - 1); i++) {
                    const current = parseInt(target.rows[i].dataset.percent);
                    const next = parseInt(target.rows[i + 1].dataset.percent);
                    if (current < next) {
                        target.rows[i].parentNode.insertBefore(target.rows[i + 1], target.rows[i]);
                        isSorting = true;
                        break;
                    }
                }
            }
        }

        /**
         * Create and sort a bar graph based on the responses passed.
         * @param {string} wrapperId
         * @param {string} tableId
         * @param {Array.<Object>} responses
         * @param {number|undefined} responded How many students responded to the question
         * @param {string} questionType
         * @param {string} graphId
         * @param {boolean} rebuild If the graph should be rebuilt or not.
         */
        set(wrapperId, tableId, responses, responded, questionType, graphId, rebuild) {
            if (responses === undefined) {
                return;
            }

            // Check if any responses to show.
            if (responses.length === 0) {
                Quiz.show(Quiz.responded);
                setText(Quiz.responded.find('h4'), 'a_out_of_b_responded', 'jazzquiz', {
                    a: 0,
                    b: this.totalStudents
                });
                return;
            }

            // Question type specific.
            switch (questionType) {
                case 'shortanswer':
                    for (let i = 0; i < responses.length; i++) {
                        responses[i].response = responses[i].response.trim();
                    }
                    break;
                case 'stack':
                    // Remove all spaces from responses.
                    for (let i = 0; i < responses.length; i++) {
                        responses[i].response = responses[i].response.replace(/\s/g, '');
                    }
                    break;
                default:
                    break;
            }

            // Update data.
            this.currentResponses = [];
            this.respondedCount = 0;
            for (let i = 0; i < responses.length; i++) {
                let exists = false;
                let count = 1;
                if (responses[i].count !== undefined) {
                    count = parseInt(responses[i].count);
                }
                this.respondedCount += count;
                // Check if response is a duplicate.
                for (let j = 0; j < this.currentResponses.length; j++) {
                    if (this.currentResponses[j].response === responses[i].response) {
                        this.currentResponses[j].count += count;
                        exists = true;
                        break;
                    }
                }
                // Add element if not a duplicate.
                if (!exists) {
                    this.currentResponses.push({
                        response: responses[i].response,
                        count: count,
                        qtype: questionType
                    });
                }
            }

            // Update responded container.
            if (Quiz.responded.length !== 0 && responded !== undefined) {
                Quiz.show(Quiz.responded);
                setText(Quiz.responded.find('h4'), 'a_out_of_b_responded', 'jazzquiz', {
                    a: responded,
                    b: this.totalStudents
                });
            }

            // Should we show the responses?
            if (!this.showResponses && this.quiz.state !== 'reviewing') {
                Quiz.hide(Quiz.responseInfo);
                Quiz.hide(Quiz.responses);
                return;
            }

            if (document.getElementById(tableId) === null) {
                const html = '<table id="' + tableId + '" class="jazzquiz-responses-overview"></table>';
                Quiz.show($('#' + wrapperId).html(html));
            }
            this.createBarGraph(this.currentResponses, 'current_response', tableId, graphId, rebuild);
            ResponseView.sortBarGraph(tableId);
        }

        /**
         * Fetch and show results for the ongoing or previous question.
         * @param {boolean} rebuild If the response graph should be rebuilt or not.
         */
        refresh(rebuild) {
            Ajax.get('get_results', {}, data => {
                this.quiz.question.hasVotes = data.has_votes;
                this.totalStudents = parseInt(data.total_students);

                this.set('jazzquiz_responses_container', 'current_responses_wrapper',
                    data.responses, data.responded, data.question_type, 'results', rebuild);

                if (data.merge_count > 0) {
                    Quiz.show($('#jazzquiz_undo_merge'));
                } else {
                    Quiz.hide($('#jazzquiz_undo_merge'));
                }
            });
        }

        /**
         * refresh() equivalent for votes.
         */
        refreshVotes() {
            // Should we show the results?
            if (!this.showResponses && this.quiz.state !== 'reviewing') {
                Quiz.hide(Quiz.responseInfo);
                Quiz.hide(Quiz.responses);
                return;
            }
            Ajax.get('get_vote_results', {}, data => {
                const answers = data.answers;
                const targetId = 'wrapper_vote_responses';
                let responses = [];

                this.respondedCount = 0;
                this.totalStudents = parseInt(data.total_students);

                for (let i in answers) {
                    if (!answers.hasOwnProperty(i)) {
                        continue;
                    }
                    responses.push({
                        response: answers[i].attempt,
                        count: answers[i].finalcount,
                        qtype: answers[i].qtype,
                        slot: answers[i].slot
                    });
                    this.respondedCount += parseInt(answers[i].finalcount);
                }

                setText(Quiz.responded.find('h4'), 'a_out_of_b_voted', 'jazzquiz', {
                    a: this.respondedCount,
                    b: this.totalStudents
                });

                if (document.getElementById(targetId) === null) {
                    const html = '<table id="' + targetId + '" class="jazzquiz-responses-overview"></table>';
                    Quiz.show(Quiz.responses.html(html));
                }

                this.createBarGraph(responses, 'vote_response', targetId, 'vote', false);
                ResponseView.sortBarGraph(targetId);
            });
        }

    }

    class Instructor {

        /**
         * @param {Quiz} quiz
         */
        constructor(quiz) {
            this.quiz = quiz;
            this.responses = new ResponseView(quiz);
            this.isShowingCorrectAnswer = false;
            this.totalQuestions = 0;

            $(document).on('keyup', event => {
                if (event.keyCode === 27) { // Escape key.
                    Instructor.closeFullscreenView();
                }
            });

            $(document).on('click', event => {
                Instructor.closeQuestionListMenu(event, 'improvise');
                Instructor.closeQuestionListMenu(event, 'jump');
            });

            Instructor.addEvents({
                repoll: () => {
                    Instructor.enableControls([]);
                    this.repollQuestion();
                },
                vote: () => {
                    Instructor.enableControls([]);
                    this.runVoting();
                },
                improvise: () => {
                    this.showImproviseQuestionSetup();
                },
                jump: () => {
                    this.showJumpQuestionSetup();
                },
                next: () => {
                    Instructor.enableControls([]);
                    this.nextQuestion();
                },
                end: () => {
                    Instructor.enableControls([]);
                    this.endQuestion();
                },
                fullscreen: () => {
                    Instructor.enableControls([]);
                    Instructor.showFullscreenView();
                },
                answer: () => {
                    Instructor.enableControls([]);
                    this.showCorrectAnswer();
                },
                responses: () => {
                    Instructor.enableControls([]);
                    this.responses.toggle();
                },
                exit: () => {
                    Instructor.enableControls([]);
                    this.closeSession();
                },
                quit: () => {
                    Instructor.enableControls([]);
                    this.closeSession();
                },
                startquiz: () => {
                    Instructor.enableControls([]);
                    this.startQuiz();
                }
            });
        }

        static addEvents(events) {
            for (let key in events) {
                if (events.hasOwnProperty(key)) {
                    $(document).on('click', '#jazzquiz_control_' + key, events[key]);
                }
            }
        }

        static get controls() {
            return $('#jazzquiz_controls_box');
        }

        static get controlButtons() {
            return Instructor.controls.find('.quiz-control-buttons');
        }

        static control(key) {
            return $('#jazzquiz_control_' + key);
        }

        static get side() {
            return $('#jazzquiz_side_container');
        }

        static get correctAnswer() {
            return $('#jazzquiz_correct_answer_container');
        }

        static get isMerging() {
            return $('.merge-from').length !== 0;
        }

        onNotRunning(data) {
            this.responses.totalStudents = data.student_count;
            Quiz.hide(Instructor.side);
            setText(Quiz.info, 'instructions_for_instructor');
            Instructor.enableControls([]);
            Quiz.hide(Instructor.controlButtons);
            let $studentsJoined = Instructor.control('startquiz').next();
            if (data.student_count === 1) {
                setText($studentsJoined, 'one_student_has_joined');
            } else if (data.student_count > 1) {
                setText($studentsJoined, 'x_students_have_joined', 'jazzquiz', data.student_count);
            } else {
                setText($studentsJoined, 'no_students_have_joined');
            }
            Quiz.show(Instructor.control('startquiz').parent());
        }

        onPreparing(data) {
            Quiz.hide(Instructor.side);
            setText(Quiz.info, 'instructions_for_instructor');
            let enabledButtons = ['improvise', 'jump', 'fullscreen', 'quit'];
            if (data.slot < this.totalQuestions) {
                enabledButtons.push('next');
            }
            Instructor.enableControls(enabledButtons);
        }

        onRunning(data) {
            if (!this.responses.showResponses) {
                this.responses.hide();
            }
            Quiz.show(Instructor.side);
            Instructor.enableControls(['end', 'responses', 'fullscreen']);
            this.quiz.question.questionTime = data.questiontime;
            if (this.quiz.question.isRunning) {
                // Check if the question has already ended.
                // We need to do this because the state does not update unless an instructor is connected.
                if (data.questionTime > 0 && data.delay < -data.questiontime) {
                    this.endQuestion();
                }
                // Only rebuild results if we are not merging.
                this.responses.refresh(!Instructor.isMerging);
            } else {
                const started = this.quiz.question.startCountdown(data.questiontime, data.delay);
                if (started) {
                    this.quiz.question.isRunning = true;
                }
            }
        }

        onReviewing(data) {
            Quiz.show(Instructor.side);
            let enabledButtons = ['answer', 'vote', 'repoll', 'fullscreen', 'improvise', 'jump', 'quit'];
            if (data.slot < this.totalQuestions) {
                enabledButtons.push('next');
            }
            Instructor.enableControls(enabledButtons);

            // In case page was refreshed, we should ensure the question is showing.
            if (!Question.isLoaded()) {
                this.quiz.question.refresh();
            }

            // For now, just always show responses while reviewing.
            // In the future, there should be an additional toggle.
            if (this.quiz.isNewState) {
                this.responses.show();
            }
            // No longer in question.
            this.quiz.question.isRunning = false;
        }

        onSessionClosed(data) {
            Quiz.hide(Instructor.side);
            Instructor.enableControls([]);
            this.quiz.question.isRunning = false;
        }

        onVoting(data) {
            if (!this.responses.showResponses) {
                this.responses.hide();
            }
            Quiz.show(Instructor.side);
            Instructor.enableControls(['quit', 'fullscreen', 'answer', 'responses', 'end']);
            this.responses.refreshVotes();
        }

        onStateChange(state) {
            $('#region-main').find('ul.nav.nav-tabs').css('display', 'none');
            $('#region-main-settings-menu').css('display', 'none');
            $('.region_main_settings_menu_proxy').css('display', 'none');
            Quiz.show(Instructor.controlButtons);
            Quiz.hide(Instructor.control('startquiz').parent());
        }

        onTimerEnding() {
            this.endQuestion();
        }

        onTimerTick(timeLeft) {
            setText(Question.timer, 'x_seconds_left', 'jazzquiz', timeLeft);
        }

        /**
         * Start the quiz. Does not start any questions.
         */
        startQuiz() {
            Quiz.hide(Instructor.control('startquiz').parent());
            Ajax.post('start_quiz', {}, () => $('#jazzquiz_controls').removeClass('btn-hide'));
        }

        /**
         * End the currently ongoing question or vote.
         */
        endQuestion() {
            this.quiz.question.hideTimer();
            Ajax.post('end_question', {}, () => {
                if (this.quiz.state === 'voting') {
                    this.responses.showVotesUponReview = true;
                } else {
                    this.quiz.question.isRunning = false;
                    Instructor.enableControls([]);
                }
            });
        }

        /**
         * Show a question list dropdown.
         * @param {string} name
         * @param {string} action The action for ajax.php
         */
        showQuestionListSetup(name, action) {
            let $controlButton = Instructor.control(name);
            if ($controlButton.hasClass('active')) {
                // It's already open. Let's not send another request.
                return;
            }

            // The dropdown lies within the button, so we have to do this extra step.
            // This attribute is set in the onclick function for one of the buttons in the dropdown.
            // TODO: Redo the dropdown so we don't have to do this.
            if ($controlButton.data('isclosed') === 'yes') {
                $controlButton.data('isclosed', '');
                return;
            }

            Ajax.get(action, {}, data => {
                let self = this;
                let $menu = $('#jazzquiz_' + name + '_menu');
                const menuMargin = $controlButton.offset().left - $controlButton.parent().offset().left;
                $menu.html('').addClass('active').css('margin-left', menuMargin + 'px');
                $controlButton.addClass('active');
                const questions = data.questions;
                for (let i in questions) {
                    if (!questions.hasOwnProperty(i)) {
                        continue;
                    }
                    let $questionButton = $('<button class="btn">' + questions[i].name + '</button>');
                    $questionButton.data({
                        'time': questions[i].time,
                        'question-id': questions[i].questionid,
                        'jazzquiz-question-id': questions[i].jazzquizquestionid
                    });
                    $questionButton.data('test', 1);
                    $questionButton.on('click', function () {
                        const questionId = $(this).data('question-id');
                        const time = $(this).data('time');
                        const jazzQuestionId = $(this).data('jazzquiz-question-id');
                        self.jumpQuestion(questionId, time, jazzQuestionId);
                        $menu.html('').removeClass('active');
                        $controlButton.removeClass('active').data('isclosed', 'yes');
                    });
                    $menu.append($questionButton);
                }
            });
        }

        showImproviseQuestionSetup() {
            this.showQuestionListSetup('improvise', 'list_improvise_questions');
        };

        showJumpQuestionSetup() {
            this.showQuestionListSetup('jump', 'list_jump_questions');
        }

        /**
         * Get the selected responses.
         * @returns {Array.<Object>} Vote options
         */
        static getSelectedAnswersForVote() {
            let result = [];
            $('.selected-vote-option').each((i, option) => {
                result.push({
                    text: option.dataset.response,
                    count: option.dataset.count
                });
            });
            return result;
        }

        /**
         * Start a vote with the responses that are currently selected.
         */
        runVoting() {
            const options = Instructor.getSelectedAnswersForVote();
            const data = {questions: encodeURIComponent(JSON.stringify(options))};
            Ajax.post('run_voting', data, () => {});
        }

        /**
         * Start a new question in this session.
         * @param {string} method
         * @param {number} questionId
         * @param {number} questionTime
         * @param {number} jazzquizQuestionId
         */
        startQuestion(method, questionId, questionTime, jazzquizQuestionId) {
            Quiz.hide(Quiz.info);
            this.responses.clear();
            Ajax.post('start_question', {
                method: method,
                questionid: questionId,
                questiontime: questionTime,
                jazzquizquestionid: jazzquizQuestionId
            }, data => this.quiz.question.startCountdown(data.questiontime, data.delay));
        }

        /**
         * Jump to a planned question in the quiz.
         * @param {number} questionId
         * @param {number} questionTime
         * @param {number} jazzquizQuestionId
         */
        jumpQuestion(questionId, questionTime, jazzquizQuestionId) {
            this.startQuestion('jump', questionId, questionTime, jazzquizQuestionId);
        }

        /**
         * Repoll the previously asked question.
         */
        repollQuestion() {
            this.startQuestion('repoll', 0, 0, 0);
        }

        /**
         * Continue on to the next preplanned question.
         */
        nextQuestion() {
            this.startQuestion('next', 0, 0, 0);
        }

        /**
         * Close the current session.
         */
        closeSession() {
            Quiz.hide(Question.box);
            Quiz.hide(Instructor.controls);
            setText(Quiz.info, 'closing_session');
            Ajax.post('close_session', {}, () => setText(Quiz.info, 'session_closed'));
        }

        /**
         * Request and show the correct answer for the ongoing or previous question.
         */
        showCorrectAnswer() {
            if (this.isShowingCorrectAnswer) {
                Quiz.hide(Instructor.correctAnswer);
                Quiz.uncheck(Instructor.control('answer'));
                this.isShowingCorrectAnswer = false;
                return;
            }
            Ajax.get('get_right_response', {}, data => {
                const answer = '<span class="jazzquiz-latex-wrapper">' + data.right_answer + '</span>';
                Quiz.show(Instructor.correctAnswer.html(answer));
                Quiz.renderAllMathjax();
                Quiz.check(Instructor.control('answer'));
                this.isShowingCorrectAnswer = true;
            });
        }

        /**
         * Enables all buttons passed in arguments, but disables all others.
         * @param {Array.<string>} buttons The unique part of the IDs of the buttons to be enabled.
         */
        static enableControls(buttons) {
            let children = Instructor.controlButtons.children('button');
            for (let child of children) {
                const id = child.getAttribute('id').replace('jazzquiz_control_', '');
                child.disabled = (buttons.indexOf(id) === -1);
            }
        }

        /**
         * Enter fullscreen mode for better use with projectors.
         */
        static showFullscreenView() {
            if (Quiz.main.hasClass('jazzquiz-fullscreen')) {
                Instructor.closeFullscreenView();
                return;
            }
            // Hide the scrollbar - remember to always set back to auto when closing.
            document.documentElement.style.overflowY = 'hidden';
            // Sets the quiz view to an absolute position that covers the viewport.
            Quiz.main.addClass('jazzquiz-fullscreen');
        }

        /**
         * Exit the fullscreen mode.
         */
        static closeFullscreenView() {
            document.documentElement.style.overflowY = 'auto';
            Quiz.main.removeClass('jazzquiz-fullscreen');
        }

        /**
         * Close the dropdown menu for choosing a question.
         * @param {Event} event
         * @param {string} name
         */
        static closeQuestionListMenu(event, name) {
            const menuId = '#jazzquiz_' + name + '_menu';
            // Close the menu if the click was not inside.
            const menu = $(event.target).closest(menuId);
            if (!menu.length) {
                $(menuId).html('').removeClass('active');
                Instructor.control(name).removeClass('active');
            }
        }

        static addReportEventHandlers() {
            $(document).on('click', '#report_overview_controls button', function () {
                const action = $(this).data('action');
                if (action === 'attendance') {
                    $('#report_overview_responded').fadeIn();
                    $('#report_overview_responses').fadeOut();
                } else if (action === 'responses') {
                    $('#report_overview_responses').fadeIn();
                    $('#report_overview_responded').fadeOut();
                }
            });
        }

    }

    return {
        initialize: function (totalQuestions, reportView, slots) {
            let quiz = new Quiz(Instructor);
            quiz.role.totalQuestions = totalQuestions;
            if (reportView) {
                Instructor.addReportEventHandlers();
                quiz.role.responses.showResponses = true;
                for (let slot of slots) {
                    const wrapper = 'jazzquiz_wrapper_responses_' + slot.num;
                    const table = 'responses_wrapper_table_' + slot.num;
                    const graph = 'report_' + slot.num;
                    quiz.role.responses.set(wrapper, table, slot.responses, undefined, slot.type, graph, false);
                }
            } else {
                quiz.poll(500);
            }
        }
    }

});
