'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const LOSE_EMOJI = '😥'
const GAME_EMOJI = '😊'
const WIN_EMOJI = '😎'
const CLICK_EMOJI = '😲'

var gBoard
var gTimeCount = 0
var gTimeDisplay

var gUnminedLocations
var gCellsClicked = []
var gMinesPlaced = 0

var gGame = {
    isOn: false,
    coveredCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    isHintOn: false,
    safeClicks: 3,
}
var gLevel = { //default 
    SIZE: 8,
    MINES: 14,
    levelName: 'medium'
}

function onInit() {
    clearInterval(gTimeCount)
    gGame.secsPassed = 0
    renderTimer()

    gGame.isOn = true
    gGame.coveredCount = gLevel.SIZE ** 2
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lives = 3
    gGame.isHintOn = false
    gGame.safeClicks = 3
    gCellsClicked = []

    //Model
    buildBoard()
    // implentMines(gLevel.MINES) //note beacuse first click never a mine
    // setMinesNegsCount(gBoard) //note beacuse first click never a mine

    //DOM
    renderBoard(gBoard, '.board-container')
    renderMinesLeft(gLevel.MINES, gGame.markedCount)
    renderSmiley(GAME_EMOJI)
    renderLives()
    turnOffHints()
    if (gLevel.levelName === 'costume') renderBombCursor()

    document.querySelector(`.beginner span`).innerHTML = localStorage.beginner
    document.querySelector(`.medium span`).innerHTML = localStorage.medium
    document.querySelector(`.expert span`).innerHTML = localStorage.expert

    var elSafeSpan = document.querySelector('.safe-click-btn span')
    elSafeSpan.innerText = gGame.safeClicks
}

function onFirstClick() {

    gTimeCount = setInterval(function () {
        gGame.secsPassed++;
        renderTimer();
    }, 1000);

    implentMines(gLevel.MINES) //check if it works with SIZE=8 and MINES=63
    setMinesNegsCount(gBoard)

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
            board[i][j].minesAroundCount = searchNegsMines(i, j)
        }
    }

}

function searchNegsMines(iBoard, jBoard) {
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
    // gBoard[3][0].isMine = true
    // gBoard[3][1].isMine = true

    // The random func:
    var unminedCells = getUnminedLocations()

    for (var i = 0; i < minesAmount; i++) {
        var idx = getRandomIntInclusive(0, unminedCells.length - 1)
        var location = unminedCells[idx]

        if (gBoard[location.i][location.j].isMine) i--
        else gBoard[location.i][location.j].isMine = true
    }


}

function onCellClicked(elCell, i, j) {
    if (!gGame.isHintOn) {
        var currCell = gBoard[i][j]

        if (!gGame.isOn) return
        if (!currCell.isCoverd) return
        if (currCell.isMarked) return

        if (gLevel.levelName === 'costume' && gMinesPlaced<gLevel.MINES) {
            putMines(elCell, i, j)
            return
        }


        if (currCell.isMine && gGame.lives > 1) {
            hasLife(elCell, i, j)
            return

        } else if (currCell.isMine) {
            gGame.lives--
            renderLives()
            youLose()
        }

        //Model
        currCell.isCoverd = false

        if (gGame.coveredCount === gLevel.SIZE ** 2 && gLevel.levelName !== 'costume') onFirstClick()

        //DOM
        elCell.classList.add(`${getClassVal(gBoard[i][j])}`)
        renderCell(elCell, i, j)

        gGame.coveredCount--

        gCellsClicked.push([elCell, i, j]) // for UNDO btn

        if (!currCell.minesAroundCount) expandUncover(i, j)


        checkGameOver()

        if (gGame.isOn) {
            renderSmiley(CLICK_EMOJI)
            setTimeout(() => {
                renderSmiley(GAME_EMOJI)
            }, 100);

        }


    } else {
        getHint(i, j)
    }


}

function getClassVal(currCell) {
    if (currCell.isMine) return 'mine'
    if (currCell.minesAroundCount) return 'num'
    if (!currCell.minesAroundCount) return 'blank'
}

