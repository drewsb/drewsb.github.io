/**
 * @param  {String} depth - Size of grid
 * @return {String} grid - Concatenated HTML code of all cells in a table tag
 */
function generateGrid(depth) {
	rows = getRows(depth);
	cols = getCols(depth);
	grid = '<table class="center">';
	for (var row = 0; row < rows; row++) {
		grid += '<tr>';
		for (var col = 0; col < cols; col++) {
			x = parseInt(row * cols + col, 10);
			grid += '<td id = cell' + x + '></td>';
		}
		grid += '</tr>';
	}
	return grid;
}

/**
 * @param  {String} depth - Size of grid
 * @return {int} - # of rows in grid
 */
function getRows(depth) {
	if (depth == 'low') {
		return 20;
	} else if (depth == 'medium') {
		return 35;
	} else if (depth == 'high') {
		return 75;
	}
}

/**
 * @param  {String} depth - Size of grid
 * @return {int} - # of columns in grid
 */
function getCols(depth) {
	if (depth == 'low') {
		return 40;
	} else if (depth == 'medium') {
		return 75;
	} else if (depth == 'high') {
		return 150;
	}
}

/**
 * @param  {int} x
 * @param  {int} y
 * @return {String} - String representation of coordinate
 * Ex: x = 4, y = 5 -> '4,5'
 */
function serializeCoord(x, y) {
	return Number(x).toString() + ',' + Number(y).toString();
}

/**
 * @param  {String} coord - String representation of coordinate
 * @return {Array} - Two-element array of coordinate
 * Ex: '4,5' -> [4,5]
 */
function deserializeCoord(coord) {
	splitArr = coord.split(',');
	return [parseInt(splitArr[0], 10), parseInt(splitArr[1], 10)];
}

/**
 * @param  {int} index - Cell index
 * @param  {int} cols - # of columns
 * @return {int} - Row of index in the grid
 */
function getRowFromIndex(index, cols) {
	return parseInt(Math.floor(index / cols), 10);
}

/**
 * @param  {int} index - Cell index
 * @param  {int} cols
 * @return {int} - Column of index in grid
 */
function getColFromIndex(index, cols) {
	return parseInt(index % cols, 10);
}

/**
 * @param  {int} row
 * @param  {int} col
 * @param  {int} cols
 * @return {String} - String representation of the cell ID as
 * would appear in the html code
 * Ex: row = 5, col = 1, cols = 5 -> '#cell10'
 */
function getID(row, col, cols) {
	return '#cell' + Number(row * cols + col).toString();
}

/**
 * @param  {String} id - Cell ID
 * @return {int} - Retrieve numerical ID of cell
 */
function getIndexFromID(id) {
	return Number(id.replace('cell', ''), 10);
}

/**
 * @param  {int} i
 * @param  {int} j
 * @param  {int} depth
 * @return {jQuery object} - jQuery object at the ith row and jth column
 */
function getCell(i, j, depth) {
	cols = getCols(depth);
	return $(getID(i, j, cols));
}

/**
 * @param  {int} id - Cell ID
 * @param  {int} bool - True to add the 'alive' class to the cell,
 * False to remove
 */
function enableCell(id, bool) {
	if (bool) {
		$(id).addClass('alive');
	} else {
		$(id).removeClass('alive');
	}
}

/**
 * Add 'visited' class to the cell at given ID
 * @param {int} id - Cell ID
 */
function addTrail(id) {
	$(id).addClass('visited');
}

/**
 * Add trail to all live cells
 * @param {Array} liveCellArray - Array holding all live cell coordinates
 * @param {int} cols - # of columns
 */
function addTrailToCells(liveCellArray, cols) {
	liveCellArray.forEach(function(cell) {
		coord = deserializeCoord(cell);
		id = getID(coord[0], coord[1], cols);
		addTrail(id);
	});
}

/**
 * Enable the 'visited' class of all visited cells True
 * @param  {Array} visitedCells - Array of all visited cells
 */
function turnTrailOn(visitedCells) {
	visitedCells.forEach(function(cell) {
		$(cell).toggleClass('visited', true);
	});
}

/**
 * Enable the 'visited' class of all visited cells False
 */
