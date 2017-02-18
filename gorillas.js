
/*
 *
 *   GORILLAS.JS - Copyleft(L) 2010-2013 - Jose Fonseca (jfonseca@zefonseca.com) *
 *
 *   Based on GORILLAS.BAS - Copyright(C) 1981 IBM Corp.
 *
 *   Author: Ze Fonseca 
 *
 *   With support from https://www.MercadoViagens.com/ and https://tics.taxi/
 *
 */

var canvas;

var canvas_width  = 830;
var canvas_height = 400;

var wh_ratio = canvas_width / canvas_height;

var global_gravity = 9.8; // m/s2;

var max_building_height = Math.round(canvas_height / 2);
var min_building_height = 40;
var max_building_width = 51;
var building_spacing = 1;

var building_colors = new Array("#a80000", "#00a8a8", "#a8a8a8");
var window_colors  = new Array("#fcfc54", "#545454");	

var window_width = 5;
var window_height = 10;
	
var delta_t = 0.12; // simulando o tempo / iteração do programa
	
// banana sprite should be preloaded in divpreload
var bananas = new Array(
   	"/assets/images/games/gorillas/banana_20px_1.jpg",
   	"/assets/images/games/gorillas/banana_20px_2.jpg",
   	"/assets/images/games/gorillas/banana_20px_3.jpg",
   	"/assets/images/games/gorillas/banana_20px_4.jpg"
);	

// gorilla sprites should be preloaded in divpreload
var gorillas_lr = new Array(
   	"/assets/images/games/gorillas/gorilla_up.png",   	
   	"/assets/images/games/gorillas/gorilla_70px.png"
);	

var gorillas_rl = new Array(
   	"/assets/images/games/gorillas/gorilla_up_rl.png",
   	"/assets/images/games/gorillas/gorilla_70px.png"
);	
	
var victory_sprite = new Array(
   	"/assets/images/games/gorillas/victory/1.png",
   	"/assets/images/games/gorillas/victory/2.png"
);		

var all_images = new Array(
    bananas, gorillas_lr, gorillas_rl, victory_sprite
);
	
var banana_width  = 20;
var banana_height = 20;
	
var gorilla_width    = 44;
var gorilla_height   = 60;
	
var banana_dist_delta = 15; // how much space between bananas in animation
var banana_x_delta = banana_dist_delta + banana_width; // horiz. dislocation delta in animation
	
var draw_timeout = 30; // milliseconds
var victory_timeout = 200;
var shoot_gesture_timeout = 500;
    
// TO-DO CPU PLAY
var cpu_play_timeout = 3000;
var cpu_play_gauge;
var cpu_play_timeout_id;
var player1_last_speed;
var player1_last_angle;

var canvas_background = "#ffffff";

var explosion_background = "#ff0000";
var explosion_radius = 20;
var explosion_radius_gorilla = 30;
var explosion_loop_timeout = 30;

var ctx;

// ------ GAME INSTANCE VARIABLES ------
var p1_center_pos;
var p2_center_pos;

var p1_score = 0;
var p2_score = 0;

var sun_pos;
var wind_speed;

var buildings;   

// ---------------------------------------------------------------------------   

/*
  Game & scenario reset.
*/

function new_game() {
	players = prompt("Number of players? 1/2", "1");
	p1_score = 0;
	p2_score = 0;
	set_score(1, 0);
	set_score(2, 0);
	scenario_reset();
	$('#divcommandplayer1').show();
    $('#divcommandplayer2').hide();
}

function scenario_reset() {
   	
    // set global object, canvas
    canvas  = $('#gorillas_canvas')[0];  

    var ermsg = "This browser does not support the HTML 5 Canvas element. Please try Firefox or Opera.";
    
    if (!canvas) {
        show_status(ermsg);
        return;
    }

	if ( canvas.getContext ) {
	    ctx = canvas.getContext('2d');  
	    ctx.fillStyle = canvas_background;        
	    ctx.fillRect(0, 0, canvas_width, canvas_height);
	}
	else {
	    show_status(ermsg);
	}   
	
	randomize_wind_speed();
	show_status("Game Started");
	draw_cityscape(ctx);   
}


// ---------------------------------------------------------------------------   