function youLose() {
    gGame.isOn = false
    clearInterval(gTimeCount)

    const minesLocations = getMinesLocations()
    for (var i = 0; i < minesLocations.length; i++) {
        var idxI = minesLocations[i].i
        var idxJ = minesLocations[i].j

        //Model
        gBoard[idxI][idxJ].isCoverd = false

        //DOM
        var elCell = document.querySelector(`.cell-${idxI}-${idxJ}`)
        elCell.classList.add(`${getClassVal(gBoard[idxI][idxJ])}`)
        renderCell(elCell, idxI, idxJ)
    }
    renderSmiley(LOSE_EMOJI)

    //later add a restart btn maybe
}

function checkGameOver() {
    if (gGame.coveredCount === gGame.markedCount && gLevel.MINES - gGame.markedCount === 0) {
        gGame.isOn = false
        clearInterval(gTimeCount)
        renderSmiley(WIN_EMOJI)

        bestScore()

    }
    return
}

function expandUncover(iCell, jCell) {
    var currCell = gBoard[iCell][jCell]

    for (var i = iCell - 1; i <= iCell + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = jCell - 1; j <= jCell + 1; j++) {
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)

            if (j < 0 || j >= gBoard[i].length) continue
            if (i === iCell && j === jCell) continue

            if (!currCell.minesAroundCount && !currCell.isMine) {

                var cellInfotoIndexOf = `${[elCurrCell, i, j]}` // for UNDO btn
                if (gCellsClicked.indexOf(cellInfotoIndexOf) !== -1) {
                    gCellsClicked.unshift([elCurrCell, i, j])  // for UNDO btn
                }

                onCellClicked(elCurrCell, i, j)
            }
        }
    }
}

function onCellMarked(event, elCell, i, j) {
    event.preventDefault()

    var currCell = gBoard[i][j]
    if (!gGame.isOn) return
    if (!currCell.isCoverd) return

    if (currCell.isMarked === false) {
        gGame.markedCount++

        //Model
        currCell.isMarked = true
        //DOM
        elCell.innerText = FLAG

    } else {
        gGame.markedCount--

        //Model
        currCell.isMarked = false
        //DOM
        elCell.innerText = EMPTY

    }
    renderMinesLeft(gLevel.MINES, gGame.markedCount)

    gCellsClicked.push([elCell, i, j]) // for UNDO btn

    checkGameOver()
}

function onDifficulty(elBtn) {

    if (elBtn.innerText === 'Beginner') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gLevel.levelName = 'beginner'
    }

    if (elBtn.innerText === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gLevel.levelName = 'medium'
    }

    if (elBtn.innerText === 'Expert') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.levelName = 'expert'
    }

    if (elBtn.innerText === 'Costume') {
        gLevel.SIZE = +prompt('Table Size? (i=j)')
        gLevel.MINES = +prompt(`Mines Amount? less then ${gLevel.SIZE ** 2}!`)
        gLevel.levelName = 'costume'
    }

    onInit()
}

function hasLife(elCell, i, j) {
    //Model
    gGame.lives--

    //DOM
    renderLives()

    elCell.classList.add('mine')
    renderCell(elCell, i, j)
    renderSmiley(LOSE_EMOJI)

    setTimeout(() => {
        renderSmiley(GAME_EMOJI)
        elCell.classList.remove('mine')
        elCell.innerText = EMPTY
    }, 100);
    return
}

function onHint(elHint) {
    if (gGame.coveredCount === gLevel.SIZE ** 2) return //cant hint on first click
    if (elHint.style.backgroundcolor === 'none') return
    elHint.style.filter = hintStyle()
    elHint.style.backgroundcolor = 'none'

    console.log(elHint.style.filter);
    console.log(hintStyle());


    gGame.isHintOn = true
    gGame.isOn = false
}

function getHint(i, j) {
    var currCell = gBoard[i][j]
    if (!currCell.isCoverd) return

    var neigs = getNeisIncluded(i, j) //included self
    showHint(neigs)
    setTimeout(() => {
        closeHint(neigs)
    }, 1500);

    gGame.isHintOn = false

}

