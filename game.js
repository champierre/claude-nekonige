let player;
let cat;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let gameTime = 0;
let lastCatchTime = 0;

// タッチ操作用の変数
let touchTarget = null;
let isMovingToTouch = false;

function setup() {
    // レスポンシブなキャンバスサイズ
    let canvasWidth = min(800, windowWidth - 40);
    let canvasHeight = min(600, windowHeight - 200);
    
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('game-container');
    
    // プレイヤーの初期位置
    player = {
        x: width / 2,
        y: height / 2,
        size: 20,
        speed: 4
    };
    
    // ねこの初期位置
    cat = {
        x: 50,
        y: 50,
        size: 25,
        speed: 2.5,
        targetX: 50,
        targetY: 50
    };
}

function draw() {
    background(135, 206, 235); // 空色の背景
    
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'playing') {
        drawGame();
        updateGame();
    } else if (gameState === 'gameOver') {
        drawGameOverScreen();
    }
}

function drawStartScreen() {
    fill(255);
    stroke(0);
    strokeWeight(3);
    rect(width/2 - 200, height/2 - 100, 400, 200, 20);
    
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text('ねこから逃げろ！', width/2, height/2 - 40);
    
    textSize(18);
    text('クリックまたはスペースキーで開始', width/2, height/2 + 20);
}

function drawGame() {
    // ゲーム時間の更新
    gameTime++;
    score = floor(gameTime / 60); // 1秒 = 60フレーム
    
    // 草地の描画
    drawGrass();
    
    // プレイヤーの描画
    drawPlayer();
    
    // ねこの描画
    drawCat();
    
    // スコアの表示
    drawScore();
    
    // 衝突判定
    checkCollision();
}

function drawGrass() {
    // シンプルな草地パターン
    fill(34, 139, 34);
    noStroke();
    for (let x = 0; x < width; x += 40) {
        for (let y = 0; y < height; y += 40) {
            circle(x + random(-5, 5), y + random(-5, 5), 8);
        }
    }
}

function drawPlayer() {
    // プレイヤー（人）の描画
    push();
    translate(player.x, player.y);
    
    // 体
    fill(100, 149, 237);
    stroke(0);
    strokeWeight(2);
    circle(0, 0, player.size);
    
    // 顔
    fill(255, 220, 177);
    circle(0, -5, 12);
    
    // 目
    fill(0);
    noStroke();
    circle(-3, -7, 2);
    circle(3, -7, 2);
    
    // 口
    stroke(0);
    strokeWeight(1);
    noFill();
    arc(0, -3, 4, 3, 0, PI);
    
    pop();
}

function drawCat() {
    // ねこの描画
    push();
    translate(cat.x, cat.y);
    
    // 体
    fill(255, 140, 0);
    stroke(0);
    strokeWeight(2);
    ellipse(0, 0, cat.size, cat.size * 0.8);
    
    // 頭
    fill(255, 140, 0);
    circle(0, -10, 18);
    
    // 耳
    fill(255, 140, 0);
    triangle(-6, -18, -3, -12, 0, -18);
    triangle(0, -18, 3, -12, 6, -18);
    
    // 目
    fill(0);
    noStroke();
    circle(-3, -12, 2);
    circle(3, -12, 2);
    
    // 鼻
    fill(255, 192, 203);
    triangle(0, -9, -1, -7, 1, -7);
    
    // ひげ
    stroke(0);
    strokeWeight(1);
    line(-8, -8, -12, -9);
    line(-8, -6, -12, -6);
    line(8, -8, 12, -9);
    line(8, -6, 12, -6);
    
    // しっぽ
    noFill();
    strokeWeight(3);
    curve(cat.x + 15, cat.y - 10, cat.x + 10, cat.y, cat.x + 20, cat.y - 15, cat.x + 25, cat.y - 5);
    
    pop();
}

function drawScore() {
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(10, 10, 200, 60, 10);
    
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    text('スコア: ' + score + '秒', 20, 30);
    text('生存時間: ' + nf(score, 0, 1) + 's', 20, 50);
}

function drawGameOverScreen() {
    fill(255, 0, 0, 100);
    noStroke();
    rect(0, 0, width, height);
    
    fill(255);
    stroke(0);
    strokeWeight(3);
    rect(width/2 - 200, height/2 - 100, 400, 200, 20);
    
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text('ゲームオーバー！', width/2, height/2 - 40);
    
    textSize(18);
    text('スコア: ' + score + '秒', width/2, height/2 - 10);
    text('クリックまたはスペースキーでリスタート', width/2, height/2 + 20);
}