/*
  Entry point. 
*/
function main() {
	new_game();
}   

	// ---------------------------------------------------------------------------   
   
/*
 *		Shows feedback in divmensagens
 */    
function show_status (msg) {
	$('#divmensagens').html(msg);
}   

function set_score (player, score) {
	var scorediv;
	if (player == 1) {
		scorediv = $('#divscore_p1');
	}
	else if(player == 2) {
		scorediv = $('#divscore_p2');
	}
	
	scorediv.html(score);
}   
   
// ---------------------------------------------------------------------------
   
/*
  Places a banana at x, y 			
  Clears previous banana at px, py  			
  For a single banana, use px, py = -100
*/
function draw_banana(ctx, banana_index, position, p_position) {
   	
   	var x = position.getX();
   	var y = position.getY();
   	var px = p_position.getX();
   	var py = p_position.getY();
   	
    var im = new Image();
    im.src = bananas[banana_index];
    
    im.onload = function () {
   	    ctx.drawImage(im, x, y); 
    }
   	
   	// clear previous banana
   	ctx.fillStyle = canvas_background;
   	ctx.fillRect(px-1, py-1, banana_width+2, banana_height+2);
   	
}

   // ---------------------------------------------------------------------------
   
function randomize_wind_speed() {
	var max = 10;
	var speed = Math.round(Math.random() * max);
	wind_speed = speed;
   	var rnd = Math.round(Math.random() * 999);
   	if ( rnd % 2 ) {
   		wind_speed = -1 * wind_speed;
   	}		
   	_display_wind_speed();
}
   
function _display_wind_speed() {
   	var wind_div = $('#divwind');
	if ( wind_speed > 0 ) {
		wind_div.html(" Wind: <img src='/assets/images/games/gorillas/arrow_r.png' align='right' style='height: 30px;'> " + wind_speed);
	}
	else {
		wind_div.html(" Wind: <img src='/assets/images/games/gorillas/arrow_l.png' align='right' style='height: 30px;'>  " + wind_speed);		
	}
}
      
// ---------------------------------------------------------------------------   

/*
  Place a gorilla.
*/
function place_gorilla(ctx, position, player) {
    var im = new Image();
    im.src = gorillas_lr[1];
    im.onload = function () {
   	    ctx.drawImage(im, position.getX(), position.getY());  
    }
   	if (player == 1) {
   		p1_center_pos = position;
   	}
   	else {
   		p2_center_pos = position;
   	}
}
 
// ---------------------------------------------------------------------------   

/*
  Draw cityscape
*/
function draw_cityscape(ctx) {
   	
   	buildings = new Array();
   	
	var tot_width = 0;	
	var building_nr = 0;

	while ( tot_width < canvas_width ) {	   	  	 
	    
	    var rnd = Math.random() * (max_building_height - min_building_height);  
	   	var building_height = Math.round( rnd ) + min_building_height;
	   	var bcrnd = Math.round( Math.random() * (building_colors.length - 1) );

	   	if ( building_nr == 2 ) {
	   		var p = new Position(tot_width+5,(canvas_height - building_height - gorilla_height));
	   		place_gorilla(ctx, p, 1);	   
	   	}
        
	   	if ( building_nr == 13 ) {
	   		var p = new Position(tot_width+4, (canvas_height - building_height - gorilla_height));
	   		place_gorilla(ctx, p, 2);	   
	   	}
	   	
	   	var b_color = building_colors[bcrnd];
	   	ctx.fillStyle = b_color;
	   	var building_y = (canvas_height - building_height);
	   	ctx.fillRect(tot_width, building_y, max_building_width, building_height);

	   	buildings.push(building_y);
	   	
	   	for ( ii=building_y+5; ii<(canvas_height-window_height); ii += (2 * window_height) ) {
		   	for ( i=0; i < ( (max_building_width/window_width) - 3); i++ ) {
		   		if (i % 2) {
		   			continue;
		   		}
		   		if ( (Math.round(Math.random() * 999)) % 2 ) {
		   			ctx.fillStyle = window_colors[0];
		   		}
		   		else {
		   			ctx.fillStyle = window_colors[1];
		   		}
		   		ctx.fillRect(tot_width+10+(i * window_width), ii, window_width, window_height);
		   	}
	   	}
	   	
	   	tot_width += parseInt(max_building_width,10) + parseInt(building_spacing,10);
	   	building_nr++;
	}
	
}    
   

