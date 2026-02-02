// The code directly linked to the page
"use strict"

//Main algorithm objects
const secScreen = document.getElementById('sec');
const msecScreen = document.getElementById('msec');

let time, startTime;
let seconds, mseconds;
let clickStart, whenClickDown, isClickDown = false;
let isInspectOT = false, state = 0;  // 0 - def; 1 - inspect; 2 - solve; 3 - DNF
let timingLoop, mouseDownLoop;

//Logic

function render(sec, msec) {
    secScreen.innerHTML = sec;
    msecScreen.innerHTML = msec;
}

function timer() {
    time = Date.now() - startTime;
    seconds = String(Math.floor((time / 1000) % 60)).padStart(2, '0');
    mseconds = String(Math.trunc(time % 1000)).padStart(3, '0');

    if (state === 1) {
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
            state = 3;
        }
    }
    else if (state === 2) {
        render(seconds, mseconds);
    }
}

function clickDown(key = {'key':' '}) {
    if (!(key['key'] === ' ')) { return null }
    if (!isClickDown) {
        isClickDown = true;

        if (state === 0) {
            secScreen.style.color = 'var(--text-green)';
            msecScreen.style.color = 'var(--text-green)';
        }
        else if (state === 1) {
            clickStart = Date.now()
            secScreen.style.color = 'var(--text-red)';
            if (seconds < 12000) { msecScreen.style.color = 'var(--text-red)'; }
        }
        else if ((state === 2) || (state === 3)) {
            clearInterval(timingLoop);
            timingLoop = null;
        }
    }

    whenClickDown = Math.trunc((Date.now() - clickStart));
    if (whenClickDown < 525) { return null }

    secScreen.style.color = 'var(--text-green)';
    if (!isInspectOT) { msecScreen.style.color = 'var(--text-green)'; }
}

function clickUp(key = {'key':' '}) {
    if (!(key['key'] === ' ')) { return null }
    isClickDown = false;

    secScreen.style.color = 'var(--text)';
    msecScreen.style.color = 'var(--text)';

    if (state === 0) {
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

        if (!isInspectOT) { return null }
        secScreen.innerHTML = seconds + '+2';
        secScreen.style.color = 'var(--text-red)';
        isInspectOT = false;
    }
    else if (state === 3) {
        state = 0;
        render('null', 'DNF');
    }
}

document.addEventListener('keydown',
    (event) => clickDown(event)
);
document.addEventListener('mousedown',
    () => {
        mouseDownLoop = setInterval(clickDown, 30);
});

document.addEventListener('keyup',
    (event) => clickUp(event)
);
document.addEventListener('mouseup',
    () => {
        clearInterval(mouseDownLoop);
        mouseDownLoop = null;
        clickUp();
});