import moment from 'moment';
import { notification } from 'antd';
import React from 'react';
import Cookies from 'js-cookie';
import { Container, Row, Col, Button,Alert } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import ReactGA from "react-ga";
import { GOOGLE_ANALYTICS_PROPERTY_ID } from '../constants';
import { JobTags } from '../constants/index.js';
import * as JobCycleApi from '../api/jobCycle.api';
import * as JobApi from '../api/job.api';
import * as WebSocket from '../api/webSocket.api'
export const getFullName = (item) => {
  const { firstName, lastName } = item;

  if (item) return `${firstName} ${lastName}`;

  return '';
};

export function formatDateTime(date) {
  return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
}

/**
 * Check if user is live or not 
 * @params = user (Type:Object)
 * @response : return true if user is live else returns false
 * @author : Sahil
 */

export function isLiveUser(user){
  let userType = 'live'
  try{
    if (user.userType == 'technician'){
        userType = user?.technician?.technicianType
    }
    else{
        userType = user?.customer?.customerType
    }
    if (userType == 'live'){
      return true
    }
    else{
      return false
    }
  }
  catch(err){
    return true
    console.log("error in checkForTestOrLiveUser ::::",err)
  }
}

/**
 * It sets the variable which opens the referal window
 * @params : {void}
 * @response : {void}
 * @author :Sahil
 * */
export const handleRefModal = ()=>{
    window.refdCode = 'open'
    setTimeout(()=>{
      window.refdCode = 'false'
    },2000)
  }


/**
 * Get Browser Cookie
 * @params = cname (Type:string)
 * @response : return specific cookie value
 * @author : Sahil
 */
export const getCookie = (cname) => {
  const name = cname + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}











  /**
   * Starts a call on technician side
   * @params = jobId(Type:Integer) , socket(Type:Object)
   * @response : it redirects the technician to meeting page ,starts a call with customer and sends the socket to change the button on client screen.
   * @author : Sahil
  */

export const handleStartCall = async(jobId,socket)=>{
  try{
    await JobCycleApi.create(JobTags.TECHNICIAN_START_CALL, jobId, false);
    socket.emit('call:started',{id:jobId})
    window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
  }
  catch(err){
    console.log("error in handleStartCall >>>",err)
  }
}


  /**
   * Sets a cookie if it is empty
   * @params = user (Type:Object)
   * @response : if cookie is not set it will set the cookie 
   * @author : Sahil
  */

export const get_or_set_cookie = (user)=>{
  try{
    console.log(">>hello jobs")
    let cookieSet = getCookie('user_id')
    if (cookieSet != '') return;
    if (cookieSet == ''){
      Cookies.set('user_id', user.id ,{"path":'/',"domain":process.env.REACT_APP_COOKIE_DOMAIN})
      return;
    }
  }
  catch(err){
    console.log("error in get_or_set_cookie>>>>",err)
  }
}

export function getFormattedTime(time) {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  return moment(`${min}:${sec}`, 'mm:ss').format('mm:ss');
}

export const openNotificationWithIcon = (type, header, message) => {
  notification[type]({
    message: header,
    description: message,
  });
  notification.config({
    duration: 10,
  })
};

export const getIdFromJobId = (jobId) => jobId.split('job_')[1];

export const roleStatus = {
  OWNER: "owner",
  ADMIN: "admin",
  USER:"user"
}


export const convertTimeFormat = (seconds)=>{
    let minutes = parseInt(seconds/60)
    let sec = seconds%60
    if (sec <10){
      sec = "0"+sec
    }
    if(minutes <10){
      minutes = "0"+minutes
    }
    return `${minutes} : ${sec}`
  }




export const showMeetingNotification = ()=>{
  notification.destroy()
  clearInterval(window.alreadyFilledInterval)
  window.localStorage.setItem("notificationSent",true)
  notification.info({
    duration:7.5,
    message : `Your paid minutes are starting now`

  })
}