// ---------------------------------------------------------------------------   

/*
  Do explosion at x, y
*/   

function explode(ctx, position, collision_code) {
   	var radgrad = ctx.createRadialGradient(position.getX(), position.getY(), explosion_radius, position.getX(), position.getY(), explosion_radius);  
	_circle_exp(position, 1, collision_code);
}
   
// open explosion radius
function _circle_exp(position, radius, collision_code) {
   	var specific_radius = explosion_radius;
   	
   	if ( (collision_code == 1) || (collision_code == 2) )  {
   		specific_radius = explosion_radius_gorilla;
   	}
   	
   	if ( radius >= specific_radius) {
   		_circle_exp2(position, radius+1);
   		return;
   	}
   	
   	ctx.beginPath();		
	var lrg = ctx.createRadialGradient(position.getX(), position.getY(), explosion_radius/4, position.getX(), position.getY(), explosion_radius/2);
	lrg.addColorStop(0, '#00c000');
	lrg.addColorStop(1, '#ff0000');
	ctx.fillStyle = lrg;
	ctx.arc(position.getX(), position.getY(), radius, 0, 2*Math.PI, false); 
	ctx.fill();
	setTimeout(function () {
		_circle_exp(position,radius+1);
	}, explosion_loop_timeout);
}

// close explosion radius
function _circle_exp2(position, radius, collision_code) {
   	if ( radius <= 0 ) {
   		return;
   	}
   	ctx.beginPath();		
	ctx.strokeStyle = canvas_background;
	ctx.arc(position.getX(), position.getY(),  radius, 0, 2*Math.PI, false); 
	ctx.stroke();
	setTimeout(function () {
		_circle_exp2(position, radius - 0.4);
	}, explosion_loop_timeout);
}

// ---------------------------------------------------------------------------   

function victory_dance(ctx, player) {
	var pos;
	if (player == 1) {
		pos = p1_center_pos;
	}
	else {
		pos = p2_center_pos;
	}
	_victory_dance(ctx, pos, 0);
}   

function _victory_dance (ctx, position, cnt) {
	if (cnt >= 16) {
		scenario_reset();			
		return;
	}
	var img = new Image();
	img.src = victory_sprite[cnt % 2];
    img.onload = function () {
	    ctx.drawImage(img, position.getX(), position.getY()-14);
    }
	
   	setTimeout( function () {
		_victory_dance(ctx, position, cnt+1);
   	},  victory_timeout);		
	
}


// ---------------------------------------------------------------------------   

   
function shoot_gesture(ctx, player) {
	var sprite;
	var pos;
	if (player == 1) {
		sprite = gorillas_lr;
		pos = p1_center_pos;
	}
	else {
		sprite = gorillas_rl;
		pos = p2_center_pos;
	}
	_shoot_gesture(ctx, sprite, pos, 0);
}   

function _shoot_gesture (ctx, sprite, position, cnt) {
    
	var img = new Image();
	img.src = sprite[cnt % 2];
	
	if ( cnt == 0 ) {
        img.onload = function () {
		    ctx.drawImage(img, position.getX(), position.getY()-19);
        }
	}
	
	if (cnt >= 1) {		
		ctx.fillStyle = canvas_background;
		ctx.fillRect(position.getX(), position.getY()-20,gorilla_width, gorilla_height);
        img.onload = function () {
		    ctx.drawImage(img, position.getX(), position.getY());		
        }
		return;
	}
	
   	setTimeout( function () {
		_shoot_gesture(ctx, sprite, position, cnt+1);
   	},  victory_timeout);		
	
}   

// ---------------------------------------------------------------------------   

/*
 * Return values for detect_collision:
 * 0: No collision
 * 1: Collision with player 1
 * 2: Collision with player 2
 * 3: Collision with building
 *
   * Direction: Same decode as shoot_banana(), 0 LR, 1 RL
   */
