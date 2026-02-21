// Code directly linked to the page
// Handling iter-session data
"use strict"

import {handover} from "./stats_handler.js";
import {newSolve} from "./stats_handler.js";
import {statsInit} from "./stats_handler.js";
import {toggleSessionState} from "./timer_handler.js";

//Main algorithm objects
let currentSession, currentSessionName, currentSessionIndex;
let sessionList = [];
let settings = {'defSession': 'Default', 'allSessions': ['Default']};

//Logic-support

function init() {
    // Load all sessions into sessionList
    fetch();

    // Initialize config
    if (localStorage['VO-CT-Config']) {
        settings = JSON.parse(localStorage['VO-CT-Config']);
    } else {
        localStorage['VO-CT-Config'] = JSON.stringify(settings);
    }

    // Ensure defSession is listed
    if (!settings.allSessions.includes(settings.defSession)) {
        settings.allSessions.push(settings.defSession);
    }

    // Sync the session lists and remove duplicates
    for (const item of sessionList) {
        if (!settings.allSessions.includes(item)) {
            settings.allSessions.push(item);
        }
    }
    for (const item of settings.allSessions) {
        if (!sessionList.includes(item)) {
            store(item, []);
            sessionList.push(item);
        }
    }

    sessionList = settings.allSessions;

    // Load default session
    if (!localStorage[`VO-CT-S-${settings.defSession}`]) {
        store(settings.defSession, []);
    }
    currentSession = JSON.parse(localStorage[`VO-CT-S-${settings.defSession}`]);
    currentSessionName = settings.defSession;
    currentSessionIndex = sessionList.indexOf(currentSessionName);

    // Render UI
    renderStats();
    renderSessions();
}

function store(sessionName, sessionSolves) {
    let session = {};
    session.name = sessionName;
    session.solves = sessionSolves;
    session.solveCount = sessionSolves.length;
    session.modTime = Date.now();

    localStorage[`VO-CT-S-${sessionName}`] = JSON.stringify(session);

    if (!(sessionList.includes(sessionName))) {
        sessionList.push(sessionName);
    }
}
function fetch(sessionName = null) {
    if (!sessionName) {
        sessionList = [];
        for (const key of Object.keys(localStorage)) {
            if (key.startsWith('VO-CT-S-')) {
                sessionList.push(key.substring(8));
            }
        }
        return;
    }

    if (!localStorage[`VO-CT-S-${sessionName}`]) {
        store(sessionName, []);
    }
    return JSON.parse(localStorage[`VO-CT-S-${sessionName}`]);
}

function showSessionMenu() {
    toggleSessionState(true);
    document.getElementById('sessions').style.display = 'initial';
}
function hideSessionMenu() {
    toggleSessionState(false);
    document.getElementById('sessions').style.display = 'none';
    document.getElementById('sessions_editor').style.display = 'none';
}
window.hideSessionMenu = hideSessionMenu;
window.showSessionMenu = showSessionMenu;

function sessionOptions_mOver(func) {
    const funcList = ['New', 'Rename', 'Import', 'Edit/Export', 'Delete', 'Save', 'Export', 'Close'];
    let cell;
    if (func < 5) {
        cell = document.getElementById('sessions_options_table').rows[0].cells[func];
    }
    else if (4 < func && func < 8) {
        cell = document.getElementById('sessions_eOptions_table').rows[0].cells[func-5];
    }
    cell.innerHTML = funcList[func];
    cell.className = '';
}
function sessionOptions_mOut(func) {
    const funcList = ['add', 'edit', 'download', 'code', 'delete', 'save', 'move_item', 'close'];
    let cell;
    if (func < 5) {
        cell = document.getElementById('sessions_options_table').rows[0].cells[func];
    }
    else if (4 < func && func < 8) {
        cell = document.getElementById('sessions_eOptions_table').rows[0].cells[func-5];
    }
    cell.innerHTML = funcList[func];
    cell.className = 'material-symbols-outlined';
}
function sessionOptions_mClick(func) {
    const funcs = [createSession, renameSession, importSession, modifySession, deleteSession, storeSession, exportSession, closeEditor];
    funcs[func]();
}
window.sessionOptions_mOver = sessionOptions_mOver;
window.sessionOptions_mOut = sessionOptions_mOut;
window.sessionOptions_mClick = sessionOptions_mClick;

//Logic-main

