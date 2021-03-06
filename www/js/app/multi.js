let canvas;
let context;
let cw;
let ch;

let me;
let enemy;
let ball;
let lsBalls = [];

const initMulti = () => {
  if (user == null) {
    goTo('home');
    warn('Warning', 'You must be logged in to play a game.');
  }
  socket.emit('isReady');
}

const handleGameOver = (winOrLoss) => {
  winOrLoss == "win" ? user.Wins++ : user.Losses++;
  goTo('home');

}


canvas = document.getElementById('myCanvas');
context = canvas.getContext('2d');
cw = canvas.width;
ch = canvas.height;

me = new MultiRect();
enemy = new MultiRect();
ball = new Ball();

const updateCanvas = () => {

  if (context == undefined)
    return;

  context.clearRect(0, 0, cw, ch);


  drawPlayer(me);
  drawPlayer(enemy);
  drawBall();
}

const drawPlayer = (player) => {
  if (player != undefined) {
    context.beginPath();
    context.rect(player.X, player.Y, Rect.W, Rect.H);

    context.lineWidth = 3;

    context.fillStyle = 'rgb(255, 255, 255)';
    context.fill();
  }

}

const drawBall = () => {
  if (ball.X != undefined && ball.Y != undefined) {
    context.beginPath();
    context.arc(ball.X, ball.Y, ball.R, 0, 2 * Math.PI);
    context.lineWidth = 1;
    context.strokeStyle = `rgb(${Ball.RColor},${Ball.GColor},${Ball.BColor})`;
    context.stroke();
    context.fillStyle = `rgb(${Ball.RColor},${Ball.GColor},${Ball.BColor})`;
    context.fill();
  }

  let gradient = 0;
  for (const shadowBall of lsBalls) {
    gradient += 0.01;
    context.beginPath();
    context.arc(shadowBall.X, shadowBall.Y, gradient * 20, 0, 2 * Math.PI);
    context.lineWidth = 1;
    context.strokeStyle = `rgba(${Ball.RColor},${Ball.GColor},${Ball.BColor}, ${gradient})`;
    context.stroke();
    context.fillStyle = `rgba(${Ball.RColor},${Ball.GColor},${Ball.BColor}, ${gradient})`;
    context.fill();
  }
}


const initPlayer = (target, x, y, h, w) => {
  target.Y = y;
  Rect.H = h;
  Rect.W = w;
  updatePlayerLocation(target, x);
}

const initBall = (x, y, r) => {
  ball.R = r;
  updateBall(x, y);
}


const updatePlayerLocation = (target, x) => {
  target.X = x;
}

const updateBall = (x, y) => {
  if (ball == undefined)
    return;

  ball.X = x;
  ball.Y = y;
}

const reset = () => {
  document.getElementById('btnReset').style.display = "none";
  socket.emit('reset');
}

const showWarnMessage = (message) => {
  warn('Warning', message)
}

const updateScoreboard = () => {
  warn('Score', `Wins: ${score.wins} \nLosses: ${score.losses}`);
}



window.onkeydown = function (e) {
  let key = e.keyCode ? e.keyCode : e.which;
  if (key == 39) {
    // me.move(false); //right
    right = true;
  } else if (key == 37) {
    // me.move(true); //left
    left = true;
  }

}

window.onkeyup = function (e) {
  let key = e.keyCode ? e.keyCode : e.which;
  if (key == 39) {
    // me.move(false); //right
    right = false;
  } else if (key == 37) {
    // me.move(true); //left
    left = false;
  }
}

let left = false;
let right = false;
const move = () => {
  if (left) {
    me.move(true);
  }
  if (right) {
    me.move(false);
  }
}

let timer = setInterval(move, 20);


// Create touchstart handler.
//event handler from: 
//https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
const multiScr = document.querySelector('.multi');
multiScr.addEventListener('touchstart', function (ev) {
  const x = ev.touches[0].clientX;
  x < screenWidth / 2 ? left = true : right = true;
}, false);

multiScr.addEventListener('touchend', function (ev) {
  const x = ev.changedTouches[0].clientX;
  x < screenWidth / 2 ? left = false : right = false;
}, false);


socket.on('meInit', (x, y, w, h) => {
  initPlayer(me, x, y, h, w);
  updateCanvas();
});

socket.on('enemyInit', (x, y, w, h) => {
  initPlayer(enemy, x, y, h, w);
  updateCanvas();
});

socket.on('ballInit', (x, y, r) => {
  initBall(x, y, r);
  updateCanvas();
})
let ballCounter = 0;
socket.on('ball', (x, y) => {
  // ballCounter++;
  // if (lsBalls.length <= 50)
  //   lsBalls.push(new Ball(x, y));
  // else {

  //   lsBalls.push(new Ball(x, y));
  //   lsBalls.splice(0, 1);
  // }

  updateBall(x, y);
  updateCanvas();
});


socket.on('meX', (x) => {
  updatePlayerLocation(me, x);
  updateCanvas();
});

socket.on('enemyX', (x) => {
  updatePlayerLocation(enemy, x);
  updateCanvas();
});

socket.on('ping', () => {
  socket.emit('pingReply');
})

socket.on('gameover', (winOrLoss) => {
  warn('Warning', winOrLoss == "win" ? "You win!" : "You lose!");
  handleGameOver(winOrLoss);
})

socket.on('disonnected', (winOrLoss) => {
  warn('Warning', winOrLoss == "win" ? "Enemy gave up.. You won!" : "You lose due to disconnection!");
  handleGameOver(winOrLoss);
})


