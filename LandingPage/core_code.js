// The code directly linked to the page
"use strict"

// Main algorithm objects
const frame = document.getElementById("main");

frame.animate(
    {transform: `translate(${-25}vw, ${-25}vh)`},
    {
        duration:0,
        fill: "forwards",
    }
)

window.onmousemove = function(e) {
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    const decX = cursorX / window.innerWidth;
    const decY = cursorY / window.innerHeight;

    const maxX = frame.offsetWidth - window.innerWidth;
    const maxY = frame.offsetHeight - window.innerHeight;

    const targetX = maxX * decX * -1;
    const targetY = maxY * decY * -1;

    frame.animate(
        {transform: `translate(${targetX}px, ${targetY}px)`},
        {
            duration: 3000,
            fill: "forwards",
            easing: "ease",
        })
}