'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {


            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" 
            onclick="onCellClicked(this, ${i}, ${j})"
            oncontextmenu="onCellMarked(event,this, ${i}, ${j})">
            </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

}

function renderCell(elCell, i, j) {
    var currCell = gBoard[i][j]

    if (currCell.isMine) elCell.innerText = MINE
    else if (currCell.minesAroundCount === 0) return
    else elCell.innerText = currCell.minesAroundCount + ''

}


function getUnminedLocations() {
    var UnminedCells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine && gBoard[i][j].isCoverd) UnminedCells.push({ i, j })
        }
    }
    return UnminedCells
}

function getMinesLocations() {
    var locations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) locations.push({ i, j })
        }
    }
    return locations
}


function getNeisIncluded(iCell, jCell) {

    var neigs = []
    for (var i = iCell - 1; i <= iCell + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = jCell - 1; j <= jCell + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (!gBoard[i][j].isCoverd) continue
            var location = { i, j }
            neigs.push(location)
        }
    }
    return neigs
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderMinesLeft(totalMines, markedCount) {
    var elMinesDisplay = document.querySelector('.mines-left')
    elMinesDisplay.innerText = totalMines - markedCount
}

function renderTimer() {
    var elTimeDisplay = document.querySelector('.timer')
    elTimeDisplay.innerText = gGame.secsPassed
}

function renderSmiley(img) {
    var elSmileyImg = document.querySelector('.smiley')
    elSmileyImg.innerText = img
}

function renderLives() {
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gGame.lives
}

function hintStyle(){
    return `drop-shadow(0px 0px 15px yellow) 
    drop-shadow(0px 0px 30px orange) 
    drop-shadow(0px 0px 45px red)`
}

function renderBombCursor(){

    document.querySelectorAll("td").forEach(td => {
        td.style.cursor = "url('https://abs.twimg.com/emoji/v2/72x72/1f4a3.png') 5 5, auto";
    });
}

function renderCursor(){
    document.querySelectorAll("td").forEach(td => {
        td.style.cursor = "pointer"
    });
}