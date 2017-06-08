var synaptic = require('synaptic');

var World = function(io){
  this.io = io;
  this.learningRate = .1;
  this.bots = 3;
  this.tanks = {
    1:{
      name:"bot 1",
      action:[0,0],
      network:new synaptic.Architect.Perceptron(2,10,2),
      reloading:false,
      rotation:{
          _order:"XYZ",
          _x:0,
          _y:0,
          _z:0
      },
      position:{
        x:Math.random() * 300 -150,
        z:Math.random() * 300 -150,
        y:1.5
      }
    },
    2:{
      name:"bot 2",
      action:[0,0],
      network:new synaptic.Architect.Perceptron(2,10,2),
      reloading:false,
      rotation:{
          _order:"XYZ",
          _x:0,
          _y:0,
          _z:0
      },
      position:{
        x:Math.random() * 300 -150,
        z:Math.random() * 300 -150,
        y:1.5
      }
    },
    3:{
      name:"bot 3",
      action:[0,0],
      network:new synaptic.Architect.Perceptron(2,10,2),
      reloading:false,
      rotation:{
          _order:"XYZ",
          _x:0,
          _y:0,
          _z:0
      },
      position:{
        x:Math.random() * 300 -150,
        z:Math.random() * 300 -150,
        y:1.5
      }
    }
  };
};

World.prototype = {
    targetTank:function(tank){
        var target;
        var minDist = 300;
        //finds closest tank
        for(var prop in this.tanks){
          if(prop.length < 2) continue;
          var tempTank = this.tanks[prop];
          var dist = Math.sqrt(Math.pow(tank.position.x - tempTank.position.x,2) + Math.pow(tank.position.z - tempTank.position.z,2));
          if(dist < minDist){
            target = tempTank;
            minDist = dist;
          }
        }
        return target;
    },
    update:function(){
      for(var i = 1;i<=this.bots;i++){
          var bot = this.tanks[i];
          var output = bot.network.activate(bot.action);
          output.forEach(function(o,i){
              output[i] = Math.round(o);
          });
          var target = this.targetTank(bot);
          if(target != undefined){
            var action = [0,0];
            //angle between two positions
            var angleRad = Math.atan2(bot.position.z - target.position.z,target.position.x - bot.position.x);
            //convert angle to 2PI format
            angleRad = angleRad < 0 ? Math.PI * 2 + angleRad : angleRad;
            var diff = Math.abs(angleRad - bot.rotation._y);
            var rotationAngle = diff < .1 ? diff : .1;

            //fire when aimed close to tank
            if(diff < .15 && bot.reloading === false){
                this.io.emit('fire',i);
                bot.reloading = true;
                (function(bot){
                  setTimeout(function(){
                      bot.reloading = false;
                  },3000);
                })(bot);
            }

            //find shortest distance between the two angles
            if( ((diff <= (Math.PI*2) - diff) && (angleRad < bot.rotation._y)) ||
            ((diff > (Math.PI*2) - diff) && (angleRad > bot.rotation._y)) ){
                //turn right
                bot.rotation._y -= rotationAngle;
                //switch to 2PI if less than 0
                if(bot.rotation._y < 0) bot.rotation._y = (Math.PI * 2) + bot.rotation._y;
            }else if( ((diff <= (Math.PI*2) - diff) && (angleRad > bot.rotation._y) ) ||
            ((diff > (Math.PI*2) - diff) && (angleRad < bot.rotation._y)) ){
                //turn left
                bot.rotation._y += rotationAngle;
            }

            //rotation in 0 to 2PI range
            bot.rotation._y = bot.rotation._y % (Math.PI * 2);

            //constant update of tanks position based off rotation
            var dx = Math.cos(bot.rotation._y)*.6;
            var dz = Math.sin(bot.rotation._y)*.6;
            if(bot.rotation._y >= 0 && bot.rotation._y < Math.PI/2){
                //facing front/up
                bot.position.x += dx;
                bot.position.z -= dz;
            }else if(bot.rotation._y >= Math.PI*3/2){
                //facing front/down
                bot.position.x += dx;
                bot.position.z -= dz;
            }else if(bot.rotation._y >= Math.PI && bot.rotation._y < Math.PI *3/2){
                //facing back/down
                bot.position.x += dx;
                bot.position.z -= dz;
            }else if(bot.rotation._y < Math.PI && bot.rotation._y >= Math.PI/2){
                //facing back/up
                bot.position.x += dx;
                bot.position.z -= dz;
            }

            //check tank bounds
            if(bot.position.x > 150){
              bot.position.x = 150;
            }else if(bot.position.x < -150){
              bot.position.x = -150;
            }
            if(bot.position.z > 150){
              bot.position.z = 150;
            }else if(bot.position.z < -150){
              bot.position.z = -150;
            }

            bot.network.propagate(this.learningRate,action);
          }

      }
    },
    hit:function(id){
      var tank = this.tanks[id];
      tank.position.x = Math.random() * 300 -150;
      tank.position.z = Math.random() * 300 -150;
    }
};

module.exports = World;
