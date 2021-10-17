import React, { useEffect, useState, useRef } from 'react';
import { CSVLink, CSVDownload } from 'react-csv';
import axios from 'axios';
import './App.css';
import Level from './Level';
import Start from './Start';
import DataDisplay from './DataDisplay';
import ErrorPage from './ErrorPage';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useBeforeunload } from 'react-beforeunload';

function App() {

  const LOA1Imgs = require.context('./LOA_1/', true, /\.png$/);
  const LOA1 = LOA1Imgs.keys().map(path=>{
    let imgId = path.indexOf("_");
    let correctNum = path.lastIndexOf("_");
    return {
      path, 
      file: LOA1Imgs(path), 
      id: path.substring(3,imgId), 
      weapons:path.substring(correctNum+1,correctNum+2), 
      isValid:true
    };
  });

  const [startData, setStart] = useState({});
  const [mData, setMData] = useState([]);
  const [cData, setCData] = useState([]);
  const [nextLevel, setNext] = useState(false);
  const [levelIndex, setLevel] = useState(0);
  const [trials, setTrials] = useState(0);
  const [transitionDone, setTransition] = useState(false);
  const [user_id, setId] = useState("user");
  const [isCalled, setCall] = useState(false);
  const [serverStat, setServerStat] = useState("OK");
  const order = [1];
  const images = [LOA1];

  useEffect(()=>{
    window.addEventListener('beforeunload', (event) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Older browsers supported custom message
      event.returnValue = 'Are you sure you want to leave the experiment?';
      setCall(true);
    });
  });

  // reset parameters for next level
  useEffect(()=>{
    if(nextLevel == true){
        setLevel(levelIndex + 1);
        setTrials(0);
        setNext(false);
        setTransition(false);
    }
  }, [nextLevel]);

  // update the display when the transition screens are done
  useEffect(()=>{
    if(transitionDone){
      getDisplay();
    }
  }, [transitionDone]);

  useEffect(()=>{
    console.log("updating display");
    console.log(serverStat);
    getDisplay();
  }, [serverStat]);

  // send the data when the experiment is done
  useEffect(()=>{
    sendData(mData.concat(cData));
  }, [isCalled]);

  //takes data from experiment and makes POST request to heroku
  async function sendData(data){
    console.log("calling sendData");
    let myobj = {user_id:user_id+"_training", rows: data};
    console.log(myobj);
    try{
      await axios.post(`https://wix-server.herokuapp.com/`, 
        myobj
      )
      .then(res => {
        console.log(res);
        console.log(res.data);
      });
    }
    catch(error){
      setServerStat("ERROR");
    }
    setCall(false);
    
  }

  //change display based on level completion
  function getDisplay(){
    if(serverStat == "ERROR"){
      return <ErrorPage></ErrorPage>
    }
    else if(levelIndex <= 0){
      if(transitionDone){
        return <Level 
          mdata={mData}
          setMData={setMData} 
          cdata={cData}
          setCData={setCData} 
          images={images[levelIndex]} 
          trials={trials} 
          setTrials={setTrials} 
          nextLevel={setNext} 
          levelType={order[levelIndex]}
          startData={startData}
        ></Level>
      }
      else{
        return <Start setUser={setId} levelIndex={levelIndex} startData={startData} setStart={setStart} setTransition={setTransition}></Start>
      }
      
    }
    else{
      // allow data to be sent only once
      if (isCalled){
        return (
          <div className="survey-style">
            <h1>Please proceed to Qualtrics to complete the experiment.</h1>
          </div>
          
        );
      }
      else{
        setCall(true);

        return (
          <div className="survey-style">
            <h1>Please proceed to Qualtrics to complete the experiment.</h1>
          </div>
          
        );
      }
    }
  }

  return (
    <div>
      {getDisplay()}
    </div>
    

  );
}

export default App;
