import React, { useState, useMemo, useLayoutEffect } from "react";
import { DragDropContext} from "react-beautiful-dnd";
import useAutoMoveSensor from "../lib/useAutoMoveSensor";
//import { GameState } from "../types/game";
import { checkCorrect, preloadImage} from "../lib/studyItems";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/board.module.scss";

import supabase from "./config/supabaseClient";


export default function StudyBoard(props) {
    // eslint-disable-next-line
  const { highscore, resetGame, state, setState, updateHighscore, keys, email} = props;

  const [isDragging, setIsDragging] = useState(false);
  const [correctness,setCorrectness] = useState(state.played.length);
  const [idCorr, setIdCorr] = useState([])
  const [ids,setIds] = useState([])
  // eslint-disable-next-line
  const [reset,setReset] = useState(false)
  
  async function onDragStart() {
    setIsDragging(true);
    navigator.vibrate(20);
  }
  async function updateBestScore(dict){
    for(let i=0; i<ids.length; i++){
      console.log(ids[i]['id'])
      dict['nextList'][ids[i]['id']] = 1;
    }
    dict['playedList'][keys]['bestScore'] = Math.max(correctness,dict['playedList'][keys]['bestScore']);
    console.log(correctness,state.played.length);
    //dict['playedList'][keys]['correct'] = Math.max(Math.floor((correctness/(state.played.length-1))*100),dict['playedList'][keys]['correct']);
    const {data,error} = await supabase.from('userQuestions').update({'playedList':dict['playedList'],'nextList':dict['nextList']}).eq('email',email).select();
    console.log(data);
    console.log(error);
  }
  
  const saveProgress=async()=>{
    // eslint-disable-next-line
    const {data,error}= await supabase.from('userQuestions').select('*').eq('email',email);
    
    const finalResult = data[0];

    updateBestScore(finalResult);
    window.alert("Progress saved, refresh the main-menu to see updated scores.");
  };
  async function resetCards(){
    //window.alert("Please refresh")
    // eslint-disable-next-line
    const {data,error} = await supabase.from('ourWorld').select('*').eq('suffix',state.played[0]['suffix'])
    getQueIds(data);
  }
  async function getQueIds(dat){
    // eslint-disable-next-line
    const {data,error}= await supabase.from('userQuestions').select('*').eq('email',email);
    let dict = data[0];
    for(let i=0; i<dat.length; i++){
      dict['nextList'][dat[i]['id']] = 0;
    }
    dict['playedList'][state.played[0]['suffix']]['bestScore'] = 0;
    doingFinalUpdate(dict);
  }
  async function doingFinalUpdate(dict){
    const {data,error} = await supabase.from('userQuestions').update({'playedList':dict['playedList'],'nextList':dict['nextList']}).eq('email',email).select();
    if(data.length!==0){
      setReset(true);
      window.location.reload();
    }
    console.log(data);
    console.log(error);

  }
  async function setthecorrectness(correct,id){
     // eslint-disable-next-line
    const {data,error} = await supabase.from('userQuestions').select('*').eq('email',email);
    let dict2 = data[0];
    updateCorrectness(dict2,correct,id);
  }
  async function updateCorrectness(dict2,correct,id){
    dict2['nextList'][id] = correct
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;
    dict2['date'][id] = today;
    console.log(dict2['nextList'][id])
    console.log(dict2['date'][id])
     // eslint-disable-next-line
    const {data,error} = await supabase.from('userQuestions').update({'nextList':dict2['nextList'],'date':dict2['date']}).eq('email',email).select();
  }
  async function onDragEnd(result) {
    setIsDragging(false);

    const { source, destination } = result;

    if (
      !destination ||
      state.next === null ||
      (source.droppableId === "next" && destination.droppableId === "next")
    ) {
      return;
    }

    const item = { ...state.next };

    if (source.droppableId === "next" && destination.droppableId === "played") {
      const newDeck = [...state.deck];
      const newPlayed = [...state.played];
      const { correct, delta, correctness } = checkCorrect(
        newPlayed,
        item,
        destination.index
      );
      var y = idCorr;
      y.push(correctness);
      setIdCorr(y);
      console.log(idCorr);
      console.log("correct", correctness);
      setthecorrectness(correctness,item['id'])
      console.log(localStorage.getItem('isSoundOn'));
      if(localStorage.getItem('isSoundOn')===null||localStorage.getItem('isSoundOn')==="true"){
        console.log(localStorage.getItem('isSoundOn'))
        if(correct){
          var audio = new Audio("audio/wrong-answer-129254.mp3");
          audio.play();
        }
        if(!correct){
          var audio1 = new Audio("audio/wrong-answer-126515.mp3");
          audio1.play();
        }
      }
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });
      console.log("played",state.played.length);
      
      let newNext = state.nextButOne;
      if(state.played.length===state.deck.length-2){
        newNext = {
          created_at: null,
          suffix: null,
          id: 0,
          country:"Game ended",
          question: "No more questions",
          year: "this filter, Please refresh",
          code:"none",
          url: null,
          answer: "bye",
        }
        
      }
      let newNextButOne = state.deck[state.played.length+1]
      console.log(state.played.length,state.deck.length-2)
      
      if(state.played.length===state.deck.length-2){
        newNextButOne = {
          created_at: null,
          suffix: null,
          id: 0,
          country:"Game ended",
          question: "No more questions",
          year: "this filter, Please refresh",
          code:"none",
          url: null,
          answer: "bye",
        }
        
      }
      console.log(newNext,newNextButOne);
      //console.log(item)
      if(1){
        setCorrectness(correctness+1);
        console.log(ids)
        var x = ids;
        console.log(typeof x);
        x.push(item)
        setIds(x)
        //console.log(item)
      }
      
      const newImageCache = [preloadImage(newNextButOne.image)];

      setState({
        ...state,
        deck: newDeck,
        imageCache: newImageCache,
        next: newNext,
        nextButOne: newNextButOne,
        played: newPlayed,
        lives: state.lives,
        badlyPlaced: correct
          ? null
          : {
              index: destination.index,
              rendered: false,
              delta,
            },
      });
    } else if (
      source.droppableId === "played" &&
      destination.droppableId === "played"
    ) {
      const newPlayed = [...state.played];
      const [item] = newPlayed.splice(source.index, 1);
      newPlayed.splice(destination.index, 0, item);

      setState({
        ...state,
        played: newPlayed,
        badlyPlaced: null,
      });
    }
    if(state.lives===0){
      if(localStorage.getItem('isSoundOn')===null||localStorage.getItem('isSoundOn')==="true"){
        
          console.log("defeat");
          if(score<5){
            var audio2 = new Audio("audio/sfx-defeat6.mp3");
            audio2.play();
          }
          else if(score<10){
            var audio3= new Audio("audio/level-win-6416.mp3");
            audio3.play();
          }
          else if(score>=10){
            var audio4= new Audio("audio/crowd-cheer-ii-6263.mp3");
            audio4.play();
          }
          
        
      }
      
    }
  }
  

  // Ensure that newly placed items are rendered as draggables before trying to
  // move them to the right place if needed.
  useLayoutEffect(() => {
    if (
      state.badlyPlaced &&
      state.badlyPlaced.index !== null &&
      !state.badlyPlaced.rendered
    ) {
      setState({
        ...state,
        badlyPlaced: { ...state.badlyPlaced, rendered: true },
      });
    }
  }, [setState, state]);

  const score = useMemo(() => {
    return state.played.filter((item) => item.played.correct).length - 1;
  }, [state.played]);

  useLayoutEffect(() => {
    if (score > highscore) {
      updateHighscore(score);
    }
  }, [score, highscore, updateHighscore]);
  return (
    <>
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      sensors={[useAutoMoveSensor.bind(null, state)]}
    >
      <div className={styles.wrapper}>
        
        <div id="bottom" className={styles.bottom}>
         
          <PlayedItemList
            badlyPlacedIndex={
              state.badlyPlaced === null ? null : state.badlyPlaced.index
            }
            isDragging={isDragging}
            items={state.played}
          />
        </div>
        <div className={styles.top}>
          
          
          
              <NextItemList next={state.next} />
              <br />
              <button className="btn btn-secondary rounded-pill" style = {{display:"none"}}onClick={saveProgress}>Save progress</button>
              <button className="btn btn-secondary rounded-pill" onClick={resetCards}>Reset Cards</button>
            
        </div>
      </div>
    </DragDropContext>
    </>
  );
}