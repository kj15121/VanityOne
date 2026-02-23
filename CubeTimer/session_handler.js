// Code directly linked to the page
// Handling session data
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
    }
    else {
        localStorage['VO-CT-Config'] = JSON.stringify(settings);
    }

    // Ensure defSession is listed
    if (!settings.allSessions.includes(settings.defSession)) {
        settings.allSessions.push(settings.defSession);
    }

    // Sync the session lists
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
    settings.allSessions = sessionList;

    // Load default session
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

function validateInput(userJSON) {

    //parsing JSON
    let parsed;
    try {
        if (typeof userJSON === "string") {
            parsed = JSON.parse(userJSON);
        }
        else {
            parsed = userJSON;
        }
    }
    catch {
        window.alert("Error in processing input, check console for more information")
        throw new Error("SyntaxError in input, expected JSON");
    }

    //getting name and solves
    let name, rawSolves;
    if (parsed) {
        name = parsed.name;
        rawSolves = parsed.solves;
    }

    //correcting name
    if (Array.isArray(name) && name[0]) {
        name = name[0];
    }
    if (typeof name !== "string" || name.trim() === "") {
        name = window.prompt('Enter a name for the session');
    }
    if (!name) {
        name = window.prompt('Enter a name for the session')
        if (!name) {
            return 'nameError';
        }
    }

    //correcting solves
    let solves = [];

    if (!Array.isArray(rawSolves)) {
        throw new Error("Invalid 'solves' field, expected an array");
    }

    rawSolves.forEach((item, index) => {
        if (typeof item !== "object" || item === null) {
            console.warn(`Solve indexed at ${index} skipped, expected collection`);
            return;
        }

        let time, state;

        if (Array.isArray(item) && 0 < item.length) {
            time = item[0];
            if (item[1] === '+2' || item[1] === 'DNF') {
                state = item[1];
            }
            else {
                state = null;
            }
        }
        else {
            time = item.time;
            state = item.state;
        }

        if (!Number.isInteger(time) || time < 0) {
            console.warn(`Solve indexed at ${index} skipped, time invalid`);
            return
        }

        solves.push({'time': time, 'state': state});
    });

    //building session
    let session = {};
    session.name = name.trim();
    session.solves = solves;
    return session;
}

function showSessionMenu() {
    toggleSessionState(true);
    document.getElementById('sessions').style.display = 'initial';
    renderSessions();
}
function hideSessionMenu() {
    toggleSessionState(false);
    document.getElementById('sessions').style.display = 'none';
    document.getElementById('sessions_editor').style.display = 'none';
}
window.hideSessionMenu = hideSessionMenu;
window.showSessionMenu = showSessionMenu;

function sessionOptions_fetchCell(func) {
    let cell;
    if (func < 5) {
        cell = document.getElementById('sessions_options_table').rows[0].cells[func];
    }
    else if (4 < func && func < 8) {
        cell = document.getElementById('sessions_eOptions_table').rows[0].cells[func-5];
    }

    return cell
}

function sessionOptions_mOver(func) {
    const funcList = ['New', 'Rename', 'Import', 'Edit/Export', 'Delete', 'Save', 'Export', 'Close'];
    const cell = sessionOptions_fetchCell(func);
    cell.innerHTML = funcList[func];
    cell.className = '';
}
function sessionOptions_mOut(func) {
    const funcList = ['add', 'edit', 'download', 'code', 'delete', 'save', 'move_item', 'close'];
    const cell = sessionOptions_fetchCell(func);
    cell.innerHTML = funcList[func];
    cell.className = 'material-symbols-outlined';
}
function sessionOptions_mClick(func) {
    const funcs = [createSession, renameSession, importSession, openEditor, deleteSession, saveSession, exportSession, closeEditor];
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
function importSession() {
    document.getElementById('fileInput').click();
    //handed over to document.getElementById('fileInput').addEventListener
}
function openEditor() {
    document.getElementById('sessions_editor').style.display = 'initial';
    store(currentSessionName, handover());
    document.getElementById('sessions_editor_textArea').value = JSON.stringify(
        fetch(currentSessionName), null, 2
    );

    currentSession = fetch(currentSessionName);
    currentSessionIndex = sessionList.indexOf(currentSessionName);
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

    renderStats();
    renderSessions();
}
function saveSession () {
    let userJSON = document.getElementById('sessions_editor_textArea').value;
    let session = validateInput(userJSON);

    if (!(currentSessionName === session.name)) {
        while (sessionList.includes(session.name) || currentSessionName === session.name) {
            session.name = window.prompt('Name already used, enter a new name');
        }
        if (!session.name) { return; }

        sessionList[currentSessionIndex] = session.name;
        localStorage.removeItem(`VO-CT-S-${currentSessionName}`);
    }

    store(session.name, session.solves);
    currentSessionName = session.name;

    renderStats();
    renderSessions();
}
function exportSession() {
    store(currentSessionName, handover());
    currentSession = fetch(currentSessionName);

    const exportBlob = new Blob(
        [JSON.stringify(currentSession, null, 2)],
        { type: 'application/json' }
    );
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
    const statsListTable = document.querySelector('#stats_list_table tbody');

    for (let i = 2; i < 6; i++) {
        for (let j = 1; j < 4; j++) {
            statsMainTable.rows[i].cells[j].innerHTML = '-';
            statsMainTable.rows[i].cells[j].style.color = 'var(--text-offset)';
        }
    }

    statsListTable.innerHTML = '';

    statsInit();
    currentSession = fetch(currentSessionName);
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
document.getElementById('fileInput').addEventListener('change', () => {
    const file = this.files[0];
    if (!file) {
        this.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        const data = String(e.target.result);

        let session = validateInput(data);

        if (session === 'nameError') {
            this.value = '';
            throw new Error('Unique name needed for session')
        }

        while (sessionList.includes(session.name)) {
            session.name = window.prompt('Name already used, enter a new name');
        }
        if (!session.name) {
            return
        }

        store(session.name, session.solves);

        renderStats();
        renderSessions();
    };
    reader.readAsText(file);
});
document.getElementById("sessions_main").addEventListener('click', (e) => {
    e.stopPropagation();
});
document.getElementById("sessions_editor").addEventListener('click', (e) => {
    e.stopPropagation();
});
document.getElementById('sessions_editor_textArea').addEventListener('change', (e) => {
    try {
        const value = JSON.parse(e.target.value);
        e.target.value = JSON.stringify(value, null, 2);
    }
    catch {}
});

init();