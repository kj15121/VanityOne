// The code directly linked to the page
"use strict"

//Main algorithm objects
let solves = [];

//Logic-support

export default function Solve(time, state) {
    this.time = time;
    this.state = [null, "+2", "DNF"][state];
    if (state === 1) { this.time += 2000; }
    solves.push(this);
    console.log(solves)
}

//Logic-main