// The code directly linked to the page
// Handling tables
"use strict"

//Main algorithm objects
const statsScreen = document.getElementById("stats_main_table");
const solveScreen = document.getElementById("stats_list_table");

let solves = [], solveTimes = [];   //solveTimes adds vals to the start | stored as ...smmm
let currentStats = {'time': '-', 'mo3': '-', 'ao5': '-', 'ao12': '-'};  // stored as ...s.mmm
let bestStats = {'time': '-', 'mo3': '-', 'ao5': '-', 'ao12': '-'};     // stored as ...s.mmm
let targetStats = {'time': '-', 'mo3': '-', 'ao5': '-', 'ao12': '-'};   // stored as ...s.mmm

//Logic-support

export function newSolve(time, state = null) {
    if (state === '+2') { time += 2000; }
    let solve = {'time': time, 'state': state }
    solves.push(solve);
    solveTimes.unshift(time);

    calcCStats();
    calcBStats();
    calcTStats();
    render();
}

function timeAdder(timeList, inverse = 0) {
    let min, max;
    let timeSum = 0;

    if (timeList.includes('DNF')) { max = 'DNF'; }
    else { max = Math.max(...timeList); }
    min = Math.min(...timeList);

    timeList.forEach((item) => {
        if (item === min) { min = null; }
        else if (item === max) { max = null; }
        else { timeSum += item; }
    });

    if (!inverse) { return timeSum }

    let targetStat, targetTime;
    targetStat = `ao${{3:5,10:12}[inverse]}`;
    targetTime = (parseFloat(bestStats[targetStat]) * inverse) - (timeSum / 1000) - 0.001;
    return targetTime.toFixed(3)
}

//Logic-main

function calcCStats() {
    let timeList = [], timeSum = 0;
    let DNFCount = 0;
    let solveCount = solveTimes.length;

    //time
    currentStats.time = (solveTimes[0] / 1000);

    //mo3
    if (solveCount < 3) { return }
    timeList = solveTimes.slice(0, 3);
    timeList.forEach((item) => {
        if (item === 'DNF') { DNFCount++; }
    });
    if ( DNFCount > 0 ) {
        currentStats.mo3 = 'DNF';
        DNFCount = 0;
    }
    else {
        timeList.forEach((item) => { timeSum += item; });
        currentStats.mo3 = (timeSum / 3000).toFixed(3);
    }

    //ao5
    if (solveCount < 5) { return }
    timeList.push(...solveTimes.slice(3, 5));
    timeList.forEach((item) => {
        if (item === 'DNF') { DNFCount++; }
    });
    if (DNFCount > 1) {
        currentStats.ao5 = 'DNF';
        currentStats.ao12 = 'DNF';
        return
    }
    else {
        timeSum = timeAdder(timeList);
        currentStats.ao5 = (timeSum / 3000).toFixed(3);
        DNFCount = 0;
    }

    //ao12
    if (solveCount < 12) { return }
    timeList.push(...solveTimes.slice(5, 12));
    timeList.forEach((item) => {
        if (item === 'DNF') { DNFCount++; }
    });
    if (DNFCount > 1) {
        currentStats.ao12 = 'DNF';
    }
    else {
        timeSum = timeAdder(timeList);
        currentStats.ao5 = (timeSum / 10000).toFixed(3);
    }
}

function calcBStats() {
    let CStat, BStat;

    CStat = currentStats.time; BStat = bestStats.time;
    if ((!(CStat === 'DNF') && (+CStat < +BStat)) || (BStat === '-'))
    { bestStats.time = currentStats.time; }

    CStat = currentStats.mo3; BStat = bestStats.mo3;
    if (!(CStat === '-' || CStat === 'DNF') && ((+CStat < +BStat) || (BStat === '-')))
    { bestStats.mo3 = currentStats.mo3; }

    CStat = currentStats.ao5; BStat = bestStats.ao5;
    if (!(CStat === '-' || CStat === 'DNF') && ((+CStat < +BStat) || (BStat === '-')))
    { bestStats.ao5 = currentStats.ao5; }

    CStat = currentStats.ao12; BStat = bestStats.ao12;
    if (!(CStat === '-' || CStat === 'DNF') && ((+CStat < +BStat) || (BStat === '-')))
    { bestStats.ao12 = currentStats.ao12; }
}

function calcTStats() {
    let timeList = [], timeSum = 0;
    let DNFCount = 0;
    let targetTime;
    let solveCount = solveTimes.length;

    //time
    targetStats.time = bestStats.time - 0.001;

    //mo3
    if (solveCount < 3) { return }
    timeList = solveTimes.slice(0, 2);
    timeList.forEach((item) => {
        if (item === 'DNF') { DNFCount++; }
    });
    if (DNFCount > 0) {
        targetStats.mo3 = '-';
        DNFCount = 0;
    }
    else {
        timeList.forEach((item) => { timeSum += item; });
        targetTime = (parseFloat(bestStats.mo3) * 3) - (timeSum/1000) - 0.001;
        if (!(targetTime < 0 ))
        { targetStats.mo3 = targetTime.toFixed(3); }
    }

    //ao5
    if (solveCount < 5) { return }
    timeList.push(...solveTimes.slice(2, 4));
    timeList.forEach((item) => {
        if (item === 'DNF') { DNFCount++; }
    });
    if (DNFCount > 1) {
        targetStats.ao5 = '-';
        targetStats.ao12 = '-';
        return
    }
    else {
        targetStats.ao5 = timeAdder(timeList, 3);
        DNFCount = 0;
    }

    //ao12
    if (solveCount < 11) { return }
    timeList.push(...solveTimes.slice(4, 11));
    timeList.forEach((item) => {
        if (item === 'DNF') { DNFCount++; }
    });
    if (DNFCount > 1) {
        currentStats.ao12 = '-';
    }
    else {
        targetStats.ao12 = timeAdder(timeList, 10);
    }
}

function render() {
    let index = solves.length

    solveScreen.innerHTML +=
        `<tr>
        <td>${index}</td>
        <td>${currentStats.time}</td>
        <td>${currentStats.mo3}</td>
        <td>${currentStats.ao5}</td>
        </tr>`
    ;

    if (solves[index-1].state === '+2') {
        solveScreen.rows[index].cells[1].style.color = 'var(--text-orange)';
    }
    else if (solves[index-1].state === 'DNF') {
        solveScreen.rows[index].cells[1].style.color = 'var(--text-red)';
    }

    if (currentStats.mo3 === bestStats.mo3 && !(bestStats.mo3 === '-')) {
        solveScreen.rows[index].cells[2].style.color = 'var(--text-green)';
    }
    if (currentStats.ao5 === bestStats.ao5 && !(bestStats.ao5 === '-')) {
        solveScreen.rows[index].cells[3].style.color = 'var(--text-green)';
    }

    for (let i = 2; i < 6; i++) {
        let cRow = {2: 'time', 3: 'mo3', 4: 'ao5', 5: 'ao12'}[i];

        statsScreen.rows[i].cells[1].innerHTML = currentStats[cRow];
        if ((currentStats[cRow] === bestStats[cRow]) && !(currentStats[cRow] === '-')) {
            statsScreen.rows[i].cells[1].style.color = 'var(--text-green)';
        }
        else {
            statsScreen.rows[i].cells[1].style.color = 'var(--text-offset)';
        }

        statsScreen.rows[i].cells[2].innerHTML = bestStats[cRow];
        statsScreen.rows[i].cells[3].innerHTML = targetStats[cRow];
    }
}