export const lastMinuteTimerPoper = (
  secondsRm = 60,
  updateTimingsForFreeCustomer,
  endMeeting,
  handleEndOnPopup

  )=>{
  clearInterval(window.clearIntervalTimer)
  window.localStorage.setItem("extraMin",true)
  let key = "updateAble"
  let lastSecondsRemain = secondsRm
  const btn = (
        <>
            <Button type="primary" className="acceptCharges btn " size="small" onClick={()=>{updateTimingsForFreeCustomer(key)}}>
              Continue meeting with charges
            </Button>
            <Button variant="danger" className="mt-2" size="small" onClick={()=>{handleEndOnPopup(key)}}>
              End Meeting
          </Button>
        </>
     );
  let lastTimeRemain = convertTimeFormat(lastSecondsRemain)
  notification.info({
    key,
    duration:null,
    btn,
    message:"Last Minute Remaning",
    description :`Your meeting is going to end in ${lastTimeRemain}`
  })
  window.lastMinuteInterval = setInterval(()=>{
    lastSecondsRemain = lastSecondsRemain -1
    lastTimeRemain = convertTimeFormat(lastSecondsRemain)
    window.localStorage.setItem("secs",lastSecondsRemain)
    if(lastSecondsRemain > 0){
      notification.info({
      key,
      btn,
      duration:null,
      message : "Last Minute Remaning",
      description : `Your meeting is going to end in ${lastTimeRemain}`
    })
    }

    if(lastSecondsRemain === 0){
    notification.destroy()
    endMeeting()
    clearInterval(window.lastMinuteInterval)
  }

      },1000)
  console.log("lastSecondsRemain :::::::::",lastSecondsRemain)
  
}


export const cardFullFillTimer = (
  clientMinutes,
  secondsRm = 120,
  updateTimingsForFreeCustomer,
  endMeeting,
  handleEndOnPopup
  )=>{
    let key = 'updateAble'
    let secondsRemain = secondsRm
    let timeRemain = convertTimeFormat(secondsRemain)
    let warningTimerCalledAlready = false
    const btn = (
        <>
            <Button type="primary" className="acceptCharges btn " size="small" onClick={()=>{updateTimingsForFreeCustomer(key)}}>
              Continue meeting with charges
            </Button>
            <Button variant="danger" className="mt-2" size="small" onClick={()=>{handleEndOnPopup(key)}}>
              End Meeting
          </Button>
        </>
     );
    notification.info({
      key,
      duration : null,
      btn,
      message :`Oh no! Your Free ${clientMinutes} minute session is almost over. Would you like to continue?`,
      description : `Your meeting is going to end in ${timeRemain}`
    })

    window.cardTimerUpdater = setInterval(()=>{
      console.log("this part this wrking 1")
      secondsRemain = secondsRemain -1
      window.localStorage.setItem("secs",secondsRemain)
      timeRemain = convertTimeFormat(secondsRemain)
      if(secondsRemain > 0){
        notification.info({
          key,
          btn,
          duration : null,
          message :`Oh no! Your Free ${clientMinutes} minute session is almost over. Would you like to continue?`,
          description : `Your meeting is going to end in ${timeRemain}`
        }) 
      }
    },1000)
    window.clearIntervalTimer = setInterval(()=>{
      if(secondsRemain === 0){
        console.log("this again working")
        clearInterval(window.cardTimerUpdater)
        if(!warningTimerCalledAlready){
          warningTimerCalledAlready = true
          lastMinuteTimerPoper(60,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup)
        }
        // notification.destroy()
      }
      for(var k in window.cardTimerUpdater){
        console.log("the array intervals :::::::::",window.cardTimerUpdater[k])
      }
        

    },1000)
}

/**
 * this function is a common function for accepting the job for technician
 * param : user (Type:Object)
 * param : jobId (Type:String)
 * param : location (Type:Object)
 * response : Boolean (Type :Object)
 * author : Sahil
 **/
export const checkJobValidations = async(user,jobId,location)=>{
  try{
    const res = await JobApi.retrieveJob(jobId);
    if (res.status !== 'Declined' && (res.technician == undefined || res.technician == '') && (!res.declinedByCustomer.includes(user.technician.id))) {
            const webSocket = await WebSocket.create({
              hitFromTechnicianSide: true, user: user.id, job: res.id, socketType: 'new-appointment-request', userType: 'technician',
            });
            const data_to_send = {
              jobId,
              mainJob: res,
              customer: (res && res.customer) ? res.customer.id : '',
              technician: (user && user.technician) ? user.technician.id : '',
              userIds:
                          location.state && location.state.userIds
                            ? location.state.userIds.filter(item => item !== user.id)
                            : [],
              web_socket_id: webSocket.websocket_details.id,
            };
            mixpanel.identify(user.email);
            mixpanel.track('Technician - Job accepted by technician.', { 'JobId': res.id });
            WebSocket.technician_accepted_customer(data_to_send);

            return true
          }
    else{
      return false
    }
  
    }
    catch(err){
      mixpanel.identify(user.email);
      mixpanel.track('Error : Technician - Job accepted by technician.', { 'JobId': jobId});
    console.log("error in checkJobValidations::::",err)
  }

}



