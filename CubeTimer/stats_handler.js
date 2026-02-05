// The code directly linked to the page
"use strict"

//Main algorithm objects
const statsScreen = document.getElementById("stats_main_table");
const solveScreen = document.getElementById("stats_list_table");

let solves = [];
let mo3 = '-', ao5 = '-', ao12 = '-';
let bestStats = {'time': '-', 'mo3': '-', 'ao5': '-', 'ao12': '-'};

//Logic-support

export default function Solve(time, state) {
    this.time = time;
    this.state = [null, "+2", "DNF"][state];
    if (state === 1) { this.time += 2000; }
    solves.push(this);
    renderAppend(this);
    console.log(solves)
}

function purifyTTime(solveTimes) {
    let min,
        max = Math.max(...solveTimes);

    let minTrack = false, maxTrack = false;
    let toRemove = [];

    let solveTimeSum = 0;

    if (solveTimes.contains('DNF')) { min = 'DNF'; }
    else { min = Math.min(...solveTimes); }

    solveTimes.forEach((item, index) => {
        if (item === min && !minTrack) {
            minTrack = true;
            toRemove.push(index);
        }
        if (item === max && !maxTrack) {
            maxTrack = true;
            toRemove.push(index);
        }
    });
    toRemove.forEach((item) => { solveTimes.splice(item, 1); });
    solveTimes.forEach(item => { solveTimeSum += item; });

    return solveTimeSum
}

//Logic-main

function calcStats() {
    let solveTimes = [], solveTimeSum = 0;
    let countDNF = 0;

    if (solves.length < 3) { return null }
    for (let i = 1; i < 4; i++) {
        solveTimes.push(solves[solves.length - i].time);
        if (solves[solves.length - i].state === 'DNF') { countDNF += 1;}
    }
    if (countDNF > 0) { mo3 = 'DNF'; }
    else {
        solveTimes.forEach(item => { solveTimeSum += item; });
        mo3 = (solveTimeSum / 3000).toFixed(3);
    }

    if (solves.length < 5) { return null }
    solveTimes = [];
    for (let i = 4; i < 6; i++) {
        solveTimes.push(solves[solves.length - i].time);
        if (solves[solves.length - i].state === 'DNF') { countDNF += 1; }
    }
    if (countDNF > 1) {
        ao5 = 'DNF';
        ao12 = 'DNF';
        return null
    }
    else {
        solveTimeSum = purifyTTime(solveTimes);
        ao5 = (solveTimeSum / 3000).toFixed(3);
    }
    if (solves.length < 12) { return null }
    solveTimes = [];
    for (let i = 6; i < 13; i++) {
        solveTimes.push(solves[solves.length - i].time);
        if (solves[solves.length - i].state === 'DNF') { countDNF += 1; }
    }
    if (countDNF > 1) { ao12 = 'DNF'; }
    else {
        solveTimeSum = purifyTTime(solveTimes);
        ao12 = (solveTimeSum / 10000).toFixed(3);
    }
}

function renderAppend(solve) {
    calcStats();
    let index = solves.length
    let newSolveHTML = `<tr>
        <td>${index}</td>
        <td>${solve.time/1000}</td>
        <td>${mo3}</td>
        <td>${ao5}</td>
        </tr>`
    solveScreen.innerHTML += newSolveHTML;

    if (solve.state === '+2') {
        solveScreen.rows[index].cells[1].style.color = 'var(--text-orange)';
    }
    else if (solve.state === 'DNF') {
        solveScreen.rows[index].cells[1].style.color = 'var(--text-red)';
    }

    for (let i = 2; i < 6; i++) {
        statsScreen.rows[i].cells[1].style.color = 'var(--text-offset)';
        let currentStat = [(solve.time/1000), mo3, ao5, ao12][i-2],
            bestStat = bestStats[['time', 'mo3', 'ao5', 'ao12'][i-2]];

        if ((parseFloat(currentStat) < parseFloat(bestStat)) || bestStat === '-' || bestStat === 'DNF') {
            bestStats[['time', 'mo3', 'ao5', 'ao12'][i-2]] = currentStat;
            bestStat = currentStat;

            if (!(currentStat === '-')) {
                statsScreen.rows[i].cells[1].style.color = 'var(--text-green)';

                if (!(currentStat === bestStat)) { return null }
                solveScreen.rows[index].cells[i-1].style.color = 'var(--text-green)';
            }
            else if (currentStat === 'DNF') {
                statsScreen.rows[i].cells[1].style.color = 'var(--text-red)';
            }
        }
        statsScreen.rows[i].cells[1].innerHTML = currentStat
        statsScreen.rows[i].cells[2].innerHTML = bestStat;
    }
}