function createSession() {
    let sessionName = window.prompt('Enter name of session');
    while (sessionList.includes(sessionName)) {
        sessionName = window.prompt('Name already used');
    }
    if (!sessionName) { return }

    store(currentSessionName, handover());

    currentSessionName = sessionName;
    store(currentSessionName, []);

    renderStats();
    renderSessions();
}
function renameSession() {
    const session = fetch(currentSessionName);
    let sessionName = window.prompt('Enter the new name');

    while (sessionList.includes(sessionName)) {
        sessionName = window.prompt('Name already used');
    }
    if (!sessionName) { return }

    sessionList[currentSessionIndex] = sessionName;
    store(sessionName, session.solves);
    localStorage.removeItem(`VO-CT-S-${currentSessionName}`);

    currentSessionName = sessionName;

    renderSessions();
}
function importSession() {}
function modifySession() {
    document.getElementById('sessions_editor').style.display = 'initial';
}
function deleteSession() {
    if (!(window.confirm("Session deletion cannot be undone, you sure?"))) {
        return
    }

    sessionList.splice(currentSessionIndex, 1);
    localStorage.removeItem(`VO-CT-S-${currentSessionName}`);

    if (sessionList.length === 0) {
        store('Default', []);
        currentSessionName = 'Default';
    }
    else if (currentSessionIndex === sessionList.length) {
        currentSessionName = sessionList[currentSessionIndex-1];
    }
    else {
        currentSessionName = sessionList[currentSessionIndex];
    }

    renderSessions();
    renderStats();
}
function storeSession () {}
function exportSession() {
    store(currentSessionName, handover());
    currentSession = fetch(currentSessionName);

    const exportBlob = new Blob([JSON.stringify(currentSession, null, 2)], { type: 'application/json' });
    const exportUrl = URL.createObjectURL(exportBlob);

    const exportElement = document.createElement('a');
    exportElement.href = exportUrl;
    exportElement.download = currentSessionName;
    exportElement.style.display = 'none';

    document.body.appendChild(exportElement);
    exportElement.click();

    document.body.removeChild(exportElement);
    URL.revokeObjectURL(exportUrl);
}
function closeEditor () {
    document.getElementById('sessions_editor').style.display = 'none';
}

function loadSession(sessionName) {
    store(currentSessionName, handover());
    currentSessionName = sessionName;
    renderStats();
    renderSessions();
}
window.loadSession = loadSession;

function renderStats() {
    const statsMainTable = document.getElementById('stats_main_table');
    const statsListTable = document.getElementById('stats_list_table');

    for (let i = 2; i < 6; i++) {
        for (let j = 1; j < 4; j++) {
            statsMainTable.rows[i].cells[j].innerHTML = '-';
            statsMainTable.rows[i].cells[j].style.color = 'var(--text-offset)';
        }
    }

    statsListTable.innerHTML =
        `<tr style="cursor: pointer;" onclick="showSessionMenu()">
            <th id="session_name" colspan="4">Session - Default</th>
        </tr>
        <tr>
            <th>S.No</th>
            <th>Time</th>
            <th>Mo3</th>
            <th>Ao5</th>
        </tr>`;

    statsInit();
    currentSession = fetch(currentSessionName)
    currentSessionIndex = sessionList.indexOf(currentSessionName);
    currentSession.solves.forEach(item => {
        newSolve(item.time, item.state);
    });

    document.getElementById('session_name').innerHTML = `Session - ${currentSessionName}`;
}
function renderSessions() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const tbody = document.querySelector('#sessions_list_table tbody');
    let bodyHTML = '';

    sessionList.forEach((item, index) => {
        const tempSession = fetch(item);
        const dateObject = new Date(tempSession.modTime);
        const time = `${dateObject.getHours()}:${dateObject.getMinutes()} `;
        const date = `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()}`;

        bodyHTML +=
            `<tr onclick="loadSession('${tempSession.name}', ${index})">
                <td>${tempSession.name}</td>
                <td>${time + date}</td>
                <td>${tempSession.solveCount}</td>
            </tr>`;
    });

    tbody.innerHTML = bodyHTML;

    tbody.rows[currentSessionIndex].style.background = 'var(--background)';
}

window.addEventListener('beforeunload', () => {
    store(currentSessionName, handover());

    settings.allSessions = sessionList;
    settings.defSession = currentSessionName;
    localStorage['VO-CT-Config'] = JSON.stringify(settings);
});

init();