import './logrocketSetup';
import './fullStorySetup';
import React,{useEffect} from 'react';
import { withRouter } from 'react-router-dom';

import styled from 'styled-components';
import GlobalStyle from './global-styles';
import Routes from './router';
import 'sanitize.css/sanitize.css';
import 'antd/dist/antd.css';
import './style.css';
import {useAuth} from './context/authContext';
import {useSocket} from './context/socketContext';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_KEY, REACT_APP_ROLLBAR_TOKEN } from './constants';
import Bookmark from 'react-bookmark';
import { Provider } from '@rollbar/react';

var isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());

if(!isiDevice && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window){
  var permission = Notification.permission;
    console.log("permission ::::1: ",permission)
    window.dispatchEvent(new KeyboardEvent('keydown', {
      'key': 'd',
      ctrlKey: true,
      }));
    if(permission != "granted"){
      Notification.requestPermission()
    }
}

mixpanel.init(MIXPANEL_KEY, {debug: true}); 

let currSeconds = 0


const App = (props) => {

  const {user} = useAuth()
  const {socket} = useSocket()
 const setCurrentSeconds = ()=>{


    currSeconds = currSeconds+1;
    if(currSeconds === 43200){
      if(window.localStorage.tetch_token !== ""){
        window.localStorage.tetch_token = ""
        window.location.reload("/")
      }
      
    }
 }







  window.onunload = function (e) {
    console.log(">i am running")
    e.preventDefault();
    alert("wait")
  }

  window.document.onload = ()=>{
    console.log(">> New on load function >>>")
     

    currSeconds = 0
  }

  document.body.onmousemove = ()=>{
    currSeconds = 0
  }

  document.body.onclick = ()=>{
    currSeconds = 0
  }

  useEffect(()=>{
    if(user){
      socket.emit("loggedIn",{userId:user.id,userType:user.userType,user:user},(confirmation)=>{
        console.log(confirmation,"this is the confirmation that the code is running")
      })
    }
    
    let timer = setInterval(()=>{setCurrentSeconds()},1000)
  },[])

  const theme = "#fff";



  const appTheme = "ThemeLight";

  const rollbarConfig = {
    accessToken:REACT_APP_ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  };

  
  return <Provider config={rollbarConfig} >
   <AppWrapper id={appTheme} theme={theme}>
    <GlobalStyle />
    <Routes {...props} />
  </AppWrapper>
  </Provider>
};

const AppWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  min-height: 100%;
 
  height: 100vh;
  
  flex-direction: column;
`;

export default withRouter(App);