export const cardAlreadyFilledTimer = (seconds = 120)=>{
  let secRm = seconds
  let key = "updateAlreadyFilledTimer"
  let timeRemain  = convertTimeFormat(secRm)
  notification.info({
    key,
    duration : null,
    message :`Your free minutes are expiring `,
    description:timeRemain
  })
  
  window.alreadyFilledInterval = setInterval(()=>{
    if(secRm > 0){
      secRm = secRm - 1
      timeRemain = convertTimeFormat(secRm)
      window.localStorage.setItem("notificationSent",false)
      window.localStorage.setItem("secs",secRm)
      notification.info({
        key,
        duration : null,
        message :`Your free minutes are expiring `,
        description:timeRemain
      })
    }


    if(secRm === 0){
      showMeetingNotification()
    }
  },1000)


}


export const chargeMeetingInfoPopup = (waitForMinSec,audio,socket,jobId)=>{
  try{
    window.theTimeout = setTimeout(()=>{
                console.log("set timeout call in updateJobtime")
                socket.emit("notification-to-technician",{"jobId":jobId})
                audio.play()
                notification.info({
                  duration:4.5,
                  className:"popUpNotification",
                  message: `Oh no! Your Free 6-minute session is over. `,
                    description: `From Now on you you will be charged`
                })
            },waitForMinSec)
  }
  catch(err){
    console.log("error in chargeMeetingInfoPopup ::::: ",err)
  }
}

export const clearAllTimeOuts = ()=>{
    if(window.notesSaveLoader){
      clearTimeout(window.notesSaveLoader)
    }
    if(window.setDisableCall){
      clearTimeout(window.setDisableCall)
    }
    if(window.pauseTimer){
      clearTimeout(window.pauseTimer)
    }
    if(window.startTimer){
      clearTimeout(window.startTimer)
    }
    if(window.intialJitsi){
      clearTimeout(window.intialJitsi)
    }
    if(window.recordingTimeOut){
      clearTimeout(window.recordingTimeOut)
    }
    if(window.jitsiTimeout){
      clearTimeout(window.jitsiTimeout)
    }
    if(window.meeting_pause){
      clearTimeout(window.meeting_pause)
    }
    if(window.tiRefTimeout){
      clearTimeout(window.tiRefTimeout)
    }
    if(window.timerButtonTimeout){
      clearTimeout(window.timerButtonTimeout)
    }
    if(window.retryJitsiTimeout){
      clearTimeout(window.retryJitsiTimeout)
    }
    if(window.showLoaderTimeout){
      clearTimeout(window.showLoaderTimeout)
    }
    if(window.fetchNotificationTimeOut){
      clearTimeout(window.fetchNotificationTimeOut)
    }
    if(window.startRecordingTimeOut){
      clearTimeout(window.startRecordingTimeOut)
    }
    if(window.intialJitsiTimeOut){
      clearTimeout(window.intialJitsiTimeOut)
    } 
      
    if(window.stopPauseTimer){
      clearTimeout(window.stopPauseTimer)
    }
      
    if(window.participantInfo){
      clearTimeout(window.participantInfo)
    }
      
    if(window.confirmNotesSubmit){
      clearTimeout(window.confirmNotesSubmit)
    }
      
    if(window.alertMessageTimeOut){
      clearTimeout(window.alertMessageTimeOut)
    }
      
    if(window.noteSaveLoaderTimeOut){
      clearTimeout(window.noteSaveLoaderTimeOut)
    }
      
    if(window.notesDeclineTimer){
      clearTimeout(window.notesDeclineTimer)
    }
      
    if(window.disabledCallTechnician){
      clearTimeout(window.disabledCallTechnician)
    }
    
  }

/**
 * custom event for google analytics with customer id as user identification
 * @params = category (Type:String), action (Type:String), label (Type:String), customer_id(Type:String)
 * @author : Neha Sharma
*/
export const GAevent = (category, action, label, customer_id) => {
  try{
    console.log("react initislize", GOOGLE_ANALYTICS_PROPERTY_ID, customer_id, ReactGA);
    ReactGA.initialize(GOOGLE_ANALYTICS_PROPERTY_ID,{ debug: true, 
      titleCase: false,
      gaOptions: {
        userId: customer_id
      } 
    });
    ReactGA.event({
      category: category,
      action: action,
      label: label,
      value:1
    });
  } catch (err) {
    //console.error("Google Analytics try catch error >>>>>>>>>>",err);
  }
}

