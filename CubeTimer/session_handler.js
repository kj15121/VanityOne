// Code directly linked to the page
// Handling iter-session data
"use strict"

import {handover} from "./stats_handler.js";
import {newSolve} from "./stats_handler.js";

//Main algorithm objects
let currentSessionName = 'Def';
let allSessions = []

//Logic-support

function store(sessionStats, sessionName) {
    let session = {};
    session.name = sessionName;
    session.stats = sessionStats;
    session.solveCount = sessionStats.length;
    session.modTime = Date.now();
    localStorage[`VO_CT-${sessionName}`] = JSON.stringify(session);
}

function fetch(sessionName = null) {
    let allKeys, ourKeys = [];

    if (sessionName && localStorage[`VO_CT-${sessionName}`])
    { return JSON.parse(localStorage[`VO_CT-${sessionName}`]) }
    else if (sessionName)
    { return null }
    else {
        allKeys = Object.keys(localStorage);
        allKeys.forEach((item) => {
            if (item.startsWith('VO_CT-'))
            { ourKeys.push(item.substring(6)); }
        });
        return ourKeys
    }
}

//Logic-main

function hideSessionMenu() {
    document.getElementById('sessions').style.display = 'none';
}
function showSessionMenu() {
    document.getElementById('sessions').style.display = 'initial';
    renderSessions();
}
window.hideSessionMenu = hideSessionMenu;
window.showSessionMenu = showSessionMenu;

function mouseOverSO(func) {
    let funcList = {0:'New', 1: 'Rename', 2:'Import', 3:'Export', 4:'Delete'};
    document.getElementById('sessions_options_table').rows[0].cells[func].innerHTML = funcList[func];
    document.getElementById('sessions_options_table').rows[0].cells[func].className = null;
}
function mouseOutSO(func) {
    let funcList = {0:'add', 1:'edit', 2:'download', 3:'upload', 4:'delete'}
    document.getElementById('sessions_options_table').rows[0].cells[func].innerHTML = funcList[func];
    document.getElementById('sessions_options_table').rows[0].cells[func].className = 'material-symbols-outlined';
}
function mouseClickSO(func) {

}
window.mouseOverSO = mouseOverSO;
window.mouseOutSO = mouseOutSO;
window.mouseClickSO = mouseClickSO;

function renderSessions() {
    let sessionTable = document.getElementById('sessions_list_table');
    let currentSession;
    sessionTable.innerHTML =
        `<colgroup>
            <col span="2">
            <col span="1" width="15%">
        </colgroup>
        <tr>
            <th colspan="3">Sessions</th>
        </tr>
        <tr>
            <th>Session</th>
            <th>Last used</th>
            <th>Solves</th>
        </tr>`;
    allSessions = fetch();
    allSessions.forEach(item => {
        currentSession = fetch(item)
        sessionTable.innerHTML +=
            `<tr>
                <td>${currentSession.name}</td>
                <td>${currentSession.modTime}</td>
                <td>${currentSession.solveCount}</td>
            </tr>`
    });
}

function renderStats(sessionName) {
    document.getElementById('stats_main_table').innerHTML =
        `<tr>
                    <th colspan="4">Stats</th>
                </tr>
        <tr>
            <th></th>
            <th>Current</th>
            <th>Best</th>
            <th>Target</th>
        </tr>
        <tr>
            <th>Time</th>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <th>Mo3</th>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <th>Ao5</th>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <th>Ao12</th>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        </tr>`;
    document.getElementById('stats_list_table').innerHTML =
        `<tr style="cursor: pointer;" onclick="showSessionMenu()">
                    <th colspan="4">Default Session</th>
                </tr>
        <tr>
                    <th>S.No</th>
                    <th>Time</th>
                    <th>Mo3</th>
                    <th>Ao5</th>
                </tr>`;
    let storedSolves = fetch(sessionName).stats;
    storedSolves.forEach(item => { newSolve(item.time, item.state); });
}

renderStats(currentSessionName);

window.addEventListener('beforeunload',
        event => { store(handover(), currentSessionName); }
);