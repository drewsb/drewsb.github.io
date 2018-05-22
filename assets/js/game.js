var simulationInterval;
currDepth = 'high';
currRows = getRows(currDepth);
currCols = getCols(currDepth);
isMouseDown = false;
isTrailOn = true;
isRunning = false;
theme = 'default';
visitedCells = [];
liveCells = [];
previousLiveCells = [];
liveCellCount = 0;
generation = 0;
runButton = document.getElementById('runButton');

/**
 * Update all neighbors of the given cell with its alive status
 * If isAlive is True, update the cell's neighbors, otherwise
 * delete the cell from liveCells
 * @param  {Boolean} isAlive
 * @param  {int} id - Cell ID
 */
function updateLiveCells(isAlive, id) {
    row = getRowFromIndex(id, currCols);
    col = getColFromIndex(id, currCols);
    coord = serializeCoord(row, col);
    n = getNeighbors(row, col, currDepth);
    Object.keys(n).forEach(function(neighborCell) {
        if (neighborCell in liveCells) {
            liveCells[neighborCell][coord] = isAlive;
        }
    });
    if (isAlive) {
        liveCells[coord] = n;
    } else {
        delete liveCells[coord];
    }
}

/**
 * Update visable cell counter with the correct number
 */
function updateCellCounter() {
    cellCounter = document.getElementById('cellCount');
    cellCounter.innerHTML = liveCellCount;
}

/**
 * Update visable generation counter with the correct number
 */
function updateGenerationCounter() {
    generationCounter = document.getElementById('generation');
    generationCounter.innerHTML = generation;
}

/**
 * Add any alive cells to visitedCells if they aren't already included.
 */
function updateVisitedCells() {
    Object.keys(liveCells).forEach(function(cell) {
        coord = deserializeCoord(cell);
        row = coord[0];
        col = coord[1];
        id = '#cell' + Number(row * currCols + col);
        if (!(id in visitedCells)) {
            visitedCells.push(id);
        }
    });
}

/**
 * Add click events to table cells to register mouse hover and click events
 */
function addGridClickEvents() {
    var isAlive;

    $('td').mousedown(function() {
        $(this).toggleClass('alive');
        isMouseDown = true;
        isAlive = $(this).hasClass('alive');
        id = getIndexFromID($(this).attr('id'));
        updateLiveCells(isAlive, id);
        return false;
    }).mouseover(function() {
        if (isMouseDown) {
            $(this).toggleClass('alive', isAlive);
            id = getIndexFromID($(this).attr('id'));
            updateLiveCells(isAlive, id);
        }
    }).bind('selectstart', function() {
        return false;
    }).hover(function() {
        isAlive = $(this).hasClass('alive');
        if (!isAlive) {
            $(this).toggleClass('hovered', true);
        }
    }, function() {
        $(this).toggleClass('hovered', false);
    });
    $(document).mouseup(function() {
        isMouseDown = false;
    });
}

/**
 * Close all dropdowns
 */
