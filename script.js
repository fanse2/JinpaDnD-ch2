const DURATION = 3500

const playButton = document.querySelector('.play-button')
const master = document.querySelector('#master')
const hellga = document.querySelector('#hellga')
const connal = document.querySelector('#connal')
const yomi = document.querySelector('#yomi')
const inwang = document.querySelector('#inwang')
const hansoom = document.querySelector('#hansoom')
const ujang = document.querySelector('#ujang')

const storyLine = [
    {
        user: master,
        line: 'Mr. 요미는 남극대륙 세력을 통합하려고 하였다.'
    },
    {
        user: master,
        line: '통합을 위해서는 통합비용이 필요하게 됐는데.'
    },
    {
        user: master,
        line: '방도를 찾던 중 소행성대에 흩어져 있는 우주자원에 주목했다.'
    },
    {
        user: master,
        line: '우주 자원을 수거하시오.. 긋럭~!'
    },
    {
        user: yomi,
        line: '인왕 선장! 소행성대에 있는 자원들을 수거해 준다면'
    },
    {
        user: yomi,
        line: '수배령을 취소하고 다시 면허를 발급해드리겠소!'
    },
    {
        user: inwang,
        line: '음 끌리기는 하는데... 약간... '
    },
    {
        user: yomi,
        line: '좋소 성공하면 1만냥씩을 얹어 드리리다.'
    },
    {
        user: inwang,
        line: '콜~! 승리호 출격!'
    },
]

function pitchLine(sentence,playerCard) {
    let line

    if(playerCard.style.display == '') {
        playerCard.style.display = 'flex'
    }

    playerCard.childNodes.forEach(el=>{
        if(el.className == 'line'){
            el.remove()
        } 
    })

    const newLine = document.createElement('div')
    newLine.classList.add('line')
    newLine.textContent = sentence
    playerCard.appendChild(newLine)

}

function story() {
    let i = 0

    storyLine.forEach(v=>{
        setTimeout(pitchLine,i*DURATION,v.line,v.user)
        i++
    })

    //setTimeout(setInterval,i*DURATION,update,20)

    //setInterval(update, 20)

}

playButton.addEventListener('click',story)

story()
///////////////////////////////////////////
// game

let canvas = document.querySelector('#canvas-top')
let startBtn = document.querySelector('#start')
let msg = document.querySelector('#msg')

let ctx = canvas.getContext('2d')
let gameState = {
    rectPosX: 10,
    rectPosY: canvas.height / 2 -10,
    rectVelocity: {x:0,y:0},
    playerSpeed: .5,
    enemyTimeout: 60,
    enemyTimeoutInit: 60,
    enemySpeed: 1,
    enemies: [],
    friends: [],
    friendAdded: false,
    score: 0
}
const P_WIDTH = 14
const P_HEIGHT = 14

const pirateImg = new Image(P_WIDTH, P_HEIGHT)
pirateImg.src = 'images/space-pirate.png'

const asterImg = new Image(10,10)
asterImg.src = 'images/asteroid.png'

let scrap = 0
let lives = 3
let interval

function random(n) {
    return Math.floor(Math.random() * n)
}

