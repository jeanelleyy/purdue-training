import React, { useEffect, useState } from 'react';
import './App.css';
import ShowImage from './ShowImage';
import Counting from './Counting';
import Monitoring from './Monitoring';
import Timer from './Timer';
import { writeM, writeC } from './LogData';

function Level(props) {
  
  const types = ["Fragile", "Normal", "Oversize"];
  const rand = Math.round(Math.random() * 2);
  const trial_count = 5;

  const [monitoringDone, setMonitoring] = useState(false);
  const [additionalStart, setAddStart] = useState(false);
  const [additionalDone, setAdditional] = useState(false);
  const [countingDone, setCounting] = useState(false);
  const [timerOk, setTimerOk] = useState(true);
  const [levelImgSet, setImgSet] = useState(props.images);
  const [imgs, setImgs] = useState([]);
  const [singleImg, setSingle] = useState("");
  const [weaponCount, setWeaponCount] = useState(0);
  const [addCount, setAddCount] = useState([]);
  
  const [key,setKey] = useState(0);
  const [rand_bag, setBag] = useState(types[rand]);

  const [mResult, setMResult] = useState({});
  const [cResult, setCResult] = useState({});

  const [time, setTime] = useState(Date.now());
  const [mTime, setMTime] = useState(Date.now());

  useEffect(()=>{
    console.log("timer stat changed", timerOk);
  }, [timerOk]);

  function getRandomBag(){
    const types = ["Fragile", "Normal", "Oversize"];
    let random_index = Math.round(Math.random() * 2);
    while(rand_bag == types[random_index]){
        random_index = Math.round(Math.random() * 2);
    }
    setBag(types[rand])
    return types[rand];
  }

  //when trials are finished
  useEffect(()=>{    
    if(monitoringDone && countingDone){

      //add image path of additional screening pattern before each level
      if(props.trials == 0){
        let patternTag = writeM(props.levelType, "The image pattern for the following level is:", props.startData.pattern, "", "", "", "");
        let monitoring_entry = writeM(props.levelType, props.trials+1, mResult.duration, mResult.duration < 15000, props.images[props.trials].file, mResult.count >=0 ? mResult.count : -1, mResult.wrong);
        props.setMData([...props.mdata, patternTag, monitoring_entry]);
      }
      else{
        if(!timerOk && !(mResult >=0)){
          let monitoring_entry = writeM(props.levelType, props.trials+1, 15000, false, props.images[props.trials].file, -1, "No Screening");
          props.setMData([...props.mdata, monitoring_entry]);
        }
        else{
          let monitoring_entry = writeM(props.levelType, props.trials+1, mResult.duration, mResult.duration < 15000, props.images[props.trials].file, mResult.count >=0 ? mResult.count : -1, mResult.wrong);
          props.setMData([...props.mdata, monitoring_entry]);
        }
      }

      const myIndex = cResult.choice;
      let counting_entry = writeC(props.levelType, props.trials+1, cResult.duration, props.images[props.trials].file, cResult.choice, rand_bag, cResult.count, props.startData[myIndex]);
      props.setCData([...props.cdata, counting_entry]);

      setMonitoring(false);
      setAdditional(false);
      setAddStart(false);
      setCounting(false);
      setTimerOk(true);
      
      setKey(key+2);
      props.setTrials(props.trials+1);
      if(props.trials < trial_count){
        getRandomBag();
      }
    }
    
  }, [monitoringDone, countingDone]);

  //when levels are finished
  useEffect(()=>{
    setTime(Date.now());
    console.log("trial #: ", props.trials);
    if(props.trials == 0){
      let myarr = [];
      for(var i=0;i<1;i++){
        let myval = Math.round(Math.random() * (trial_count - 1));
        while(myarr.indexOf(myval) > -1){
          myval = Math.round(Math.random() * (trial_count - 1));
        }
        myarr.push(myval);
      }
      console.log("got new nums for this level", myarr, props.levelType);
      setAddCount(myarr);
    }
    if(props.trials == trial_count){
      props.nextLevel(true);

    }
    else if(props.levelType == 3 || props.levelType == 92){
      //get random image index
      var randSpot = Math.round(Math.random() * (levelImgSet.length-1));
      while(!levelImgSet[randSpot].isValid){
        randSpot = Math.round(Math.random() * (levelImgSet.length-1));
      };

      //get corresponding file
      const file1 = levelImgSet[randSpot].file; 
      
      //go through image list for matching pair
      for(var i=0;i<levelImgSet.length;i++){
        if(parseInt(levelImgSet[i].id) ==  parseInt(levelImgSet[randSpot].id) && i != randSpot){
          //get file for match
          const file2 = levelImgSet[i].file;

          //remove pair from image set
          let newSet = levelImgSet.slice();
          newSet[randSpot].isValid = false;
          newSet[i].isValid = false;
          setImgSet(newSet);

          console.log("selected:",file1, file2);
          if(levelImgSet[i].path.length > levelImgSet[randSpot].path.length){
            setImgs([file2, file1]);
          }
          else{
            setImgs([file1, file2]);
          }
          setWeaponCount(levelImgSet[i].weapons);
          break;
        }
      }
      
    }
    else if(props.levelType == 1 || props.levelType == 91){
      let imgSet = levelImgSet;
      console.log("imgSet:", imgSet);
      var randSpot = Math.round(Math.random() * (levelImgSet.length-1));
      while(!levelImgSet[randSpot].isValid){
        randSpot = Math.round(Math.random() * (levelImgSet.length-1));
      };
      const file1 = imgSet[randSpot].file;

      let newSet = levelImgSet.slice();
      newSet[randSpot].isValid = false;
      setImgSet(newSet);
      console.log("selected:",file1);
      setSingle(file1);
      setWeaponCount(levelImgSet[randSpot].weapons);
    }
  }, [props.trials]);

  useEffect(()=>{
    console.log("levelImgSet: ", levelImgSet);
  }, [levelImgSet]);

  function blinkingImage(){   
    if (props.levelType == 1 || props.levelType == 91){
      return (<ShowImage key={key+1} images={[singleImg,singleImg]}></ShowImage>)
    }
    else{
        return(<ShowImage key={key+1} images={imgs}></ShowImage>)
    }
  }

  function isHighlight(){
    if (props.levelType == 91 || props.levelType == 92){
      return true;
    }
    return false;
  }

  return (
    <div className="task_style">
      <div className="img_side">
      <Timer key={props.trials} addDone={additionalDone} addStart={additionalStart} setTimerOk={setTimerOk} setmdone={setMonitoring} mdone={monitoringDone}></Timer>
      {blinkingImage()}
    
    <h2 className="bag_style">{rand_bag}</h2>
  
    </div>
    <Monitoring 
      key={props.trials} 
      weaponCount = {weaponCount} 
      highlightOk={isHighlight()} 
      completed={setMonitoring} 
      result={setMResult}
      time={time}
      setMTime={setMTime}
      trials={props.trials}
      correctAdd={props.startData.pattern}
      addDone={additionalDone}
      setAdd={setAdditional}
      setAddStart={setAddStart}
      timerOk={timerOk}
      addCount={addCount}
    />
    <div className="divider"></div>
    <Counting 
      key={"L"+props.levelType} 
      mDone={monitoringDone}
      completed={setCounting} 
      result={setCResult}
      time={mTime}
    />
    </div>
  );
}

export default Level;
