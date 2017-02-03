

var Minefield = function( _x, _y, _columns, _rows, bombRate, tileSurroundings, spritesheetName, spiresheetDefinitions, spriteSize ) {
    
    this.columns = 0; //Keeps track on how long the 2D array grid is
    this.rows = 0; //Keeps track on how tall the 2D array grid is
    this.grid = []; //Holds the 2D array grid
    this.amountOfTiles = 0; //Keeps track of how many tiles there are
    this.bombs = 0; //Keeps track of how many bombs there are in the minefield
    this.protectedTiles = 0; //Keeps track of how many tiles the user has flagged as a bomb
    this.freedTiles = 0; //Keeps track of the tiles the user checked that weren't bombs
    this.sprites = game.add.group( game, game.world, "Minefield" ); //Group the mines so we can clear them later on when we want to generate a new field in the same object
    this.sprites.x = _x; this.sprites.y = _y;
    this.gameState = "NewRound"; //Keeps track of when the minefield exploded
    
    this.spriteSize = spriteSize || {x:32, y:32}; //The size of each tile sprite
    this.spritesheetName = spritesheetName || "MinesweeperSprites"; //Default sprite name (can be defined in the args for a different spritesheet)
    this.spritesheet = spiresheetDefinitions || { //Default list (can be defined in the args for a different spritesheet)
        mineIndicator0: 0,
        mineIndicator1: 1,
        mineIndicator2: 2,
        mineIndicator3: 3,
        mineIndicator4: 4,
        mineIndicator5: 5,
        mineIndicator6: 6,
        mineIndicator7: 7,
        mineIndicator8: 8,
        unexposedTile: 9,
        flag: 10,
        explodedBomb: 11,
        question: 12,
        bomb: 13,
    };
    
    
    this.tileValues = { //The definitions what the tile values mean (used to display the right sprite from the spritesheet definitions list)
        [-1]: "bomb",//Bomb
        0: "mineIndicator0", //Mine indicator 0
        1: "mineIndicator1", //Mine indicator 1
        2: "mineIndicator2", //Mine indicator 2
        3: "mineIndicator3", //Mine indicator 3
        4: "mineIndicator4", //Mine indicator 4
        5: "mineIndicator5", //Mine indicator 5
        6: "mineIndicator6", //Mine indicator 6
        7: "mineIndicator7", //Mine indicator 7
        8: "mineIndicator8", //Mine indicator 8
    };
    
    this.surroundingTilePositions = tileSurroundings || [ //This can also be modified for different style minesweeper grids like a plus sign or hexagons (if we want to get complicated)
        {x: 1, y: 1},
        {x: 1, y: 0},
        {x: 1, y: -1},
        {x: 0, y: -1},
        {x: -1, y: -1},
        {x: -1, y: 0},
        {x: -1, y: 1},
        {x: 0, y: 1},
    ];
    
    this.newField( _columns, _rows, bombRate ); //Spawn a new field
    
}



// Generates a new 2D Array grid for the mines
Minefield.prototype.newField = function( _columns, _rows, bombRate ) {
    
    this.columns = _columns || this.columns;
    this.rows = _rows || this.rows;
    this.grid = [];
    this.amountOfTiles = this.columns * this.rows;
    this.bombs = 0;
    this.protectedTiles = 0;
    this.freedTiles = 0;
    this.sprites.removeAll(true);
    this.gameState = "NewRound";
    
    // Insert empty field
    for (var y = 0; y < this.rows; y++) {
        
        this.grid[ y ] = [];
        for (var x = 0; x < this.columns; x++) {
            
            //Create the tile
            var tile = this.sprites.create( x * this.spriteSize.x, y * this.spriteSize.y, this.spritesheetName );
            
            //Give the tile information to backtrack where the tile is in the 2D array grid
            tile.gridPos = {x:x, y:y}
            
            //Set the tile information
            this.grid[ y ][ x ] = {
                value: 0,
                sprite: tile,
                exposed: false,
                protected: false,
            };
            tile.frame = this.spritesheet.unexposedTile; //Set the default unexposed tile
            
            
            //Set the interaction events on the sprite
            var self = this;
            tile.inputEnabled = true;
            tile.events.onInputUp.add(function(tile, input) {
                
                var inputDuration = game.time.time - input.timeDown // how long the input was held down in miliseconds
                
                //Check if the user was holding down the tile for x amount of miliseconds (for mobile users or with mouse to place a flag) or the right mouse button (to place a flag with a mouse)
                if (inputDuration > 300 || input.rightButton.timeUp == input.previousTapTime)
                    
                    self.toggleProtectionOnMine(tile.gridPos.x, tile.gridPos.y);
                else//otherwise it was the left mouse button or a short tab
                    
                    self.checkTile( tile.gridPos.x, tile.gridPos.y );
                
                
            }, game.world);
        }
    }
    
    this.spawnMines( this.columns * this.rows * bombRate ); //Put some mines in it
}