class RectCollider {
    constructor(x, y, width, height){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    isColliding(rectCollider) {
        if(
            this.x < rectCollider.x + rectCollider.width && 
            this.x + this.width > rectCollider.x && 
            this.y < rectCollider.y + rectCollider.height && 
            this.height + this.y > rectCollider.y
        ) {
            return true
        }
        return false
    }
}

function checkCollision(gameState) {
    let playerCollider = new RectCollider(gameState.rectPosX,gameState.rectPosY,10,10)

    for(let i=0; i<gameState.enemies.length; ++i) {
        let enemyCollider = new RectCollider(gameState.enemies[i].x, gameState.enemies[i].y, 10, 10)
        if(playerCollider.isColliding(enemyCollider)) {
            lives--
            return true
        }
    }

    //scraped
    for(let i=0; i<gameState.friends.length; ++i) {
        let friendCollider = new RectCollider(gameState.friends[i].x, gameState.friends[i].y, 5, 5)
        if(playerCollider.isColliding(friendCollider)) {
            gameState.playerSpeed*=1.05
            gameState.friends.splice(i,1)
            scrap++
        }
    }
}

function update() {
    ctx.clearRect(0,0,canvas.width,canvas.height)

    gameState.enemyTimeout -= 1
    // add a enemy
    if(gameState.enemyTimeout == 0) {
        gameState.enemyTimeout = Math.floor(gameState.enemyTimeoutInit)
        gameState.enemies.push({
            x: canvas.width,
            y: random(canvas.height),
            velocity: gameState.enemySpeed
        })
        gameState.enemySpeed *= 1.001;
        gameState.enemyTimeoutInit = gameState.enemyTimeoutInit * .999
    }

    //space ship movement
    gameState.rectPosX += gameState.rectVelocity.x
    gameState.rectPosY += gameState.rectVelocity.y
    if(gameState.rectPosX > canvas.width - P_WIDTH){
        gameState.rectPosX = canvas.width - P_WIDTH
        gameState.rectVelocity.x = 0
    }
    if(gameState.rectPosX < 0){
        gameState.rectPosX = 0
        gameState.rectVelocity.x = 0
    }
    if(gameState.rectPosY < 0){
        gameState.rectPosY = 0
        gameState.rectVelocity.y = 0
    }
    if(gameState.rectPosY > canvas.height - P_HEIGHT){
        gameState.rectPosY = canvas.height - P_HEIGHT
        gameState.rectVelocity.y = 0
    }

    ctx.drawImage(pirateImg,gameState.rectPosX, gameState.rectPosY)

    // draw enemies

    for(let i = 0; i < gameState.enemies.length; ++i){
        gameState.enemies[i].x -= gameState.enemies[i].velocity
        
        ctx.drawImage(asterImg, gameState.enemies[i].x, gameState.enemies[i].y, 10, 10)
    }

    // passed enemies removal
    for(let i = 0; i < gameState.enemies.length; ++i){
        if(gameState.enemies[i].x < -10){
            gameState.enemies.splice(i,1)
            gameState.score++
        }
    }

    // score
    document.querySelector('#score').innerHTML = '수거량: ' + scrap + '  ' + '🛸'.repeat(lives-1)
    if(gameState.score%8 == 0 && gameState.friendAdded == false){
        gameState.friends.push({
            x: random(canvas.width-20),
            y: random(canvas.height-20)
        })
        gameState.friendAdded = true
    }
    if(gameState.score%10 == 1 && gameState.friendAdded == true){
        gameState.friendAdded = false
    }

    // friend
    for(let i = 0; i < gameState.friends.length; ++i){
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(gameState.friends[i].x, gameState.friends[i].y, 5, 5)
    }

    if(checkCollision(gameState) == true){
        gameState = {
            rectPosX: 10,
            rectPosY: canvas.height / 2 -10,
            rectVelocity: {x: 0, y: 0},
            playerSpeed: .5,
            enemyTimeout: 60,
            enemyTimeoutInit: 60,
            enemySpeed: 1,
            enemies: [],
            friends: [],
            friendAdded: false,
            score: 0
        }
        if(lives <= 0) {
            // game set
            msg.innerHTML = `${scrap}박스를 수거, ${scrap}만냥을 적립했습니다.`
            clearInterval(interval)
            interval = 0
        }
    }
}

// let interval = setInterval(update, 20)


document.addEventListener('keydown', e => {
    if(e.keyCode == 39) {
        gameState.rectVelocity.x = gameState.playerSpeed
    }
    if(e.keyCode == 37) {
        gameState.rectVelocity.x = -gameState.playerSpeed
    }
    if(e.keyCode == 40) {
        gameState.rectVelocity.y = gameState.playerSpeed
    }
    if(e.keyCode == 38) {
        gameState.rectVelocity.y = -gameState.playerSpeed
    }
})

startBtn.addEventListener('click', e => {
    if(interval) return
    interval = setInterval(update, 20)
    msg.innerHTML = ``
    lives = 3
    scrap = 0
})