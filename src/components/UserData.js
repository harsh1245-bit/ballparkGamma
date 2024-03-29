import React, { useEffect, useState, useCallback } from 'react';

//import Avatar from '@mui/material/Avatar';
import ReactGA from 'react-ga4';
import Mixpanel from 'mixpanel-browser';
import imageList from '../lib/imageList';
import { createClient } from '@supabase/supabase-js';
import StudyBoard from './StudyBoard';
import createState from "../lib/create-state-beta";
import Grid from '@mui/material/Grid';
import studySuff from '../lib/studySuff';

const supabase = createClient('https://hpcqpvygdcpwrzoldghm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY3FwdnlnZGNwd3J6b2xkZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjUwMzg0NTIsImV4cCI6MTk4MDYxNDQ1Mn0.-DVUVZlZGkiylcWqO7ROJ11Y86dyHcl7ex5985WDhr8');

const UserData = (props) => {
    const {user} = props;
    const [keys,setkeys] = useState(null)
    const [userScores, setUserScores] = useState(null);
    const [userQids,setUserQids] = useState(null);
    const [userDates, setUserDates] = useState(null);
    const [userPlayed,setUserPlayed] = useState(null);
    const [ playing, setPlaying] = useState(false);
    const [questions, setQuestions] = useState(null);
    const [state, setState] = useState(null);
    const [menu, setMenu] = useState(false);
    const [highscore, setHighscore] = useState(
        Number(localStorage.getItem("highscore") ?? "0")
      );
      Mixpanel.init('2a40b97bb7489509f0ac425303cd49d7');
    useEffect(()=>{
        const getQuestio = async()=>{
            // eslint-disable-next-line
            const {data, error} = await supabase.from('ourWorld').select('*')
            if(data){
                setQuestions({
                    "id": 19139,
                    "created_at": "2023-03-11T07:19:35.616665+00:00",
                    "question": "Cards",
                    "answer": "Please wait",
                    "suffix": "Please wait",
                    "country": "Loading",
                    "code": "none",
                    "year": "",
                    "url": "https://ourworldindata.org/literacy"
                },
                {
                    "id": 19130,
                    "created_at": "2023-03-11T07:19:35.616665+00:00",
                    "question": "Cards",
                    "answer": "Please wait",
                    "suffix": "Please wait",
                    "country": "Loading",
                    "code": "none",
                    "year": "",
                    "url": "https://ourworldindata.org/literacy"
                });
            }
        }
        const getUserScores =async()=>{
            const {data,error} = await supabase.from('userQuestions').select('*').eq("email",user);
        console.log(data);
        if(data.length!==0){
            console.log("isme chala");
            setUserScores(data[0])
            setUserQids(data[0]['nextList'])
            setUserDates(data[0]['date'])
        }
        if(error){
            console.log(error);
        }

        }
        getQuestio();
        getUserScores();
    },[user])
    
   
    const updateHighscore = useCallback((score) => {
        localStorage.setItem("highscore", String(score));
        setHighscore(score);
      }, []);
    
    const getQuestions = async(key)=>{
        ReactGA.event({
      category: 'Button Clicks',
      action: studySuff[key],
    });
    
    Mixpanel.track(studySuff[key], { button: "click" });
        document.getElementById("loading").style.display="block";
        setkeys(key);
        setMenu(true);
        const {data,error} = await supabase.from('ourWorld').select('*').eq("suffix",key);
        let maxDay = 0;
        if(data){
            console.log(data);
            setQuestions(data);
            var x = []
            var y = []
            var z = []
            for(let j=0; j<data.length; j++){
                data[j]['correctness'] = userQids[data[j]['id']];
                let day = userDates[data[j]['id']];
                day = day.replace('/','-');
                var today = new Date();
                var thatDay = new Date(day);
                const diffTime = Math.abs(today - thatDay);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                console.log(today, thatDay, diffDays);
                data[j]['days'] =  diffDays-1;
                maxDay = Math.max(maxDay,diffDays);
                z.push(data[j]);
            }
            for(let j=0; j<z.length; j++){
                z[j]['days'] = z[j]['days']/maxDay;
                z[j]['days'] = 1-z[j]['days'];
                z[j]['days'] = ((z[j]['days']*7)+(z[j]['correctness']*3))/10;
            }
            //harsh
            z.sort(function(a,b){
                return a.days-b.days;
            });
            console.log(z);
            for(let i=0; i<data.length; i++){
                console.log(userQids[data[i]['id']])
                if(userQids[data[i]['id']]===0){
                    x.push(data[i])
                    //console.log(userQids[data[i]['id']])
                }
                if(userQids[data[i]['id']]===1){
                    y.push(data[i])
                }
            }
            setQuestions(z)
            y = z[z.length-1]
            setUserPlayed(y)
            console.log(userPlayed);
        }
        if(error){
            console.log(error)
        }
        
          
        createStateAsync(z,[z[z.length-1]]);
        playSetter();
    }
    const createStateAsync = async(x,y) => {
        console.log("yes chal rha")
        setState(await createState(x,y));
          console.log("yes chal rha")
        
    };
    const resetGame = useCallback(() => {
        const resetGameAsync = async () => {
          window.location.reload();
          
          
        };
    
        resetGameAsync();
        // eslint-disable-next-line
      }, [questions]);
    
    const playSetter = ()=>{
        setPlaying(!playing);
    }
    if(state && questions && menu && playing){
        return (
            <>
            <StudyBoard
            highscore={highscore}
            state={state}
            setState={setState}
            resetGame={resetGame}
            updateHighscore={updateHighscore}
            keys = {keys}
            email = {user}
            />
            <button className="btn btn-secondary rounded-pill mt-2 mr-2"onClick={()=>{ window.location.reload()}}>Main menu</button>
            </>
        )
    }
  return (
    <>
        {userScores?(
            <div style={{justifyContent:'center',margin:"15px"}}>
                <div id="loading"style={{display:"none",backgroundColor:"grey",color:"white",borderRadius:"15px", fontWeight:"bold"}}><h6 style={{padding:"10px"}}>Loading Cards...</h6></div>
        <Grid container rowSpacing={2} columnSpacing={{ xs: 2, sm: 2, md: 3 }}sx={{justifyContent:'center',margin:"3px"}}>
        {
            Object.keys(userScores['playedList']).map((key,index)=>(
                <>
                <Grid item xs={4} sm={2} md={1}  >
                {/*<Avatar   src={imageList[index]} sx={{ width: 56, height: 56, display: 'inline-block' }} onClick={()=>getQuestions(key)} />*/}
                
                
                  
                <div style={{backgroundColor:"white", borderRadius:"15px", fontWeight:"normal", width:"100px", cursor:"pointer"}} onClick={()=>{getQuestions(key)}}>
                    <img alt="example" src={imageList[index]} style={{height:"100px", maxWidth:"100%", borderRadius:"15px"}}/>
                    <div style={{textAlign:"center", padding:"5px"}}>
                {userScores['playedList'][key]['bestScore']/userScores['playedList'][key]['correct']<=0.4?(<><p style={{color:'black'}}>{studySuff[key]}</p></>)
                  :
                  (<>{userScores['playedList'][key]['bestScore']/userScores['playedList'][key]['correct']<=0.8?(<p style={{color:'black'}}>{studySuff[key]}</p>):(
                    <p style={{color:'black'}}>{studySuff[key]}</p>
                  )}</>)
                }</div>

                </div>
                  
                 
                  
                </Grid>
       
          
          
        
        
      
                </>
            ))
        } </Grid>
       
        </div>):(<></>)}
      
      
    </>
  );
}
export default UserData;