/**
 * custom event for google analytics with job id as job identification
 * @params = category (Type:String), action (Type:String), customer_id(Type:String), job_id(Type:String), value (Type:Number)
 * @author : Kartik
*/
export const GArevenueEvent = (category, action, customer_id, job_id, value) => {
  try {
    console.log("react initislize", GOOGLE_ANALYTICS_PROPERTY_ID, job_id, ReactGA)
    console.log("GArevenueEvent called >>>>>", category, action, customer_id, job_id, value)
    ReactGA.initialize(GOOGLE_ANALYTICS_PROPERTY_ID, {
      debug: true,
      titleCase: false,
      gaOptions: {
        userId: customer_id
      }
    });
    ReactGA.event({
      category: category,
      action: action,
      label: job_id,
      value: value
    });
  } catch (err) {
    //console.error("Google Analytics try catch error >>>>>>>>>>",err);
  }
}

/**
 * send customer to meeting
 * @params = item (Type:object), message (Type:String)
 * @author : Neha Sharma
*/
export const sendCustomerToMeeting = (item, user, message)=>{
  try{
    get_or_set_cookie(user)
    // mixpanel code//
    mixpanel.identify(user.email);
    mixpanel.track(message, {'JobId':item.id});
    // mixpanel code//
    window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${item.id}`
  } catch (err) {
  }
}
  /**
   * Console log the data for debuging
   * @params = message (Type:string)
   * @response : print log in browser
   * @author : Ridhima Dhir
  */
  export const consoleLog = (message)=>{
    console.log(message)
  }

/**
 * this function use to decide the queries 
 * @params : value(Type:String)
 * @params : user (Type:Object)
 * @params : softwareArray(Type:Array)
 * @response : query (Type:Object)
 * @author : Sahil
 **/
export const queryDecider = (value,user,softwareArray= false,techMainSoftwares=[],techSubSoftwares=[],mainSoftwareWithoutState=[],subSoftwareWithoutState=[])=>{

    let query = {}
    if(user?.userType === "technician"){
      let newSoftArray = []
      if (!softwareArray){
        newSoftArray =  techMainSoftwares.concat(techSubSoftwares)
      }
      else{
        newSoftArray = softwareArray
      }
       let withoutStateVariable = mainSoftwareWithoutState.concat(subSoftwareWithoutState);
      query['software'] = { "$in": (newSoftArray.length > 0 ?  newSoftArray : withoutStateVariable) }

    }
    if(user?.userType === "customer"){
      query['customer'] = user?.customer?.id
    }
    if(value === "Active Jobs"){

      query['$or'] =[{ status: {$in:["Scheduled","Waiting","Inprogress","Accepted","ScheduledExpired","long-job"]} }]
    }
    if(value === "Pending Jobs"){
      query['status'] = "Pending"
      console.log("fetchActiveJobs")
    }
    if(value === "Completed Jobs"){
       
      query['$or'] =[ { status: {$in:["Completed","Declined"]} }]
      console.log("Completed Jobs")
    }
    if(value === "Completed Jobs Tech"){    
      let newSoftArray =  techMainSoftwares.concat(techSubSoftwares)
      let withoutStateVariable = mainSoftwareWithoutState.concat(subSoftwareWithoutState);
      query['software'] = { "$in": (newSoftArray.length > 0 ?  newSoftArray : withoutStateVariable) }
      query['technician'] = user?.technician?.id
      query['status'] = "Completed"
      console.log("Completed tech jobs")
    }
    if(value === "Declined Jobs Tech"){

      query["$or"] = [{'tech_declined_ids':{"$in":[user?.technician?.id]}},{'declinedByCustomer':{"$in":[user?.technician?.id]}}]
      console.log("Declined Jobs Tech")
    }
    if(value === "Proposals"){
       query["$or"] = [{"$and":[{"status":"Accepted"},{"technician":user?.technician?.id}]},{"status":{$in:["Waiting"]}},
       {"$or":[{"$and":[{"status":{"$in":['Scheduled']}},{"schedule_accepted_by_technician":user?.id}]},{
        "$and":[{"status":{"$in":['Scheduled']}},{"schedule_accepted":false}]
       }

       ]},
       {"$or":[{"$and":[{"status":"Inprogress"},{"technician":user?.technician?.id}]}
       ]},

        {"$or":[{"$and":[{"status":"long-job"},{"technician":user.technician.id}]}
       ]},
       {"$and":[{"notifiedTechs":{'$elemMatch':{'techId':user.technician.id}}},{"status":"Pending"}]}
       ]

       
    }

    console.log("queryDecider query :: ",query)
    return query

   }
