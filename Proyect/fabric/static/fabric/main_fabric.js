 const DIRECTIONS = {
    N : {left: 0, top: -1},
    S: {left: 0, top: 1},
    W: {left: -1, top: 0},
    E : {left: 1, top: 0},
    none : {left: 0, top: 0}
};
 const ORIENTATION = {
     HORIZONTAL : 1,
     VERTICAL: 0,
 };
 const FPS = 5;

class Game{
    static canvas;
    player;
    constructor(_canvas, _player){
        this.canvas = _canvas;
        this.player = _player;
    }
}

class Hitbox{
    // Rectangle hitbox, point1 is top left point of the rectangle
    // point2 is bottom right point.
    point1 = {x:0, y:0};
    point2 = {x:0, y:0};

    constructor(_x, _y, width, height){
        this.point1 = {x: _x, y: _y};
        this.point2 = {x: _x + width, y: _y + height}
    }

    collided_with(other_hitbox){
        if(this.point1.x > other_hitbox.point2.x || other_hitbox.point1.x > this.point2.x)
            return false;
        if(this.point1.y > other_hitbox.point2.y || other_hitbox.point1.y > this.point2.y)
            return false;
        return true;
    }
}

class Player{
    hitbox;
    velocity = 0.1;
    render = null;
    constructor(render) {
        this.render = render;
        this.hitbox = new Hitbox(render.top, render.left,
                                render.width, render.height);
    }
}

// TODO make a parent class for Enemy and Player
class Enemy{
    hitbox;
    velocity = 1;
    render = null;
    direction = DIRECTIONS.none;
    constructor(render) {
        this.velocity = fabric.util.getRandomInt(1,10)/10 + this.velocity;
        this.render = render;
        this.hitbox = new Hitbox(render.top, render.left,
            render.width, render.height);
    }

    should_despawn(canvas){
        if(this.render.top < 0 || this.render.top > canvas.height){
            return true
        }else if(this.render.left < 0 || this.render.left > canvas.width){
            return true
        }
        return false;
    }

    move(){
        let direction = {left: this.direction.left, top: this.direction.top};
        direction.left *= this.velocity;
        direction.left += this.render.left;
        direction.top *= this.velocity;
        direction.top += this.render.top;
        this.render.set(direction);

    }

    set_direction(orientation){

       if(orientation == ORIENTATION.HORIZONTAL) {
           this.direction = this.render.left == 0 ? DIRECTIONS.E : DIRECTIONS.W;
       }else if(orientation == ORIENTATION.VERTICAL){
            this.direction = this.render.top == 0 ? DIRECTIONS.S : DIRECTIONS.N;
        } else{
           this.direction = DIRECTIONS.none;
       }
    }
}

class EnemyFactory{
    static enemies = [];
    static timer = 30; //how many frames until it generates an enemy
    static timer_copy = 30;

    static generate_enemies(canvas, amount){
        for(;amount > 0; amount--){
            let rand_radius = fabric.util.getRandomInt(15, 5);
            let rand_coordinates = EnemyFactory.get_random_coordinates(canvas);
            let render = new fabric.Circle({
                radius: rand_radius,
                left: rand_coordinates.left,
                top: rand_coordinates.top
            });

            let enemy = new Enemy(render);
            enemy.set_direction(rand_coordinates.orientation);
            canvas.add(enemy.render);
            canvas.renderAll();

            EnemyFactory.enemies.push(enemy);
        }
    }

    static get_random_coordinates(canvas){
        let side = fabric.util.getRandomInt(0,1);
        if(side){
            return {left: fabric.util.getRandomInt(0, canvas.width), top: fabric.util.getRandomInt(0,1) ? 0 : canvas.height-10, orientation: ORIENTATION.VERTICAL}
        }else{
            return {left: fabric.util.getRandomInt(0,1) ? 0 : canvas.width, top: fabric.util.getRandomInt(0, canvas.height-10), orientation: ORIENTATION.HORIZONTAL}
        }
    }
}

