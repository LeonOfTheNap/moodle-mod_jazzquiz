<?php
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
 * Contains all the language strings for JazzQuiz.
 * @package   mod_jazzquiz
 * @author    Sebastian S. Gundersen <sebastsg@stud.ntnu.no>
 * @author    John Hoopes <moodle@madisoncreativeweb.com>
 * @copyright 2014 University of Wisconsin - Madison
 * @copyright 2018 NTNU
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// General.
$string['modulename'] = 'JazzQuiz';
$string['modulename_help'] = '
<p>
    The JazzQuiz activity enables an instructor to create and administer quizzes in real-time. All regular quiz question types can be used in the JazzQuiz.
</p>
<p>
    The instructor has the ability to jump to different questions while running a session.
    Responses are shown live in a bar graph, optimized for projectors. Fullscreen mode is also available.
    A time limit may be set to automatically end the question, or the instructor can manually end the question and move on to the next one.
</p>';

$string['modulenameplural'] = 'JazzQuizzes';
$string['jazzquizsettings'] = 'General JazzQuiz settings';
$string['pluginadministration'] = 'JazzQuiz administration';
$string['pluginname'] = 'JazzQuiz';

$string['attempts'] = 'Attempts';
$string['jazzquiz:addinstance'] = 'Add an instance of jazzquiz';
$string['jazzquiz:attempt'] = 'Attempt an JazzQuiz';
$string['jazzquiz:control'] = 'Control an JazzQuiz. (Usually for instructors only)';
$string['jazzquiz:editquestions'] = 'Edit questions for an JazzQuiz.';
$string['jazzquiz:seeresponses'] = 'View other student responses to grade them';

// Tabs.
$string['view'] = 'View';
$string['edit'] = 'Edit';
$string['review'] = 'Review';
$string['reports'] = 'Reports';

// Info.
$string['question_will_start_now'] = 'The question will start now';
$string['question_will_start_in_x_seconds'] = 'The question will start in {$a} seconds';
$string['wait_for_students'] = 'Waiting for students to connect';
$string['loading'] = 'Loading...';
$string['closing_session'] = 'Closing session...';
$string['session_closed'] = 'Session is now closed';
$string['wait_for_instructor'] = 'Please wait for the instructor to start the next question.';
$string['question_will_end_in_x_seconds'] = 'The question will end in {$a} seconds';

// Event.
$string['event_attempt_started'] = 'Attempt started';
$string['event_question_answered'] = 'Question answered for attempt';

// Form.
$string['default_question_time'] = 'Default question time';
$string['default_question_time_help'] = 'The default time to display each question.<br>This can be overridden by individual questions.';
$string['wait_for_question_time'] = 'Wait for question time';
$string['wait_for_question_time_help'] = 'The time to wait for a question to start.';

// Edit.
$string['questions'] = 'Questions';
$string['add'] = 'Add';
$string['question'] = 'Question';
$string['add_question'] = 'Add question';
$string['delete_question'] = 'Delete question {$a}';
$string['question_move_down'] = 'Move question {$a} down';
$string['question_move_up'] = 'Move question {$a} up';
$string['question_time'] = 'Question time';
$string['question_time_help'] = 'Question time in seconds.';
$string['no_time_limit'] = 'No time limit';
$string['no_time_limit_help'] = 'Check this field to have no timer on this question. <p>The instructor will then be required to click the end question button for the question to end</p>';
$string['invalid_question_time'] = 'Question time must be an integer of 0 or above';
$string['edit_question'] = 'Edit question';
$string['save_question'] = 'Save question';
$string['edit_page_open_session_error'] = 'You cannot edit the quiz while a session is open.';
$string['create_new_question'] = 'Create new question';
$string['add_to_quiz'] = 'Add to quiz';

