/******************************************
 * Caleb Roe
 * Connect 4 Engine
 * CIS 343 Fall 2022
 *****************************************/

import { exit } from 'node:process';
import * as readline from 'node:readline';

const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export default class Connect4 {
    #numRows;
    #numCols;
    #winLength;
    #board;

    constructor(numRows, numCols, winLength) { //default constructor for variables 
        this.#numRows = numRows;
        this.#numCols = numCols;
        this.#winLength = winLength;
    }

    makeBoard() { //method that creates a new board
        this.#board = Array(this.#numCols).fill(1).map(() => Array(this.#numRows).fill(0));
    }

    getColumn(player, callback) { //method uses callback() to grab input from player, also does some error checking on the player input
        io.question(`Player ${player}, select a column: `, input => { //callback for input
            let userVal = input.toUpperCase().charCodeAt() - 65; //grabs char code then converts to uppercase
            if (userVal === 16) { //if it equals 'Q'
                console.log("Goodbye.");
                this.quit();
                exit();
            }
            if (userVal < this.#numCols && userVal >= 0) { //checks if its within the correct range, if yes, return user input to game. else error and loop
                callback(userVal); //returns user input
            }
            else { //not within range or something wrong, error and loop again
                console.log("That is not a correct column, please try again.");
                this.getColumn(player, callback);
            }
        });
    }

    getFirstRow(column) { //helper function used to find first open spot in row, returns -1 if flag never updated
        let firstOpen = -1 //flag 
        for (let i = 0; i < this.#numRows; i++) {
            if (this.#board[column][i] === 0 && firstOpen === -1) { //check if the row is the default zero, and if flag hasnt been updated
                firstOpen = i; //set flag to row
            }
        }
        return firstOpen //returns the first open row
    }

    printBoard() { //same logic from Scheme version. tried console.log but it has a newline character at the end that was messing up prints,
                    // found .write worked better through stackOverflow comparison
        for (let i = this.#numRows - 1; i >= 0; i--) {
            for(let j = 0; j < this.#numCols; j++) {
                process.stdout.write(` ${this.#board[j][i]} `); //print the element in the board without a \n so it will create a grid pattern
            }
            console.log(); //used for a newline
        }
        for(let x = 0; x < this.#numCols; x++) { //loops through the size of the columns
            let A = 'A'.charCodeAt(); //grab the ascii value of A as a baseline to print
            process.stdout.write(" " + String.fromCharCode(A + x) + " "); //adds the value of x to A, then converts to char to print
        }
        console.log(); //newline
    }

    checkForTie() { //same logic from connect 4 in C. checks using a flag if the top row of the board still has a zero. if yes, return false.
        let flag = 0; //flag check
        let topRow = this.#numRows - 1; //sets to the top of the row of grid
        for(let i = 0; i < this.#numCols; i++) { //loops through each element of the top row and checks if zero, updates flag.
            if(this.#board[i][topRow] === 0) {
                flag++;
            }
        }
        if (flag !== 0){ //if flag ever got updated, no tie yet so returns false(0)
            return 0;
        }
        else { //zero was never found and flag was never updated, returns true(1)
            return 1;
        }
    }

    dropToken(col, row, player) { // method that updates the board index with player value
        this.#board[col][row] = player;
    }

    xInARow(player, list) { //reused code from C version of c4. checks using chain method to see if enough elements = winLength
        let counter = 0; //flag
        for(let i = 0; i < list.length; i++){ // Loops throughout the array.
            if(player === list[i]) { //if element matches, update counter
                counter++;
            }
            else { //if element doesnt match, reset counter
                counter = 0;
            }
            if(this.#winLength === counter) { //if counter matches win length, return player element
                return player;
            }
        }
        return 0; //if no win, return false (0)
   }

    getVertical(col) {//method that returns an array of elements of the vertical row of last token placed
        return this.#board[col]; //returns the column of the board as an array
    }

    getHorizontal(row) { //method that returns an array of elements of the horizontal row of last token placed
        let array = [];
        for(let i = 0; i < this.#numCols; i++) { //loops through and grabs element to pass to new array
            array[i] = this.#board[i][row] //set the element of array as the element of board at i and row
        }
        return array; //return the list of horizontal values in the selected row
    }

    //used same logic as scheme functions for diags but i thought i was much easier to find the boundary and then do one push to an array rather than append two lists
    getRightDiag(col, row) { //method that uses two helper functions to find the edge of the board, and then populate a new array of directions elements.
        let coordinates = []; //creates empty array to store col and row elements
        function findCorner(col, row,){ // Helper function to find the bottom edge coordinates of board recursively
            if(col >= 0 && row >= 0){ //check if you reach the edge of the board for either column or row
                coordinates[0] = col; //set elements
                coordinates[1] = row;
                findCorner(col - 1, row - 1,) //calls function again and passes next lower diagonal element for check
            }
        }
        let array = []; //new array for return of diagonal elements
        function rightDiagHelper(board, col, row, maxColumn, maxRow){ //helper function that recursively pushes elements to new array
            if(col < maxColumn && row < maxRow){ //check if you reach the top boundary of board
                array.push(board[col][row]); //copy element to array
                rightDiagHelper(board, col + 1, row + 1, maxColumn, maxRow); //recursively loop again
            }
        }  
        findCorner(col, row); //call first helper function
        rightDiagHelper(this.#board, coordinates[0], coordinates[1], this.#numCols, this.#numRows); //call second helper function with found coordinates
        return array; //returns array of the diagonal of the token placed
    }

    getLeftDiag(col, row) { //method that uses two helper functions to find the edge of the board, and then populate a new array of directions elements.
        let coordinates = []; //creates empty array to store col and row elements
        function findCorner(col, row, maxColumn){ // Helper function to find the bottom edge coordinates of board recursively
            if(col < maxColumn && row >= 0){
                coordinates[0] = col; //set elements
                coordinates[1] = row;
                findCorner(col + 1, row - 1, maxColumn); //calls function again and passes next lower diagonal element for check
            }
        }
        let array = []; //new array for return of diagonal elements
        function leftDiagHelper(board, col, row, maxRow){ //helper function that recursively pushes elements to new array
            if(col >= 0 && row < maxRow){
                array.push(board[col][row]);
                leftDiagHelper(board, col - 1, row + 1, maxRow); //recursively loop again
            }
        }  
        findCorner(col, row, this.#numCols); //call first helper function to find starting col and row
        leftDiagHelper(this.#board, coordinates[0], coordinates[1], this.#numRows); //call second helper function with found coordinates
        return array; //returns array of the diagonal of the token placed
    }

    updatePlayer(player){ //method that sets player value to either 1 or 2
        if (player === 1){
            return 2;
        }
        else {
            return 1;
        }
    }

    quit() { //quits io
        io.close();
    }

    whoWon(player, col, row){ //used same method as in scheme version. checks each direction using each getter methods
        //created variables that store the value of each of the directions
        let vertical = this.xInARow(player, this.getVertical(col));
        let horizontal = this.xInARow(player, this.getHorizontal(row));
        let rightDiag = this.xInARow(player, this.getRightDiag(col, row));
        let leftDiag = this.xInARow(player, this.getLeftDiag(col, row));

        if(vertical === player || horizontal === player || rightDiag === player || leftDiag === player){ //checks if any of the returned values are the player
            return player;
        }
        else{
            return 0; //returns false(0) if no winner so we can loop game again
        }
    }

    playGame() { // interface for running game logic, use a turn loop (callback?) then setup same checks as in connect4 C version
        this.makeBoard(); //create board
        this.printBoard(); //display board

        let turn = (player) => { //was giving me -999 player errors when i tried to do a function call, found hilo example of turn from class lecture worked well
            this.getColumn(player, (column) => { //grab player input
                let row = this.getFirstRow(column); //grab the row of the token placed
                if (row === -1) { //check to see if the row is full
                    console.log("That column is full, please select another column.");
                    turn(player);
                }
                else {
                    this.dropToken(column, row, player); //place the token into selected column
                    this.printBoard();
                    if (this.checkForTie() === 1){ //if gameboard is full, return tie message
                        console.log("You have Tied! Thanks for playing.");
                        console.log("Goodbye.");
                        this.quit();
                        exit();    
                    }
                    else if(player === this.whoWon(player, column, row)) { //check if player won, return won message
                        console.log(`Congratulations, Player ${player}! You Win.`);
                        this.quit();
                        exit();
                    }
                    else { //no winner, no tie, update player and begin another turn
                        let newPlayer = this.updatePlayer(player)
                        turn(newPlayer);
                        }
                    }
                })
            }
        turn(1); //calls turn with player 1 first
    }
}