function createHexagon(){
    let hexagon = new fabric.Polygon(
        [
            { x: 10, y: 10},
            { x: 20, y: 10},
            { x: 27.07, y: 17.07},
            { x: 27.07, y: 27.07},
            { x: 20, y: 34.14},
            { x: 10, y: 34.14},
            { x: 2.93, y: 27.07},
            { x: 2.93, y: 17.07},
            { x: 10, y: 10}

        ],
            {
                stroke: 'pink',
                fill: 'magenta',
                left: 100,
                top: 100
            }
    );

    hexagon.scale(2);

    return hexagon;
}

function resizeCanvas(canvas, height = window.innerHeight, width = window.innerWidth) {
        canvas.setHeight(height);
        canvas.setWidth(width);
        canvas.renderAll();
}

function configureCanvas(json_string=null){
    let canvas;
    if(json_string){
        canvas = new fabric.StaticCanvas('canvas');
        canvas.loadFromJSON(json_string);
    }else{
        canvas = new fabric.StaticCanvas('canvas', {
            backgroundColor : "#44f"
        });
    }
    resizeCanvas(canvas);

    return canvas;
}

function onKeyDown(event) {
    let keyCode = event.code;
    let dir = {left: 0, top: 0};
    switch (keyCode) {
        case "KeyD": //d
            dir = {left: 1, top: 0};
            break;
        case "KeyS": //s
            dir = {left: 0, top: 1};
            break;
        case "KeyA": //a
            dir = {left: -1, top: 0};
            break;
        case "KeyW": //w
            dir = {left: 0, top: -1};
            break;
    }

    return dir;
}

function inputs(game){
    window.addEventListener("keydown", (event) => {
        let velocity = game.player.velocity;
        let direction = onKeyDown(event);
        direction.left *= velocity;
        direction.left += game.player.render.left;
        direction.top *= velocity;
        direction.top += game.player.render.top;

        game.player.render.set(direction);
        game.canvas.renderAll();
    }, false);
}

function move_generate_enemies(game){
    if(EnemyFactory.timer < 0) {
        EnemyFactory.generate_enemies(game.canvas, 1);
        EnemyFactory.timer = EnemyFactory.timer_copy;
    }else {
        EnemyFactory.timer -= 1;
    }

    EnemyFactory.enemies.forEach((enemy) => {
        enemy.move();
        if(enemy.should_despawn(game.canvas)){
            let index = EnemyFactory.enemies.indexOf(enemy);
            EnemyFactory.enemies.splice(index, 1);
        }
    });
}

function game_loop(game){
    inputs(game);
    move_generate_enemies(game);

    game.canvas.renderAll();
}

function game_setup(canvas){
    let hexagon = createHexagon();
    let player = new Player(hexagon);
    let game = new Game(canvas, player);
    canvas.add(player.render);
    return game;
}

const main = () => {
    alert("Dodge the blacks circles! Move with the WASD keys");
    $('#pdf_btn').toggleClass('disabled');
    $('#save_btn').toggleClass('disabled');
    $('#pdf_btn').prop('disabled', function(i, v) { return !v; });
    $('#save_btn').prop('disabled', function(i, v) { return !v; });
    let json_string = $("#main_fabric").attr("data-json_string");
    let canvas = configureCanvas(json_string);
    Game.canvas = canvas;
    let game;
    if(json_string == "") {
        game = game_setup(canvas);
    }else{
        //BUG must make a method to obtain a new Game if json_string is given
        game = null;
    }
    setInterval(() => {game_loop(game)}, 1000/FPS);
};



 // Setup ajax connections safetly

 function csrfSafeMethod(method) {
     // these HTTP methods do not require CSRF protection
     return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
 }

function serialize(){
    const api_url = "/api/save/";
    const csrf_token = $.cookie("csrftoken");
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        }
    });
    $.ajax({
        url: api_url,
        type: 'POST',
        datatype: 'json',
        data: {'saved_data': JSON.stringify(Game.canvas), 'csrfmiddlewaretoken': csrf_token},
        success: function( data, textStatus, jQxhr ){
            alert("success! You may reload this game in " + window.location.href + data.id)
        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log( errorThrown );
            alert( errorThrown );
        }
    });
}