// Session.
$string['quiz_not_running'] = '<p>Wait for your teacher to start the quiz.</p><p>Use the reload button to check if it has started.</p>';
$string['teacher_start_instructions'] = '<p>Start a quiz for the students to take.</p><p>Define a session name below to help when looking through the results at a later date.</p>';
$string['session_name'] = 'Session name';
$string['session_name_required'] = 'The session name is required';
$string['start_session'] = 'Start Session';
$string['unable_to_create_session'] = 'Unable to create session';
$string['session'] = 'Session';
$string['join_quiz_instructions'] = 'Click below to join the quiz';
$string['instructor_sessions_going'] = 'There is a session already in progress. Please click the button below to go to the session';
$string['goto_session'] = 'Go to session in progress';
$string['no_session'] = 'There is no open session';
$string['join_quiz'] = 'Join Quiz';
$string['attempt_started'] = 'An attempt has already been started by you, please click below to continue to your open attempt';
$string['no_students_have_joined'] = 'No students have joined.';
$string['one_student_has_joined'] = '1 student has joined.';
$string['x_students_have_joined'] = '{$a} students have joined.';
$string['click_to_show_original_results'] = 'Click to show original results';
$string['click_to_show_vote_results'] = 'Click to show vote results';
$string['showing_vote_results'] = 'Showing vote results';
$string['showing_original_results'] = 'Showing original results';
$string['failed_to_end_question'] = 'Failed to end the question.';
$string['error_getting_vote_results'] = 'There was an error getting the vote results.';
$string['a_out_of_b_voted'] = '{$a->a} / {$a->b} voted';
$string['a_out_of_b_responded'] = '{$a->a} / {$a->b} responded';
$string['error_starting_vote'] = 'There was an error starting the vote.';
$string['error_getting_current_results'] = 'There was an error getting current results.';
$string['error_with_request'] = 'There was an error with the request.';
$string['x_seconds_left'] = '{$a}s left';
$string['error_saving_vote'] = 'There was an error saving your vote.';
$string['you_already_voted'] = 'Sorry, but you have already voted.';

// Instructor Controls.
$string['startquiz'] = 'Start quiz';
$string['repoll'] = 'Re-poll';
$string['vote'] = 'Vote';
$string['improvise'] = 'Improvise';
$string['jump'] = 'Jump';
$string['next'] = 'Next';
$string['end'] = 'End';
$string['fullscreen'] = 'Fullscreen';
$string['quit'] = 'Quit';
$string['responses'] = 'Responses';
$string['answer'] = 'Answer';
$string['exit'] = 'Exit';

// Quiz Review.
$string['select_session'] = 'Select session to review:';
$string['attendance_list'] = 'Attendance list';

// Admin Settings.
$string['enabled_question_types'] = 'Enable question types';
$string['enabled_question_types_info'] = 'Question types that are enabled for use within instances of the JazzQuiz activity.';
$string['improv_enabled_questions'] = 'Default improvisation questions';
$string['improv_enabled_questions_info'] = 'Questions added by JazzQuiz which can be used for improvisation during a session.';

// Instructions.
$string['instructions_for_student'] = '<p>Please wait for the instructor to start the quiz.</p>';
$string['instructions_for_instructor'] = '
    <h3>Please make sure to read the instructions:</h3>
    <table>
        <tr>
            <td>
                <i class="fa fa-repeat"></i> Re-poll
            </td>
            <td>
                Allows the instructor to re-poll the question that was just asked.
                This is the same as starting a question from the <i class="fa fa-bars"></i> Jump dropdown list.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-bar-chart"></i> Vote
            </td>
            <td>
                 Let the students vote on their answers.
                 The instructor can click on an answer to toggle whether it should be included in the vote or not.
                 Clicking on the bar of the answer will start a merge from that answer.
                 Note that this bar will consume the bar you click on next.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-edit"></i> Improvise
            </td>
            <td>
                Shows a list of questions made for improvising. Write the question on the blackboard and ask for input with these questions.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-bars"></i> Jump
            </td>
            <td>
                Shows a list of all the questions planned for the quiz.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-forward"></i> Next
            </td>
            <td>
                Continue on to the next question in the list of planned questions.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-close"></i> End
            </td>
            <td>
                End the current question.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-expand"></i> Fullscreen
            </td>
            <td>
                Show the results in fullscreen. The answers will not appear during a question, so you can keep this up throughout the session.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-square-o"></i> / <i class="fa fa-check-square-o"></i> Answer
            </td>
            <td>
                Gives the instructor a view of the question with the correct response selected.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-square-o"></i> / <i class="fa fa-check-square-o"></i> Responses
            </td>
            <td>
                Hide or show the students\' answers.
            </td>
        </tr>
        <tr>
            <td>
                <i class="fa fa-window-close"></i> Quit
            </td>
            <td>
                Exit the current quiz session.
            </td>
        </tr>
    </table>';
