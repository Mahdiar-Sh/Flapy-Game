var cvs = document.getElementById("myCanvas");
var ctx = cvs.getContext("2d");
var fremes = 0;
var sprite = new Image();
sprite.src = "img/sprite.png";

var score = new Audio();
score.src = "audio/score.wav";

var flap = new Audio();
flap.src = "audio/flap.wav";

var hit = new Audio();
hit.src = "audio/hit.wav";

var die = new Audio();
die.src = "audio/die.wav";

var start = new Audio();
start.src = "audio/start.wav";


var bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,
    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}
var fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx: 2,
    draw: function () {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    update: function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

var trees = {
    top: {
        sX: 553,
        sY: 0,
    },
    bott: {
        sX: 502,
        sY: 0,
    },
    w: 53,
    h: 400,
    gap: 80,
    dx: 2,
    position: [],
    maxYPos: -150,
    point: 0,
    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let topY = p.y;
            let botY = p.y + this.h + this.gap;
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topY, this.w, this.h);
            ctx.drawImage(sprite, this.bott.sX, this.bott.sY, this.w, this.h, p.x, botY, this.w, this.h);
        }
    },
    update: function () {
        if (state.current != state.game) return;
        if (state.current == state.game) {
            if (fremes % 100 == 0) {
                this.position.push({
                    x: cvs.width,
                    y: this.maxYPos * (Math.random() + 1)
                })
            }
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];
                p.x -= this.dx;
                let bottomYTree = p.y + this.h + this.gap;
                if (p.x + this.w < 0) {
                    this.position.shift();
                    this.point += 1;
                    score.play();
                    gameOver.maxPoint = Math.max(trees.point , gameOver.maxPoint);
                    localStorage.setItem("maxPoint" , gameOver.maxPoint);
                }

                if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                    state.current = state.over;
                    die.play();
                }
                if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomYTree && bird.y - bird.radius < bottomYTree + this.h) {
                    state.current = state.over;
                    die.play();
                }
            }
        }
    }
}

var bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 }
    ],
    w: 34,
    h: 26,
    x: 50,
    y: 150,
    speed: 0,
    gravity: 0.25,
    animateIndex: 0,
    jump: 4.6,
    root: 0,
    radius: 12,
    draw: function () {
        let bird = this.animation[this.animateIndex];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.root);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
        ctx.restore();
    },
    update: function () {
        if (state.current == state.getReady)
            if (fremes % 5 == 0) this.animateIndex += 1;
        if (this.animateIndex == 3) this.animateIndex = 0;
        else {
            if (fremes % 8 == 0) this.animateIndex += 1;
            if (this.animateIndex == 3) this.animateIndex = 0;
        }
        if (state.current == state.getReady) {
            this.y = 150;
        }
        else {
            this.speed += this.gravity;
            this.y += this.speed;
        }
        if (this.y + this.h / 2 > cvs.height - fg.h) {
            this.y = cvs.height - fg.h - this.h / 2;
            state.current = state.over;
            this.animateIndex = 1;
        }
        if (this.speed > this.jump) this.root = 90 * (Math.PI / 180);
    },
    flap: function () {
        this.speed = - this.jump;
        this.root = -25 * (Math.PI / 180);
    }
}
var state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2,
}
function handeler() {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            start.play();
            break;
        case state.game:
            bird.flap();
            flap.play();
            break;
        default:
            trees.position = [];
            bird.root = 0;
            bird.speed = 0;
            trees.point = 0;
            state.current = state.getReady;
            break;
    }
}
document.addEventListener("click", handeler)
document.addEventListener("keydown", function () {
    handeler();
})
var getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,
    draw: function () {
        if (state.current == state.getReady)
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
}
var gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,
    maxPoint : localStorage.getItem("maxPoint") || 0,
    draw: function () {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
            ctx.lineWidth = 2;
            ctx.fillStyle = "white";
            ctx.font = "25px serif";
            ctx.fillText(trees.point, this.w, this.h - 15);
            ctx.strokeStyle = "black";
            ctx.strokeText(trees.point, this.w, this.h - 15);
            ctx.lineWidth = 2;
            ctx.fillStyle = "white";
            ctx.font = "25px serif";
            ctx.fillText(this.maxPoint, this.w , this.h + 24);
            ctx.strokeStyle = "black";
            ctx.strokeText(this.maxPoint, this.w, this.h + 24);
        }
        if (state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.fillStyle = "white";
            ctx.font = "30px serif";
            ctx.fillText(trees.point, cvs.width/2, 23);
            ctx.strokeStyle = "black";
            ctx.strokeText(trees.point, cvs.width/2, 23);
        }
    },
}
function update() {
    bird.update();
    fg.update();
    trees.update();
}
function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    trees.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
}
function animate() {
    update();
    draw();
    fremes++;
    requestAnimationFrame(animate);
}
animate();