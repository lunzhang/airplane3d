import './style.scss';
import Game from './game.js';

(function(){
  const wrapper = document.getElementById('game-wrapper');
  const game = new Game(wrapper);
  window.game = game;
})();
