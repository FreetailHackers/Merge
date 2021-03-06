export default function getRandomElement (array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomElements (array, numberOfElements) {
  return new Array(numberOfElements).fill(0).map(_ => getRandomElement(array));
}