function closeDropdowns() {
    dropdowns = document.getElementsByClassName('dropdown-content');
    for (i = 0; i < dropdowns.length; i++) {
        openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}

/**
 * Stop game if it's running, and reset all live cells and visited cells.
 */
function clearGame() {
    if (isRunning) {
        clearInterval(simulationInterval);
    }
    visitedCells = [];
    $('td').removeClass('alive');
    $('td').removeClass('visited');
    $('td').removeClass('hovered');
    isRunning = false;
    runButton.innerHTML = 'Run';
    generation = 0;
    liveCellCount = 0;
    updateGenerationCounter();
    updateCellCounter();
}

/**
 * Run one simulation.
 */
function stepGame() {
    if (Object.keys(liveCells).length == 0) {
        liveCells = getLiveCells(currDepth);
        previousLiveCells = [];
        addTrailToCells(Object.keys(liveCells), currCols);
    }
    runSimulation();
}

/**
 * Run the game of life continuously until either the user presses the 'Stop'
 * button or the generation of cells aren't changing.
 */
function runGame() {
    if (isRunning) {
        runButton.innerHTML = 'Run';
        isRunning = false;
        clearInterval(simulationInterval);
    } else {
        liveCells = getLiveCells(currDepth);
        previousLiveCells = [];
        liveCellCount = Object.keys(liveCells).length;
        if (liveCellCount == 0) {
            return;
        }
        isRunning = true;
        runButton.innerHTML = 'Pause';
        simulationInterval = setInterval(function() {
            if (!runSimulation()) {
                clearInterval(simulationInterval);
                isRunning = false;
                runButton.innerHTML = 'Run';
            }
        });
        if (isTrailOn) {
            addTrailToCells(Object.keys(liveCells), currCols);
        }
    }
}

/**
 * Run simulation if there are more than 0 live cells, and the
 * game hasn't reached a still point.
 * @return {Boolean} - True if game was simulated, False otherwise.
 */
function runSimulation() {
    liveCellCount = Object.keys(liveCells).length;
    generation++;
    updateCellCounter();
    updateVisitedCells();
    isStagnant = compareArrays(previousLiveCells, Object.keys(liveCells));
    if (liveCellCount != 0 && !isStagnant) {
        previousLiveCells = Object.keys(liveCells).slice();
        simulateRound(liveCells, previousLiveCells);
        updateGenerationCounter();
        return true;
    } else {
        return false;
    }
}

/**
 * Run one simulation of the Game of Life.
 * Reconfigure liveCells appropriately and add trails to visited cells.
 */
function simulateRound() {
    newLiveCells = [];
    iterationCells = getAllIterationCells(liveCells, currDepth);
    Object.keys(iterationCells).forEach(function(key) {
        isCellAlive = iterationCells[key][0];
        numNeighbors = iterationCells[key][1];
        coord = deserializeCoord(key);
        row = coord[0];
        col = coord[1];
        id = '#cell' + parseInt(row * currCols + col, 10);
        if (isCellAlive && numNeighbors != 2 && numNeighbors != 3) {
            enableCell(id, false);
        } else if (isCellAlive && (numNeighbors == 2 || numNeighbors == 3)) {
            if (!(key in newLiveCells)) {
                newLiveCells[key] = [];
            }
        } else if (!isCellAlive && numNeighbors == 3) {
            if (isTrailOn) {
                addTrail(id);
            }
            enableCell(id, true);
            if (!(key in newLiveCells)) {
                newLiveCells[key] = [];
            }
        }
    });
    Object.keys(newLiveCells).forEach(function(key) {
        coord = deserializeCoord(key);
        row = coord[0];
        col = coord[1];
        newLiveCells[key] = getNeighbors(row, col, currDepth);
    });
    liveCells = newLiveCells;
}


$(function() {
    // Hide html content until js is loaded
    document.getElementById('hideAll').style.display = 'none';
    $('#tableContainer').append(generateGrid(currDepth));

    addGridClickEvents();
    setCellSizes(currDepth);
    updateTheme(theme, theme, false);
    updateCellCounter();
    updateGenerationCounter();
    generateGreeting();

    // Add dropdown options
    $('.dropheader').click(function() {
        document.getElementById($(this).attr('id') + 'Dropdown')
            .classList.toggle('show');
        if ($(this).attr('id') == 'pattern') {
            document.getElementById('depth' + 'Dropdown')
                .classList.remove('show');
            document.getElementById('theme' + 'Dropdown')
                .classList.remove('show');
        } else if ($(this).attr('id') == 'depth') {
            document.getElementById('pattern' + 'Dropdown')
                .classList.remove('show');
            document.getElementById('theme' + 'Dropdown')
                .classList.remove('show');
        } else {
            document.getElementById('depth' + 'Dropdown')
                .classList.remove('show');
            document.getElementById('pattern' + 'Dropdown')
                .classList.remove('show');
        }
    });

    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropheader')) {
            closeDropdowns();
        }
    };

    // Add grid size options
    $('.depth-item').click(function() {
        clearGame();
        var newDepth = $(this).val();
        $('#tableContainer').html(generateGrid(depth));
        currDepth = newDepth;
        currRows = getRows(currDepth);
        currCols = getCols(currDepth);
        setCellSizes(depth);
        addGridClickEvents();
        updateTheme(theme, theme, false);
    });

    // Add pattern options
    $('.pattern-item').click(function() {
        clearGame();
        generatePattern($(this).val(), currDepth);
    });

    // Add theme options
    $('.theme-item').click(function() {
        newTheme = $(this).val();
        if (theme != newTheme) {
            updateTheme(theme, newTheme, true);
            theme = newTheme;
        }
    });

    // Add trail option
    trailOn = document.getElementById('trail');
    $('input[type="checkbox"]').change(function() {
        if ($(this).is(':checked')) {
            turnTrailOn(visitedCells);
            isTrailOn = true;
            trailOn.innerHTML = 'On';
        } else {
            turnTrailOff();
            isTrailOn = false;
            trailOn.innerHTML = 'Off';
        }
    });
});

/**
 * Outputs the ID's of all current alive cells, used for greeting.js.
 */
function outputAllLiveIDs() {
    liveCells = getLiveCells(currDepth);
    arr = [];
    Object.keys(liveCells).forEach(function(key) {
        coord = deserializeCoord(key);
        row = coord[0];
        col = coord[1];
        arr.push(getID(row, col, currCols));
    });
    for (i = 0; i < arr.length; i += 50) {
        console.log(arr.slice(i, Math.min(i + 50, arr.length - 1)));
    }
}
