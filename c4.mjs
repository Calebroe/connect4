/******************************************
 * Caleb Roe
 * Connect 4 in Javascript
 * CIS 343 Fall 2022
 *****************************************/

import { exit } from "process";        // Provides an exit method
import Connect4 from "./Connect4.mjs"  // Demonstrates how to import other .mjs files *if* you want to

const myArgs = process.argv.slice(2);

let rows = 6;
let cols = 7;
let winLength = 4;

if (myArgs.length >= 1) {// Use a regular expression to parse rowsxcols
    let matches = /(\d+)x(\d+)/.exec(myArgs[0]);
    if (matches === null) {
        console.log(`Board size "${myArgs[0]}" is not formatted properly.`);
        exit();
    } else {
        rows = parseInt(matches[1]);
        cols = parseInt(matches[2]);
    }
    if (myArgs.length == 2) {//handling condition for win length param being set by user
        winLength = parseInt(myArgs[1]);
    }
}
(new Connect4(rows, cols, winLength)).playGame();