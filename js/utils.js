'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {


            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" onclick=
            "onCellClicked(this, ${i}, ${j})"></td>`
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
    else if (currCell.minesAroundCount===0) return
    else elCell.innerText = currCell.minesAroundCount + ''

}


function getUnminedCells() {
    var emptyCells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine) emptyCells.push({ i, j })
        }
    }
    return emptyCells
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}