function turnTrailOff() {
	$('.visited').toggleClass('visited', false);
}

/**
 * @param  {String} currTheme - Current theme
 * @param  {String} newTheme - Desired theme
 * @param  {Boolean} isRemoving - True if currTheme should be removed from cells
 */
function updateTheme(currTheme, newTheme, isRemoving) {
	if (isRemoving) {
		$('td').removeClass(currTheme);
	}
	$('td').addClass(newTheme);
}

/**
 * Set the width and height of table cells appropriately
 * @param {String} depth - Size of grid
 */
function setCellSizes(depth) {
	if (depth == 'low') {
		$('td').width(24);
		$('td').height(24);
	} else if (depth == 'medium') {
		$('td').width(12);
		$('td').height(12);
	} else if (depth == 'high') {
		$('td').width(5);
		$('td').height(5);
	}
}

/**
 * @param  {String} depth - Size of grid
 * @return {Dictionary} liveCells - Return dict of all live cells, mapping
 * the coordinate to a Boolean indicating whether or not it's alive.
 */
function getLiveCells(depth) {
	rows = getRows(depth);
	cols = getCols(depth);
	liveCells = [];
	$('td').each(function(index) {
		if ($(this).hasClass('alive')) {
			row = Math.floor(index / cols);
			col = index % cols;
			neighbors = getNeighbors(row, col, depth);
			liveCells[serializeCoord(row, col)] = neighbors;
		}
	});
	return liveCells;
}

/**
 * @param  {int} i - Row index
 * @param  {int} j - Column index
 * @param  {String} depth - Size of grid
 * @return {Array} - List of all neighbors
 */
function getNeighbors(i, j, depth) {
	rows = getRows(depth);
	cols = getCols(depth);
	neighborCoords = [];
	neighbors = [];
	if (j > 0) {
		neighborCoords.push([i, j - 1]);
		if (i > 0) {
			neighborCoords.push([i - 1, j - 1]);
		}
		if (i < rows - 1) {
			neighborCoords.push([i + 1, j - 1]);
		}
	}
	if (j < cols - 1) {
		neighborCoords.push([i, j + 1]);
		if (i > 0) {
			neighborCoords.push([i - 1, j + 1]);
		}
		if (i < rows - 1) {
			neighborCoords.push([i + 1, j + 1]);
		}
	}
	if (i > 0) {
		neighborCoords.push([i - 1, j]);
	}
	if (i < rows - 1) {
		neighborCoords.push([i + 1, j]);
	}
	neighborCoords.forEach(function(x) {
		cell = $(getCell(x[0], x[1], depth));
		coord = serializeCoord(x[0], x[1]);
		if (cell.hasClass('alive')) {
			neighbors[coord] = true;
		} else {
			neighbors[coord] = false;
		}
	});
	return neighbors;
}

/**
 * @param  {Dictionary} dict - Coordinates mapping to Boolean
 * @return {int} - Number of coordinates mapping to True
 */
function countTrueValues(dict) {
	total = 0;
	Object.keys(dict).forEach(function(key) {
		if (dict[key]) {
			total++;
		}
	});
	return total;
}

/**
 * Ex: 	liveCells = [[0,1], (4,0), ..., (5,0)]
 * @param  {Array} liveCells - Array of coordinates of all live cells
 * @param  {String} depth - Depth/size of grid
 * @return {Array} allCells - Array of all the neighbors of live cells
 */
function getAllIterationCells(liveCells, depth) {
	allCells = [];
	Object.keys(liveCells).forEach(function(cell) {
		neighbors = liveCells[cell];
		numOfNeighborsFirst = countTrueValues(neighbors);
		allCells[cell] = [true, numOfNeighborsFirst];
		Object.keys(neighbors).forEach(function(key) {
			coord = deserializeCoord(key);
			row = coord[0];
			col = coord[1];
			if (!(key in allCells)) {
				numOfNeighborsSecond = countTrueValues(getNeighbors(row, col, depth));
				allCells[key] = [neighbors[key], numOfNeighborsSecond];
			}
		});
	});
	return allCells;
}

