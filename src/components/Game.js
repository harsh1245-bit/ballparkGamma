import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
//import { GameState } from "../types/game";
//import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./Board";
import Loading from "./Loading";
import Instructions from "./Instructions";
//import badCards from "../lib/bad-cards";
import supabase from "./config/supabaseClient"
import DropDown from "./DropDown";
import JoinRoom from "./JoinRoom";
import CreateRoom from "./CreateRoom";
import Score from "./Score";
import Roomscores from "./Roomscores";
import Button from "./Button";

export default function Game() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [shareText, setShareText] = useState("Share Code");
  const [items, setItems] = useState(null);
  const [createdRoom, setCreatedRoom] = useState(localStorage.getItem("createdRoom")?localStorage.getItem("createdRoom"):"")
  const [questions, setQuestions] = useState(null);
  const [played,setPlayed] = useState(false);
  const [create, setCreate] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  //const [joinedRoom, setJoinedRoom] = useState(false);
  const [countries, setCountries] = useState(new Set(['United States', 'China', 'United Kingdom', 'Germany','Age',
  'Calorie burnt',
  'Cost',
  'Event',
  'Height',
  'Length',
  'Number of users',
  'Speed',
  'Weight', 'Canada', 'India', 'Japan', 'France', 'Russia', 'Italy', 'Switzerland', 'Spain', 'Sweden', 'Netherlands', 'Israel', 'United Arab Emirates', 'Saudi Arabia', 'Belgium', 'Thailand', 'Pakistan', 'Iran', 'Portugal', 'South Korea']));
  const [name,setname] = useState(localStorage.getItem("username")?localStorage.getItem("username"):"")
    const onHandleChange=(ele)=>{
        setname(ele.target.value)
        console.log(ele.target.value)
    }
  //const suffList = ['%','Billion gallons','Fahrenheit','GW.h','Gigawatt-hours','MW','Megawatt-hours','Million units','Terawatt-hours','billion tons','cm','cycles','degree celcius','degree celsius','degree fahrenheit','females','houses','inches','kilo metres','km square','metres','micrograms per cubic metre','million litres','million terajoules','mm','people','thousand tons','tons','years']
  useEffect(() => {

    const fetchQuestion= async ()=>{
      if(!createdRoom){
        const suffs = ['people', '%', 'US $', 'tonnes', 'years','kWh/person','AD',
        'Calories',
        'Feets',
        'USD',
        'kg',
        'mph',
        '$',
 'Cricket facts',
 'Energy facts',
 'Environmental facts',
 'Football facts',
 'Geopolitical facts',
 'Hollywood facts',
 'Music facts',
 'Political facts',
        'years']
      const tag = suffs[Math.floor(Math.random()*suffs.length)]
      console.log(tag);
      const {data, error} = await supabase
      .from('ourWorld')
      .select('*').eq('suffix',tag);
  
      if(error){
          console.log("error")
          
      }
      
      if(data){
        const x =data;
        /*const quesArray = [];
        const  num = Math.floor(Math.random()*suffList.length);
        const reqTag = suffList[num];
        for(let i=0; i<x.length; i++){
          if(x[i].suffix===reqTag){
            quesArray.push(x[i]);
          }
        }*/
        setQuestions(x);
        //console.log(data);
      }
      }
      else{
        // eslint-disable-next-line
        const{data,error} = await supabase.from('gameRoom').select('*').eq("id",createdRoom);
        setQuestions(data[0].ques);
        console.log(data[0].scores[localStorage.getItem("username")]);
        if(data[0].scores[localStorage.getItem("username")] || data[0].scores[localStorage.getItem("username")]===0){
          setPlayed(true);
          console.log(played);
        }

      }
    }
    
    const fetchGameData = async () => {
      const res = await axios.get(
        "https://wikitrivia-data.tomjwatson.com/items.json"
      );
      const items = res.data
        .trim()
        .split("\n")
        .map((line) => {
          return JSON.parse(line);
        })
        // Filter out questions which give away their answers
        .filter((item) => !item.label.includes(String(item.year)))
        .filter((item) => !item.description.includes(String(item.year)))
        .filter((item) => !item.description.includes(String("st century" || "nd century" || "th century")))
        // Filter cards which have bad data as submitted in https://github.com/tom-james-watson/wikitrivia/discussions/2
        ;
      setItems(items);
    };
    const deletion=()=>{
      if(localStorage.getItem("toDelete")){
        console.log(localStorage.getItem("toDelete"))
        deleteGmae(localStorage.getItem("toDelete"))
      }
    }

    fetchGameData();
    fetchQuestion();
    deletion();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const createStateAsync = async() => {
      if (items !== null) {
        setState(await createState(questions));
        setLoaded(true);
        console.log("working")
      }
    };
    
   createStateAsync();
  
    
    
    // eslint-disable-next-line
  }, [questions]);
   const playedRoom =async(code)=>{
    //window.location.reload();
    const{data,error} = await supabase.from('gameRoom').select('*').eq("id",code);
    console.log(localStorage.getItem("username"))
    console.log(data);
    if(data[0].scores[localStorage.getItem("username")] || data[0].scores[localStorage.getItem("username")]===0){
      setPlayed(true);
      console.log(played);
    }
    if(error){
      console.log(error);
    }
    
  }
  const roundingQuestions=(arr)=>{
    const arrNew = arr;
    for(let x=0; x<arrNew.length; x++){
      if(arrNew[x].answer>9999 && arrNew[x].answer<999999){
        arrNew[x].answer = (arrNew[x].answer/1000).toFixed(1);
        //console.log(arrNew[x].answer);
        arrNew[x].answer = arrNew[x].answer*1000;
      }
      else if(arrNew[x].answer>999999 && arrNew[x].answer<999999999){
        arrNew[x].answer = (arrNew[x].answer/1000000).toFixed(1);
        arrNew[x].answer = arrNew[x].answer*1000000;
      }
      else if(arrNew[x].answer>999999999 && arrNew[x].answer<999999999999){
        arrNew[x].answer = (arrNew[x].answer/1000000000).toFixed(1);
        arrNew[x].answer = arrNew[x].answer*1000000000;
      }
      else if(arrNew[x].answer>999999999999 && arrNew[x].answer<999999999999999){
        arrNew[x].answer = (arrNew[x].answer/1000000000000).toFixed(1);
        arrNew[x].answer = arrNew[x].answer*1000000000000;
      }
      
    }
    setQuestions(arrNew);
  }
  const startGame = ()=>{
    const arr = []
    let x = 0;
    const countryArr = Array.from(countries);
    for(let i=0; i<countryArr.length; i++){
      const countr = countryArr[i];
      for(let j=0; j<questions.length; j++){
        if(questions[j].country===countr){
          arr.push(questions[j]);
          //console.log(arr[x]);
          if(arr[x].answer>9999 && arr[x].answer<999999){
            arr[x].answer = (arr[x].answer/1000).toFixed(1);
            //console.log(arr[x].answer);
            arr[x].answer = arr[x].answer*1000;
          }
          else if(arr[x].answer>999999 && arr[x].answer<999999999){
            arr[x].answer = (arr[x].answer/1000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000;
          }
          else if(arr[x].answer>999999999 && arr[x].answer<999999999999){
            arr[x].answer = (arr[x].answer/1000000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000000;
          }
          else if(arr[x].answer>999999999999 && arr[x].answer<999999999999999){
            arr[x].answer = (arr[x].answer/1000000000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000000000;
          }
          x=x+1;
        }
      }
      setQuestions(arr);
      console.log(questions);
    }
    setStarted(true);
  }
  

  const share = useCallback(async () => {
    await navigator?.clipboard?.writeText(
      `🏛️ https://ballpark-gamma.netlify.app/\nGame code:${localStorage.getItem("createdRoom")}\nClick on the link and enter the code`
    );
    setShareText("Copied");
    setTimeout(() => {
      setShareText("Share code");
    }, 2000);
  }, []);

  const startGameBeta=()=>{
    setStarted(true);
  }
  const createGame= async()=>{
    if(name===""){
      window.alert('Username is empty');
      return;
    }
    localStorage.setItem("username",name);
    setPlayed(false);
    setCreate(true);
    const arr = []
    let x = 0;
    const countryArr = Array.from(countries);
    for(let i=0; i<countryArr.length; i++){
      const countr = countryArr[i];
      for(let j=0; j<questions.length; j++){
        if(questions[j].country===countr){
          arr.push(questions[j]);
          //console.log(arr[x]);
          if(arr[x].answer>9999 && arr[x].answer<999999){
            arr[x].answer = (arr[x].answer/1000).toFixed(1);
            //console.log(arr[x].answer);
            arr[x].answer = arr[x].answer*1000;
          }
          else if(arr[x].answer>999999 && arr[x].answer<999999999){
            arr[x].answer = (arr[x].answer/1000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000;
          }
          else if(arr[x].answer>999999999 && arr[x].answer<999999999999){
            arr[x].answer = (arr[x].answer/1000000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000000;
          }
          x=x+1;
        }
      }
      setQuestions(arr);
      const shuffled = arr.sort(() => Math.random() - 0.5);
      const finalArr = shuffled.slice(0,21);

      //console.log(questions);
      console.log(makeid(5));
      if(localStorage.getItem("createdRoom")===null && finalArr.length>=21)
      {
        const RoomId=makeid(5)
        const {data,error} = await supabase.from('gameRoom').insert({id:RoomId,ques:finalArr,names:[name]}).select()
        console.log(data,error);
        setCreatedRoom(RoomId)
        localStorage.setItem("createdRoom",RoomId)
      }
    }

  }
  async function deleteGmae(code){
    const {data,error} = await supabase.from('gameRoom').delete().match({'id':code}).select();
    if(data){
      console.log(data);
    }
    if(error){
      console.log(error);
    }
    console.log("deleting");
  }
  function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
const setRoom = ()=>{
  setJoiningRoom(true);
  console.log("ye chal rha")
}
const setJoinedRoomQuestions = useCallback((roomQues,code)=>{
  if(name==="" || code===""){
    window.alert("Some field is empty");
    return;
  }
  
  //setQuestions(roomQues);
  roundingQuestions(roomQues);
  setCreatedRoom(code);
  localStorage.setItem("createdRoom",code);
  localStorage.setItem("username",name);
  console.log(localStorage.getItem("username"))
  console.log(questions.length);
  playedRoom(code);
  setJoiningRoom(false);
  // eslint-disable-next-line
},[questions,name])
  const resetGame = useCallback(() => {
    const resetGameAsync = async () => {
      if (items !== null) {
        setState(await createState(questions));
      }
      window.location.reload();
    };

    resetGameAsync();
    // eslint-disable-next-line
  }, [questions]);
  
  const [highscore, setHighscore] = useState(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateCountries = useCallback((countrySet)=>{
    setCountries(countrySet);
    console.log(countries)
    // eslint-disable-next-line
  },[])
  const updateHighscore = useCallback((score) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);
  
  if (!loaded || state === null) {
    return <Loading />;
  }
  if(joiningRoom){
    return(
      <>
      <h2 style={{color:"white", textTransform: "uppercase",fontStyle: "italic",marginTop:"20px"}}>Place the cards on the numberline in the correct order.</h2>
      <h2 style={{color:"white", textTransform: "uppercase",fontStyle: "italic"}}>Multiplayer</h2>
      <div style={{width:"70%", margin:"auto"}}>
        <div className="input-group mb-3">
        <input type="text" className="form-control" value={name} onChange={onHandleChange} placeholder="Username (Should be unique)" aria-label="Recipient's username" aria-describedby="basic-addon2"/>
        <div className="input-group-append">
            
            
        </div>
        </div>
    </div>
      
      <JoinRoom questions={questions} setJoinedRoomQuestions = {setJoinedRoomQuestions} name={name}/>
      
      </>
    )
  }
  if(createdRoom && started===false){
    if(played){
      return(
        <>
        <h1 style={{color:"white"}}>Leader-board</h1>
        <div style={{marginTop:"20px",marginBottom:"20px"}}>
        <Score score={localStorage.getItem("createdRoom")} title="Game code" />
        </div>
        <Roomscores createdRoom={createdRoom}/>
        {create?(
        <>
        <button className="btn btn-secondary" onClick={()=>{
        localStorage.removeItem("createdRoom");
        setCreatedRoom(null); 
        console.log(localStorage.getItem("createdRoom"));
        setCreate(false);
        //deleteGmae();
        localStorage.setItem("toDelete",createdRoom);
        window.location.reload();
        
         }}>End game</button>
        </>
      ):(
        <button className="btn btn-secondary" onClick={()=>{
          localStorage.removeItem("createdRoom");
          setCreatedRoom(null); 
          console.log(localStorage.getItem("createdRoom"));
          window.location.reload()
           }}>Leave game</button>
      )}
        </>
      )
    }
    return(
      <>
      <Instructions highscore={highscore} start={startGameBeta} typ={"Start Game"} />
      <div style={{marginTop:"20px"}}>
      <Score score={localStorage.getItem("createdRoom")} title="Game code" />
      <span style={{marginLeft:"5px"}}><Score score={name} title="Username" /></span>
      </div>

      <div style={{margin:"10px"}}>
      <Button onClick={share} text={shareText} minimal />
      </div>
      
      {create?(
        <>
        <button className="btn btn-secondary" onClick={()=>{
        localStorage.removeItem("createdRoom");
        setCreatedRoom(null); 
        console.log(localStorage.getItem("createdRoom"));
        setCreate(false);
        //deleteGmae();
        localStorage.setItem("toDelete",createdRoom);
        window.location.reload();
        
         }}>End game</button>
        </>
      ):(
        <button className="btn btn-secondary" onClick={()=>{
          localStorage.removeItem("createdRoom");
          setCreatedRoom(null); 
          console.log(localStorage.getItem("createdRoom"));
          window.location.reload()
           }}>Leave game</button>
      )}
      
      </>
    )
  }
  if (!started) {
    return (
      <>
      
      <Instructions highscore={highscore} start={startGame} typ={"Single Player"} />
      <div style={{display:"none"}}><DropDown countries={countries} updateCountries={updateCountries}/></div>
      <br />
      <br />

      <h3 style={{color:"white", textTransform: "uppercase",fontStyle: "italic", marginTop:"5px", marginBottom:"5px"}}>----Multiplayer----</h3>
      <div style={{width:"70%", margin:"auto"}}>
        <div className="input-group mb-3">
        <input type="text" className="form-control" value={name} onChange={onHandleChange} placeholder="Username (Should be unique)" aria-label="Recipient's username" aria-describedby="basic-addon2"/>
        <div className="input-group-append">
            
            
        </div>
        </div>
    </div>
      
      
      <CreateRoom questions={questions} createGame = {createGame} joiningRoom={joiningRoom} setRoom={setRoom} />
      </>
    );
  }

  return (
    <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      updateHighscore={updateHighscore}
      createdRoom = {createdRoom}
      name = {name}
    />
  );
}
