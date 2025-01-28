'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

var gBoard

var gGame = {
    isOn: false,
    coveredCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var gLevel = {
    SIZE: 4,
    MINES: 2,
}

function onInit() {
    gGame.isOn = true
    gGame.secsPassed = setInterval(() => {
        gGame.secsPassed++
    }, 1000);

    buildBoard()
    implentMines(gLevel.MINES) //change later to random func
    setMinesNegsCount(gBoard)

    renderBoard(gBoard, '.board-container')

}

function buildBoard() {
    gBoard = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isCoverd: true,
                isMine: false,
                isMarked: false,
            }
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = searchMinesAround(i, j)
        }
    }

}

function searchMinesAround(iBoard, jBoard) {
    var negMinesCount = 0
    for (var i = iBoard - 1; i <= iBoard + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = jBoard - 1; j <= jBoard + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === iBoard && j === jBoard) continue
            if (gBoard[i][j].isMine) negMinesCount++

        }

    }
    return negMinesCount
}

function implentMines(minesAmount) {
    gBoard[0][1].isMine = true
    gBoard[2][2].isMine = true

    //The random func ahead works

    // var unminedCells = getUnminedCells()  
    // var minesLocations = []

    // for (var i = 0; i < minesAmount; i++) {
    //     var idx = getRandomIntInclusive(0, unminedCells.length)
    //     var location = unminedCells[idx]
        
    //     if (gBoard[location.i][location.j].isMine) i--
    //     else gBoard[location.i][location.j].isMine = true
    // }

}

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (!currCell.isCoverd) return
    if (currCell.isMarked) return
    // console.log(elCell)

    //Model
    gBoard[i][j].isCoverd = false

    //Dom
    elCell.classList.add(`${getValue(gBoard[i][j])}`)
    renderCell(elCell, i, j)

}

function getValue(currCell) {
    if (currCell.isMine) return 'mine'
    if (currCell.minesAroundCount) return 'num'
    if (!currCell.minesAroundCount) return 'blank'
}