/**
 * @param  {Array} arr1
 * @param  {Array} arr2
 * @return {Boolean} - True if arrays contain equivalent elements,
 * False otherwise
 */
function compareArrays(arr1, arr2) {
	if (arr1.length != arr2.length) {
		return false;
	}
	for (var index = 0; index < arr1.length; index++) {
		if (arr1[index] != arr2[index]) {
			return false;
		}
	}
	return true;
}

/**
 * Generate greeting pattern from data in greeting.js
 */
function generateGreeting() {
	coordinates = part0;
	coordinates = coordinates.concat(part1);
	coordinates = coordinates.concat(part2);
	coordinates = coordinates.concat(part3);
	coordinates = coordinates.concat(part4);
	coordinates = coordinates.concat(part5);
	coordinates = coordinates.concat(part6);
	coordinates = coordinates.concat(part7);
	coordinates = coordinates.concat(part8);
	coordinates = coordinates.concat(part9);
	coordinates = coordinates.concat(part10);
	coordinates = coordinates.concat(part11);
	coordinates = coordinates.concat(part12);
	coordinates = coordinates.concat(part13);
	coordinates.forEach(function(id) {
		enableCell(id, true);
	});
}

/**
 * Draw desired pattern based on hardcoded coordinates
 * @param  {String} type - Desired pattern
 * @param  {String} depth - Size of grid
 */
