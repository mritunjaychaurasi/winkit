import React, { memo, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import * as DOM from 'react-router-dom';
import { Container, Row, Col, Button,Alert } from 'react-bootstrap';
import { getIdFromJobId,cardFullFillTimer,chargeMeetingInfoPopup,lastMinuteTimerPoper,cardAlreadyFilledTimer,showMeetingNotification,clearAllTimeOuts } from 'utils';
import Timer  from 'react-compound-timer';
import { useJob } from '../../../context/jobContext';
import { useUser } from '../../../context/useContext';
import { useJitsiMeet } from '../../../context/jitsiMeetContext';
// import StepButton from '../../../components/StepButton';
import {isMobile} from 'react-device-detect';
import Box from '../../../components/common/Box';
import { useSocket } from '../../../context/socketContext';
import { endConferenceCall } from '../../../api/serviceProvider.api';
import { CopyOutlined } from '@ant-design/icons';
import ConfirmTechMatch from './steps/ConfirmTechMatch';
import { useHistory } from 'react-router';
import * as JobApi from '../../../api/job.api';
import mixpanel from 'mixpanel-browser';
import Loader from '../../../components/Loader';
import ExtensionModal from '../../Technician/JobAlert/steps/ExtensionModal';
import PinModal from '../../Technician/JobAlert/steps/PinModal';
// import LeftSidebar from '../../../components/Sidebar/LeftSidebar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faShareSquare, faPaperPlane, faPhone, faPhoneAlt ,faVolumeUp} from '@fortawesome/free-solid-svg-icons';
import {useServices} from '../../../context/ServiceContext';
import * as JobService from "../../../api/job.api";
import logo from '../../../assets/images/logo.png';
import style from 'styled-components';
import { Progress, Spin, Modal,notification } from 'antd';
import { JITSI_URL } from '../../../constants';
import {openNotificationWithIcon} from '../../../utils';
import  notifySound from '../../../assets/sounds/notification.mp3';
import * as WebSocket from '../../../api/webSocket.api';
import * as CustomerApi from '../../../api/customers.api';
import LANDING_PAGE_URL from '../../../constants';
import CustomerCard from '../../../pages/Customer/Profile/steps/customerCard';
import $ from 'jquery';
let calledTechnician = false
let api = null;
let new_on_page = true;
const time = { seconds: 0, minutes: 0, hours: 0 };
let cardFunctionCalled = false;
let calledInterval = false
let secs = 0
let audio = new Audio(notifySound)
let spareTimer = false
let freeMin = 0
let lastInterval = false
let refreshStartTimer = false
let fetchJobId = null;
let timerCalled = false
var seconds_remaining  = 0
let sameSeconds = 0

let popupTimerAlreadyCalled = false


const CustomerJobProgress = () => {
	const [ratePerTime,setratePerTime] = useState(0);
	const [MainInvitation,setInvitation] = useState(false);
	const [invitedNumber,setInvitedNumber] = useState('')
	const history = useHistory();
	const currentStep = 0;
	const [customerWantsToAddCard,setCustomerWantsToAddCard] = useState(null)
	const [newCardAdded, setNewCardAdded] = useState(false);
	const { socket } = useSocket();
	const [secondsToRestartTimer,setSecondsToRestartTimer] = useState(0)
	const [meetingJob, setMeetingJob] = useState({});
	const [softwareSettings, setSoftwareSettings] = useState({});
	const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
	const pinCode = '';
	const [customerContiuedHisFirstMeeting ,setCustomerContiuedHisFirstMeeting] = useState(false)
	const [isOpen, setIsOpen] = useState(false);
	const [extension,setExtension] = useState('')
	const { setJobTime, fetchJob,method,setMethod,job,updateJob, getTotalJobs, getTotalPaidJobs } = useJob();
	const [isModalOpen,setIsModalOpen] = useState(null)
	const { user } = useUser();
	const { getJitsiMeet, createMeeting, meetingInfo, meetingId, isLoading } = useJitsiMeet();
	const [invited, setInvited] = useState(false);
	const jitsiContainerId = '6063bd22202fb514ce26346b123';
	const { jobId } = useParams();
	const jitsiMeetId = getIdFromJobId(jobId);
	const [popupBefore,setPopupBefore] = useState(2)
	const [freeSession,setFreesession] = useState(0)
	const dialInRef = useRef(null);
	const TriggerClick = useRef(null);
	const kick = useRef(null)
	const [computerAudioEnabled,setComputerAudioEnabled] = useState();
	const [showStopButton,setshowStopButton] = useState(false);
	const [showLoader,setShowLoader] = useState(true);
	const [intialTimeVal,setIntialTimeVal] = useState(0);
	const [calledTech,setCalledTech] = useState(false)
	const [dontCalc,setDontCalc] = useState(false)
	const tiRef = useRef();
	const hideButton = useRef();
	const remoteDesktopRef = useRef(null);
	const [disableContinueBtn,setDisableContinueBtn] = useState(false);
	const { CreateEarningReport } = useServices();
	const [waitingForTechNotes, setWaitingForTechNotes] = useState(true);
	const [notesSaveLoader, setNotesSaveLoader] = useState(false);
	const [notesDeclineLoader, setNotesDeclineLoader] = useState(false);
	const [notesConfirmed, setNotesConfirmed] = useState(false);
	const [notesDeclined, setNotesDeclined] = useState(false);
	const [alertMessageShow, setAlertMessageShow] = useState(false);
	const [declineMessageShow, setDeclineMessageShow] = useState(false);
	const [jobDetailsUpdated,setJobDetailsUpdated] = useState(false);
	const [issuesList, setIssuesList] = useState([]);
	const [confirmedIssuesList, setConfirmedIssuesList] = useState([]);
	const [emptyNotesAlert,setEmptyNotesAlert] = useState(false);
	const [cardsInfo,setCardsInfo] = useState(false)
	const [disabledCallYourself, setDisabledCallYourself] = useState(false);
	const [disabledCallTechnician, setDisabledCallTechnician] = useState(false);
	const [jitsiSessionEnd, setJitsiSessionEnd] = useState(false);
	const [allNotesSelected, setAllNotesSelected] = useState(false);
	const [disabledEndCall, setDisabledEndCall] = useState(false);
    const [totalJobs, setTotalJobs] = useState(-1);
    const [Joincount, setJoinCount] = useState(0);
	const [minutesFreeForClient,setMinutesFreeForClient] = useState(6);
	const clearAllIntervals = (meeting_pause)=>{
		if(meeting_pause){
				if(window.cardTimerUpdater){
					clearInterval(window.cardTimerUpdater)
				}
				if(window.clearIntervalTimer){
					clearInterval(window.clearIntervalTimer)
				}
				if(window.lastMinuteInterval){
					clearInterval(window.lastMinuteInterval)
				}
				if(window.alreadyFilledInterval){
					clearInterval(window.alreadyFilledInterval)
				}
			}
	}

	const startTimerAgain = (customerConfirmedNotes,meeting_pause,mainSeconds)=>{
	if(customerConfirmedNotes && !meeting_pause){
		let hours = mainSeconds / 3600
		let realMinutes = mainSeconds/60
		let seconds = mainSeconds%60
		let timeValue = mainSeconds*1000
		setIntialTimeVal(timeValue)
		tiRef.current.start()
	}
}
	

	const popUpConditionDecider = async({
		mainSeconds,
		clientSeconds,
		job,
		user,
		minutesFreeForClient,
		popupBefore,
		customerConfirmedNotes,
		}
	)=>{
		let openPopup = false
		let cardPopUpBeforeSeconds = clientSeconds - (popupBefore*60)
		let clientSecondsWithFreeMin = clientSeconds + 60
		if(customerConfirmedNotes){
			let paidJobs = await JobService.getTotalPaidJobs({"customer":user.customer.id})
				if(paidJobs <= 1 && mainSeconds > 0){
					if   
						((mainSeconds < clientSecondsWithFreeMin) && (mainSeconds >= cardPopUpBeforeSeconds) && !popupTimerAlreadyCalled)
					{
						openPopup = true
						popupTimerAlreadyCalled = true
						return openPopup
					}
				}



		}
	}
	const checkIfCustomerHasCard = async()=>{
		let customerId;
		if(job && job.customer && job.customer.id){
			customerId = job.customer.id
			
		}
		if(user && user.customer && user.customer.id){
			customerId = user.customer.id
			
		}

		const customer_info = await CustomerApi.retrieveCustomer(customerId);
		let haveCard = customer_info.stripe_id && customer_info.stripe_id != "" ? true : false
		return haveCard

	}
	const updateTimerForJob = async()=>{
		await JobService.updateJob(jobId,{"meeting_pause":false})
	}
	const pollingBoth = ()=>{
		if(new_on_page){
			console.log("inside if condition pollingBoth")
			new_on_page = false
			window.pollingInterval = setInterval(async()=>{
			if(fetchJobId != null){
				let res = await JobService.retrieveJob(fetchJobId)
				console.log("sample fetch timer every 10 second",res.total_seconds)
				let totalSeconds = res.total_seconds
				let meeting_pause = res.meeting_pause
				let customerConfirmedNotes = res.customerConfirmedNotes
				let clientSeconds =  parseInt(minutesFreeForClient*60)
				// startTimerAgain(customerConfirmedNotes,meeting_pause,totalSeconds,minutesFreeForClient)
				clearAllIntervals(meeting_pause)
				if(totalSeconds != undefined && !isNaN(totalSeconds)){
					if(!popupTimerAlreadyCalled && totalSeconds != 0){
						if(job!=undefined){
							handleTimerAndPopup(totalSeconds,customerConfirmedNotes,meeting_pause,clientSeconds)
						}
						
					}
					
				}
			}
				
			},3000)
		}
	}
	const handleMainConditions = async(minutesFreeForClient,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup,haveCard=false)=>{
		console.log("---------------------------------1---------------------")
		let seconds = parseInt(window.localStorage.getItem("secs"))
		popupTimerAlreadyCalled = true
		if(window.localStorage.getItem("extraMin") === "true"){
			if(seconds === 0 || isNaN(seconds)){
				if(!haveCard){
					console.log("this part 09")
					lastMinuteTimerPoper(60,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup)
				}
				else{
					console.log("this part 10")
					if(window.localStorage.getItem("notificationSent") === "false"){
						cardAlreadyFilledTimer(seconds)
					}
					else{
						showMeetingNotification()
					}
				}
			}
			else{
				if(!haveCard){
					console.log("this part 11")
					lastMinuteTimerPoper(seconds,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup)
				}
				else{
					console.log("this part 12")
					if(window.localStorage.getItem("notificationSent") === "false"){
						cardAlreadyFilledTimer(seconds)
					}
					else{
						showMeetingNotification()
					}
					
				}
			}
		}
		else{
			console.log("seconds before calling the pauseTimer :::::::",seconds)
			if(seconds === 0 || isNaN(seconds)){
				if(!haveCard){
					console.log("this part 21")
					if(socket){
						socket.emit("notification-to-technician",{"jobId":jobId})
					}
					cardFullFillTimer(minutesFreeForClient,120,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup)
				}
				else{
					console.log("this part 22")
					cardAlreadyFilledTimer()
				}
				// cardTimer(minutesFreeForClient,audio,socket,handleEndOnPopup,freeMin,updateTimingsForFreeCustomer,jobId,endMeeting,false,false,haveCard,false)
			}
			else{
				console.log("this part23")
				if(!haveCard){
					if(socket){
						socket.emit("notification-to-technician",{"jobId":jobId})
					}
					cardFullFillTimer(minutesFreeForClient,seconds,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup)
				}
				else{
					console.log("inside filled Timer ::::::::")
					if(window.localStorage.getItem("notificationSent") === "false"){
						cardAlreadyFilledTimer(seconds)
					}
					else{
						showMeetingNotification()
					}
				}
				// cardTimer(minutesFreeForClient,audio,socket,handleEndOnPopup,freeMin,updateTimingsForFreeCustomer,jobId,endMeeting,false,false,haveCard,seconds)
			}
		}

	}
	let handleTimerAndPopup = async(
		mainSeconds,
		customerConfirmedNotes,
		meeting_pause,
		clientSeconds)=>{
		console.log("mainSeconds :::",mainSeconds)
		let differnceRemainSecondsFromClientFreeMinutes  = clientSeconds - mainSeconds
		let minuteDiffRemainFromClientFreeMinutes = parseInt(differnceRemainSecondsFromClientFreeMinutes /60)
		let haveCard = await checkIfCustomerHasCard()
		let condition = await popUpConditionDecider({
			mainSeconds,
			clientSeconds,
			job,
			user,
			minutesFreeForClient,
			popupBefore,
			customerConfirmedNotes,
		})

		
		console.log("condition ::::::::",condition)
		

		if(condition === true){
			let seconds = parseInt(window.localStorage.getItem("secs"))
			console.log("seconds before calling the pauseTimer :::::::",seconds)
			handleMainConditions(minutesFreeForClient,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup,haveCard)
		}
		console.log("haveCard ::::::::",haveCard)
		if(!haveCard && !popupTimerAlreadyCalled){
			if(mainSeconds > (clientSeconds + (1*60))){
				endMeeting()
				return
			}
		}
		console.log("meeting_pause ::::::::::",meeting_pause)
		
		
		// if(){
		// 	console.log("inside that loop")
		// 	tiRef.current.start()
		// }
	}

	
	const handleModalClose = () => {
		setIsOpen(false);
	};
	window.startRecordingTimeOut = setTimeout(()=>{
		if(api != null){
  			api.executeCommand("startRecording",{
				mode:"file"
			})
  		}
	},10000)

	const jobupdationWithApi = async(data)=>{
		await JobService.updateJob(jobId,data)
	}
	useEffect(()=>{
        (async () => {
            if(user && user.customer && !cardFunctionCalled){
                let totalJobsCount = await getTotalJobs({'customer':user.customer.id})
                console.log("totalJobsCount",totalJobsCount)
                setTotalJobs(totalJobsCount) 
                cardFunctionCalled = true;
            }
        })();
    },[user]);

	useEffect(()=>{
		if(MainInvitation){
			// mixpanel code//
	     	mixpanel.identify(user.email);
	      	mixpanel.track('Customer -Invite on phone',{'JobId':jobId,'invitedNumber':invitedNumber});
	      	// mixpanel code//
	      	let extLength = (extension && extension !== '' ? extension.length : "0")
	      	api.invite([{allowed: true,number: `${invitedNumber + extension+extLength}`,originalEntry:`${invitedNumber}`,showCountryCodeReminder: false,type: "phone",extension:extension}])

		}
	},[MainInvitation])

	useEffect(() => {
		// socket.volatile.emit('join', jobId);
			if(isMobile){
				openNotificationWithIcon("info","Meeting not allowed","Please join on a pc to start meeting")
				window.location.href = "/"
			}
			let iframe  =  document.querySelector('[title="Button to launch messaging window"]');
			let buttonIframe = document.querySelector('[title = "Message from company"]')
			console.log("this is my iframe :::::::",iframe)
			if(buttonIframe){
				buttonIframe.style.display = "none"
			}
		    if(iframe){
		      iframe.style.display = "none"
		    }
			socket.emit('join', jobId);
			// $('#hideHelpButton').trigger('click')
		// setTimeout(()=>{setShowLoader(false);},15000)
	}, []);
	useEffect(() => {
		console.log('in useeffect of customer jobprogress>>>>>>',Joincount)
		if(job){
			pollingBoth()
		}
		if(job && job.callStartType != undefined && Joincount === 0){

			console.log('job.callStartType>>>>>>>>>>',job.callStartType)
			let new_method = job.callStartType
			if (new_method === "ComputerAudio"){
				setMethod(new_method)
				console.log('set Joincount one>>>>>>>>>>>>17-03-22')
				setJoinCount(1)

				setComputerAudioEnabled(false)
				window.intialJitsiTimeOut = setTimeout(()=>{ 
					initialiseJitsi(false)},3000)
			}
			else{
				setComputerAudioEnabled(true)
				console.log('set Joincount two>>>>>>>>>>>>17-03-22')
				setJoinCount(1)
				window.intialJitsiTimeOut =  setTimeout(()=>{initialiseJitsi(true)},3000)
			}		
		}

	}, [job]);


	useEffect(()=>{
		socket.on("hangup-all",async(data)=>{
			setJitsiSessionEnd(true);
			HandleHangup(data)
		})

		socket.on("rejected-by-technician",(data)=>{
			console.log('rejected-by-technician socket>>>>>>>',data.jobId,jobId)
			if(data.jobId === jobId){
				if (api != null) {
				api.executeCommand('hangup');
				api = null
			}
			 openNotificationWithIcon(
					'info',
					'Your job was declined',
					'Your job requires a greater level of support.  Hang tight — we’re finding you the right geek for the job.'
				);
			if(notification){
				notification.destroy()

			}
			clearAllIntervals(true)
			clearAllTimeOuts()
			window.localStorage.removeItem("secs")
			window.localStorage.removeItem("extraMin")
			window.location.href = `/customer/create-job/${data.jobId}?jobId=${data.jobId}`
			}
		})

		socket.on('send-notes-to-customer', data => {
	      	if (data && data.jobId && jobId && data.jobId === jobId && data.allNotes.trim().length > 0) {
	      		fetchJob(jobId);
	      		setWaitingForTechNotes(false);
	      		setNotesConfirmed(false);
				setNotesDeclined(false);
				setDeclineMessageShow(false);
				setEmptyNotesAlert(false);
				setConfirmedIssuesList([])
	      	}
	    });
	    socket.on('send-updated-job-details-to-customer', data => {
	    	if (data && data.jobId && jobId && data.jobId === jobId) {
	    		fetchJob(jobId);
	    		setJobDetailsUpdated(true)
	    	}
	    });



	    socket.on("stop-customer-timer",(data)=>{
    	  	(async () => {
			console.log("Received signal to stop-customer-timer")
			if(tiRef && tiRef != null && tiRef.current != null){
				console.log('job stop-customer-timer>>>>>>>>',data)
				var milisec = miliseconds(parseInt(data.timer.hours),parseInt(data.timer.minutes),parseInt(data.timer.seconds));
				setIntialTimeVal(milisec)
				tiRef.current.pause()
				calledInterval = false
				refreshStartTimer = false
				spareTimer = false

			}
			setIsModalOpen(null)
			console.log("time.minutes ::::::",time.minutes)
			if(window.updateTime != '' && (parseInt(time.minutes) < 4)){
				clearInterval(window.updateTime)
				console.log("window.updateTime:::::::::::::::::",window.updateTime)
			}
			console.log("clear_interval:::::::::::::::::",window.clear_interval)
			if(window.clear_interval != '' && (parseInt(time.minutes) < 4)){
				clearInterval(window.clear_interval)
			}
			if(window.theTimeout != '' && (parseInt(time.minutes) < 4)){
				clearInterval(window.theTimeout)
			}	
			clearAllIntervals(true)	  
			})();
		})


		function miliseconds(hrs,min,sec){
		    return((hrs*60*60+min*60+sec)*1000);
		}



		socket.on("start-customer-timer",async (data)=>{
			console.log("Received signal to start-customer-timer")
			if(tiRef && tiRef != null && tiRef.current != null){		
				tiRef.current.start()
			}
			console.log("popupTimerAlreadyCalled :: :::::",popupTimerAlreadyCalled)
			if(popupTimerAlreadyCalled){
				setIsModalOpen(false)
			}
		})
	},[socket])
	useEffect(() => {
		// console.log('jobId>>>>>>>>>>>>>>>>>>>>fetchJob',jobId)
		fetchJob(jobId);		
		socket.on('stop-screenshare', () => {
			setJitsiSessionEnd(true);
			if (api ) {
				
				// if(kick != null){
				// 	kick.current.click()
				// }
				api.executeCommand('hangup');
				api = null
			}
			// setIsScreenShared(false);
			setInvited(false);
		});
	}, [jobId]);
	const handleNewCardAdded = async()=>{
		if(newCardAdded != false){
			console.log("new Card added ::::::",newCardAdded)
			clearInterval(window.updateTime)
			clearInterval(window.clear_interval)
			notification.destroy()
			let jobRes = await JobService.retrieveJob(fetchJobId)
			setCustomerContiuedHisFirstMeeting(true)
			clearInterval(window.pollingInterval)

			if(tiRef && tiRef != null && tiRef.current != null){
					// setTimerStarted(true);
				if(!jobRes.technician_paused_timer){
						tiRef.current.start();
						console.log("tiref :::::::::::::::::::::::::")
						socket.emit("start-card-timer",{"id":jobId})
					}
			}

			//changes on working code ended
			
			setFreesession(minutesFreeForClient)
			setDisableContinueBtn(false)
			jobupdationWithApi({"customerContiuedHisFirstMeeting":true,"meeting_pause":false})
			// updateJob(jobId,)
			notification.info({
						duration:4.5,
						message: `You can continue your meeting `,
	    				description: `Thank you for using geeker now you will charged accordingly `
					})
		}

	}
	useEffect(()=>{
		handleNewCardAdded()

	},[newCardAdded])

	const handleCustomerWantsToAddCard = async()=>{
		console.log("new_on_page ::::::::",new_on_page)
		try{
			let jobRes = await JobService.retrieveJob(fetchJobId)
			if(customerWantsToAddCard === false && new_on_page == false && newCardAdded === false){
			console.log("customer dont want to add cards this is working")
				calledInterval = false
				refreshStartTimer = true
				if(tiRef && tiRef != null && tiRef.current != null){
					// setTimerStarted(true);
						if(!jobRes.technician_paused_timer){
							console.log("tiref 2:::::::::::::::::::::::::")
							socket.emit("start-card-timer",{"id":jobId})
							tiRef.current.start();
						}
						try{
							await updateTimerForJob()
						}
						catch(e){
							console.log("error in updating timer for the job funcName:[handleCustomerWantsToAddCard] ::::: ",e)
						}
					
					// setEnableStartPauseTimerButton(true);
				}
				//changes on Working code
				
				//changes on working code ended
				try{
					let haveCard = await checkIfCustomerHasCard()
					let paidJobs = await JobService.getTotalPaidJobs({"customer":user.customer.id})
					console.log("haveCard ::::::: customerWantsToAddCard",handleMainConditions)
					console.log("paidJobs :",paidJobs)
					console.log("condition paidJobs :::",paidJobs <= 1)
					console.log("haveCard ::::",haveCard)
					console.log("jobRes ::::::::::::: ",jobRes)
					console.log("!jobRes.technician_paused_timer :::::::: ",!jobRes.technician_paused_timer)
					if(paidJobs <= 1 && !jobRes.technician_paused_timer){
						pollingBoth()
						handleMainConditions(minutesFreeForClient,updateTimingsForFreeCustomer,endMeeting,handleEndOnPopup,haveCard)
					}
					setCustomerWantsToAddCard(null)
				}
				catch(e){
					console.log("error in calling the popup again funcName:[handleCustomerWantsToAddCard] ::::::: ",e)
				}

				// cardTimer(minutesFreeForClient,audio,socket,handleEndOnPopup,freeMin,updateTimingsForFreeCustomer,jobId,endMeeting,false,true)
				// startCardTimer()
			// }
			}
		}
		catch(e){
			console.log("error in retrieving job :::::: ",e)
		}
		

	}
	useEffect(()=>{
		console.log("customerWantsToAddCard ::::::",customerWantsToAddCard)
		
		handleCustomerWantsToAddCard()
	},[customerWantsToAddCard])

	useEffect(()=>{

		if(api != null && api.getNumberOfParticipants() === -1){

			setJitsiSessionEnd(true);
		}
		if(job){



			fetchJobId = job.id
			
			setCustomerContiuedHisFirstMeeting(job.customerContiuedHisFirstMeeting)
			console.log('Job>>>>>',job)		
		
			if(job.meeting_start_time && job.status !== 'Waiting'){
				let meeting_start_time = new Date(job.meeting_start_time)
				let now_date = new Date()
				if(job.pause_start_time && job.pause_start_time !== '' && job.meeting_pause){
					now_date = new Date(job.pause_start_time)
				}
				let lastInterval = false
				let seconds = job.total_seconds
				seconds = (job.total_pause_seconds ? parseInt(seconds)- job.total_pause_seconds : parseInt(seconds))
				let milliseconds = seconds * 1000
				setIntialTimeVal(milliseconds)
				let minutes = seconds /60
				console.log("minutes :::::: :",minutes)
				console.log("conditions :::::::::",minutes < (minutesFreeForClient-2) && timerCalled == false && minutes >= 0)
				console.log("")

				if(minutes < (minutesFreeForClient-2) && timerCalled == false && minutes >= 0 ){
					let customerId;
					if(job && job.customer && job.customer.id){
						customerId = job.customer.id						
					}
					if(user && user.customer && user.customer.id){
						customerId = user.customer.id						
					}

					let secremain = 120
					let filter_dict = {}
					filter_dict['customer'] = customerId
					filter_dict['customerConfirmedNotes'] = true
					timerCalled = true
					let waitMinSeconds =  (minutesFreeForClient-2) > minutes? ((minutesFreeForClient-2)-minutes) *60000 : 0
					console.log("waitMinSeconds:::1 ",waitMinSeconds)
					let additionalMinutes = (minutesFreeForClient) > minutes? ((minutesFreeForClient)-minutes) *60000 : 0
					const result = JobService.findJobByParams(filter_dict,{ page:1,pageSize:1000 })
					result.then(async(res)=>{
						    setDontCalc(true)
							console.log("waitMinSeconds::: ",waitMinSeconds)
							console.log("res.jobs :::::::",res.jobs)
							if(res.jobs && res.jobs.totalCount && res.jobs.totalCount === 1 ){
								let customer_info = await CustomerApi.retrieveCustomer(customerId);
								let haveCard = customer_info.stripe_id && customer_info.stripe_id != "" ? true : false
								console.log("minutes ::::::::::",minutes)
								console.log("minutesFreeForClient ::::: ",minutesFreeForClient)
								console.log("minutes >= minutesFreeForClient && !haveCard :::::::",minutes >= minutesFreeForClient && !haveCard)
								if(minutes >= minutesFreeForClient && !haveCard && !popupTimerAlreadyCalled){
									endMeeting()
									return;
								}
								if(!refreshStartTimer){
									refreshStartTimer = true
								}
							}
							 timerCalled = false 
						})
					}
				// console.log('hello start timer startImmediately')

				if(!job.meeting_pause){
					console.log('tiRef>>>>>>>>>>',tiRef)					
					window.stopPauseTimer = setTimeout(function(){ if(tiRef != null && tiRef.current != null){ tiRef.current.start() }}, 1000);
				}
				
			}
			let price = 0;
		    if(job.subSoftware && job.subSoftware.rate){
		    	price = job.subSoftware.rate;
		    }else if(job.software && job.software.rate){
		    	price = job.software.rate;
		    }
		    let issuesListArr = []
		    if(job.allNotes && job.allNotes.trim().length > 0 && job.technicianSubmitNotes){
	    		setWaitingForTechNotes(false)
	    		issuesListArr = job.allNotes.split('|SEP|');
	    		setIssuesList(issuesListArr);
	    	}
	    	if(job.customerConfirmedNotes){
	    		setNotesConfirmed(true);
	    	}
	    	if(job.customerDeclinedNotes){
	    		setDeclineMessageShow(true);	
	    	}
	    	if(job.customerDeclinedNotes){
	    		setNotesDeclined(true)
	    	}
	    	if(job.confirmedNotes && job.confirmedNotes.trim().length > 0 && job.customerConfirmedNotes){
	    		let confirmedIssuesListArr = job.confirmedNotes.split('|SEP|');
	    		setConfirmedIssuesList(confirmedIssuesListArr)
	    	}
	    	if(job.confirmedNotes && job.confirmedNotes.trim().length > 0 && job.customerConfirmedNotes){
	    		let confirmedIssuesListArr = job.confirmedNotes.split('|SEP|');
	    		setConfirmedIssuesList(confirmedIssuesListArr)
	    		if(issuesListArr.length === confirmedIssuesListArr.length){
	    			setAllNotesSelected(true)
	    		}
	    	}

		    setratePerTime(price)
			let softSettings = (job.subSoftware ? job.subSoftware : job.software)
			setSoftwareSettings(softSettings)
			setMeetingJob(job);
			if(job.status === "Completed"){
				window.location.href =  `/meeting-feedback/${job.id}`
			}			
		}
	},[job,meetingJob])


	useEffect(() => {
		if (user && jobId) {
			createMeeting({
				email: user.email,
				name: `${user.firstName.trim()} ${user.lastName.trim()}`,
				avatar:
					'https://www.gravatar.com/avatar/73543542128f5a067ffc34305eefe48a',
				userId: user.id,
				group: 'justwinkit',
				aud: 'jitsi',
				iss: 'panther-core',
				sub: JITSI_URL.BASE_URL,
				room: jitsiMeetId,
				authRoom: '*',
				exp: 24,
			});
		}
	}, [user, jobId, jitsiMeetId]);

	useEffect(() => {
		if (meetingId) {
			getJitsiMeet(meetingId);
		}
	}, [meetingId]);

	useEffect(() => {
		if (currentStep === 0) {
			setJobTime(0);
		}
	}, [currentStep]);

	const handleParticipantMic = ()=>{
			if (api != null){
				api.executeCommand('toggleAudio');
			}	
	}

	const loadJitsiScript = () => {
		let resolveLoadJitsiScriptPromise = null;

		const loadJitsiScriptPromise = new Promise((resolve) => {
			resolveLoadJitsiScriptPromise = resolve;
		});

		const script = document.createElement('script');
		const script2 = document.createElement('script');
		const script3 = document.createElement('script');
		// script.src =
		//   "https://shard1-tetch-front.panthermediasystem.net/external_api.js"; //mytestroom

		script.src = JITSI_URL.FULL_URL+'external_api.js'; // winkit.ml mytestroom
		script.async = true;
		script2.src = "https://code.jquery.com/jquery-3.5.1.min.js"
		script3.src = "https://meet.jit.si/libs/lib-jitsi-meet.min.js"
		script2.async = true;
		script3.async = true;
		script.onload = () => resolveLoadJitsiScriptPromise(true);
		document.body.appendChild(script);
		document.body.appendChild(script2);
		document.body.appendChild(script3);

		return loadJitsiScriptPromise;
	};

	const screenInvite = () => {
		// mixpanel code//
     	mixpanel.identify(user.email);
     	setshowStopButton(!showStopButton)
      	mixpanel.track('Customer - Share your screen with technician',{'JobId':jobId});
      	// mixpanel code//
		setInvited(true)
		socket.emit('invite-screen', { id: jobId });
		api.executeCommand("toggleShareScreen")		
	};

	const stopShareScreen = () => {	

		// mixpanel code//
     	mixpanel.identify(user.email);
      	mixpanel.track('Customer - Stop screen share',{'JobId':jobId});
      	// mixpanel code//
		if(api!=null && showStopButton === true){	
			api.executeCommand('toggleShareScreen');	
			setshowStopButton(false);	
				
		}	
	};

	const handleEndOnPopup = (key)=>{
		if(window.cardTimerUpdater){
			clearInterval(window.cardTimerUpdater)
		}
		if(window.clearIntervalTimer){
			clearInterval(window.clearIntervalTimer)
		}
		if(window.lastMinuteInterval){
			clearInterval(window.lastMinuteInterval)
		}
		if(window.alreadyFilledInterval){
			clearInterval(window.alreadyFilledInterval)
		}
		if(window.alreadyFilledInterval){
			clearInterval(window.alreadyFilledInterval)
		}
		notification.destroy()
		endMeeting()
	}
  	const clicksession = async() => {    
  		mixpanel.identify(user.email);
	    mixpanel.track('Customer - Start Zoho Session',{'JobId':jobId});


    	const res = await JobApi.sendDataSession(user.email);  
    	var my_session_data = JSON.parse(res)
    	my_session_data['job'] = job
    	socket.emit('zoho-session', my_session_data);
    	window.open(my_session_data['representation']['customer_url'], '_blank');
  	}

	const rejoinPhoneCall = async() => {  
		// mixpanel code//
	    mixpanel.identify(user.email);
	    mixpanel.track('Customer - Rejoin',{'JobId':jobId,'meetingMethod':method});
	     // mixpanel code//

	    if(!computerAudioEnabled){
	    	window.localStorage.setItem("customerCallingHimSelf",true)
	    	console.log('reload>>>>>>>>>>>>>>>>>>>>111')
  			window.location.reload();
	    }

		// console.log('method>>>>>>>',method)
		if(method === "ComputerAudio"){
	    	console.log('reload>>>>>>>>>>>>>>>>>>>>2222')

			window.localStorage.setItem("customerCallingHimSelf",true)
			window.location.reload()
		}
		else{

			let extLength = (job.customer.extension && job.customer.extension !== '' ? job.customer.extension.length : "0")
			let extension = job.customer.extension && job.customer.extension != null ? job.customer.extension : ""
			api.invite(
				[{allowed: true,number: `${job.customer.phoneNumber+ job.customer.extension.split("+")[1]+extLength}`,originalEntry:`${job.customer.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}])
		}
  	}

	const initialiseJitsi = async (computerAudioEnabled) => {
		window.localStorage.removeItem("jitsiLocalStorage");
		let startSilentMeeting = false
		let customerCalledHimself = false
		try {
			var callDone = true;
			if (!window.JitsiMeetExternalAPI) {
				console.log('1111111111111 no load jitsi script')
				await loadJitsiScript();
			}
			console.log('outside no load jitsi script')

			if (computerAudioEnabled){
				startSilentMeeting = true
			}
			// if(window.localStorage.getItem("customerCallingHimSelf") != null && window.localStorage.getItem("customerCallingHimSelf") == "true"){
			// 	startSilentMeeting = true
			// 	customerCalledHimself = true
			// 	setAudioIcon(true)
			// }
			api = new window.JitsiMeetExternalAPI(JITSI_URL.BASE_URL, {
				interfaceConfigOverwrite: {
					SHOW_PROMOTIONAL_CLOSE_PAGE: false,

					DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
				},
				
				configOverwrite: {
					startScreenSharing: false,
					startWithAudioMuted: computerAudioEnabled,
					startWithVideoMuted:true,
					notifications: [],
					toolbarButtons: [
						'microphone',
						'fullscreen',
						'fodeviceselection',
						'profile',
						'chat',
						'desktop'
					],
				},

				parentNode: document.getElementById(jitsiContainerId),
				roomName: jitsiMeetId,
				jwt: '',
				displayName: 'Screen Sharing',
				userInfo: {
					displayName: user?.firstName.trim() + user?.lastName.trim(),
					email : user.email,
					id: 1,
				},
			});	

			console.log('update problem in job correction by manibha 17-03-22')
			JobService.updateJob(jobId,{"callStartType":"ComputerAudio"})

			api.on('micError',(type,message)=>{
				openNotificationWithIcon("info","Info","Audio Permission Denied")
			})
			api.on('videoConferenceLeft', () => {
				stopShareScreen();
			});
			if(computerAudioEnabled){
				api.setAudioOutputDevice(null,null)
			}
			console.log("particpantinfo ::",api.getParticipantsInfo())
			api.on('videoConferenceJoined', () => {
				// console.log('joined>>>>>>>>>>>>>>')
				socket.emit("DisableLoader")
				// mixpanel code//
		     	mixpanel.identify(user.email);
		      	mixpanel.track('Customer - Jitsi session started',{'JobId':jobId});
		      	// mixpanel code//			
			});
			api.on('screenSharingStatusChanged', (screen_data) => {
				if(screen_data['on'] ===  true){
					setshowStopButton(true);
				}else{
					setshowStopButton(false);
				}
			});
			api.on("incomingMessage",()=>{
				
				audio.play()
				openNotificationWithIcon("info","Info","New Message from Technician")

			})

			api.on('readyToClose', () => {
			     history.push()
			});
			
			if((callDone && computerAudioEnabled === true) || customerCalledHimself){
				window.localStorage.setItem("customerCallingHimSelf",false)
				handleParticipantMic()
				let extLength = (job.customer.extension && job.customer.extension !== '' ? job.customer.extension.length : "0")
				let extension = job.customer.extension && job.customer.extension != null ? job.customer.extension : ""
				api.invite(
					[{allowed: true,number: `${job.customer.phoneNumber+ extension+extLength}`,originalEntry:`${job.customer.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}]
				).then(()=>{
					console.log("success111")
				});
				callDone = false
			}
			api.on('participantJoined', () => {
				// /*setEndMeetingBtnDisabled(false)	*/			
				setShowLoader(false);
			});

			window.participantInfo = setTimeout(function(){
				if(api){
					let partispantsArr = api.getParticipantsInfo()
					console.log("partispantsArr>>>>09-03-22",partispantsArr)
					if(partispantsArr.length > 0){
						let valueToFind = user.firstName.trim()+user.lastName.trim()+' (me)';
						console.log("valueToFind++++++++++++",valueToFind)
						let result = partispantsArr.find( ({ formattedDisplayName }) => formattedDisplayName === valueToFind );
						console.log("result********************",result)
						if(!result){
							retryJitsi();
						}
						if(result){
							console.log("set loader false>>>>>>09-03-22")
							setShowLoader(false);
						}
					}else{
						retryJitsi();
					}
				}
				else{
					console.log('retry in else>>>>09-03-22')
					retryJitsi();
				}

			},35000)

		} catch (error) {
			console.log('error from initialize jitsi', error);
			retryJitsi();
		}
	};

	const retryJitsi = () => {
		if(job && job.id && job.status !== "Completed"){
			console.log("Going to reload page to reinitialize jitsi");
			window.location.href= `/customer/job/${job.id}`
		}
	}
	useEffect(() => {
		if (invited) {
			console.log("yes invited")
		}
	}, [invited]);

	useEffect(()=>{
		if(isModalOpen){
			if(api!=null && showStopButton === true){	
				openNotificationWithIcon("info","Info","For Security reasons we stopped your screen sharing. Please enter card details and start screen share again.")
				api.executeCommand('toggleShareScreen');	
				setshowStopButton(false);
			}	
		}

		if(isModalOpen === false && newCardAdded == false){
			console.log("inside modal false ::::::::: ")
			console.log("customer dont want to add cards")
			setCustomerWantsToAddCard(false)
		}
	},[isModalOpen])

	const updateTimingsForFreeCustomer = async(key,updateTime=null,clear_interval=null,secremain)=>{
		console.log("using  :::::::::::: ",secremain)
		if(tiRef && tiRef != null && tiRef.current != null){
					// setTimerStarted(true);
					tiRef.current.stop();
					// setEnableStartPauseTimerButton(true);
			}

		seconds_remaining = secremain 
		if(window.cardTimerUpdater){
			clearInterval(window.cardTimerUpdater)
		}
		if(window.clearIntervalTimer){
			clearInterval(window.clearIntervalTimer)
		}
		if(window.lastMinuteInterval){
			clearInterval(window.lastMinuteInterval)
		}
		if(window.alreadyFilledInterval){
			clearInterval(window.alreadyFilledInterval)
		}
		try{
			await JobService.updateJob(job.id,{"meeting_pause":true})
		}	
		catch(e){
			console.log("error in update job :::",e)
		}
		
		// clearInterval(window.clear_interval)
		if (job.customer.stripe_id != undefined && job.customer.stripe_id != ""){
			setNewCardAdded(true)
			return 
		}
		new_on_page = false
		socket.emit("stop-timer-due-to-card",{"id":jobId})
		setCustomerWantsToAddCard(true)
		setIsModalOpen(true)		
	}

	async function updateJobTime(){
		const res = await JobApi.retrieveJob(jobId);
		if(!res.meeting_start_time){
			tiRef.current.start()
			let secremain = 120
			let className = `d-block label-total-value `
			var countDownTarget = new Date().getTime() + 1* 60 * 1000;
			let filter_dict = {}
			let lastInterval = false
			let additionalMinutes = minutesFreeForClient *60000 
			let customerId;
			if(job && job.customer && job.customer.id){
				customerId = job.customer.id
				
			}
			if(user && user.customer && user.customer.id){
				customerId = user.customer.id
				
			}

			setDisableContinueBtn(true)
			filter_dict['customer'] = customerId
			filter_dict['customerConfirmedNotes'] = true
			let startTimer = false
			const res = await JobService.findJobByParams(filter_dict,{ page:1,pageSize:1000 })
			
			if(res.jobs.totalCount <= 1)
			{
				const customer_info = await CustomerApi.retrieveCustomer(customerId);
				let haveCard = customer_info.stripe_id && customer_info.stripe_id != "" ? true : false
				console.log("haveCard ::::::::::: ",haveCard)
			}
			socket.emit('add-start-time-in-job', job);
		}
	}
	const kickPhoneParticipant = ()=>{
		try{
			if (api != null) {
				let participant_array = api.getParticipantsInfo()
				console.log("participant_array :::: :",participant_array)
				for (var k in participant_array){
					console.log("participant_array id:::: ",participant_array[k]['participantId'])
					let participant_id = participant_array[k]['participantId']
					console.log("condition 1 ::::::: ",participant_array[k]['displayname'] != user?.firstName.trim() + user?.lastName.trim())
					console.log("participant_array[k]['displayname'] ::: ",participant_array[k]['displayname'])
					console.log(" user?.firstName + user?.lastName :::: ", user?.firstName.trim() + user?.lastName.trim())
					if(participant_array[k]['displayname'] != user?.firstName.trim() + user?.lastName.trim()){
						console.log("kicking out participant ",participant_id)
						api.executeCommand("kickParticipant",participant_id)
					}
					
				}
				if(kick != null){
					kick.current.click()
				}
				api.executeCommand('hangup');
				api = null

			}
		}	
		catch(err){
			console.log("kickPhoneParticipant ::: ".err)
		}
	}
	const HandleHangup = async (data)=>{
		try{
			console.log("Cust :All data before hangup is ",data);
			console.log('job.id>>>>>>>>>>HandleHangup',jobId);
			console.log("job data is ",job);
			console.log("meetingJob data is ",meetingJob);
			WebSocket.updateSocket(data['web_socket_id'],{'hitFromCustomerSide':true})
		}
		catch(err){
			console.log("error in HandleHangup err :::",err)
		}
		notification.destroy()
		window.location.href =  `/meeting-feedback/${data.jobId}`;
	}


	const endMeetingConfirm = () => {
		Modal.confirm({
	      	title: 'Are you sure you want to end the meeting?',
		    okText: 'Continue',
		    cancelText: 'Go back',
		    className:'app-confirm-modal',
		    onOk(){
		        endMeeting();
		    },
	    });  		
	}	


	function convert_millis_to_hms_format(millis){
		let sec = Math.floor(millis / 1000);
		let hrs = Math.floor(sec / 3600);
		sec -= hrs * 3600;
		let min = Math.floor(sec / 60);
		sec -= min * 60;

		sec = '' + sec;
		sec = ('00' + sec).substring(sec.length);

		if (hrs > 0) {
			if(hrs < 10){
				min = '' + min;
				min = ('00' + min).substring(min.length);
				return '0'+hrs + ":" + min + ":" + sec;
			}else{
				min = '' + min;
				min = ('00' + min).substring(min.length);
				return hrs + ":" + min + ":" + sec;
			}

		}
		else {
			console.log("min ::::",min)
			if(min === 0){
				return  `00:00:${sec}`;
			}
			else if(min > 0 && min < 10){
				console.log("min > 0 && min < 10 :::::",min > 0 && min < 10)
				return  `00:0${min}:${sec}`;
			}else{
				console.log("condition 2::::::",min > 0 && min < 10)
				return  `00:${min}:${sec}`;
			}
		}
	}



	const endMeeting = async (intervals,clear_interval=null) => {
		setJitsiSessionEnd(true);
		setDisabledEndCall(true)
      	console.log("Inside end meeting of customer")
      	clearInterval(window.pollingInterval)
      	clearAllTimeOuts()
		// mixpanel code//
		clearAllIntervals(true)
     	mixpanel.identify(user.email);
      	mixpanel.track('Customer -End meeting',{'JobId':jobId});
      	// mixpanel code//
		setMethod("ComputerAudio");
		window.localStorage.setItem("secs",0)
		window.localStorage.removeItem("secs")
		window.localStorage.removeItem("extraMin")

		let jobTechId = (job && job.technician && job.technician.id ? job.technician.id : "");
		let data = {jobId : jobId,user_type:user.userType,techId:jobTechId}

		let fetchUpdatedJob =  await JobService.retrieveJob(job.id)
		console.log('fetchUpdatedJob>>>>>>>>',fetchUpdatedJob)
		let miliseconds = fetchUpdatedJob.total_seconds*1000
		console.log('miliseconds>>>>>>>',miliseconds)
		data['total_time'] =  convert_millis_to_hms_format(miliseconds)
		console.log(data['total_time'],'.............................')


		data['job_data'] = job
		data['total_seconds'] = fetchUpdatedJob.total_seconds
		let totalPaidJobsCount = await getTotalPaidJobs({'customer':job.customer.id})
        console.log("totalPaidJobsCount",totalPaidJobsCount)

		data['is_free_job'] = (totalPaidJobsCount > 1 ? false : true)

		if(notification){
			notification.destroy()
		}
		let totalCostGenerationData = {"jobId":jobId,"customerId":job.customer.id}
		console.log("************************ Job Service Request Total Cost  *****************************************")
		let res = await JobService.generateTotalCost(totalCostGenerationData)
		console.log("************************ Job Service Request Total Cost *****************************************")

		await CreateEarningReport(jobId, job, res.total_cost);		


		if (api != null) {
			let participant_array = api.getParticipantsInfo()
				console.log("participant_array :::: :",participant_array)
				for (var k in participant_array){
					console.log("participant_array id:::: ",participant_array[k]['participantId'])
					let participant_id = participant_array[k]['participantId']
					console.log("condition 1 ::::::: ",participant_array[k]['displayName'] != user?.firstName.trim() + user?.lastName.trim())
					console.log("participant_array[k]['displayname'] ::: ",participant_array[k]['displayName'])
					console.log(" user?.firstName + user?.lastName :::: ", user?.firstName.trim() + user?.lastName.trim())
					if(participant_array[k]['displayName'] != user?.firstName.trim() + user?.lastName.trim()){
						console.log("kicking out participant ",participant_id)
						api.executeCommand("kickParticipant",participant_id)
					}
					
				}
			api.executeCommand('hangup');
		}
		console.log("Data in end meeting is ",data)
		await WebSocket.create({
		        user: user.id,
		        job : jobId,
		        socketType:'meeting-closed',
		        userType:user.userType,
		        data:data,
		        from:"meetingEnd"
			});
	}

  	const hideLoader = ()=>{
		setShowLoader(false)
	}



  	const confirmNotes = async() => {
  		setEmptyNotesAlert(false);
  		if(confirmedIssuesList.length === 0){
  			setEmptyNotesAlert(true);
  		}else{
	  		Modal.confirm({
		      title: 'By selecting “continue,” you confirm we’ve understood and summarized your issue correctly. You will not be able to request support for additional issues during this session.',
		      okText: 'Continue',
		      cancelText: 'Go back',
		      className:'app-confirm-modal',
		      onOk() {
		        confirmNotesSubmit();
		      },
		    });  		
  		}
  	}
  	const confirmNotesSubmit = async() => {
  		setNotesSaveLoader(true)
  		confirmedIssuesList.sort(function(a, b){  
		  return issuesList.indexOf(a) - issuesList.indexOf(b);
		});

  		window.confirmNotesSubmit = setTimeout(async function(){
  			let confirmedNotes = confirmedIssuesList.join("|SEP|");
	  		await updateJob(jobId,{confirmedNotes:confirmedNotes,"customerConfirmedNotes":true,})
	  		setAlertMessageShow(true)
	  		setNotesConfirmed(true);
	  		let data = {}
			data['jobId'] = jobId
			data['customerConfirmedNotes'] = true
			socket.emit("customer-confirmed-notes",data)

	  		mixpanel.identify(user.email);
	      	mixpanel.track('Customer - Confirmed the notes',{'JobId':jobId});

	      	//Start the meeting time
	      	updateJobTime()

	  		window.noteSaveLoaderTimeOut = setTimeout(function(){
				setNotesSaveLoader(false)
			},1500)
			window.alertMessageTimeOut = setTimeout(function(){
				setAlertMessageShow(false)
			},4000)
  		},1000)
  	}

  	const declineNotes = async() => {
  		Modal.confirm({
	      title: 'We`ll send these notes back to technician to review it again. Do you want to proceed?',
	      okText: 'Continue',
	      cancelText: 'Cancel',
	      className:'app-confirm-modal',
	      onOk() {
	        declineNotesSubmit();
	      },
	    });  		
  	}

  	const declineNotesSubmit = async() => {
  		setNotesDeclineLoader(true)
  		await updateJob(jobId,{"customerDeclinedNotes":true, "technicianSubmitNotes":false})
  		setDeclineMessageShow(true)
  		setNotesDeclined(true)
  		
  		let data = {}
		data['jobId'] = jobId
		data['customerDeclinedNotes'] = true
		socket.emit("customer-declined-notes",data)

  		mixpanel.identify(user.email);
      	mixpanel.track('Customer - Declined the notes',{'JobId':jobId});

  		window.notesDeclineTimer = setTimeout(function(){
			setNotesDeclineLoader(false)
		},1500)
  	}

  	const issueChecked = (e) => {
  		if(e.target.value === 'all'){
  			setAllNotesSelected(!allNotesSelected)
  			if(e.target.checked){
  				setConfirmedIssuesList(issuesList)
  			}else{
  				setConfirmedIssuesList([])
  			}
  		}else{
  			setAllNotesSelected(false)
			let confirmedIssuesListArr = [...confirmedIssuesList];
			let idx = e.target.value
	  		if(e.target.checked){
	  			confirmedIssuesListArr.push(issuesList[idx])
	  		}else{
	  			let findIdx = confirmedIssuesListArr.indexOf(issuesList[idx])
	  			confirmedIssuesListArr.splice(findIdx,1)
	  		}
	  		setConfirmedIssuesList(confirmedIssuesListArr)

	  		if(confirmedIssuesListArr.length === issuesList.length){
	  			setAllNotesSelected(true)
	  		}
  		}
  	}
  	const handleUserUsingComputer = ()=>{
  		try{
  			handleParticipantMic()
  			window.localStorage.setItem("customerCallingHimSelf",false)
  			// window.location.reload()
  		}
  		catch(err){
  			console.log("error ::::: ",err)
  		}
  	}
  	const call_yourself = ()=>{
  			handleParticipantMic()
  			let extLength = (job.customer.extension && job.customer.extension !== '' ? job.customer.extension.length : "0")
			let extension = job.customer.extension && job.customer.extension != null ? job.customer.extension : ""
  			api.invite(
			[{allowed: true,number: `${job.customer.phoneNumber+ extension+extLength}`,originalEntry:`${job.customer.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}]
			).then(()=>{
				console.log("successfully called myself")
			});
		window.localStorage.setItem("customerCallingHimSelf",true)
		// window.location.reload();
  		
  	}

  	const call_technician = ()=>{

  		if(api != null){
  			setDisabledCallTechnician(true)
  			api.invite([{allowed: true,number: `${job.technician.profile.confirmId.phoneNumber+"0"}`,originalEntry: `${job.technician.profile.confirmId.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}])
  			window.disabledCallTechnician = setTimeout(function(){ setDisabledCallTechnician(false) }, 15000);
  		}
  		
  	}

	return (
		<Container fluid>
			<Row>
                <Col md="3" lg="2">
                    <Row>
					    <Col xs={12} className="pt-4">
					        <div className="bar-logo-box">
					          	<Link to="/">
					            	<Image onClick={localStorage.removeItem('CurrentStep')}src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="Geeker" />
					          	</Link>
				        	</div>
				      	</Col>
					      
				      	<Col xs={12} className="mt-4 side-menu-bar px-3">
				      		<Row>
					      		{waitingForTechNotes &&
						      		<Col xs={12}>
								        <h5 className="font-weight-bold">First, let’s confirm your issue</h5>
			      						<ProgressStyled percent={40} showInfo={false} />
		      						</Col>
		      					}
		      					{jobDetailsUpdated &&
						            <Alert variant='success' className="w-100">
						                Technician updated the job details. You can see the updated information at bottom of meeting block.
						            </Alert>
					          	}
		      					{!waitingForTechNotes &&
		      						<>
		      							{alertMessageShow &&
								            <Alert variant='success' className="w-100">
								                Thanks for confirmation.
								            </Alert>
							          	}
							          	{declineMessageShow &&
								            <Alert variant='danger' className="w-100">
								                Notes are declined by you. Technician will review the notes again. Please wait for technician input.
								            </Alert>
							          	}
							          	{emptyNotesAlert &&
								            <Alert variant='danger' className="w-100">
								                Please select the issues you want to solve before confirm.
								            </Alert>
							          	}
		      							<Col xs={12}>
		      								{notesConfirmed 
		      									?
									        		<h5 className="font-weight-bold">Confirmed Points :</h5>
								        		:
								        			<h5 className="font-weight-bold">Please confirm the issues listed :</h5>
		      								}
			      						</Col>
			      						<Col xs={12} className="notes-outer">
			      							 {issuesList.length > 0 &&
								        		<ul className="small-text p-0 m-0">
								        			{!notesConfirmed &&
									        			<li className="issue-list-item-with-check">
							        						<label className="m-0">
								        						<span className="issue-checkbox-outer">
								        							<input 
								        								type="checkbox" 
								        								value='all' 
								        								className="issue-checkbox" 
								        								onChange={issueChecked}
								        								disabled={meetingJob.customerConfirmedNotes}
								        								checked={allNotesSelected}
								        								id={"checkbox-issue-all"}
							        								/>
								        						</span>
							        							<span htmlFor={"checkbox-issue-all"} className="issue-text"><b>Select all</b></span>
							        						</label>
							        					</li>
							        				}
									        		{
									        			issuesList.map((i,idx)=>{
									        				return (
									        					<li className="issue-list-item-with-check" key={'issue_item_'+idx}>
									        						<label>
									        						<span className="issue-checkbox-outer">
									        							<input 
									        								type="checkbox" 
									        								value={idx} 
									        								className="issue-checkbox" 
									        								onChange={issueChecked}
									        								disabled={meetingJob.customerConfirmedNotes}
									        								checked={(confirmedIssuesList.indexOf(i) === -1 ? false : true)}
									        								id={"checkbox-issue-"+idx}
								        								/>
									        						</span>
									        						<span htmlFor={"checkbox-issue-"+idx} className="issue-text">{i}</span>
									        						</label>
									        					</li>
									        				)
										        		})
										        	}
								        		</ul>
									        }
			      						</Col>
			      						{!notesConfirmed && !notesDeclined &&
			      							<>
				      						<Col xs={12}>
				      							<Button className={(notesSaveLoader ? "disabled-btn" : "")+" btn app-btn w-100 mt-3 notes-submit-btn"} onClick={confirmNotes} disabled={notesSaveLoader}>
				      								<span/>
				      								{notesSaveLoader 
				      									?
				      										<Spin/>
				      									:
				      										<>Confirm</>
				      								}
				      							</Button>
				      						</Col>

				      						<Col xs={12}>
				      							<Button className={(notesDeclineLoader ? "disabled-btn" : "")+" btn app-btn app-btn-transparent w-100 mt-3 notes-submit-btn"} onClick={declineNotes} disabled={notesDeclineLoader}>
				      								<span/>
				      								{notesDeclineLoader 
				      									?
				      										<Spin/>
				      									:
				      										<>Decline</>
				      								}
				      							</Button>
				      						</Col>
				      						</>
				      					}

			      					</>
		      					}
	      					</Row>
				        </Col>
			      	
				    </Row>

                </Col>
                <Col md="9" lg="10" className="px-4">
                	<Row>
                		<Loader height="100%" className={(showLoader ? "loader-outer" : "d-none")} />
                		<Col xs="12" className="jitsi-screen-outer mt-4">
							{showLoader && (
								<div className="session_loading">
									<button onClick={hideLoader} style={{"display":"none"}} ref={hideButton}>Hide me</button>Loading the session
								</div>
							 )}
							{jitsiSessionEnd &&
								<div className="no-meeting-loaded">
								 	<div className="meeting-area text-center">
								 		<h2 className="mb-3">Thanks for using Geeker service.</h2>
								 		<h1>Looked like meeting session is ended. Please reload your page.</h1>
								 	</div>
								 </div>
							}
							{!jitsiSessionEnd &&
								<div id={jitsiContainerId} />
							}
						</Col>
						<Col xs="12">
	                		<Col xs="12" className="jitsi-bottom-section my-4 p-3 radius-8">
	                			<Row>
	                				<Col lg="5" md="12">
	                					<Row>
	                						<Col xs="12" className="pt-3">
	                							<Row>
	                								<Col md="5">
	                									{meetingJob && meetingJob.customer &&
	                										<>	
	                											<p>
	                											<span className="meeting-label-name">Software:</span>
	                											<span >{job.software.name + (job.subSoftware ? ' ('+job.subSoftware.name+')' : '')}</span>
	                											</p>
                											</>
                										}
	                									{meetingJob && meetingJob.technician &&
	                										<>
		                										<span className="meeting-label-name">Technician:</span>
		                										<span className="meeting-label-value">
		                											{meetingJob.technician.user.firstName} {meetingJob.technician.user.lastName}
		                										</span>
		                									
	                										</>
	                									}
	                								</Col>
	                								<Col md="3">
	                									{meetingJob && meetingJob.estimatedTime 
	                										?
	                											<>
			                										<span className="meeting-label-name">Est. time:</span>
			                										<span className="meeting-label-value">
			                											{meetingJob.estimatedTime} mins
			                										</span>
		                										</>
	                										:
	                										<>
	                											{softwareSettings && softwareSettings.estimatedTime &&
			                										<>
				                										<span className="meeting-label-name">Est. time:</span>
				                										<span className="meeting-label-value">
				                											{softwareSettings.estimatedTime} mins
				                										</span>
			                										</>
			                									}
	                										</>
	                									}
	                								</Col>
	                								<Col md="4">
	                									{meetingJob && meetingJob.estimatedPrice
	                										?
	                											<>
			                										<span className="meeting-label-name">Est. price:</span>
			                										<span className="meeting-label-value">
			                											<EstimatedPriceToggle  softwareSettings = {meetingJob}/>
			                											<br/>
			                											{totalJobs === 0 &&
			                												<div className="small-font font-italic">(First 6 minutes free)</div>
			                											}
			                										</span>
		                										</>
	                										:
	                										<>
	                											{softwareSettings && softwareSettings.estimatedPrice &&
			                										<>
				                										<span className="meeting-label-name">Est. price:</span>
				                										<span className="meeting-label-value">
				                											<EstimatedPriceToggle  softwareSettings = {softwareSettings}/>
				                											<br/>
				                											{totalJobs === 0 &&
				                												<div className="small-font font-italic">(First 6 minutes free)</div>
				                											}
				                										</span>
			                										</>
			                									}
	                										</>
                										} 
	                								</Col>
	                							</Row>
	                						</Col>
	                						<Col xs="12" className="mt-3">
	                							{meetingJob && meetingJob.customer &&
            										<>
                										<span className="meeting-label-name">
                											{meetingJob.updatedIssueDescription && meetingJob.updatedIssueDescription.length > 0 
                												?
                													<>Issue (Added by you):</>
            													:
            														<>Issue:</>
                											}                											
                										</span>
                										<span className="meeting-label-value">
                											{meetingJob.issueDescription}                											
                										</span>
            										</>
            									}
	                						</Col>
                							{meetingJob && meetingJob.customer && meetingJob.updatedIssueDescription && meetingJob.updatedIssueDescription.length > 0 &&
		                						<Col xs="12" className="mt-3">
	        										<span className="meeting-label-name">Issue [Updated by technician ({meetingJob.updatedIssueDescription[meetingJob.updatedIssueDescription.length-1].technicianName})]:</span>
	        										<span className="meeting-label-value">
														{meetingJob.updatedIssueDescription[meetingJob.updatedIssueDescription.length-1].issueDescription}        											
	        										</span>
		                						</Col>
        									}
	                					</Row>
	                				</Col>
	                				<Col md="12" lg="7 text-right">
	                					<Row>
	                						<Col lg="2" md="12" className="pt-3 pt-lg-0">
	                							<div key={intialTimeVal} className="meeting-timer">
													<Timer initialTime={intialTimeVal} startImmediately={false} ref={tiRef}>
														{() => (
															<div className="f-16">
																<Timer.Hours
																	formatValue={(value) => {
																		value = (value > 9 ?  value : (value < 1) ? '00': '0'+value)
																		time.hours = value || 0;
																		return value || '0';
																	}}
																/>
																:
																<Timer.Minutes
																	formatValue={(value) => {
																		value = (value > 9 ?  value : (value < 1) ? '00': '0'+value)
																		time.minutes = value || 0;
																		return value || '0';
																	}}
																/>
																:
																<Timer.Seconds
																	formatValue={(value) => {
																		value = (value > 9 ?  value : (value < 1) ? '00': '0'+value)
																		time.seconds = value || 0;
																		return value || '0';
																	}}
																/>
															</div>
														)}
													</Timer>
												</div>
	                						</Col>
	                						<Col md="12" lg="6" className="text-right">
	                							<Row>
	                								<Col xs="12">
	                							<Row style={{justifyContent:"center"}}>
			                						<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Give remote access to technician.">
			                							<Row>
															<Col md="12" className="text-center p-0">
					                							<Button className="meeting-btn" onClick={clicksession}>
					                								<FontAwesomeIcon icon={faDesktop}/>
					                							</Button>
															</Col>
															<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																<a href="#" onClick={clicksession}>Remote</a>
															</Col>	
														</Row>			                							
			                						</Col>
			                						<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Invite user">
			                							<Row>
			                								<Col md="12" className="text-center p-0">
					                							<Button className="meeting-btn" onClick={()=>{dialInRef.current.click()}}>
					                								<FontAwesomeIcon icon={faPaperPlane}/>
					                							</Button>
															</Col>
															<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																<a href="#" onClick={()=>{dialInRef.current.click()}}>Invite</a>
															</Col>
														</Row>
			                							
			                						</Col>


			                						

			                						</Row>
			                						</Col>
			                						<Col xs="12">
	                							<Row style={{justifyContent:"center"}}>
			                						<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Call yourself on mobile">
			                							<Row>
					                						<Col md="12" className="text-center p-0">
					                							<Button className={(disabledCallYourself ? "disabled-btn" : "") +" meeting-btn"}  onClick={()=>{call_yourself()}} disabled={disabledCallYourself} title="Call yourself on phone">
					                								<FontAwesomeIcon icon={faPhone}/>
					                							</Button>
															</Col>
															<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																<a href="#" onClick={()=>{call_yourself()}} disabled={disabledCallYourself}>Call yourself</a>
															</Col>
														</Row>
													</Col>
													<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Call customer on mobile">
			                							<Row>
															<Col md="12" className="text-center p-0">
					                							<Button className={(disabledCallTechnician ? "disabled-btn" : "") +" meeting-btn"}  onClick={()=>{call_technician()}} disabled={disabledCallTechnician} title="Call customer on phone" >
					                								<FontAwesomeIcon icon={faPhoneAlt} />
					                							</Button>
															</Col>
															<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																<a href="#" onClick={()=>{call_technician()}} disabled={disabledCallTechnician}>Call Technician</a>
															</Col>
															
														</Row>
														
													</Col>
													</Row>
					                				</Col>
			                						<Col md="2" lg="3" xs="4" className="pt-3 text-center invisible" title="Kick Phone Participant">
			                							<Row>
			                								<Col md="12" className="text-center p-0">
					                							<Button className="meeting-btn" ref={kick} onClick={()=>{kickPhoneParticipant()}}>
					                								<FontAwesomeIcon icon={faPaperPlane}/>
					                							</Button>
															</Col>
															<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																<a href="#" onClick={()=>{kickPhoneParticipant()}}>Kick Phone Participant</a>
															</Col>
														</Row>
			                							

			                						</Col>
	                							</Row>
	                						</Col>
	                						
	                						<Col lg="4" md="12" className=" text-left text-lg-center pt-3">
	                							<Row>
	                								<Col md="12" className="end-meeting-btn-outer">
			                							<Button
															className={(disabledEndCall ? "disabled-btn" : "") +" app-btn app-btn-red"}
															onClick={() => {
																endMeetingConfirm();
															}}													
															title="Click this button to end the meeting."
															disabled={disabledEndCall}
														>	
														<span/>
														{disabledEndCall ?
															 <Spin/>															
															:
															<>End Meeting</>
														}

														</Button>
															

													</Col>
													{ job && job.customer &&<CustomerCard user={user} values={job.customer} onNext={false} onPrev={false} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} cardsInfo={cardsInfo} setCardsInfo={setCardsInfo} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} showCards={false} />}
													<Col md="12" className="app-link-outer">
														{ method !=="ComputerAudio" && <><span>Disconnected?</span> <Button className="app-btn app-btn-transparent joinBtn" onClick={rejoinPhoneCall} >  <span></span> Call me again </Button> </>}
													</Col>
												</Row>
	                						</Col>
	                					</Row>
	                				</Col>
	                			</Row>
								<ConfirmTechMatch 
									invited={true} 
									dialInRef={dialInRef} 
									stopScreenShare = {stopShareScreen}
									setInvitation = {setInvitation}
									setInvitedNumber = {setInvitedNumber}
									setExtension = {setExtension}
									remoteDesktopRef = {remoteDesktopRef}
								/>
								<ExtensionModal
									onClose={() => setIsExtensionModalOpen(false)}
									isOpen={isExtensionModalOpen}
								/>
								<PinModal pinCode={pinCode} onClose={handleModalClose} isOpen={isOpen} />
							</Col>
						</Col>
                    </Row>
                </Col>
			</Row>
		</Container>
	);
};