// Sets a flag on a tile for the user to prevent future misclicks
Minefield.prototype.toggleProtectionOnMine = function( _x, _y ) {
    
    
    if ((_x < 0 || _x >= this.columns)
    || (_y < 0 || _y >= this.rows)) {
        //Debug: console.warn( _x + ", " + _y + " went ouf of grid reach" )
    } else if (this.gameState == "Running") {
        
        var tile = this.getTile( _x, _y );
        
        if (tile.exposed == false) {
            tile.protected = !tile.protected;
            this.refreshTile( _x, _y );
        }
        
        if (tile.protected)
            this.protectedTiles++;
        else
            this.protectedTiles--;
    }
}



// End the game properly
Minefield.prototype.endGame = function( win ) {
    
    if (win) { //Winners interaction
        
        
        //Change the game state
        this.gameState = "Won";
        
        
        //Change the bomb tiles to flags
        this.exposeTiles( -1, this.spritesheet.flag ); //( tileValue, frame, protected, exposed )
        
    } else { //Loser interaction
        
        
        //Change the game state
        this.gameState = "Lost";
        
        //Change the wrongly protected tiles to exploded tiles (also happens in the original game)
        for (var i = 0; i <= 8; i++)
            this.exposeTiles( i, this.spritesheet.explodedBomb, true, false ); //( tileValue, frame, protected, exposed )

        //Expose all the bomb tiles
        this.exposeTiles( -1, this.spritesheet.bomb, false, false ); //( tileValue, frame, protected, exposed )
        
    }
}



// Used for the click interaction, checks what to do with the tile you clicked on
Minefield.prototype.checkTile = function( _x, _y ) {
    
    
    if ((_x < 0 || _x >= this.columns)
    || (_y < 0 || _y >= this.rows)) {
        //Debug: console.warn( _x + ", " + _y + " went ouf of grid reach" )
    } else if (this.gameState == "Running" || this.gameState == "NewRound") {
        
        var tile = this.getTile( _x, _y );
        
        // To make sure the first tiles around your mouse aren't bombs
        if (this.gameState == "NewRound") {
            this.gameState = "Running"
            
            var startingTiles = [{x:_x, y:_y}];
            this.surroundingTilePositions.forEach(function(pos) {
                startingTiles.push({x:_x + pos.x, y:_y + pos.y});
            });
                        
            var self = this;
            startingTiles.forEach(function(pos) {
                
                if (self.getTile( pos.x, pos.y).value == -1) {
                    
                    self.setTile( pos.x, pos.y, 0 );
                    self.spawnMines( 1, startingTiles );
                }
            });
        }
        
        if (tile.protected == false && tile.exposed == false) {
            
            tile.exposed = true;
            this.refreshTile( _x, _y );
            
            var self = this;
            
            /**
             * Mine interactions below
             * -1 == mine
             * 0 >= empty tile
             */
            switch (tile.value) {
                case -1: //Clicked on a bomb:

                    //Display the bomb that exploded
                    tile.sprite.frame = this.spritesheet.explodedBomb;
                    
                    //Send loser message
                    this.endGame( false );
                    break;
                case 0: //Clicked on an empty tile without a bomb indicator:
                    /**
                     * Flood fill around the empty tile
                     * Note tile.exposed prevents the same tile from being checked twice (no endless loops please)
                     */
                    this.surroundingTilePositions.forEach(function(pos) {
                        
                        self.checkTile( _x + pos.x, _y + pos.y );
                    });
                default: //Did not click on a bomb:
                    
                    this.freedTiles++;
                    if (this.freedTiles >= this.amountOfTiles - this.bombs) //Check if the user won
                        this.endGame( true ); //Send winner message
            }
        }
    }
}