function detect_collision(ctx, position, direction) {
   	// test for building collision
   	var i=0;
   	for (i=0; i<buildings.length; i++) {
   		var x = i * (max_building_width + building_spacing);
   		var y = buildings[i];
        
   		if ( (position.getX()+banana_width >= x) && (position.getY()+banana_height >= y) && (position.getX() <= (x + max_building_width) ) ) {
   			return 3;
   		}
   	}
   	
   	// test player 1 collision
    if ( ( position.getX()+banana_width >= p1_center_pos.getX() ) && (position.getY()+banana_height >= p1_center_pos.getY()) && (position.getX() <= (p1_center_pos.getX() + gorilla_width) ) ) {   				
   		return 1;
   	}  		
    
    // test player 2 collision
    if ( ( position.getX()+banana_width >= p2_center_pos.getX() ) && (position.getY()+banana_height >= p2_center_pos.getY())  && (position.getX() <= (p2_center_pos.getX() + gorilla_width) )) {   				
   		return 2;
   	}  
   	
   	return 0;	
}   

// ---------------------------------------------------------------------------   

/*
  Shoot a banana from x, y
  direction: 0 = LR, 1 = RL
*/
function shoot_banana(ctx, angle, position, gravity, speed, wind, direction) {
   	var t=0;
   	var p_position = new Position(-20, -20);
   	var x = position.getX();
   	var y = position.getY();
   	y -= banana_height;
   	
   	if (direction == 1) {
   		x -= banana_width;
   		//speed = -1 * speed;
   	}
   	
   	var pos = new Position(x,y);
   	var ls = 6 * Math.log(speed);
   	
   	_move_banana(ctx, angle, 0, t, pos, p_position, gravity, ls, wind, direction, 1);
}

// ---------------------------------------------------------------------------   

/*
  Worker func for shoot_banana
  direction: 0 = LR, 1 = RL
*/         
function _move_banana(ctx, angle, banana_index, t, position, p_position, gravity, speed, wind, direction, no_collision) {
    
   	var x = position.getX();
   	var y = position.getY();
   	var px = p_position.getX();
   	var py = p_position.getY();   		
    
   	var radians = ((90-angle) * Math.PI) / 180;
   	
   	// right-left
   	if ( direction == 1 ) {
   		radians = ( (angle-90) * Math.PI ) / 180;
   	} 
   	
	var speedY = (speed * Math.cos(radians)) * 0.6;
	var speedX = Math.round(speedX = (speed * Math.sin(radians)));	
    
	speedX =  Math.abs(Math.round(speedX));
	
	/*
	  I tried subtracting the wind directly, but it did not work as expected.
	  Floating points seem to ignore the sign, whatever - bruteforce.
	*/
	
	if ( direction == 1 ) {		
		speedX -= Math.abs(Math.round(wind));
		speedX = -1 * speedX;
	}
	else {
		speedX += Math.abs(Math.round(wind)); 
	}
   	
   	if ( banana_index > 3 ) {
   		banana_index = 0
   	}
   	
   	draw_banana(ctx, banana_index, position, p_position); 
   	
   	if ( (x > canvas_width) || (x <= 0)  ) {
      	// beyond canvas - miss
   		return;
   	}
   	
	var col_code = 0;
   	if ( !no_collision && (col_code = detect_collision(ctx, position)) ) {
   	    
   		if (col_code == 2) {
   			p1_score++;
   			set_score(1, p1_score);
   			victory_dance(ctx, 1);
			if ( (players == 1) && (cpu_play_timeout_id) ) {
				clearTimeout(cpu_play_timeout_id);
				$('#divcommandplayer1').show();
			}    
		}
		
		if (col_code == 1) {
   			p2_score++;
   			set_score(2, p2_score);
   			victory_dance(ctx, 2);	   				
		}   			
   		
   		if ( direction == 0 ) {
   			// LR -> explosion must happen to the left of point, to cover banana
   			var pex = new Position( position.getX()+(banana_width/2), position.getY() + (banana_width/2) );
   			if ( position.getX() < p2_center_pos.getX() ) {
				cpu_play_gauge = ( p2_center_pos.getX() / position.getX() );   				
   			}
   			else if (position.getX() > p2_center_pos.getX()) {
   				cpu_play_gauge = ( position.getX() / p2_center_pos.getX() );  ; 
   			}
   			explode(ctx, pex, col_code);	
   		}
   		else {
   			var pex = new Position( position.getX()+(banana_width/2), position.getY()+ (banana_width/2)   );
   			explode(ctx, pex, col_code);	
   		}
   		
   		return;
   	}   		
   	
   	// prepara proxima iteracao
   	// "loop assincrono", chamando proxima iteracao via timeout
   	t += delta_t;
   	y += ( (-1 * (speedY * t ) ) + ( .5 * global_gravity * (t * t) ) );
   	
   	if ( direction == 1 ) {
   		if ( speedX > 0 ) {
   			x -= speedX * t * .5;
   		}
   		else {
   			x += speedX * t * .5;
   		}
   	}
   	else {
   		x += speedX * t * .5;
   	}
   	
   	var newpos = new Position(x, y);
   	
   	setTimeout( function () {
   		_move_banana(ctx, angle, ++banana_index, t, newpos, position, gravity, speed, wind, direction);
   	},  draw_timeout);
}   