const Link = style(DOM.Link)`
  	cursor:pointer;
`;
const Image = style.img`
  	display: block;
  	width: 120px;
`;
const ProgressStyled = styled(Progress)`
  .ant-progress-success-bg,
  .ant-progress-bg {
    background-color: #1bd4d5;
  }
  .ant-progress-text {
    color: white !important;
  }
  .ant-progress-inner{
  	background-color: #CBD1D6;	
  }
`;

const EstimatedPriceToggle = (props)=>{
	// console.log(props,"i am the props")
	const time1 = (props.softwareSettings ? parseInt(props.softwareSettings.estimatedTime.split("-")[0]) : 'NA')
    const time2 = (props.softwareSettings ? parseInt(props.softwareSettings.estimatedTime.split("-")[1]) : 'NA')
	let price_per_six_min =props.softwareSettings.rate
	let price1 = (props.softwareSettings ? props.softwareSettings.estimatedPrice.split("-")[0] : price_per_six_min )
    let price2 = (props.softwareSettings ? props.softwareSettings.estimatedPrice.split("-")[1] : price_per_six_min )
	let temp1 = (time1/6)*parseInt(price1)
	temp1 = (temp1 ? temp1.toFixed(0) : 'NA')
	 let temp2 = (time2/6)*parseInt(price2)
	 temp2 = (temp2 ? temp2.toFixed(0) : 'NA')
	return <>
			${temp1}-{temp2}
	</>

}
CustomerJobProgress.propTypes = {};

export default memo(CustomerJobProgress);