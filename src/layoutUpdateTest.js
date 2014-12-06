var NS = "http://www.w3.org/2000/svg";

var objects = [];

var viewport = document.getElementById('viewport');

var svg = document.createElementNS(NS, 'svg');

viewport.appendChild(svg);


for(var i=0; i<100; i++) {
  var newBox = randomBox();
  svg.appendChild(newBox);
  objects.push(newBox);
}

console.log('objects', objects);


gameLoop();


function gameLoop () {
  
  for (var i=0; i<objects.length; i++) {
    objects[i].x.baseVal.value += 1;
    objects[i].y.baseVal.value += 1;
  }
  
  requestAnimationFrame(gameLoop);

}

function randomBox (width, height) {
  var newBox = document.createElementNS(NS, 'rect');
  
  newBox.setAttribute('width' , width  || 100);
  newBox.setAttribute('height', height || 100);

  newBox.setAttribute('x', randomInt(1900));
  newBox.setAttribute('y', randomInt(1000));

  newBox.setAttribute('transform',  'rotate(' + randomInt(360) + ', 50, 50)');

  newBox.style.fill = '#f09';
  
  return newBox;
}


function randomInt (max) {
  return Math.floor(Math.random() * max);
}