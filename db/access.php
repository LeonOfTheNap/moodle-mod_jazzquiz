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

// Capability definitions for the jazzquiz module.
//
// The capabilities are loaded into the database table when the module is
// installed or updated. Whenever the capability definitions are updated,
// the module version number should be bumped up.
//
// The system has four possible values for a capability:
// CAP_ALLOW, CAP_PREVENT, CAP_PROHIBIT, and inherit (not set).
//
// CAPABILITY NAMING CONVENTION
//
// It is important that capability names are unique. The naming convention
// for capabilities that are specific to modules and blocks is as follows:
//   [mod/block]/<component_name>:<capabilityname>
//
// component_name should be the same as the directory name of the mod or block.
//
// Core moodle capabilities are defined thus:
//    moodle/<capabilityclass>:<capabilityname>
//
// Examples: mod/forum:viewpost
//           block/recent_activity:view
//           moodle/site:deleteuser
//
// The variable name for the capability definitions array follows the format
//   $<componenttype>_<component_name>_capabilities
//
// For the core capabilities, the variable is $moodle_capabilities.

$capabilities = [
    // Can start a quiz and move on to the next question
    // NB: must have 'attempt' as well to be able to see the questions
    'mod/jazzquiz:control' => [
        'captype'      => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'legacy'       => [
            'teacher'        => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager'        => CAP_ALLOW
        ]
    ],

    // Can try to answer the quiz
    'mod/jazzquiz:attempt' => [
        'captype'      => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'legacy'       => [
            'student'        => CAP_ALLOW,
            'teacher'        => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager'        => CAP_ALLOW
        ]
    ],

    // Can see who gave what answer
    'mod/jazzquiz:seeresponses' => [
        'captype'      => 'read',
        'contextlevel' => CONTEXT_MODULE,
        'legacy'       => [
            'teacher'        => CAP_ALLOW,
            'editingteacher' => CAP_ALLOW,
            'manager'        => CAP_ALLOW
        ]
    ],

    // Can add / delete / update questions
    'mod/jazzquiz:editquestions' => [
        'captype'      => 'write',
        'contextlevel' => CONTEXT_MODULE,
        'legacy'       => [
            'editingteacher' => CAP_ALLOW,
            'manager'        => CAP_ALLOW
        ]
    ],

    // Can add an instance of this module to a course
    'mod/jazzquiz:addinstance' => [
        'captype'      => 'write',
        'contextlevel' => CONTEXT_COURSE,
        'legacy'       => [
            'editingteacher' => CAP_ALLOW,
            'coursecreator'  => CAP_ALLOW,
            'manager'        => CAP_ALLOW
        ]
    ],
];

