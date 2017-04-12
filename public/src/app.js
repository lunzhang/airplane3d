import './style.scss';
import Game from './game.js';
import io from 'socket.io-client';

(function(){
  const socket = io.connect('http://localhost:80');
  const wrapper = document.getElementById('game-wrapper');
  const game = new Game(socket,wrapper);

  window.addEventListener('resize',function(){
      let height = wrapper.clientHeight;
      let width = wrapper.clientWidth;
      game.renderer.setSize(width,height);
      game.camera.aspect = width/height;
      game.camera.updateProjectionMatrix();
  });

  window.game = game;

})();
