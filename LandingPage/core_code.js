// The code directly linked to the page
"use strict"

//Main algorithm objects
const frame = document.getElementById('main');

let camX = 0,
    camY = 0;

let touchState = false;
let initX, initY;
let initCamX, initCamY;

//Logic


const offsetX = -(frame.offsetWidth - window.innerWidth) / 2,
    offsetY = -(frame.offsetHeight - window.innerHeight) / 2;
frame.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

function render(){
    frame.animate(
        {transform: `translate(${camX}px, ${camY}px)`},
        {
            duration: 3000,
            fill: "forwards",
        })
}

function viewLimit(){
    const winX = window.innerWidth,
        winY = window.innerHeight;
    const minX = (frame.offsetWidth - winX) * -1,
        minY = (frame.offsetHeight - winY) * -1;
    camX = Math.min(0, Math.max(minX, camX));
    camY = Math.min(0, Math.max(minY, camY));
}

window.addEventListener(
    "mousemove",
    function(e){
        const winX = window.innerWidth,
            winY = window.innerHeight;
        const decX = e.clientX / winX,
            decY = e.clientY / winY;
        const maxX = frame.offsetWidth - winX,
            maxY = frame.offsetHeight - winY;

        camX = decX * maxX * -1;
        camY = decY * maxY * -1;

        render()
    }
);

window.addEventListener(
    "touchstart",
    function(e){
        if (e.touches.length !== 1) return;

        e.preventDefault();

        touchState = true;
        initX = e.touches[0].clientX;
        initY = e.touches[0].clientY;
        initCamX = camX;
        initCamY = camY;
    },
    {passive: false}
);

window.addEventListener(
    "touchmove",
    function(e){
        if (!touchState) return;

        e.preventDefault();

        const moveX = e.touches[0].clientX - initX,
            moveY = e.touches[0].clientY - initY;
        camX = initCamX + moveX;
        camY = initCamY + moveY;

        viewLimit();
        render();
    },
    {passive: false}
);

window.addEventListener(
    "touchend",
    function() {
        touchState = false;
    }
);