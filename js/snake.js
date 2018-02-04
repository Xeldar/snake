"use strict";
class Snake {
    constructor(id = 'game', speed = 80, canvasSize = 200, squareSize = 10) {
        this.id = id;
        this.speed = speed;
        this.canvasSize = canvasSize;
        this.squareSize = squareSize;
        this.gameEnd = false;
        this.gameStarted = false;
        this.audio = new Audio('sounds/quack.mp3');

        this.canvas = document.getElementById(this.id);
        if (this.canvas !== null) {
            this.canvas.height = this.canvasSize;
            this.canvas.width = this.canvasSize;
            this.ctx = this.canvas.getContext('2d');
            this.initGame();
            let t = this;
            setInterval(function() {
                t.moveSnake();
            }, this.speed);
        } else {
            this.ctx = null;
        }
        document.addEventListener('keydown', (event) => {
            this.gameControl(event);
        });
    }

    initGame() {
        if (this.canvas !== null) {
            this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
            this.snakeSize = 2;
            this.lastKey = 'right';
            this.anticipedKey = '';
            this.movment = 'right';
            this.applePosX = '';
            this.applePosY = '';
            this.snake = [{
                x: (this.canvasSize / 2 - (this.squareSize)),
                y: (this.canvasSize / 2 - this.squareSize),
                w: this.squareSize,
                h: this.squareSize
            }, {
                x: (this.canvasSize / 2 - (this.squareSize * 2)),
                y: (this.canvasSize / 2 - this.squareSize),
                w: this.squareSize,
                h: this.squareSize
            }, {
                x: (this.canvasSize / 2 - (this.squareSize * 3)),
                y: (this.canvasSize / 2 - this.squareSize),
                w: this.squareSize,
                h: this.squareSize
            }, ];
        }
    }

    gameControl(event) {
        const keyName = event.keyCode;

        if (!this.gameStarted && keyName != 13 && this.canvas !== null) return;

        switch (keyName) {
            case 13:
                if (!this.gameStarted) {
                    let play = document.getElementById('play');
                    play.style.display = "none";
                    this.gameStarted = true;
                } else if (this.gameEnd) {
                    let play = document.getElementById('playAgain');
                    play.style.display = "none";
                    this.playAgain();
                    this.gameStarted = true;
                    this.gameEnd = false;
                }
                break;
            case 80:
                this.gameEnd = !this.gameEnd;
                break;
            case 37:
                if (this.lastKey != this.movment && this.lastKey != "right") this.anticipedKey = "left";
                else if (this.movment != "right") this.lastKey = "left";
                break;
            case 38:
                if (this.lastKey != this.movment && this.lastKey != "down") this.anticipedKey = "up";
                else if (this.movment != "down") this.lastKey = "up";
                break;
            case 39:
                if (this.lastKey != this.movment && this.lastKey != "left") this.anticipedKey = "right";
                else if (this.movment != "left") this.lastKey = "right";
                break;
            case 40:
                if (this.lastKey != this.movment && this.lastKey != "up") this.anticipedKey = "down";
                else if (this.movment != "up") this.lastKey = "down";
                break;
        }
    }

    moveSnake() {

        if (this.gameEnd || !this.gameStarted || this.checkEndGame()) return;

        let snakePosX,
            snakePosY,
            lastSnake;

        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

        // MOVE ALL THE PART OF THE SNAKE
        for (let i = this.snakeSize; i >= 0; i--) {
            let newPosX,
                newPosY,
                r = this.snake[i - 1],
                rCurrent = this.snake[i];

            this.ctx.beginPath();
            if (i != 0) {
                if (i == this.snakeSize && r.x == rCurrent.x && r.y == rCurrent.y) {
                    newPosX = rCurrent.x;
                    newPosY = rCurrent.y;
                } else {
                    newPosX = r.x;
                    newPosY = r.y;
                }
                this.ctx.fillStyle = "blue";
            } else {
                switch (this.lastKey) {
                    case "right":
                        newPosX = rCurrent.x + this.squareSize;
                        newPosY = rCurrent.y;
                        break;
                    case "down":
                        newPosY = rCurrent.y + this.squareSize;
                        newPosX = rCurrent.x;
                        break;
                    case "left":
                        newPosX = rCurrent.x - this.squareSize;
                        newPosY = rCurrent.y;
                        break;
                    case "up":
                        newPosY = rCurrent.y - this.squareSize;
                        newPosX = rCurrent.x;
                        break;
                }
                this.movment = this.lastKey;
                this.ctx.fillStyle = "red";
            }
            this.ctx.rect(newPosX, newPosY, this.squareSize, this.squareSize);
            snakePosX = newPosX;
            snakePosY = newPosY;
            this.snake[i].x = newPosX;
            this.snake[i].y = newPosY;
            this.ctx.fill();
            this.ctx.closePath();
        }

        // MANAGE ANTICIPED MOVMENT
        if (this.anticipedKey != "") {
            this.lastKey = this.anticipedKey;
            this.anticipedKey = "";
        }

        // EAT APPLE ?
        if (snakePosY == this.applePosY && snakePosX == this.applePosX) {
            lastSnake = this.snake[this.snakeSize];
            this.snakeSize++;
            this.audio.currentTime = 0;
            this.audio.play();
            this.snake[this.snakeSize] = {
                x: lastSnake.x,
                y: lastSnake.y,
                w: this.squareSize,
                h: this.squareSize
            };
            this.applePosX = "";
            this.applePosY = "";
        }

        this.randomApple();
    }

