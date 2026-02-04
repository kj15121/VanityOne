// The code directly linked to the page
"use strict"

import Solve from './stats_handler.js';

//Main algorithm objects
const secScreen = document.getElementById('sec');
const msecScreen = document.getElementById('msec');
const catchScreen = document.getElementById('timer_landing');
const beep = document.createElement("audio");

let time, startTime;
let seconds, mseconds;
let clickStart, whenClickDown, isClickDown = false;
let isInspectOT = false, isDNF = false;
let state = 0;  // 0 - default; 1 - inspect; 2 - solve; 3 - DNF
let timingLoop, mouseDownLoop;

//Logic-support

function render(sec, msec) {
    secScreen.innerHTML = sec;
    msecScreen.innerHTML = msec;
}

beep.src = '../Resources/beep.mp3';
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
            msecScreen.style.color = 'var(--text-red)';
            isInspectOT = true;
        }
        else {
            render(seconds, 'DNF');
            secScreen.style.color = 'var(--text-red)';
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
    if (!(key['key'] === ' ')) { return null }
    if (!isClickDown) { //First key-detect
        isClickDown = true;

        if (state === 0 || state === 1) {
            clickStart = Date.now();
            secScreen.style.color = 'var(--text-red)';
            if (state === 0 || time < 12000) { msecScreen.style.color = 'var(--text-red)'; }

        }
        else if (state === 2) {
            render(seconds, mseconds);
            clearInterval(timingLoop);
            timingLoop = null;
        }
    }
    if (!(state === 0 || state === 1)) { return null }
    //Usable key continuations

    whenClickDown = Math.trunc((Date.now() - clickStart));
    if (whenClickDown < 525) { return null }

    secScreen.style.color = 'var(--text-green)';
    if (!isInspectOT) { msecScreen.style.color = 'var(--text-green)'; }
}

function clickUp(key = {'key':' '}) {
    if (!(key['key'] === ' ')) { return null }
    isClickDown = false;
    //Key released

    secScreen.style.color = 'var(--text)';
    msecScreen.style.color = 'var(--text)';

    if (state === 0) {
        if (whenClickDown < 525) { return null }
        clickStart = null;
        whenClickDown = null;

        startTime = Date.now();
        timingLoop = setInterval(timer, 50);
        state = 1;
    }
    else if (state === 1) {
        if (whenClickDown < 525) { return null }
        clickStart = null;
        whenClickDown = null;

        clearInterval(timingLoop);
        timingLoop = null;

        startTime = Date.now();
        timingLoop = setInterval(timer, 23);
        state = 2;
    }
    else if (state === 2) {
        state = 0;

        if (isInspectOT) {
            secScreen.innerHTML = seconds + '+2';
            secScreen.style.color = 'var(--text-red)';
            isInspectOT = false;
            new Solve(time, 1);
        }
        else if (isDNF) {
            msecScreen.innerHTML = 'DNF'
            secScreen.style.color = 'var(--text-red)';
            isDNF = false;
            new Solve(time, 2);
        }
        else { new Solve(time, 0); }
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