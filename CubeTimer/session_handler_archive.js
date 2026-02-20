// Code directly linked to the page
// Handling iter-session data
"use strict"

import {handover} from "./stats_handler.js";
import {newSolve} from "./stats_handler.js";
import {statsInit} from "./stats_handler.js";

//Main algorithm objects
let currentSessionName = 'Default';
let currentSessionIndex;
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
    currentSessionIndex = null;
}
function showSessionMenu() {
    document.getElementById('sessions').style.display = 'initial';
    renderSessions();
}

window.hideSessionMenu = hideSessionMenu;
window.showSessionMenu = showSessionMenu;

function sessionOptions_mOver(func) {
    let funcList = ['New', 'Rename', 'Import', 'Export', 'Delete'];
    document.getElementById('sessions_options_table').rows[0].cells[func].innerHTML = funcList[func];
    document.getElementById('sessions_options_table').rows[0].cells[func].className = null;
}
function sessionOptions_mOut(func) {
    let funcList = ['add', 'edit','download', 'upload', 'delete'];
    document.getElementById('sessions_options_table').rows[0].cells[func].innerHTML = funcList[func];
    document.getElementById('sessions_options_table').rows[0].cells[func].className = 'material-symbols-outlined';
}
function sessionOptions_mClick(func) {
    let funcs = [sessionCreate, sessionRename, sessionImport, sessionExport, sessionDelete];
    funcs[func]();
}

window.sessionOptions_mOver = sessionOptions_mOver;
window.sessionOptions_mOut = sessionOptions_mOut;
window.sessionOptions_mClick = sessionOptions_mClick;

function sessionCreate() {
    store(handover(), currentSessionName);
    statsInit();

    let sessionName = window.prompt('Enter name of session');
    while (allSessions.includes(sessionName)) {
        sessionName = window.prompt('Name already used');
    }
    if (!sessionName) { return }

    currentSessionName = sessionName;
    store([], sessionName);

    renderStats(currentSessionName);
    renderSessions();
}
function sessionRename() {
    let session = fetch(currentSessionName);

    let sessionName = window.prompt('Enter the new name');
    while (allSessions.includes(sessionName)) {
        sessionName = window.prompt('Name already used');
    }
    if (!sessionName) { return }

    store(session.stats, sessionName);
    localStorage.removeItem(`VO_CT-${currentSessionName}`);
    currentSessionName = sessionName;

    renderSessions();
}
function sessionImport() {}
function sessionExport() {}
function sessionDelete() {
    console.log('session delete');
    if (window.confirm("Session deletion cannot be undone, you sure?")) {
        return
    }

    localStorage.removeItem(`VO_CT-${currentSessionName}`);

}

function sessionMClick(sessionName, rowNumber) {
    store(handover(), currentSessionName);
    statsInit();

    currentSessionIndex = rowNumber;
    currentSessionName = sessionName;

    renderStats(sessionName);
    renderSessions();

    document.getElementById('sessions_list_table').rows[rowNumber].style.backgroundColor = 'var(--background)';
}
window.sessionMClick = sessionMClick;

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
function renderSessions() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let time, date;
    let sessionTable = document.getElementById('sessions_list_table');
    let currentSession;
    let dateObject, dateString;

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
    allSessions.forEach((item, index) => {
        currentSession = fetch(item)

        dateObject = new Date(currentSession.modTime);
        time = `${dateObject.getHours()}:${dateObject.getMinutes()} `;
        date = `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}`;
        dateString = time + date;

        sessionTable.innerHTML +=
            `<tr onclick="sessionMClick('${currentSession.name}', ${index+2})">
                <td>${currentSession.name}</td>
                <td>${dateString}</td>
                <td>${currentSession.solveCount}</td>
            </tr>`
    });
}

renderStats(currentSessionName);
renderSessions();

window.addEventListener('beforeunload',
        event => { store(handover(), currentSessionName); }
);