function generatePattern(type, depth) {
	coordinates = [];
	rows = getRows(depth);
	cols = getCols(depth);
	centerX = Math.floor(cols / 2);
	centerY = Math.floor(rows / 2);

	switch (type) {
		case 'acorn':
			originX = Math.floor(centerX + centerX / 5);
			coordinates.push(getID(centerY, originX, cols));
			coordinates.push(getID(centerY - 2, originX + 1, cols));
			coordinates.push(getID(centerY, originX + 1, cols));
			coordinates.push(getID(centerY, originX + 4, cols));
			coordinates.push(getID(centerY, originX + 5, cols));
			coordinates.push(getID(centerY, originX + 6, cols));
			coordinates.push(getID(centerY - 1, originX + 3, cols));
			break;
		case 'glider':
			originX = Math.floor(centerX + 2 * centerX / 5);
			originY = rows - 1;
			coordinates = generateGlider(originX, originY, true, cols);
			break;
		case 'glider-gun':
			originX = Math.floor(centerX / 4);
			originY = 4;
			coordinates.push(getID(originY, originX - 1, cols));
			coordinates.push(getID(originY, originX, cols));
			coordinates.push(getID(originY + 1, originX, cols));
			coordinates.push(getID(originY + 1, originX - 1, cols));
			gunX = originX + 9;
			coordinates.push(getID(originY, gunX, cols));
			coordinates.push(getID(originY + 1, gunX, cols));
			coordinates.push(getID(originY + 2, gunX, cols));
			coordinates.push(getID(originY + 3, gunX + 1, cols));
			coordinates.push(getID(originY + 4, gunX + 2, cols));
			coordinates.push(getID(originY + 4, gunX + 3, cols));

			coordinates.push(getID(originY - 1, gunX + 1, cols));
			coordinates.push(getID(originY - 2, gunX + 2, cols));
			coordinates.push(getID(originY - 2, gunX + 3, cols));

			coordinates.push(getID(originY + 1, gunX + 4, cols));
			coordinates.push(getID(originY - 1, gunX + 5, cols));
			coordinates.push(getID(originY, gunX + 6, cols));
			coordinates.push(getID(originY + 1, gunX + 6, cols));
			coordinates.push(getID(originY + 1, gunX + 7, cols));
			coordinates.push(getID(originY + 2, gunX + 6, cols));
			coordinates.push(getID(originY + 3, gunX + 5, cols));

			gun2X = gunX + 10;
			coordinates.push(getID(originY, gun2X, cols));
			coordinates.push(getID(originY - 1, gun2X, cols));
			coordinates.push(getID(originY - 2, gun2X, cols));
			coordinates.push(getID(originY, gun2X + 1, cols));
			coordinates.push(getID(originY - 1, gun2X + 1, cols));
			coordinates.push(getID(originY - 2, gun2X + 1, cols));

			coordinates.push(getID(originY - 3, gun2X + 2, cols));
			coordinates.push(getID(originY + 1, gun2X + 2, cols));

			coordinates.push(getID(originY - 3, gun2X + 4, cols));
			coordinates.push(getID(originY - 4, gun2X + 4, cols));
			coordinates.push(getID(originY + 1, gun2X + 4, cols));
			coordinates.push(getID(originY + 2, gun2X + 4, cols));

			coordinates.push(getID(originY - 1, gun2X + 14, cols));
			coordinates.push(getID(originY - 1, gun2X + 15, cols));
			coordinates.push(getID(originY - 2, gun2X + 14, cols));
			coordinates.push(getID(originY - 2, gun2X + 15, cols));
			break;
		case 'shooting-stars':
			topY = 0;
			bottomY = rows - 1;
			leftX = 1;
			rightX = cols - 2;
			for (var x = 3; x < cols - 2; x += 15) {
				console.log(x);
				generateGlider(x, topY, false, cols).forEach(function(cell) {
					coordinates.push(cell);
				});
				generateGlider(x + 3, bottomY, true, cols).forEach(function(cell) {
					coordinates.push(cell);
				});
			};
			for (var y = 14; y < rows - 2; y += 15) {
				generateGlider(leftX, y, false, cols).forEach(function(cell) {
					coordinates.push(cell);
				});
				if (y + 5 < rows) {
					generateGlider(rightX, y + 7, true, cols).forEach(function(cell) {
						coordinates.push(cell);
					});
				}
			};
			break;
		case 'spaceship':
			originX = 0;
			originY = centerY;

			coordinates.push(getID(originY, originX, cols));
			coordinates.push(getID(originY - 2, originX, cols));
			coordinates.push(getID(originY, originX + 3, cols));
			coordinates.push(getID(originY - 3, originX + 1, cols));
			coordinates.push(getID(originY - 3, originX + 2, cols));
			coordinates.push(getID(originY - 3, originX + 3, cols));
			coordinates.push(getID(originY - 3, originX + 4, cols));
			coordinates.push(getID(originY - 2, originX + 4, cols));
			coordinates.push(getID(originY - 1, originX + 4, cols));
			break;
		case 'horizontal-line':
			for (var i = 0; i < cols; i++) {
				coordinates.push(getID(centerY, i, cols));
			}
			break;
		case 'pyramid':
			for (var j = 0; j < rows; j++) {
				coordinates.push(getID(j, 0, cols));
			}
			break;
		case 'box':
			for (var j = 0; j < rows; j++) {
				coordinates.push(getID(j, 0, cols));
			}
			for (var j = 0; j < rows; j++) {
				coordinates.push(getID(j, cols - 1, cols));
			}
			for (var i = 0; i < cols; i++) {
				coordinates.push(getID(0, i, cols));
			}
			for (var i = 0; i < cols; i++) {
				coordinates.push(getID(rows - 1, i, cols));
			}
			break;
	}
	coordinates.forEach(function(id) {
		enableCell(id, true);
	});
}

/**
 * @param  {int} originX - x coordinate of starting position
 * @param  {int} originY - y coordinate of starting position
 * @param  {Boolean} inverse - True if glider is at the top, False otherwise
 * @param  {int} cols - The number of columns in the grid
 * @return {Array} - coordinates - List of coordinates to draw
 */
function generateGlider(originX, originY, inverse, cols) {
	var coordinates = [];
	if (inverse) {
		coordinates.push(getID(originY, originX, cols));
		coordinates.push(getID(originY - 1, originX - 1, cols));
		coordinates.push(getID(originY - 2, originX - 1, cols));
		coordinates.push(getID(originY - 2, originX, cols));
		coordinates.push(getID(originY - 2, originX + 1, cols));
	} else {
		coordinates.push(getID(originY, originX, cols));
		coordinates.push(getID(originY + 1, originX + 1, cols));
		coordinates.push(getID(originY + 2, originX + 1, cols));
		coordinates.push(getID(originY + 2, originX, cols));
		coordinates.push(getID(originY + 2, originX - 1, cols));
	}
	return coordinates;
}