// Used to randomly spawn mines around the field
Minefield.prototype.spawnMines = function( amountOfMines, blacklistedTiles ) {
    
    // Check for problems for the future while loops (Should always have 9 empty tiles for the starting tiles)
    if (this.bombs + amountOfMines > this.amountOfTiles - 9) {
        console.warn( "Too many mines requested, cannot fill the field with '" + amountOfMines + "' amount of mines (either not enough tiles or too many bombs). Filling the whole field with '" + (this.amountOfTiles - this.bombs - 9) + "' amount of mines so it's at least winnable (if you're very lucky).")
        amountOfMines = this.amountOfTiles - this.bombs - 9;
    }
    
    for (var i = 0; i < amountOfMines; i ++) {
        
        var foundEmptySpot = false
        var randomPos = 0
        
        // Look for an empty tile
        while (foundEmptySpot == false) { // This should not endlessly loop due to the if statement above making sure there are enough tiles
            
            var randomNum = Math.floor( Math.random() * this.rows * this.columns );
            var randomPos = {x: randomNum % this.columns, y: Math.floor(randomNum / this.columns)}; //Selects a random tile in the grid
            var blacklisted = false;
            
            if (blacklistedTiles != undefined)
                blacklistedTiles.forEach(function(pos){
                    if (randomPos.x == pos.x && randomPos.y == pos.y)
                        blacklisted = true; //Find a new spot
                });
            
            if (blacklisted == false && this.getTile( randomPos.x, randomPos.y ).value >= 0)
                foundEmptySpot = true;
        }
        
        // If a valid tile is found, set it as a bomb
        this.setTile(randomPos.x, randomPos.y, -1) // -1 == a mine
    }
}



// Gets the information from a tile as a object
Minefield.prototype.getTile = function( _x, _y ) {
    
    
    if ((_x < 0 || _x >= this.columns)
    || (_y < 0 || _y >= this.rows)) {
        //Debug: console.warn( _x + ", " + _y + " went ouf of grid reach" )
        return {};
    } else 
        return this.grid[ _y ][ _x ];
}



// Used to generate mines in the field. But can also be used at run time to place bombs for whatever purpose.
Minefield.prototype.setTile = function( _x, _y, value ) {
    
    if ((_x < 0 || _x >= this.columns)
    || (_y < 0 || _y >= this.rows)) {
        //Debug: console.warn( _x + ", " + _y + " went ouf of grid reach" )
    } else {
        
        if (this.getTile( _x, _y ).value == -1)
            this.bombs--;
        /**
         * -1 = mine
         * 0 = empty field
         * 1 = mine indicator 1
         * 2 = mine indicator 2
         * 3 = mine indicator 3
         * 4 = mine indicator 4
         * 5 = mine indicator 5
         * 6 = mine indicator 6
         * 8 = mine indicator 8
         */
        this.grid[ _y ][ _x ].value = value
        
        if (value == -1)
            this.bombs++;

        // Display the correct sprite on the tile
        this.refreshTile( _x, _y );
        
        // Refresh the indicator tiles around the bomb
        var self = this;
        this.surroundingTilePositions.forEach(function(pos){

            // Display the correct sprite on the tile
            self.refreshTile( _x + pos.x, _y + pos.y );
        })
    }
}



// Reveal the map when the user lost or when the user gave up and pressed a 'reveal map' button if there is one
/**
 * 'tileValue' can  be used to expose only tiles with the spesific 'tileValue' value on them
 * If the tileValue is -1, it will only expose the bombs and the wrongly placed flags
 * If tileValue is left undefined, it will expose the whole map
 */
Minefield.prototype.exposeTiles = function( tileValue, frame, protected, exposed ) { 
    
    
    for (var y = 0; y < this.grid.length; y++) {
        for (var x = 0; x < this.grid[y].length; x++) {
            
            var tile = this.getTile( x, y );
            
            // Compare values with args (if args are given)
            if (((tileValue != undefined && tile.value == tileValue) || tileValue == undefined)
            && ((protected != undefined && tile.protected == protected) || protected == undefined)
            && ((exposed != undefined && tile.exposed == exposed) || exposed == undefined)) {
                
                
                if (frame)
                    
                    tile.sprite.frame = frame;
                else {
                    
                    tile.exposed = true;
                    this.refreshTile( x, y );
                }
            }
        }
    }
}



// Used to display the proper sprite image on a tile
Minefield.prototype.refreshTile = function( _x, _y ) {
    
    
    if ((_x < 0 || _x >= this.columns)
    || (_y < 0 || _y >= this.rows)) {
        //Debug: console.warn( _x + ", " + _y + " went ouf of grid reach" )
    } else {
        
        var ownTile = this.getTile( _x, _y )
        
        if (ownTile.value >= 0) {

            var bombs = 0;

            var self = this;
            this.surroundingTilePositions.forEach(function(pos){

                if (self.getTile( _x + pos.x, _y + pos.y ).value == -1)
                bombs++;
            })

            ownTile.value = bombs;
        }
        
        if (ownTile.protected)
            
            ownTile.sprite.frame = this.spritesheet.flag;
        else if (ownTile.exposed) {
            
            ownTile.sprite.frame = this.spritesheet[ this.tileValues[ ownTile.value ] ];
        } else
            
            ownTile.sprite.frame = this.spritesheet.unexposedTile;
    }
}