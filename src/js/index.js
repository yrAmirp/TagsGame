const containerNode = document.querySelector('.tags');
const gameNode = document.querySelector('.game');
const itemNodes = Array.from(containerNode.querySelectorAll('.item'));
const countItems = 16;
const wonTitle = document.querySelector('.won');

if(itemNodes.length !== countItems ) {
  throw new Error(`Количество items in HTML должно быть ровно ${countItems}`);
}

// 1. Initialize position
  itemNodes[countItems - 1].style.display = 'none';
  let matrix = getMatrix(
    itemNodes.map((item)=> Number(item.dataset.matrixId))
  )
  setPositionMatrix(matrix);
  
// 2. Shuffle

  const maxShuffleCount = 50;
  let shuffling = false;
  let timer;
  let shuffleCount = 0;
  document.querySelector('.mix').addEventListener('click',shuffle)

// 3. Change position by click
const blankNumber = 16;
containerNode.addEventListener('click', (event) =>{
  if(shuffling) return
  const buttonNode = event.target.closest('.item');
  if(!buttonNode) return

  const buttonNumber = Number(buttonNode.dataset.matrixId);
  const buttonCoords = findCoordsByNumber(buttonNumber, matrix);
  const blankCoords = findCoordsByNumber(blankNumber, matrix);
  const isValid = isValidForSwap(buttonCoords, blankCoords);

  if(isValid) swap(buttonCoords, blankCoords, matrix);
})

// 4. Change position by arrow
window.addEventListener('keydown', (event) => {
  if(shuffling) return
  if(!event.key.includes('Arrow')) return
  const blankCoords = findCoordsByNumber(blankNumber, matrix);
  const buttonCoords = {
    x: blankCoords.x,
    y: blankCoords.y,
  }
  const direction = event.key.split('Arrow')[1].toLowerCase();
  const maxIndexMatrix = matrix.length-1;
  switch(direction){
    case 'up':
      buttonCoords.y +=1;
      break;
    case 'down':
      buttonCoords.y -=1;
      break;
    case 'left':
      buttonCoords.x +=1;
      break;
    case 'right':
      buttonCoords.x -=1;
      break;
  }
  const isNotValid = ((buttonCoords.x > maxIndexMatrix || buttonCoords.x < 0) || (buttonCoords.y > maxIndexMatrix || buttonCoords.y < 0))
  if(isNotValid){
    return
  }
  swap(buttonCoords, blankCoords, matrix);
})


// Helper functions
function getMatrix(arr){
  const matrix = [[], [], [], []];
  let y = 0;
  let x = 0;
  for(let i = 0; i < arr.length; i++){
    if(x >= 4){
      y++;
      x = 0;
    }
    matrix[y][x] = arr[i];
    x++;
  }
  return matrix
}

function setPositionMatrix(matrix){
  for(let y = 0; y< matrix.length; y++){
    for(let x = 0; x< matrix[y].length; x++){
      const value = matrix[y][x];
      const node = itemNodes[value - 1];
      setNodeStyles(node, x, y);
    }
  }
}

function setNodeStyles(node, x, y){
  const shiftPs = 100;
  node.style.transform = `translate3D(${x*shiftPs}%,${y*shiftPs}%,0)`
}

// function shuffleArray(array){
//   return array
//     .map((value) => ({value, sort:  Math.random() }))
//     .sort((a,b) => a.sort - b.sort)
//     .map(({value}) => value)
// }
let blockCoords = null;
function randomSwap(matrix) {
  const blankCoords = findCoordsByNumber(blankNumber, matrix);
  const validCoords = findValidCoords({
    blankCoords,
    matrix,
    blockCoords,
  });
  const selectCoords = validCoords[
    Math.floor(Math.random() * validCoords.length)
  ];
  swap(blankCoords, selectCoords, matrix);
  blockCoords = blankCoords;
  
  
}
function findValidCoords({blankCoords, matrix, blockCoords}) {
  const validCoords = [];
  for(let y = 0; y < matrix.length; y++){
    for(let x = 0; x < matrix[y].length; x++){
      if(isValidForSwap({x,y}, blankCoords)){
        if(!blockCoords || !(blockCoords.x === x && blockCoords.y === y))
        validCoords.push({x,y})
      }
    }
  }
  return validCoords;
}

function findCoordsByNumber(number, matrix) {
  for(let y = 0; y < matrix.length; y++){
    for(let x = 0; x < matrix[y].length; x++){
      if(matrix[y][x] === number) return {x,y}
    }
  }
  return null;
}

function isValidForSwap(coords1, coords2) {
  const diffX = Math.abs(coords1.x - coords2.x);
  const diffY = Math.abs(coords1.y - coords2.y);
  return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y)
}

function swap(coords1, coords2, matrix) {
  const coords1Number = matrix[coords1.y][coords1.x];
  matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x];
  matrix[coords2.y][coords2.x] = coords1Number;
  setPositionMatrix(matrix);

  if(isWon(matrix)){
    addWonClass();
  }
}
const winFlatArr = new Array(16).fill(0).map((item,idx) => idx+1);
function isWon(matrix){
  const flatMatrix = matrix.flat();
  for(let i = 0; i< winFlatArr.length; i++){
    if(winFlatArr[i] !== flatMatrix[i]) return false;
  }
  return true;
}

const wonClass = 'tagsWon';
function addWonClass(){
  setTimeout(() => {
    containerNode.classList.add(wonClass);
    wonTitle.style.display = 'flex';
    shuffle()
    setTimeout(() => {
      containerNode.classList.remove(wonClass);
      wonTitle.style.display = 'none';
    }, 3000);
  }, 300);
}

function shuffle(){
    if(shuffling) return
    shuffling = true;
    clearInterval(timer);
    gameNode.classList.add('gameShuffle')
      timer = setInterval(() => {
        randomSwap(matrix);
        setPositionMatrix(matrix);

        shuffleCount += 1;
        console.log(shuffleCount);
        
        if(shuffleCount >= maxShuffleCount) {
          gameNode.classList.remove('gameShuffle');
          shuffleCount = 0;
          clearInterval(timer);
          shuffling = false;
        }
      }, 50);
  }
