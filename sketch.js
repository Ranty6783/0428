// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存所有水泡的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 水泡類別定義
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(10, 25); // 水泡半徑
    this.speed = random(1, 3); // 上升速度
    this.alpha = 255; // 初始透明度
    this.vx = random(-1, 1); // 左右晃動感
  }

  update() {
    this.y -= this.speed;
    this.x += this.vx;
    this.alpha -= 2; // 逐漸變透明
  }

  display() {
    stroke(255, this.alpha);
    strokeWeight(1.5);
    fill(255, 255, 255, this.alpha * 0.3);
    circle(this.x, this.y, this.r * 2);
    // 水泡反光點
    noStroke();
    fill(255, 255, 255, this.alpha * 0.5);
    circle(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.4);
  }

  isFinished() {
    return this.alpha <= 0 || this.y < -this.r;
  }
}

function draw() {
  background('#e7c6ff');

  // 計算顯示影像的寬高與位置 (畫布的 60%)
  let displayW = width * 0.6;
  let displayH = height * 0.6;
  let offsetX = (width - displayW) / 2;
  let offsetY = (height - displayH) / 2;

  image(video, offsetX, offsetY, displayW, displayH);

  // 在左上方顯示文字
  fill(0);
  noStroke();
  textSize(32);
  textAlign(LEFT, TOP);
  text("414730852彭禹軒", 20, 20);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 定義要連接的關鍵點索引群組：0-4, 5-8, 9-12, 13-16, 17-20
        let fingerParts = [[0, 1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
        
        // 根據左右手設定連線顏色
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
        } else {
          stroke(255, 255, 0);
        }
        strokeWeight(4);

        // 繪製每一根手指的連線
        for (let part of fingerParts) {
          for (let i = 0; i < part.length - 1; i++) {
            let p1 = hand.keypoints[part[i]];
            let p2 = hand.keypoints[part[i + 1]];
            let x1 = map(p1.x, 0, video.width, offsetX, offsetX + displayW);
            let y1 = map(p1.y, 0, video.height, offsetY, offsetY + displayH);
            let x2 = map(p2.x, 0, video.width, offsetX, offsetX + displayW);
            let y2 = map(p2.y, 0, video.height, offsetY, offsetY + displayH);
            line(x1, y1, x2, y2);
          }
        }

        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 將原始影像座標對應到畫布上縮放後的位置
          let mappedX = map(keypoint.x, 0, video.width, offsetX, offsetX + displayW);
          let mappedY = map(keypoint.y, 0, video.height, offsetY, offsetY + displayH);

          // 如果是 4, 8, 12, 16, 20 指尖，則產生水泡
          if ([4, 8, 12, 16, 20].includes(i) && frameCount % 3 == 0) {
            bubbles.push(new Bubble(mappedX, mappedY));
          }

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(mappedX, mappedY, 16);
        }
      }
    }
  }

  // 更新與顯示水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    // 如果水泡該破了（消失），就從陣列移除
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}
