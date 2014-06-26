$(function() {
	var table = $("#table");
	var game = new Game(table, 32, 24);
	var drag = false;
	
	table.on("mousedown", function() {
		drag = true;
		table.one("mouseup mouseleave", function() {
			drag = false;
		});
	});
	
	table.on("mousedown mouseover", "td", function(e) {
		e.preventDefault();
		var td = $(this);
		var tile = td.data("tile");
		if (tile && (drag || e.type == "mousedown")) {
			tile.toggle();
		}
	});
	
	var buttons = $.each([
		"play",
		"stop",
		"step",
		"refresh"
	], function(i, fn) {
		$("#" + fn).on("click", function() {
			game[fn].call(game);
		});
	});
	
	$("#fast").on("click", function() {
		game.play.call(game, 40);
	});
	
	$(window).on("resize", function() {
		var h = table.width() * 0.75;
		table.height(h);
	}).trigger("resize");
});

function Game(table, w, h) {
	this.table = table;
	this.w = w || 32;
	this.h = h || 24;
	this.tiles = [];
	
	// Go ahead and create a new game board.
	this.refresh();
};

Game.prototype.refresh = function() {
	var table = this.table;
	var rows = this.h;
	var cols = this.w;
	
	table.html("");
	
	this.tiles = [];
	for (var r = 0; r < rows; r++) {
		this.tiles.push([]);
	}
	
	for (var r = 0; r < rows; r++) {
		var tr = $("<tr>");
		table.append(tr);
		for (var c = 0; c < cols; c++) {
			var td = $("<td>");
			this.tiles[r].push(new Tile(td));
			tr.append(td);
		}
	}
};

Game.prototype.play = function(speed) {
	speed = speed || 100;
	var game = this;
	this.stop();
	this.timer = setInterval(function() {
		game.step();
	}, speed);
};

Game.prototype.step = function() {
	var size = this.h * this.w;
	var stop = true;
	
	var live = [];
	var kill = [];
	
	for (var i = 0; i < size; i++) {
		var col = i % this.w;
		var row = Math.floor(i / this.w);
		
		var neighbours = 0;
		for (var ii = 0; ii < 9; ii++) {
			if (ii == 4) {
				continue;
			}
			
			var x = col + ((ii % 3) - 1);
			var y = row + Math.floor(ii / 3) - 1;
			
			if (x < 0) x = this.w - 1; else if (x == this.w) x = 0;
			if (y < 0) y = this.h - 1; else if (y == this.h) y = 0;
			
			var tile = this.tiles[y][x];
			if (tile.state == TileState.alive) {
				neighbours++;
			}
		}
		
		var tile = this.tiles[row][col];
		if (tile.state == TileState.dead && neighbours == 3) {
			live.push(tile);
			stop = false;
		} else if (tile.state == TileState.alive && (neighbours < 2 || neighbours > 3)) {
			kill.push(tile);
			stop = false;
		}
	}
	
	$.each(live, function() { this.live(); });
	$.each(kill, function() { this.kill(); });
	
	if (stop) {
		this.stop();
	}
};

Game.prototype.stop = function() {
	clearInterval(this.timer);
};

var TileState = {
	dead: 0,
	alive: 1
};

function Tile(td) {
	this.td = td;
	this.state = TileState.dead;
	
	// Keep a reference to this tile inside the DOM element.
	td.data("tile", this);
};

Tile.prototype.toggle = function() {
	if (this.state == TileState.alive) {
		this.kill();
	} else {
		this.live();
	}
};

Tile.prototype.kill = function() {
	this.td.removeClass("alive");
	this.state = TileState.dead;
};

Tile.prototype.live = function() {
	this.td.addClass("alive");
	this.state = TileState.alive;
};
