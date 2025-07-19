let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const BUTTON_W = CANVAS_W/4;
const BUTTON_H = BUTTON_W/2;
const BUTTON_Y = CANVAS_H*3/5;
const BUTTON_M = 24;

const GRAVITY = 1.0;
const GRID_SIZE = 64;
const GRID_W = 64;
const GRID_BASE_X = GRID_SIZE*1;
const GRID_BASE_Y = GRID_SIZE*1;
const BALL_NUM = 3;
const BALL_START_X = GRID_SIZE*4;
const BALL_START_Y = GRID_SIZE*6;
const BALL_SIZE = GRID_SIZE;
const BALL_COLOR = 'red';
const BALL_TOSS_SPEED = 34;
const HAND_COLOR = 'lightYellow';
const HAND_CENTER_L = GRID_SIZE*4;
const HAND_CENTER_R = GRID_SIZE*11;
const HAND_CENTER_Y = GRID_SIZE*11;
const HAND_SIZE = GRID_SIZE*1.5;
const HAND_SPEED = 12;
const HAND_TOSS_ANGLE = 168;
const HAND_ENABLE_ANGLE = 270;
const HAND_MOVE_R = GRID_SIZE*2;
const CATCH_RANGE = 50;

let leftButton, rightButton;
let startButton;
let startFlag = false;
let startTime;
let endTime = 0;
let balls;
let hands = [];

let timeCount;
const TEXT_VIEW_SIZE = 32;
let countValue = 0;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
}
function leftFn() {
	hands[0].move = true;
}
function rightFn() {
	hands[1].move = true;
}
function startFn() {
//	hands.move = true;
	if (!startFlag){
		startFlag = true;
		countValue = 0;
	}
}
function setup() {
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	rectMode(CENTER);

	leftButton = buttonInit('←', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W*3)/2-BUTTON_M, BUTTON_Y+BUTTON_H+BUTTON_M);
	rightButton = buttonInit('→', BUTTON_W, BUTTON_H, (CANVAS_W+BUTTON_W)/2+BUTTON_M, BUTTON_Y+BUTTON_H+BUTTON_M);
//	startButton = buttonInit('START', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y+BUTTON_H+BUTTON_M);
	leftButton.mousePressed(leftFn);
	rightButton.mousePressed(rightFn);
//	startButton.mousePressed(startFn);
	textAlign(CENTER,CENTER);

	resetFn();
}
function resetFn() {
	balls = [];
	hands = [];
	for (let i=0; i<2; i++){
		let ball = ballInit();
		balls.push(ball);
		let hand = {};
		hand.angle = 0;
		hand.toss = false;
		hand.move = false;
		hand.enable = false;
		hand.ball = i;
		hand.pos = {};
		hands.push(hand);
	}
	startFlag = false;
}
function ballInit() {
	let ball = {};
	ball.pos = {};
	ball.speed = {};
	ball.speed.x = 0;
	ball.speed.y = 0;
	ball.caught = true;
	return ball;
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text);
	button.size(w,h);
	button.position(x,y);
	button.style('font-size', '32px');
	return button;
}
function handProc(hand, mirror, centerX, centerY) {
	if (hand.move){
		if ((hand.angle<HAND_TOSS_ANGLE) && (hand.angle+HAND_SPEED >= HAND_TOSS_ANGLE)){
			if (hand.ball>=0){
				balls[hand.ball].caught = false;
				if (!mirror){
					balls[hand.ball].speed.x = BALL_TOSS_SPEED*cos((HAND_TOSS_ANGLE+90)*PI/180);
				}else{
					balls[hand.ball].speed.x = -BALL_TOSS_SPEED*cos((HAND_TOSS_ANGLE+90)*PI/180);
				}
				balls[hand.ball].speed.y = BALL_TOSS_SPEED*sin((HAND_TOSS_ANGLE+90)*PI/180);
				if (balls.length<BALL_NUM){
					let ball = ballInit();
					balls.push(ball);
					hand.ball = balls.length-1;
				}else{
					hand.ball = -1;
				}
			}
			hand.enable = false;
		}
		hand.angle += HAND_SPEED;
		if (hand.angle>=HAND_ENABLE_ANGLE){
			hand.enable = true;
		}
		if (hand.angle>=360){
			hand.angle = 0;
			hand.move = false;
		}
	}
	if (!mirror){
		hand.pos.x = centerX+HAND_MOVE_R*cos(hand.angle*PI/180);
		hand.pos.y = centerY+HAND_MOVE_R*sin(hand.angle*PI/180);
	}else{
		hand.pos.x = centerX-HAND_MOVE_R*cos(hand.angle*PI/180);
		hand.pos.y = centerY+HAND_MOVE_R*sin(hand.angle*PI/180);
	}
}
function draw() {
	background(48);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	fill(255);
	stroke(255);
	textSize(64);
	textAlign(CENTER);
	text(countValue, CANVAS_W/2, GRID_SIZE*3);
	strokeWeight(0);
	handProc(hands[0], true, HAND_CENTER_L, HAND_CENTER_Y);
	fill(HAND_COLOR);
	circle(hands[0].pos.x, hands[0].pos.y, HAND_SIZE);
	handProc(hands[1], false, HAND_CENTER_R, HAND_CENTER_Y);
	circle(hands[1].pos.x, hands[1].pos.y, HAND_SIZE);

	for (let i=0; i<balls.length; i++){
		if (!balls[i].caught){
			balls[i].pos.x += balls[i].speed.x;
			balls[i].pos.y += balls[i].speed.y;
			balls[i].speed.y += GRAVITY;
			if (balls[i].pos.y>=CANVAS_H){
				resetFn();
				break;
			}
			for (let h=0; h<hands.length; h++){
		//		const t = sqrt((balls[i].pos.x-hands[h].pos.x)*(balls[i].pos.x-hands[h].pos.x)+(balls[i].pos.y-hands[h].pos.y)*(balls[i].pos.y-hands[h].pos.y));
		//		console.log(t);
				if (sqrt((balls[i].pos.x-hands[h].pos.x)*(balls[i].pos.x-hands[h].pos.x)+(balls[i].pos.y-hands[h].pos.y)*(balls[i].pos.y-hands[h].pos.y)) <= CATCH_RANGE){
		//			console.log(balls[i], hands[h]);
					if (hands[h].enable && (hands[h].ball<0)){
						balls[i].caught = true;
						hands[h].ball = i;
						countValue++;
					}
				}
			}
		}else{
			for (let h=0; h<hands.length; h++){
				if (hands[h].ball==i){
					balls[i].pos.x = hands[h].pos.x;
					balls[i].pos.y = hands[h].pos.y;
				}
			}
		}
		fill(BALL_COLOR);
		circle(balls[i].pos.x, balls[i].pos.y, BALL_SIZE);
	}
	fill(255);
	stroke(255);
	textSize(16);
	strokeWeight(1);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
	text('ball:'+balls.length, DEBUG_VIEW_X,debugY);
	debugY += DEBUG_VIEW_H;
	text('hand_l:'+hands[0].ball, DEBUG_VIEW_X,debugY);
	debugY += DEBUG_VIEW_H;
	text('hand_r:'+hands[1].ball, DEBUG_VIEW_X,debugY);
}
function touchMoved() {
	return false;
}