var rows  = 24;
var cols  = 32;
var tiles = [];
var timer = null;
var speed = 100;

$(function() {
	var drag = false;
	var game = $("#game");
	game.mousedown(function() { drag = true; });
	game.on("mouseup mouseleave", function() { drag = false; });
	game.on("mousedown mouseover", "td", function(e) {
		e.preventDefault();
		if (drag || e.type == "mousedown") {
			var td = $(this).toggleClass("alive");
		}
	});
	var buttons = $.each([
		"play",
		"fastForward",
		"pause",
		"step",
		"refresh"
	], function(i, fn) {
		$("#" + fn).on("click", window[fn]);
	});
	refresh();
});

function play() {
	pause();
	timer = setTimeout(function() {
		step();
		play();
	}, speed);
}

function fastForward() {
	pause();
	timer = setTimeout(function() {
		step();
		fastForward();
	}, speed / 2);
}

function step() {
	var size = rows * cols;
	for (var i = 0; i < size; i++) {
		var c = i % cols;
		var r = Math.floor(i / cols);
		var alive = 0;
		for (var ii = 0; ii < 9; ii++) {
			if (ii == 4) {
				continue;
			}
			var x = c + ((ii % 3) - 1);
			var y = r + (Math.floor(ii / 3) - 1);
			if (x < 0) x = cols - 1; else if (x == cols) x = 0;
			if (y < 0) y = rows - 1; else if (y == rows) y = 0;
			if (tiles[y][x].hasClass("alive")) {
				alive++;
			}
		}
		var tile = tiles[r][c];
		if (alive == 3) {
			tile.addClass("add");
		} else if (alive < 2 || alive > 3) {
			tile.addClass("remove");
		}
	}
	$(".add").attr("class", "alive");
	$(".remove").attr("class", "");
}

function pause() {
	clearTimeout(timer);
}

function refresh() {
	var table = $("<table>");
	tiles = [];
	for (var y = 0; y < rows; y++) {
		var row = $("<tr>");
		tiles.push([]);
		for (var x = 0; x < cols; x++) {
			var col = $("<td>");
			row.append(col);
			tiles[y].push(col);
		}
		table.append(row);
	}
	$("#game").html(table);
	pause();
}