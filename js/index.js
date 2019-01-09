var canvas, canvasContext;
var level = 1;
//ball variables
var ballX = 400;
var ballSpeedX = 0;
var ballY = 530;
var ballSpeedY = 0;

//bar variables and constants
var BAR_WIDTH = 100;
const BAR_HEIGHT = 10;
const BAR_DIST_FROM_EDGE = 60;
var barX = 350;


//mouse variables;
var mouseX;
var mouseY;

//pause
var paused = false;

//bricks variables and constants
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 20;
const BRICK_COLS = 10;
const BRICK_GAP = 2;
const BRICK_ROWS = 17;
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var bricksLeft = 0;

//score variables
var highestScore = 0;
var maximumScore = 0;
var joueurScore = 0;
var attempts = 5;
var joueurAttempts = attempts;
var showEndingScreen = false;
var showStartingScreen = true; 

function updateMousePosition(evt) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;

  mouseX = evt.clientX - rect.left - root.scrollLeft;
  mouseY = evt.clientY - rect.top - root.scrollTop;

  barX = mouseX - (BAR_WIDTH/2);


}

function handleMouseClick(evt) {
  if(showEndingScreen) {
    if (maximumScore>highestScore){
      highestScore = maximumScore;
    }
    joueurScore = 0;
    maximumScore = 0;
    joueurAttempts = attempts;
    brickReset();
    ballReset();
    level = level + 1;
    showEndingScreen = false;
  }

  if(ballSpeedX == 0 && ballSpeedY == 0) {
    ballSpeedX = 0;
    ballSpeedY = -5;
    showStartingScreen=false;
  }
}

window.onload = function() {
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext('2d');

  var framesPerSecond = 30;
  setInterval(updateAll, 1000/framesPerSecond);

  canvas.addEventListener('mousedown', handleMouseClick);

  canvas.addEventListener('mousemove', updateMousePosition);

  brickReset();
}

function updateAll() {
  moveAll();
  drawAll();
}

function ballReset() {
  if(joueurAttempts <= 0) {
    showEndingScreen = true;
  }

  ballX = canvas.width/2;
  ballY = 400;

  ballSpeedX = 0;
  ballSpeedY = 5;
}

function ballMovement() {
  ballX += ballSpeedX;

  //droite
  if(ballX > canvas.width && ballSpeedX > 0.0) {
    ballSpeedX *= -1;
  }

  //gauche
  if(ballX < 0 && ballSpeedX < 0.0) {
    ballSpeedX *= -1;
  }

  ballY += ballSpeedY;

  // bas
  if(ballY > canvas.height) {
    joueurAttempts--;
    ballReset();
  }

  // haut
  if(ballY < 0 && ballSpeedY < 0.0) {
    ballSpeedY *= -1;
  }
}

function isBrickAtColRow(col, row) {
  if(col >= 0 && col < BRICK_COLS && row >= 0 && row < BRICK_ROWS) {
    var brickIndexUnderCoord = rowColToArrayIndex(col, row);
    return brickGrid[brickIndexUnderCoord];
  } else {
    return false;
  }
}