    randomApple() {
        let isOnSnake = true,
            halfSquare = this.squareSize / 2,
            newTop,
            newLeft;

        while (isOnSnake) {
            let checkSnake = false;

            if (this.applePosX == "" && this.applePosY == "") {
                let randomNumTop = this.getRandomArbitrary(0, this.canvasSize - this.squareSize),
                    randomNumLeft = this.getRandomArbitrary(0, this.canvasSize - this.squareSize);
                newTop = ((randomNumTop % this.squareSize) >= halfSquare ? parseInt(randomNumTop / this.squareSize) * this.squareSize + this.squareSize : parseInt(randomNumTop / this.squareSize) * this.squareSize),
                newLeft = ((randomNumLeft % this.squareSize) >= halfSquare ? parseInt(randomNumLeft / this.squareSize) * this.squareSize + this.squareSize : parseInt(randomNumLeft / this.squareSize) * this.squareSize);

                for (let i = 0; i <= this.snakeSize; i++) {
                    if (this.snake[i].y == newTop && this.snake[i].x == newLeft) {
                        checkSnake = true;
                    }
                }
                if (checkSnake == false) {
                    isOnSnake = false;
                }
            } else {
                newTop = this.applePosY;
                newLeft = this.applePosX;
                isOnSnake = false;
            }
        }

        this.ctx.beginPath();
        this.ctx.arc(newLeft + halfSquare, newTop + halfSquare, halfSquare / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'green';
        this.ctx.lineWidth = 0;
        this.ctx.fill();
        this.ctx.closePath();
        this.applePosX = newLeft;
        this.applePosY = newTop;
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    checkEndGame() {
        let isSnaked = false,
            newPosY,
            newPosX,
            playAgain,
            statut,
            points,
            checkSnake = false;

        switch (this.lastKey) {
            case 'right':
                newPosX = this.snake[0].x + this.squareSize;
                newPosY = this.snake[0].y;
                break;
            case 'left':
                newPosX = this.snake[0].x - this.squareSize;
                newPosY = this.snake[0].y;
                break;
            case 'up':
                newPosX = this.snake[0].x;
                newPosY = this.snake[0].y - this.squareSize;
                break;
            case 'down':
                newPosX = this.snake[0].x;
                newPosY = this.snake[0].y + this.squareSize;
                break;
        }

        for (let i = 1; i <= this.snakeSize; i++) {
            if (newPosY == this.snake[i].y && newPosX == this.snake[i].x) {
                isSnaked = true;
            }
        }

        if (newPosX >= this.canvasSize || newPosX < 0 || newPosY >= this.canvasSize || newPosY < 0 || isSnaked) {
            this.gameEnd = true;
            playAgain = document.getElementById('playAgain');
            points = document.getElementById('points');
            statut = document.getElementById('statut');
            if ((this.canvasSize / this.squareSize) * (this.canvasSize / this.squareSize) == this.snakeSize) {
                statut.innerHTML = "WIN";
            } else {
                statut.innerHTML = "LOOSE";
            }
            points.innerHTML = parseInt(this.snakeSize);
            playAgain.style.display = "block";
        }

        return this.gameEnd;
    }

    playAgain() {
        this.initGame();
    }
}
(function() {
    var snake = new Snake('game', 70, 200, 10);
})();