// ---------------------------------------------------------------------------   

/*
  Some object definitions, though almost none of this is object-oriented.
*/     

function Position(x, y) {
    this.x = x;
    this.y = y;
    return this;
}

Position.prototype.getX = function () {
    return this.x;
}

Position.prototype.getY = function () {
    return this.y;
}

Position.prototype.setX = function (x) {
    this.x = x;
    return this;
}

Position.prototype.setY = function (y) {
    this.y = y;
    return this;
}

// ---------------------------------------------------------------------------   

/*
  Various event handlers
*/       

function cpu_play() {
   	
   	var speed = 55;
   	var angle   = 45;
   	var abswind = Math.abs(wind_speed);
    
   	if (player1_last_speed > 0) {
   		if ( cpu_play_gauge ) {
   			speed = cpu_play_gauge * player1_last_speed;
   		}
   	}
   	
   	if ( wind_speed > 0 ) {
   		speed += abswind;
   	}
   	else {
   		speed -= wind_speed;
   	}
   	
	$('#divcommandplayer1').show();
	
	show_status("P2 Banana!");  
	shoot_gesture(ctx, 2);
	shoot_banana(ctx, angle, p2_center_pos, global_gravity, speed, wind_speed, 1);   
}

function button_click_p1() {
    
    $('#divcommandplayer1').hide();
   	if (players == 2) {
	    $('#divcommandplayer2').show();
    }
    
    var angle = $('#angle_input_p1').val();
    var speed = $('#speed_input_p1').val();
    
    player1_last_speed = speed;
    player1_last_angle  = angle;
    
    show_status("P1 Banana! ANGLE " + angle + " VEL " + speed);
    shoot_gesture(ctx, 1);
    shoot_banana(ctx, angle, p1_center_pos, global_gravity, speed, wind_speed, 0);
    
	if ( players == 1 ) {
		cpu_play_timeout_id = setTimeout(cpu_play, cpu_play_timeout);
	}    
    
}

function button_click_p2() {
    $('#divcommandplayer1').show();
    $('#divcommandplayer2').hide();   
    var angle = $('#angle_input_p2').val();
    var speed = $('#speed_input_p2').val();
    show_status("P2 Banana! ANGLE " + angle + " VEL " + speed);  
    shoot_gesture(ctx, 2);
   	shoot_banana(ctx, angle, p2_center_pos, global_gravity, speed, wind_speed, 1);  
}

function button_click_reset() {
    scenario_reset();
}

function button_click_newgame() {
 	new_game();
}  

function preload_images() {
    for (var arr in all_images) {
        for (var img in arr) {
            $("<img/>")[0].src = img;
        }
    }
}

// ---------------------------------------------------------------------------   

/*
  Hook up the event handlers
  Start the game.
*/      

$(function () {
    preload_images();
    $('#button_input_p1').click(button_click_p1); 
    $('#button_input_p2').click(button_click_p2); 
    $('#button_reset').click(button_click_reset);
    $('#button_newgame').click(button_click_newgame); 
    main(); // entry point
});




// ---------------------------------------------------------------------------   

/*
 * END GORILLAS.JS
 */
