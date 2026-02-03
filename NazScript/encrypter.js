// Script to encrypt the input
"use strict"

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const notchPosition = [16, 4, 21, 9, 25];
const disc1 = [4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9];
const disc2 = [0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4];
const disc3 = [1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14];
const disc4 = [4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1];
const disc5 = [21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10];
const discCollection = [disc1, disc2, disc3, disc4, disc5];
const ukw = [24, 17, 20, 7, 16, 18, 11, 3, 15, 23, 13, 6, 14, 10, 12, 8, 4, 1, 5, 25, 2, 22, 21, 9, 0, 19];

let rotorCollection, swaper;

function Rotor(disc, spin, order) {
    this.spin = spin;
    this.order = order;
    this.wiring = discCollection[disc-1];
    this.notch = notchPosition[disc-1];
    this.increment = function() {
        if (this.order === 0) {
            this.spin = (this.spin + 1) % 26;
            return null;
        }
        let notchPrevious, spinPrevious;
        spinPrevious = rotorCollection[order - 1].spin;
        notchPrevious = rotorCollection[order - 1].notch;
        if (spinPrevious === notchPrevious) {
            this.spin = (this.spin + 1) % 26;
            return null;
        }
    }
    this.actionFwd = function(token) {
        return this.wiring[(token + this.spin) % 26];
    }
    this.actionBwd = function(token) {
        return (this.wiring.indexOf(token) - this.spin + 26) % 26;
    }
}

function rotorInitialise(rotorConfigDisc, rotorConfigSpin) {
    rotorCollection = [];
    for (let i = 0; i < 3; i++) {
        rotorCollection.push(new Rotor(rotorConfigDisc[i], rotorConfigSpin[i], i));
    }
}

function rotorActionFwd(token) {
    rotorCollection.forEach(function(value){
        value.increment();
        token = value.actionFwd(token);
    })
    return token
}

function rotorActionBwd(token) {
    for (let i = 2; i > -1; i--) {
        token = rotorCollection[i].actionBwd(token);
    }
    return token
}

function rotorActionReflect(token) {
    return ukw[token];
}

function plugboard(token) {
    if (!swaper.includes(token)) {
        return token
    }
    const tokenLocation = swaper.indexOf(token);
    if (tokenLocation%2 === 0) {
        token = swaper[tokenLocation+1];
    }
    else { //(tokenLocation%2 == 1)
        token = swaper[tokenLocation-1];
    }
    return token;
}

function doSpread(input) {
    let text = [];
    let inserts = {};
    input = input.toUpperCase();
    input = input.split("");
    input.forEach(function(value, index) {
        if (letters.includes(value)) {
            text.push(letters.indexOf(value));
        }
        else {
            inserts[index] = value;
        }
    });
    return {text: text, inserts: inserts};
}

function unSpread(text, inserts) {
    let output = "";
    let insertLocations = Object.keys(inserts);
    let insertCount = 0;
    let outputLength = text.length + insertLocations.length;

    for (let i = 0; i < outputLength; i++) {
        if (insertLocations.includes(i.toString())) {
            output += inserts[i];
            insertCount++;
        }
        else {
            output += letters[text[i-insertCount]];
        }
    }
    return output;
}

export function manage(rotorConfig, plugboardConfig, input) {
    //setup units
    rotorInitialise(rotorConfig.disc, rotorConfig.sPos)
    swaper = plugboardConfig;

    //work on the input
    let text, output;
    input = doSpread(input);
    text = input.text;
    text.forEach(function(value, index, array){
        value = plugboard(value);
        value = rotorActionFwd(value);
        value = rotorActionReflect(value);
        value = rotorActionBwd(value);
        value = plugboard(value);
        array[index] = value;
    });

    //work on output
    output = unSpread(text, input.inserts);
    return output;
}