/*var timeSurvived = Date.now() - timeWhenGameStarted;
console.log('Your score is ' + timeSurvived);
StartNewGame();*/
 
 
 var player;
 var playerWidth = 50;
 var playerHeight = 70;
 var playerSpeed = 10;

var enemyList = {};
var upgradeList = {};
var bulletList = {};

 Entity = function (type, id, x, y, width, height, img) {
     var self = {
         type: type,
         id: id,
         x: x,
         y: y,
         width: width,
         height: height,
         img: img
     };

     self.Update = function () {
         self.UpdatePosition();
         self.Draw();
     }

     self.Draw = function () {
         ctx.save();
         var x = self.x - player.x;
         var y = self.y - player.y;

        x += WIDTH/2;
        y += HEIGHT/2;

        x -= self.width/2;
        y -= self.height/2; 

         ctx.drawImage(self.img, 0, 0, self.img.width, 
                       self.img.height, x, y, self.width, 
                       self.height);
         ctx.restore();
     }

     self.GetDistance = function (entity2) {
         var vx = self.x - entity2.x;
         var vy = self.y - entity2.y;

         return Math.sqrt(vx * vx + vy * vy);
     }

     self.TestCollision = function(entity2){ 
         var rect1 = {
                 x:self.x-self.width/2,
                 y:self.y-self.height/2,
                 width:self.width,
                 height:self.height
         }
         var rect2 = {
                 x:entity2.x-entity2.width/2,
                 y:entity2.y-entity2.height/2,
                 width:entity2.width,
                 height:entity2.height
         }
         return TestCollisionRectRect(rect1,rect2);
        
 }


     self.UpdatePosition = function(){

     }

     return self;
 }
 Player = function () {
     var self = Actor('player', 'player.id', 50, 30, playerWidth, playerHeight, Img.player, HEALTH, 1);
     //
     self.pressingDown = false;
     self.pressingUp = false;
     self.pressingLeft = false;
     self.pressingRight = false;

     self.UpdatePosition = function () {
         if (self.pressingRight) {
             self.x += playerSpeed;
         }
         if (self.pressingDown) {
             self.y += playerSpeed;
         }
         if (self.pressingLeft) {
             self.x -= playerSpeed;
         }
         if (self.pressingUp) {
             self.y -= playerSpeed;
         }

         //isPositionValid

         if (self.x < self.width / 2) {
             self.x = self.width / 2;
         }
         if (self.x > currentMap.width - self.width / 2) {
             self.x = currentMap.width - self.width / 2;
         }
         if (self.y < self.height / 2) {
             self.y = self.height / 2;
         }
         if (self.y > currentMap.height - self.height / 2) {
             self.y = currentMap.height - self.height / 2;
         }
     

         self.OnDeath = function(){
            var timeSurvived = Date.now() - timeWhenGameStarted;
            console.log('Your score is ' + timeSurvived);
            StartNewGame();
         }
     }

     return self;

 }
 Actor = function (type, id, x, y, width, height, img, hp, attackSpeed) {
     var self = Entity(type, id, x, y, width, height, img);

     self.hp = hp;
     self.attackSpeed = attackSpeed;
     self.attackCounter = 0;
     self.aimAngle = 0;

     var super_update = self.Update;

     self.Update = function () {
         super_update();
         self.attackCounter += self.attackSpeed;
     }

     self.PerformAttack = function () {
         if (self.attackCounter > 25) {	//every 1 sec
             self.attackCounter = 0;
             GenerateBullet(self);
         }
     }
     self.PerformSpecialAttack = function () {

         if (self.attackCounter > 50) {
             self.attackCounter = 0;
             /* for(var angle = 0; angle < 360; angle++){
                 GenerateBullet(player, angle);
             }*/
             GenerateBullet(self, self.aimAngle - 5);
             GenerateBullet(self, self.aimAngle);
             GenerateBullet(self, self.aimAngle + 5);
         }

     }

     self.OnDeath = function(){};

     return self;
 }

 // Enemy
 Enemy = function (id, x, y,  width, height, img, hp, attackSpeed) {
     var self = Actor('enemy', id, x, y, width, height, img, hp, attackSpeed);
     enemyList[id] = self;

     var super_update = self.Update;
     
     self.Update = function(){
         super_update();
         self.UpdateAim();
     }

     self.UpdateAim = function(){
         var diffX = player.x - self.x;
         var diffY = player.y - self.y;

         self.aimAngle = Math.atan2(diffY, diffX) / Math.PI * 180;
     }

     self.UpdatePosition = function(){
        var diffX = player.x - self.x;
        var diffY = player.y - self.y;

        if(diffX > 0)
            self.x += 3;
        else
            self.x -= 3;

        if(diffY > 0)
            self.y += 3;
        else
            self.y -= 3;

    }

    self.OnDeath = function(){
        console.log(enemyList[key]);
        console.log(JSON.stringify[enemyList]);
        delete enemyList[key];
    }
 }

 //Randomly Enenmy
 RandomlyGenerateEnemy = function () {

	 
    var id = Math.random();
     var x = Math.random() * currentMap.width ;
     var y = Math.random() * currentMap.height;
     var width = 64;
     var height = 64;

     Enemy(id, x, y, width, height, Img.enemy, 10, 1);
 }


 Upgrade = function (id, x, y, width, height, img, category) {
     var self = Entity('upgrade', id, x, y, width, height, img);
     
     
     var super_update = self.Update;
     self.Update = function () {
         super_update();
     }

     self.category = category;
     upgradeList[id] = self;
 }

 //Randomly Upgrade
 RandomlyGenerateUpgrade = function () {

     var x = Math.random() * currentMap.width;
     var y = Math.random() * currentMap.height;
     var width = 32;
     var height = 32;
     var id = Math.random();
     

     if (Math.random() < 0.5) {
         var category = 'score';
         var img = Img.upgrade1;
     } else {
         var category = 'attack-speed';
         var img = Img.upgrade2;
     }

     Upgrade(id, x, y, width, height, img, category);
 }

 // Bullet
 Bullet = function (id, x, y, spdX, spdY, width, height, combatType) {
     var self = Entity('bullet', id, x, y, width, height, Img.bullet);

     self.timer = 0;
     self.combatType = combatType;
     self.spdX = spdX;
     self.spdY = spdY;

     var super_update = self.Update;

     self.UpdatePosition =  function () {
        self.x += self.spdX;
        self.y += self.spdY;
    
        if (self.x > currentMap.width || self.x < 0) {
            self.spdX = -self.spdX;
        }
        if (self.y > currentMap.height || self.y < 0) {
            self.spdY = -self.spdY;
        }
    }

    bulletList[id] = self;
 }

 //Randomly Bullet
 GenerateBullet = function (actor, overwriteAngle) {
     var x = actor.x;
     var y = actor.y;
     var height = 16;
     var width = 16;
     var id = Math.random();

     var angle;
     if (overwriteAngle !== undefined) {
         angle = overwriteAngle;
     } else {

         angle = actor.aimAngle;
     }

     var spdX = Math.cos(angle / 180 * Math.PI) * 5;
     var spdY = Math.sin(angle / 180 * Math.PI) * 5;

     Bullet(id, x, y, spdX, spdY, width, height, actor.type);
 }