function ballBrickCollision() {
  var ballBrickCol = Math.floor(ballX / BRICK_WIDTH);
  var ballBrickRow = Math.floor(ballY / BRICK_HEIGHT);
  var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

  if(ballBrickCol >= 0 && ballBrickCol < BRICK_COLS && ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {
    if(isBrickAtColRow(ballBrickCol, ballBrickRow)) {
      brickGrid[brickIndexUnderBall] = false;
      bricksLeft--; //remove brick from the total
      console.log(bricksLeft);
      joueurScore += 10;
      console.log(joueurScore);
     // console.log("meilleur score :" +highestScore)

      var previousBallX = ballX - ballSpeedX;
      var previousBallY = ballY - ballSpeedY;
      var previousBrickCol =  Math.floor(previousBallX / BRICK_WIDTH);
      var previousBrickRow = Math.floor(previousBallY / BRICK_HEIGHT);

      var bothTestsFailed = true;

      if(previousBrickCol != ballBrickCol) {
        if(isBrickAtColRow(previousBrickCol, ballBrickRow) == false) {
          ballSpeedX *= -1;
          bothTestsFailed = false;
        }
      }

      if(previousBrickRow != ballBrickRow) {
        if(isBrickAtColRow(previousBrickCol, ballBrickRow) == false) {
          ballSpeedY *= -1;
          bothTestsFailed = false;
        }
      }

      if(bothTestsFailed) { // empêche la balle de passer lorsque les deux coins sont couverts
        ballSpeedX *= -1;
        ballSpeedY *= -1;
      }
    }
  }
}

function ballBarCollision() {
  var barTopEdgeY = canvas.height - BAR_DIST_FROM_EDGE;
  var barBottomEdgeY = barTopEdgeY + BAR_HEIGHT;
  var barLeftEdgeX = barX;
  var barRightEdgeX = barLeftEdgeX + BAR_WIDTH;

  if(ballY+10 > barTopEdgeY && //sous le sommet de la bar
     ballY < barBottomEdgeY && //au-dessus du bas de la bar
     ballX+10 > barLeftEdgeX && //à droite du côté gauche de la bar
     ballX-10 < barRightEdgeX) { //à gauche du côté droit de la bar

    ballSpeedY *= -1;

    var centerOfBarX = barX + BAR_WIDTH/2;
    var ballDistFromBarCenterX = ballX - centerOfBarX;
    ballSpeedX = ballDistFromBarCenterX * 0.35;

    if(bricksLeft == 0) {
      //                        brickReset();
      showEndingScreen = true;
    }
  }
}

function moveAll() {
  if(showEndingScreen) {
    return;
  }

  if (!paused) {
    ballMovement();

    ballBrickCollision();
  
    ballBarCollision();
  }
}

function brickReset() {
  bricksLeft = 0;

  var i;

  for(i = 0; i < 3 * BRICK_COLS; i++) {
    brickGrid[i] = false;
  }

  for(; i < BRICK_COLS * BRICK_ROWS; i++) {
    if(Math.random() < 0.5) {
      brickGrid[i] = true;
      bricksLeft++;//compte combien de bricks il y a sur la scène et stocke la valeur
      maximumScore += 10;
    }else {
      brickGrid[i] = false;
    }//fin du else (random check)
  }//fin du for
  console.log(maximumScore);
  console.log("meilleur score :" + highestScore);
}//fin du brickReset

function rowColToArrayIndex(col, row) {
  return col + row * BRICK_COLS;
}

function drawBricks() {
  for(var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
    for(var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
      var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

      if(brickGrid[arrayIndex]) {
        rect((BRICK_WIDTH*eachCol), BRICK_HEIGHT*eachRow, BRICK_WIDTH-BRICK_GAP, BRICK_HEIGHT-BRICK_GAP, 'orange');
      }//fin du brick drawing if true
    }
  }//fin du brick for
}//fin du drawBricks

//Pour pauser le jeu
window.addEventListener('keydown', pauseGameKeyHandler, false);
function pauseGameKeyHandler(e) {
  var keyCode = e.keyCode;
  switch(keyCode){
     case 32: //space
       togglePause();
       break;
   }
}

function togglePause() {
  paused = !paused;
  drawAll();
}

function drawAll() {
  //background
  rect(0, 0, canvas.width, canvas.height, 'black');
  BAR_WIDTH=100;
  if(showEndingScreen && level != 10 ) {
    
    if(joueurScore == maximumScore ) {
      if(maximumScore>highestScore){
        highestScore = maximumScore;
        return;
      }
      text("VOUS AVEZ GAGNE!", canvas.width/2, 100, 'white', 'bold 3em Arial', 'center');
      text("SCORE DE LA PARTIE: " + joueurScore, canvas.width/2, 200, 'white', 'bold 2em Arial', 'center');
      text("MEILLEUR SCORE :"+ highestScore, canvas.width/2, 300, 'red', 'bold 2em Arial', 'center');
      text("ESSAIS RESTANTS: " + joueurAttempts, canvas.width/2, 400, 'white', 'bold 2em Arial', 'center');
      text("NIVEAU SUIVANT: " + (level + 1),canvas.width/2, 450, 'white', 'bold 2em Arial', 'center');
      text("ATTENTION: La taille de la barre va changer !" ,canvas.width/2, 500, 'red', 'bold 1em Arial', 'center');
      text("Cliquer pour continuer", canvas.width/2, 550, 'white', 'bold 1.5em Arial', 'center');
    } else {
      text("VOUS AVEZ PERDU!", canvas.width/2, 100, 'white', 'bold 3em Arial', 'center');
      text("SCORE: " + joueurScore, canvas.width/2, 250, 'white', 'bold 2em Arial', 'center');
      text("ESSAIS: " + joueurAttempts, canvas.width/2, 400, 'white', 'bold 2em Arial', 'center');
      text("NIVEAU : " + level ,canvas.width/2, 450, 'white', 'bold 2em Arial', 'center');
      text("Cliquer pour continuer", canvas.width/2, 550, 'white', 'bold 1.5em Arial', 'center');
    }
    return;
  }

  if(showEndingScreen && level == 10 ) {
    
    if(joueurScore != maximumScore ) {
      text("VOUS AVEZ PERDU!", canvas.width/2, 100, 'white', 'bold 3em Arial', 'center');
      text("SCORE: " + joueurScore, canvas.width/2, 250, 'white', 'bold 2em Arial', 'center');
      text("ESSAIS: " + joueurAttempts, canvas.width/2, 400, 'white', 'bold 2em Arial', 'center');
      text("NIVEAU : " + level ,canvas.width/2, 450, 'white', 'bold 2em Arial', 'center');
      text("Cliquer pour continuer", canvas.width/2, 550, 'white', 'bold 1.5em Arial', 'center');
    return;
  }
}


  if (showStartingScreen){
    text("Cliquez pour commencer.", canvas.width/2, 100, 'white', 'bold 3em Arial', 'center');
    text("Utilisez la souris pour bouger la barre", canvas.width/2, 150, 'blue', 'bold 1.5em Arial', 'center');
    text("Si toutes les briques ont été détruites,", canvas.width/2, 200, 'blue', 'bold 1.5em Arial', 'center');
    text("laissez la balle toucher la barre pour terminer la partie.", canvas.width/2, 250, 'blue', 'bold 1.5em Arial', 'center');
    text("Pour faire une pause appuyez sur la touche espace.", canvas.width/2, 300, 'blue', 'bold 1.5em Arial', 'center');
    text("BONNE CHANCE !!!", canvas.width/2, 400, 'white', 'bold 2em Arial', 'center');
 
    return;
  }

  if (joueurScore==50){ 
    showEndingScreen = true;
    joueurScore = maximumScore;
  }


  if (level == 2 || level == 4){
    BAR_WIDTH=BAR_WIDTH-30;
  }

  if (level == 3 || level == 8){ 
    for(n=1;n<8;n++){
      if(joueurScore == 10*2*n){ 
        //if(BAR_WIDTH>= 50)
        BAR_WIDTH = BAR_WIDTH - 50 ;
      }
    }}

if (level == 5 || level == 7){
    BAR_WIDTH=BAR_WIDTH-50;
  }

  if (level == 9){
    BAR_WIDTH=BAR_WIDTH-70;
  }
  if (level == 10){
    for(n=1;n<8;n++){
      if(joueurScore == 10*2* n){ 
        //if(BAR_WIDTH>= 50)
        BAR_WIDTH = BAR_WIDTH - 70 ;
      }
    }
    if(showEndingScreen){
      if(joueurScore==maximumScore){
        rect(0, 0, canvas.width, canvas.height, 'black');
        text("Félicitations Brick Breaker !!! ", canvas.width/2, 100, 'green', 'bold 2em Arial', 'center');
        text("Vous venez de terminer ", canvas.width/2, 200, 'green', 'bold 1.7em Arial', 'center');
        text("le jeu avec un score de: " + joueurScore, canvas.width/2,250, 'green', 'bold 1.8em Arial', 'center');
        text("Cliquez pour recommencer du niveau 1" , canvas.width/2,400, 'white', 'bold 1.8em Arial', 'center');
        return;
        
        
      }
    }
  }

  if (level == 11){ 
        level = 1;
        BAR_WIDTH = 100;
        highestScore = 0;
        return;
    }
  

  //ball
  circle(ballX, ballY, 10, 'white');

  //bar
  rect(barX, canvas.height-BAR_DIST_FROM_EDGE, BAR_WIDTH, BAR_HEIGHT, 'white');

  //bricks
  drawBricks();

  text("Score:" + joueurScore, 10, 30, 'white', 'bold 1.4em monospace', 'left');
  text("Niveau:" + level, 200, 30, 'white', 'bold 1.4em monospace', 'left');
  text("Meilleur Score:" + highestScore, 360, 30, 'white', 'bold 1.4em monospace', 'left');  
  text("Essais:" + joueurAttempts, 673, 30, 'white', 'bold 1.4em monospace', 'left');
}

function rect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function circle(centerX, centerY, radius, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
  canvasContext.fill();
}

function text(showWords, textX, textY, fillColor, fontSizeStyle, textAlignment) {
  canvasContext.fillStyle = fillColor;
  canvasContext.font = fontSizeStyle;
  canvasContext.textAlign = textAlignment;
  canvasContext.fillText(showWords, textX, textY);
}