import { preloadImage,getRandomItem } from "./items";

export default async function createState(deck,alreadyPlayed) {
  //update("harsh");
  //crete();
  var played = []
  if(alreadyPlayed.length===0)
  { played = [{ ...getRandomItem(deck,alreadyPlayed), played: { correct: true } }];}
  for(let i =0; i<alreadyPlayed.length; i++){
    played.push({...alreadyPlayed[i],played: { correct: true }})
  }
  played.sort(function(a,b){
    return a.answer-b.answer
  })
  //const next = getRandomItem(deck, played);
  const next = deck[0];
  console.log(next);
  //const nextButOne = getRandomItem(deck, [...played, next]);
  const nextButOne = deck[1];
  console.log(nextButOne);
  const imageCache = [preloadImage(next.image), preloadImage(nextButOne.image)];
  //update();
  return {
    badlyPlaced: null,
    deck,
    imageCache,
    lives: 3,
    next,
    nextButOne,
    played,
  };
}
