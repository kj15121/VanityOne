// The code directly linked to the page
// Handling the timer
"use strict"

import {newSolve} from './stats_handler.js';

//Main algorithm objects
const secScreen = document.getElementById('sec');
const msecScreen = document.getElementById('msec');
const catchScreen = document.getElementById('timer_landing');
const beep = document.createElement("audio");

let time, startTime;
let seconds, mseconds;
let clickStart, whenClickDown, isClickDown = false;
let isInspectOT = false, isDNF = false;
let state = 0;  // 0 - default; 1 - inspect; 2 - solve
let timingLoop, mouseDownLoop;
let sessionState = false;

//Logic-support

function render(sec, msec) {
    secScreen.innerHTML = sec;
    msecScreen.innerHTML = msec;
}

export function toggleSessionState(state) {
    sessionState = state;
}

beep.src = '../Assets/beep.mp3';
beep.setAttribute("preload", "auto");
beep.setAttribute("controls", "none");
beep.style.display = "none";
beep.alert = function() {
    beep.play()
        .catch(() => { console.error("audio error"); })
}

//Logic-main

function timer() {
    time = Date.now() - startTime;
    seconds = String(Math.floor((time / 1000) % 60)).padStart(2, '0');
    mseconds = String(Math.trunc(time % 1000)).padStart(3, '0');

    if (state === 1) {  //During inspection
        if (time < 12000) {
            render(seconds, 'inspect');
        }
        else if (time < 15000) {
            render(seconds, 'GO!!!');
            msecScreen.style.color = 'var(--text-green)';
        }
        else if (time < 17000) {
            render(seconds, '+2');
            msecScreen.style.color = 'var(--text-red)'
            isInspectOT = true;
        }
        else {
            render(seconds, 'DNF');
            secScreen.style.color = 'var(--text-red)';
            isInspectOT = false;
            isDNF = true;
        }

        if ( (11950 < time && time < 12050) ||
             (14950 < time && time < 15050) ||
             (16950 < time && time < 17050) ) {
            beep.alert();
        }
    }
    else if (state === 2) { //During solve
        render(seconds, mseconds[0]);
    }
}

function clickDown(key = {'key':' '}) {
    if (sessionState) { return }
    if (key.key === 'Escape' && state === 1) {
        clearInterval(timingLoop);
        timingLoop = null;
        render(seconds, 'canceled');
        document.getElementById('stats').style.display = 'flex';
        state = 0;
    }
    if (key.key === 'Escape' && state === 2) {
        clearInterval(timingLoop);
        timingLoop = null;
        msecScreen.innerHTML = 'DNF'
        secScreen.style.color = 'var(--text-red)';
        document.getElementById('stats').style.display = 'flex';
        state = 0;
        newSolve(time, 'DNF');
    }
    if (!(key['key'] === ' ')) { return }
    if (!isClickDown) { //First key-detect
        isClickDown = true;

        if (state === 0 || state === 1) {
            clickStart = Date.now();
            secScreen.style.color = 'var(--text-red)';
            if (state === 0 || time < 12000) { msecScreen.style.color = 'var(--text-red)'; }

        }
        else if (state === 2) {
            clearInterval(timingLoop);
            timingLoop = null;
            render(seconds, mseconds);
        }
    }
    if (!(state === 0 || state === 1)) { return }
    //Usable key continuations

    whenClickDown = Date.now() - clickStart;
    if (whenClickDown < 525) { return }

    secScreen.style.color = 'var(--text-green)';
    if (!isInspectOT || !isDNF) { msecScreen.style.color = 'var(--text-green)'; }
}

function clickUp(key = {'key':' '}) {
    if (sessionState) { return }
    if (!(key['key'] === ' ')) { return }
    isClickDown = false;
    //Key released

    secScreen.style.color = 'var(--text)';
    msecScreen.style.color = 'var(--text)';

    if (state === 0) {
        if (whenClickDown < 525) { return }
        clickStart = null;
        whenClickDown = null;

        startTime = Date.now();
        timingLoop = setInterval(timer, 51);

        document.getElementById('stats').style.display = 'none'
        state = 1;
    }
    else if (state === 1) {
        if (whenClickDown < 525) { return }
        clickStart = null;
        whenClickDown = null;

        clearInterval(timingLoop);
        timingLoop = null;

        startTime = Date.now();
        timingLoop = setInterval(timer, 23);

        state = 2;
    }
    else if (state === 2) {
        if (isInspectOT) {
            secScreen.innerHTML = seconds + '+2';
            secScreen.style.color = 'var(--text-red)';
            isInspectOT = false;
            newSolve(time, '+2');
        }
        else if (isDNF) {
            msecScreen.innerHTML = 'DNF'
            secScreen.style.color = 'var(--text-red)';
            isDNF = false;
            newSolve(time, 'DNF');
        }
        else { newSolve(time); }

        document.getElementById('stats').style.display = 'flex'
        state = 0;
    }
}

//Script

document.addEventListener(
    'keydown',
    (event) => clickDown(event)
);
catchScreen.addEventListener(
    'mousedown',
    () => {
        mouseDownLoop = setInterval(clickDown, 30);
    }
);
catchScreen.addEventListener(
    'touchstart',
    (event) => {
        event.preventDefault();
        mouseDownLoop = setInterval(clickDown, 30);
    }
)

document.addEventListener(
    'keyup',
    (event) => clickUp(event)
);
catchScreen.addEventListener(
    'mouseup',
    () => {
        clearInterval(mouseDownLoop);
        mouseDownLoop = null;
        clickUp();
    }
);
catchScreen.addEventListener(
    'touchend',
    (event) => {
        event.preventDefault();
        clearInterval(mouseDownLoop);
        mouseDownLoop = null;
        clickUp();
    }
);
catchScreen.addEventListener(
    'touchcancel',
    (event) => {
        event.preventDefault();
        clearInterval(mouseDownLoop);
        mouseDownLoop = null;
        clickUp();
    }
);