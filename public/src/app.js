import io from 'socket.io-client';
import * as THREE from 'three';
import Game from './game.js';
import './style.scss';

const socket = io.connect('http://localhost:1993/');
const wrapper = document.getElementById('game-wrapper');
const nameWrapper = document.getElementById('name-wrapper');
const startBtn = document.getElementById('startBtn');
const name = document.getElementById('name');

const game = new Game(socket, wrapper);

window.addEventListener('resize', () => {
  const height = wrapper.clientHeight;
  const width = wrapper.clientWidth;

  game.renderer.setSize(width, height);
  game.camera.aspect = width / height;
  game.camera.position.y = height * 0.6;
  game.camera.updateProjectionMatrix();
});

startBtn.addEventListener('click', () => {
  if (name.value.length > 0) {
    game.start(name.value);
    nameWrapper.style.display = 'none';
  }
});