function updateGame() {
    // プレイヤーの移動
    updatePlayer();
    
    // ねこのAI
    updateCat();
}

function updatePlayer() {
    let newX = player.x;
    let newY = player.y;
    
    // キーボード入力での移動
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A
        newX -= player.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D
        newX += player.speed;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // W
        newY -= player.speed;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // S
        newY += player.speed;
    }
    
    // タッチ操作での移動
    if (isMovingToTouch && touchTarget) {
        let dx = touchTarget.x - player.x;
        let dy = touchTarget.y - player.y;
        let distance = sqrt(dx * dx + dy * dy);
        
        if (distance > 5) { // 目標地点に近づいたら停止
            // 目標地点の方向に移動
            newX += (dx / distance) * player.speed;
            newY += (dy / distance) * player.speed;
        } else {
            // 目標地点に到達したらタッチ移動を停止
            isMovingToTouch = false;
            touchTarget = null;
        }
    }
    
    // 画面境界のチェック
    player.x = constrain(newX, player.size/2, width - player.size/2);
    player.y = constrain(newY, player.size/2, height - player.size/2);
}

function updateCat() {
    // ねこがプレイヤーを追いかける
    let dx = player.x - cat.x;
    let dy = player.y - cat.y;
    let distance = sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        // プレイヤーの方向に移動
        cat.x += (dx / distance) * cat.speed;
        cat.y += (dy / distance) * cat.speed;
        
        // 少しランダムな動きを追加
        cat.x += random(-0.5, 0.5);
        cat.y += random(-0.5, 0.5);
    }
    
    // 画面境界のチェック
    cat.x = constrain(cat.x, cat.size/2, width - cat.size/2);
    cat.y = constrain(cat.y, cat.size/2, height - cat.size/2);
    
    // 時間が経つにつれてねこの速度を上げる
    if (frameCount % 300 === 0) { // 5秒ごと
        cat.speed += 0.1;
    }
}

function checkCollision() {
    let distance = dist(player.x, player.y, cat.x, cat.y);
    let minDistance = (player.size + cat.size) / 2;
    
    if (distance < minDistance) {
        gameState = 'gameOver';
    }
}

function mousePressed() {
    if (gameState === 'start' || gameState === 'gameOver') {
        startGame();
    } else if (gameState === 'playing') {
        // ゲーム中のクリック/タップでプレイヤーを移動
        touchTarget = { x: mouseX, y: mouseY };
        isMovingToTouch = true;
    }
}

// タッチイベントの処理
function touchStarted() {
    if (gameState === 'start' || gameState === 'gameOver') {
        startGame();
        return false; // デフォルトのタッチ動作を防ぐ
    } else if (gameState === 'playing') {
        // ゲーム中のタッチでプレイヤーを移動
        touchTarget = { x: mouseX, y: mouseY };
        isMovingToTouch = true;
        return false; // デフォルトのタッチ動作を防ぐ
    }
}

function keyPressed() {
    if (key === ' ') {
        if (gameState === 'start' || gameState === 'gameOver') {
            startGame();
        }
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    gameTime = 0;
    
    // タッチ移動をリセット
    touchTarget = null;
    isMovingToTouch = false;
    
    // プレイヤーの位置をリセット
    player.x = width / 2;
    player.y = height / 2;
    
    // ねこの位置をランダムにリセット
    cat.x = random(50, width - 50);
    cat.y = random(50, height - 50);
    cat.speed = 2.5;
    
    // プレイヤーから離れた位置にねこを配置
    while (dist(player.x, player.y, cat.x, cat.y) < 150) {
        cat.x = random(50, width - 50);
        cat.y = random(50, height - 50);
    }
}

// ウィンドウサイズ変更時の処理（モバイルの画面回転など）
function windowResized() {
    let canvasWidth = min(800, windowWidth - 40);
    let canvasHeight = min(600, windowHeight - 200);
    resizeCanvas(canvasWidth, canvasHeight);
    
    // プレイヤーとねこの位置を新しいキャンバスサイズに合わせて調整
    player.x = constrain(player.x, player.size/2, width - player.size/2);
    player.y = constrain(player.y, player.size/2, height - player.size/2);
    cat.x = constrain(cat.x, cat.size/2, width - cat.size/2);
    cat.y = constrain(cat.y, cat.size/2, height - cat.size/2);
}