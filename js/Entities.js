 //player
 var player;
 var playerWidth = 50;
 var playerHeight = 70;
 var playerSpeed = 10;

var enemyList = {};
var upgradeList = {};
var bulletList = {};

 Entity = function (type, id, x, y, spdX, spdY, width, height, img) {
     var self = {
         type: type,
         id: id,
         x: x,
         y: y,
         spdX: spdX,
         spdY: spdY,
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

         ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height );
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


     self.UpdatePosition = function () {
         self.x += self.spdX;
         self.y += self.spdY;

         if (self.x > WIDTH || self.x < 0) {
             self.spdX = -self.spdX;
         }
         if (self.y > HEIGHT || self.y < 0) {
             self.spdY = -self.spdY;
         }
     }

     return self;
 }
 Player = function () {
     var self = Actor('player', 'player.id', 50, 30, 40, 5, playerWidth, playerHeight, Img.player, HEALTH, 1);
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
         if (self.x > WIDTH - self.width / 2) {
             self.x = WIDTH - self.width / 2;
         }
         if (self.y < self.height / 2) {
             self.y = self.height / 2;
         }
         if (self.y > HEIGHT - self.height / 2) {
             self.y = HEIGHT - self.height / 2;
         }
     }

     var super_update = self.Update;

     self.Update = function(){
         super_update();
         if (self.hp <= 0) {
         var timeSurvived = Date.now() - timeWhenGameStarted;
         console.log('Your score is ' + timeSurvived);
         StartNewGame();
     }
     }

     return self;

 }
 Actor = function (type, id, x, y, spdX, spdY, width, height, img, hp, attackSpeed) {
     var self = Entity(type, id, x, y, spdX, spdY, width, height, img);

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


     return self;
 }

 // Enemy
 Enemy = function (id, x, y, spdX, spdY, width, height) {
     var self = Actor('enemy', id, x, y, spdX, spdY, width, height, Img.enemy, 10, 1);
     
     var super_update = self.Update;
     
     self.Update = function(){
         super_update();
         self.PerformAttack();

         var isColliding = player.TestCollision(self);

         if (isColliding) {
             player.hp -= 1;

         }
     }

     enemyList[id] = self;
 }

 //Randomly Enenmy
 RandomlyGenerateEnemy = function () {

     var id = Math.random();
     var x = Math.random() * WIDTH / 2;
     var y = Math.random() * HEIGHT / 2;
     var spdX = 5 + Math.random() * 5;
     var spdY = 5 + Math.random() * 5;
     var width = 64;//10 + Math.random() * 30;
     var height = 64;//10 + Math.random() * 30;

     Enemy(id, x, y, spdX, spdY, width, height);
 }


 Upgrade = function (id, x, y, spdX, spdY, width, height, img, category) {
     var self = Entity('upgrade', id, x, y, spdX, spdY, width, height, img);
     console.log(self.id);
     var super_update = self.Update;
     self.Update = function () {
         super_update();

         var isColliding = player.TestCollision(self);

         if (isColliding) {

             if (self.category === 'score') {
                 score += 1000;
             }
             if (self.category === 'attack-speed') {
                 player.attackSpeed += 3;
             }
             console.log(self.id);
             delete upgradeList[self.id];
         }
       
     }

     self.category = category;
     upgradeList[id] = self;
 }

 //Randomly Upgrade
 RandomlyGenerateUpgrade = function () {

     var x = Math.random() * WIDTH;
     var y = Math.random() * HEIGHT;
     var width = 32;
     var height = 32;
     var id = Math.random();
     var spdX = 0;
     var spdY = 0;

     if (Math.random() < 0.5) {
         var category = 'score';
         var img = Img.upgrade1;
     } else {
         var category = 'attack-speed';
         var img = Img.upgrade2;
     }

     Upgrade(id, x, y, spdX, spdY, width, height, img, category);
 }

 // Bullet
 Bullet = function (id, x, y, spdX, spdY, width, height) {
     var self = Actor('bullet', id, x, y, spdX, spdY, width, height, Img.bullet, 0, 0);

     self.timer = 0;

     var super_update = self.Update;
     self.Update = function () {
         super_update();
         var toRemove = false;
         self.timer++;

         if (self.timer > 75) {
             toRemove = true;
         }

         for (var enemyKey in enemyList) {
             /*  var isColliding = self.TestCollision(enemyList[enemyKey]);
               if (isColliding) {
                   toRemove = true;
                   delete enemyList[enemyKey];
                   break;
               }*/
         }

         if (toRemove) {
             delete bulletList[self.id];
         }
     }

     bulletList[id] = self;
 }

 //Randomly Bullet
 GenerateBullet = function (actor, overwriteAngle) {
     var x = actor.x;
     var y = actor.y;
     var height = 32;
     var width = 32;
     var id = Math.random();

     var angle;
     if (overwriteAngle !== undefined) {
         angle = overwriteAngle;
     } else {

         angle = actor.aimAngle;
     }

     var spdX = Math.cos(angle / 180 * Math.PI) * 5;
     var spdY = Math.sin(angle / 180 * Math.PI) * 5;

     Bullet(id, x, y, spdX, spdY, width, height);
 }