function showHint(neigs) {

    for (var x = 0; x < neigs.length; x++) {
        var elCell = document.querySelector(`.cell-${neigs[x].i}-${neigs[x].j}`)
        elCell.classList.add(`${getClassVal(gBoard[neigs[x].i][neigs[x].j])}`)
        renderCell(elCell, neigs[x].i, neigs[x].j)
    }
}

function closeHint(neigs) {

    for (var x = 0; x < neigs.length; x++) {
        var elCell = document.querySelector(`.cell-${neigs[x].i}-${neigs[x].j}`)
        elCell.classList.remove(`${getClassVal(gBoard[neigs[x].i][neigs[x].j])}`)
        elCell.innerText = EMPTY

        gGame.isOn = true
    }


}

function turnOffHints() {
    var el = document.querySelectorAll('.hint')
    el[0].style.filter = ''
    el[1].style.filter = ''
    el[2].style.filter = ''
    el[0].style.backgroundcolor = ''
    el[1].style.backgroundcolor = ''
    el[2].style.backgroundcolor = ''

}

function bestScore() {
    var levelName = gLevel.levelName;

    if (typeof (Storage) !== "undefined") {

        var currentBest = localStorage[levelName];

        if (gGame.secsPassed < currentBest || currentBest === undefined) {
            localStorage[levelName] = +gGame.secsPassed;
            document.querySelector(`.${levelName} span`).innerHTML = localStorage[levelName]
        }
    } else {
        document.getElementById("result").innerText = 'Your browser does not support Web Storage';
    }
}

function onSafeClick() {
    if (!gGame.isOn) return
    if (gGame.coveredCount === gLevel.SIZE ** 2) return //cant safe click on first click
    if (gGame.safeClicks <= 0) return

    if (gGame.safeClicks === 3) {
        gUnminedLocations = getUnminedLocations()
    }

    if (!gUnminedLocations.length) return //no more empty cells

    var randomMineIdx = getRandomIntInclusive(0, gUnminedLocations.length - 1)
    var randomMineLocation = gUnminedLocations[randomMineIdx]
    gUnminedLocations.splice(randomMineIdx, 1)

    var elCell = document.querySelector(`.cell-${randomMineLocation.i}-${randomMineLocation.j}`)
    elCell.classList.add('safe-click-cell')
    setTimeout(() => {
        elCell.classList.remove('safe-click-cell')
    }, 1500);

    gGame.safeClicks--

    var elSafeSpan = document.querySelector('.safe-click-btn span')

    elSafeSpan.innerText = gGame.safeClicks

}

function onUndo() {
    if (!gGame.isOn) return
    if (gCellsClicked.length === 1) return //cant undo first click

    var cellToUndo = gCellsClicked.splice(gCellsClicked.length - 1, 1)
    var elCell = cellToUndo[0][0]
    var i = cellToUndo[0][1]
    var j = cellToUndo[0][2]
    var currCell = gBoard[i][j]

    //DOM
    elCell.innerText = EMPTY
    elCell.classList.remove(`${getClassVal(currCell)}`)

    //Model
    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
    }
    if (!currCell.isCoverd) {
        currCell.isCoverd = true
        gGame.coveredCount++
    }

    renderMinesLeft(gLevel.MINES, gGame.markedCount)
}

function onCostume() {
    // get size and mines amount from user
    gLevel.SIZE = +prompt('Table Size? (i=j)')
    gLevel.MINES = +prompt(`Mines Amount? less then ${gLevel.SIZE ** 2}!`)

    onInit()
}

function putMines(elCell, i, j) {
    var currCell = gBoard[i][j]
    if(currCell.isMine){
        alert('Already contains Mine')
        return
    }

    //Model
    currCell.isMine=true
    gMinesPlaced++

    //DOM
    elCell.innerText = MINE

    setTimeout(() => {
        elCell.innerText = EMPTY
    }, 200);

if (gMinesPlaced === gLevel.MINES){
    setMinesNegsCount(gBoard)
    renderCursor()
} 

}