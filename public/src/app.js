import io from 'socket.io-client';
import Game from './game.js';
import './style.scss';

const socket = io.connect('https://tank3d.herokuapp.com/');
const wrapper = document.getElementById('game-wrapper');
const nameWrapper = document.getElementById('name-wrapper');
const startBtn = document.getElementById('startBtn');
const name = document.getElementById('name');

const game = new Game(socket, wrapper);

const tanFOV = Math.tan(((Math.PI / 180) * game.camera.fov / 2));
const clientHeight = 450;

game.camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (wrapper.clientHeight / clientHeight));
game.camera.updateProjectionMatrix();

window.addEventListener('resize', () => {
  const height = wrapper.clientHeight;
  const width = wrapper.clientWidth;

  game.camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (height / clientHeight));

  game.renderer.setSize(width, height);
  game.camera.aspect = width / height;
  game.camera.updateProjectionMatrix();
});

startBtn.addEventListener('click', () => {
  if (name.value.length > 0) {
    game.start(name.value);
    nameWrapper.style.display = 'none';
  }
});
