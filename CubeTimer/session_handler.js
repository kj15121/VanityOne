// Code directly linked to the page
// Handling iter-session data
"use strict"

//Main algorithm objects
let sessionStats = []

//Logic-support

export function store(sessionStats, sessionName) {
    localStorage[`VO_CT-${sessionName}`] = JSON.stringify(sessionStats);
}

export function fetch(sessionName = null) {
    let allKeys, ourKeys

    if (sessionName && localStorage[`VO_CT-${sessionName}`])
    { return JSON.parse(localStorage[`VO_CT-${sessionName}`]) }
    else if (sessionName)
    { return null }
    else {
        allKeys = Object.keys(localStorage);
        allKeys.forEach((item) => {
            if (item.startsWith('VO_CT-'))
            { ourKeys.push(item.substring(6)); }
        });
        return ourKeys
    }
}

//Logic-main
