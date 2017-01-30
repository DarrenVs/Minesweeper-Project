var Minesweeper = {
    
    new: function() {
        
        game.state.add("Minesweeper", Minesweeper);
        game.state.start("Minesweeper");
    },
    
    preload: function() {
        this.load.spritesheet('MinesweeperSprites', 'img/spriteSheet.png', 32, 32, 14);
        this.load.spritesheet('ButtonsSheet', 'img/difficultySheet.png', 300, 120, 3);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        game.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };
    },
    
    
    create: function() {
        
        
        //--------------Spawn the default field---------
        var rows = 10;
        var columns = 10;
        var bombRate = 0.15;
        var field = new Minefield( 10, 10, columns, rows, bombRate );
        game.world.Minefield = field;
        
        
        
        //----------Spawn the timer----------
        this.world.Timer = game.add.text(10, game.world.height - 150, "Time: ",  { font: "32px Arial", fill: '#ffffff' });
        this.world.Timer.startTime = game.time.time;
        
        
        
        //----------Spawn the amount of bombs text----------
        this.world.BombsLeftInfo = game.add.text(10, game.world.height - 185, "Bombs left: ",  { font: "32px Arial", fill: '#ffffff' });
        
        
        
        //----------Spawn the amount of bombs text----------
        this.world.GameStateIndicator = game.add.text(10, game.world.height - 225, field.gameState,  { font: "32px Arial", fill: '#ffffff' });
        
        
        
        
        //----------Spawn the buttons--------
        var Buttons = game.add.group( game, game.world, "Buttons" );
        var EasyButton = Buttons.create( 0, 0, "ButtonsSheet" );
        EasyButton.frame = 0;
        EasyButton.inputEnabled = true;
        
        EasyButton.events.onInputUp.add(function(tile, input) {
            
            alert("EASY MODE")
            field.newField( 5, 5, .1 );
            
            game.world.Timer.startTime = game.time.time; //Reset the timer
            resetScale();
        }, game.world);
        
        
        var NormalButton = Buttons.create( 300, 0, "ButtonsSheet" );
        NormalButton.frame = 1;
        NormalButton.inputEnabled = true;
        
        NormalButton.events.onInputUp.add(function(tile, input) {
            
            alert("NORMAL MODE")
            field.newField( 10, 10, .15 );
            
            game.world.Timer.startTime = game.time.time; //Reset the timer
            resetScale();
        }, game.world);
        
        
        var HardButton = Buttons.create( 600, 0, "ButtonsSheet" );
        HardButton.frame = 2;
        HardButton.inputEnabled = true;
        
        HardButton.events.onInputUp.add(function(tile, input) {
            
            alert("HARD MODE")
            field.newField( 17, 17, .2 );
            
            game.world.Timer.startTime = game.time.time; //Reset the timer
            resetScale();
        }, game.world);
        
        
        
        
        
        
        //----------Fix the scaling of the UI-------
        function resetScale() {
            
            //Fix the button scaling so they are readable
            Buttons.scale.x = Buttons.scale.y = (game.world.width) / Buttons.getLocalBounds().width;
            Buttons.y = game.world.height - Buttons.getLocalBounds().height * Buttons.scale.y;

            
            //Fix the scaling so the minefield isn't outside the screen
            field.sprites.scale.y = field.sprites.scale.x = Math.min( (game.width * .9) / (field.sprites.getLocalBounds().width), (game.height * .7) / (field.sprites.getLocalBounds().height) );
        }
        resetScale();
        
        
        
    },
    
    update: function() {
        
        //-----------Timer update-----------
        if (game.world.Minefield.gameState == "Running")
            game.world.Timer.text = "Time: " + Math.round((game.time.time - this.world.Timer.startTime) * .001);
        else
            this.world.Timer.startTime = game.time.time;
        
        
        //----------Bombs left update-------
        if (game.world.Minefield.gameState == "Won")
            this.world.BombsLeftInfo.text = "Bombs: 0";
        else
            this.world.BombsLeftInfo.text = "Bombs: " + (game.world.Minefield.bombs - game.world.Minefield.protectedTiles);
        
        
        //----------GameState update---------
        this.world.GameStateIndicator.text = "Gamestate: " + game.world.Minefield.gameState;
    },
}