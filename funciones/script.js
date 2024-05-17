// Recuperamos la etiqueta canvas y creamos un contexto 2d
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const $sprite = document.querySelector('#sprite');
const $bricks = document.querySelector('#bricks');

/* Variables del juego */
let counter = 0;

/* VARIABLES DE LA PELOTA */
const ballRadius = 2;

// Posición de la pelota
let x = canvas.width / 2;
let y = canvas.height - 15;

// Velocidad de la pelota
let dx = -4;
let dy = -3;

/* VARIABLES DE LA PALETA */
const paddleHeight = 6;
const paddleWidth = 44;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 5;

let rightPressed = false;
let leftPressed = false;

/* VARIABLES DE LOS LADRILLOS */
const brickRowCount = 7;
const brickColumnCount = 12;
const brickWidth = 24;
const brickHeight = 7;
const brickPadding = 0;
const brickOffsetTop = 4;
const brickOffsetLeft = 7;
const bricks = [];

const brick_status = {
    active: 1,
    destroyed: 0
};

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [] // Inicializamos con un array vacío
    for (let r = 0; r < brickRowCount; r++) {
        // Calculamos la posición del ladrillo en la pantalla
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
        // asignar un color aleatorio a cada ladrillo
        const random = Math.floor(Math.random() * 8)
        // guardamos la información de cada ladrillo
        bricks[c][r] = {
            x: brickX,
            y: brickY,
            status: brick_status.active,
            color: random
        }
    }
}

let paddle_sensibility = 6;

function drawBall() {

    ctx.beginPath() // Iniciar el trazado
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath() // terminar el trazado
}

function drawPaddle() {

    ctx.drawImage(
        $sprite, // imagen
        32, // clipX: coordenadas del recorte
        175, // clipY: coordenadas del recorte
        paddleWidth, // Tamaño del recorte
        paddleHeight, // tamaño del recorte
        paddleX, // posicion X del dibujo
        paddleY, // posición Y del dibujo
        paddleWidth, // ancho del dibujo
        paddleHeight // alto del dibujo
    )
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            if (currentBrick.status === brick_status.destroyed)
                continue;

            const clipX = currentBrick.color * 32

            ctx.drawImage(
                $bricks,
                clipX,
                0,
                32,
                16,
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            )
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === brick_status.destroyed)
                continue;

            // Calcular los bordes de la pelota y el ladrillo
            const ballRight = x + ballRadius;
            const ballLeft = x - ballRadius;
            const ballTop = y - ballRadius;
            const ballBottom = y + ballRadius;
            const brickRight = currentBrick.x + brickWidth;
            const brickLeft = currentBrick.x;
            const brickTop = currentBrick.y;
            const brickBottom = currentBrick.y + brickHeight;

            // Comprobar si la pelota colisiona con el ladrillo
            const collidesWithBrick =
                ballRight > brickLeft &&
                ballLeft < brickRight &&
                ballTop < brickBottom &&
                ballBottom > brickTop;

            if (collidesWithBrick) {
                // Si la pelota golpea por la parte inferior del ladrillo, cambiar solo dy
                if (ballBottom >= brickBottom && ballTop < brickBottom) {
                    dy = -dy;
                } else {
                    // Cambiar la dirección de la pelota en ambos ejes
                    dx = -dx;
                    dy = -dy;
                }

                // Marcar el ladrillo como destruido
                currentBrick.status = brick_status.destroyed;
            }
        }
    }
}

function ballMovement() {

    // rebotar la pelota en las paredes
    if (
        x + dx > canvas.width - ballRadius || // Pared derecha
        x + dx < ballRadius // Pared izquierda

    ) {
        dx = -dx
    }

    // mover la pelota
    x += dx
    y += dy

    // rebotar en la parte de arriba
    if (y + dy < ballRadius) {
        dy = -dy
    }

    // la pelota toca la pala
    const isBallSameXAsPaddle =
        x > paddleX &&
        x < paddleX + paddleWidth

    const isBallTouchingPaddle =
        y + dy > paddleY

    if (isBallSameXAsPaddle && isBallTouchingPaddle) {
        dy = -dy // cambiar la dirección de la pelota
    } else if ( // Si la pelota toca el suelo mostrar game over y reinicar el juego
        y + dy > canvas.height - ballRadius) {
        console.log('GAME OVER')
        document.location.reload()
    }


}

function paddleMovement() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddle_sensibility
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddle_sensibility
    }
}

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    function keyDownHandler(event) {
        const { key } = event
        if (key === 'Right' || key === "ArrowRight") {
            rightPressed = true;
        } else if (key === 'left' || key === 'ArrowLeft') {
            leftPressed = true;
        }
    }

    function keyUpHandler(event) {
        const { key } = event
        if (key === 'Right' || key === "ArrowRight") {
            rightPressed = false;
        } else if (key === 'left' || key === 'ArrowLeft') {
            leftPressed = false;
        }
    }
}

function draw() {
    console.log(rightPressed, leftPressed)
    cleanCanvas()
    // Dibujamos los elementos
    drawBall()
    drawPaddle()
    drawBricks()

    // drawScore

    // colisiones y movimientos
    collisionDetection()
    ballMovement()
    paddleMovement()

    /* Con el método "requestAnimationFrame" la función draw se llamará a sí misma creando un loop infinito para repintarse */
    window.requestAnimationFrame(draw)
}

// Invocamos las funciones
draw();
initEvents();
