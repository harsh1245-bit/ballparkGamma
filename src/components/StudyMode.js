import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import UserData from './UserData';
import ReactGA from 'react-ga4';
import Mixpanel from 'mixpanel-browser';
Mixpanel.init('2a40b97bb7489509f0ac425303cd49d7');

const supabase = createClient('https://hpcqpvygdcpwrzoldghm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY3FwdnlnZGNwd3J6b2xkZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjUwMzg0NTIsImV4cCI6MTk4MDYxNDQ1Mn0.-DVUVZlZGkiylcWqO7ROJ11Y86dyHcl7ex5985WDhr8');
const StudyMode = () => {
  const [user, setUser] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  

  useEffect(() => {
    function handleResize(){
      setScreenWidth(window.innerWidth);
    }
    const createUser = async ()=>{
        const {data,error}= await supabase.from('userQuestions').insert({'email':user,}).select()
        console.log(data);
        console.log(error);
      }
    const getUserData = async()=>{
        if(user){
            const {data,error} = await supabase.from('userQuestions').select('*').eq("email",user);
            console.log(data);
            if(data.length===0){
                console.log("ye chalrha")
                createUser();
            }
            if(data.length!==0){
                console.log("isme chala");
            }
            if(error){
                console.log(error);
            }
        }
      }
      window.addEventListener('resize',handleResize);
    checkUser();
    getUserData();
  }, [user]);
  
  
  const checkUser = async () => {
    const session = await supabase.auth.getSession();
    console.log(session.data.session.user.email)
    setUser(session.data.session.user.email?session.data.session.user.email:null);
  };

  const handleLogin = async (response) => {
    const { id_token } = response;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      idToken: id_token,
    });
    ReactGA.event({
      category: 'Button Clicks',
      action: "Login",
    });
    
    Mixpanel.track("Login", { button: "click" });
    if (error) {
      console.error('Error signing in with Google:', error);
    } else {
      checkUser();
    }
  };

  const handleLogout = async () => {
    ReactGA.event({
      category: 'Button Clicks',
      action: "Logout",
    });
    
    Mixpanel.track("Logout", { button: "click" });
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
    }
  };

  return (
    <div>
      {user ? (
        <div >
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",backgroundColor:"white", color:"black", margin:"15px", borderRadius:"10px"}}>
            <br />
          <div style={{textAlign:"left", flex:1, wordBreak:"break-word"}}>
            <h2 style={{margin:"20px"}}>Study Mode</h2>
          <h4 style={{margin:"20px", display:screenWidth>480?"block":"none"}} >Welcome, {user}</h4>
          
          </div>
          <img src="/images/studyMode.webp" alt="h" style={{textAlign:"right", height: screenWidth>480?"300px":"150px", margin:"20px"}} />
          <br />
          </div>
          
          <UserData user={user}/>
          <button className="btn btn-secondary rounded-pill mt-2"onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",backgroundColor:"white", color:"black", margin:"15px", borderRadius:"10px"}}>
            <br />
          <div style={{textAlign:"left", flex:1, wordBreak:"break-word"}}>
            <h2 style={{margin:"20px"}}>Login or Signup</h2>
          
          <button className="btn btn-secondary rounded-pill mt-2" onClick={handleLogin}
          style={{margin:"20px"}}>Google</button>
          
          </div>
          <img src="/images/studyMode.webp" alt="h" style={{textAlign:"right", height: screenWidth>480?"300px":"150px", margin:"20px"}} />
          <br />
          </div>
          
        <br />
        </div>
      )}
    </div>
  );
};

export default StudyMode;
