import './style.scss';
import Game from './game.js';
import io from 'socket.io-client';

(function(){
  const socket = io();
  const wrapper = document.getElementById('game-wrapper');
  const game = new Game(socket,wrapper);

  const tanFOV = Math.tan( ( ( Math.PI / 180 ) * game.camera.fov / 2 ) );
  const clientHeight = 450;

  game.camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( wrapper.clientHeight / clientHeight ) );
  game.camera.updateProjectionMatrix();

  window.addEventListener('resize',function(){
      let height = wrapper.clientHeight;
      let width = wrapper.clientWidth;

      game.camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( height / clientHeight ) );

      game.renderer.setSize(width,height);
      game.camera.aspect = width/height;
      game.camera.updateProjectionMatrix();
  });

  window.game = game;

})();
