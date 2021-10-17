import React, { useState, useEffect } from 'react';

function Timer(props) {
  const [seconds, setSeconds] = useState("15");
  const [isActive, setIsActive] = useState(true);
  const [isCounting, setIsCounting] = useState(true);

  useEffect(() => {
    let interval = null;
    // still showing timer and there is time left: decrement timer
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        if (isCounting){
          setSeconds(seconds => seconds - 1);
        }
      }, 1000);
    }

    // user finished monitoring task within time or additional started: stop timer
    if (props.addStart && !props.addDone) {
      setIsCounting(false);
    }

    // still showing timer and there is no time left: change to text
    else if (isActive && seconds == 0){
      setSeconds("Please sort bag into a bin.");
    }

    return () => {
      clearInterval(interval);
    }
  }, [isActive, isCounting, seconds]);

  useEffect(()=>{
    if(props.addDone){
      setIsCounting(true);
    }
  }, [props.addDone]);

  return (
    <div className="app">
      <div className="timer">
        <h1>{seconds}</h1>
      </div>
    </div>
  );
};

export default Timer;