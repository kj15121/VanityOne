// The code directly linked to the page
import {manage} from './encrypter.js'
"use strict"

// Main algorithm variables

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let rotorDisc = [null, null, null]; //Discs in the rotor
let rotorSpin = [0, 0, 0];       //Starting position of the disc
let swaper = []                   //Plug Board (swaper) configuration
let sprCtrl = null                  //Control for swaper modification

let dMToggle = true;             //Dark Mode Toggle
let swaperLength;

// UI functions

function rtr_disc(rotor, disc){
    //Change the disc of a rotor
    if (rotorDisc[rotor - 1]) {
        document.getElementById(`r${rotor}.${rotorDisc[rotor-1]}`).style.backgroundColor = "var(--minor)";
    }
    rotorDisc[rotor - 1] = disc;
    document.getElementById(`r${rotor}.${disc}`).style.backgroundColor = "var(--textHover)";
}
window.rtr_disc = rtr_disc;

function rtr_spin(rotor, spin){
    //Change the starting position of the disc
    rotorSpin[rotor - 1] = (rotorSpin[rotor - 1] + spin + 26) % 26;
    document.getElementById(`r${rotor}.s`).innerHTML = letters[rotorSpin[rotor-1]];
}
window.rtr_spin = rtr_spin;

function spr_letter(token){
    //Control swaper insertion flow
    if (swaper.includes(token)) {}
    else if (sprCtrl === token) {
        document.getElementById(token).style.backgroundColor = 'var(--minor)';
        sprCtrl = null;
    }
    else if (sprCtrl == null) {
        document.getElementById(token).style.backgroundColor = 'var(--textHover)';
        sprCtrl = token;
    }
    else {
        swaper.push(sprCtrl);
        swaper.push(token);
        document.getElementById(sprCtrl).innerHTML = "-";
        document.getElementById(token).innerHTML = "-";
        document.getElementById(sprCtrl).style.backgroundColor = "var(--minor)";
        sprCtrl = null;
        sprRender();
    }
}
window.spr_letter = spr_letter;

function spr_pair(token){
    //Control swaper deletion flow
    token = (parseInt(token.replace("s", "")) - 1) * 2;
    if (swaper[token]) {
        document.getElementById(swaper[token]).innerHTML = swaper[token];
        document.getElementById(swaper[token+1]).innerHTML = swaper[token+1];
        swaper.splice(token, 2);
        sprRender();
    }
}
window.spr_pair = spr_pair;

function sprRender(){
    //Render swaper configuration
    swaperLength = (swaper.length)/2
    for (let i = 0; i < swaperLength; i++) {
        document.getElementById(`s${i + 1}`).innerHTML = `${swaper[2 * i]} : ${swaper[(2 * i) + 1]}`;
    }
    if (!(swaperLength === 14)) {
        document.getElementById(`s${swaperLength + 1}`).innerHTML = "- : -";
    }
}

function hustle() {
    //check for completeness
    if (rotorDisc.includes(null)) {
        alert("Select discs for all rotors")
        return
    }

    //Package settings and handover operations to encryptor
    const swaperConfig = [];
    swaper.forEach(function(value){swaperConfig.push(letters.indexOf(value))})
    const rotorConfig = {disc: rotorDisc, sPos: rotorSpin};
    const input = document.getElementById("tI").value;
    document.getElementById("tlr_output").innerHTML = manage(rotorConfig, swaperConfig, input);
}
window.hustle = hustle;

function displayMode() {
    let varCSS = document.querySelector(":root");
    if (dMToggle === true) {
        varCSS.style.setProperty("--major", "#dcdde0");
        varCSS.style.setProperty("--minor", "#cfd1d3");
        varCSS.style.setProperty("--minorDark", "#d6d7db");
        varCSS.style.setProperty("--text", "#090990");
        varCSS.style.setProperty("--textHover", "#ffffff");
        varCSS.style.setProperty("--textLabel", "#000000");
        document.getElementById("dm_switch").innerHTML = "bedtime"
        dMToggle = false;
    }
    else {
        varCSS.style.setProperty("--major", "#1e1f22");
        varCSS.style.setProperty("--minor", "#2b2d30");
        varCSS.style.setProperty("--minorDark", "#242529");
        varCSS.style.setProperty("--text", "#cfcffc");
        varCSS.style.setProperty("--textHover", "#000000");
        varCSS.style.setProperty("--textLabel", "#ffffff");
        document.getElementById("dm_switch").innerHTML = "light_mode"
        dMToggle = true;
    }
}
window.displayMode = displayMode;