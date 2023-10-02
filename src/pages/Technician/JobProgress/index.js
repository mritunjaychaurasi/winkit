import React, { memo, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Modal, Spin, Progress ,Table, Pagination,Checkbox} from 'antd';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import * as DOM from 'react-router-dom';
import Timer from 'react-compound-timer';
import { getIdFromJobId } from 'utils';
import { useJob } from '../../../context/jobContext';
import { useUser } from '../../../context/useContext';
import { useJitsiMeet } from '../../../context/jitsiMeetContext';
import Box from '../../../components/common/Box';
import { useSocket } from '../../../context/socketContext';
import ExtensionModal from '../JobAlert/steps/ExtensionModal';
import PinModal from '../JobAlert/steps/PinModal';
import {useTools} from '../../../context/toolContext';
import { openNotificationWithIcon,clearAllTimeOuts } from 'utils';
import ConfirmTechMatch from '../../Customer/JobProgress/steps/ConfirmTechMatch';
import { CopyOutlined } from '@ant-design/icons';
import * as TechnicianApi from '../../../api/technician.api';
import { useHistory } from 'react-router';
import Loader from '../../../components/Loader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faBan, faPencilAlt, faTrash,faClock, faPhone, faPhoneAlt,faVolumeUp} from '@fortawesome/free-solid-svg-icons';
import {useServices} from '../../../context/ServiceContext';
import  notifySound from '../../../assets/sounds/notification.mp3';
import logo from '../../../assets/images/logo.png';
import style from 'styled-components';
import mixpanel from 'mixpanel-browser';
import { JITSI_URL,JOB_CHARACTERS_ALLOWED} from '../../../constants';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import * as SoftwareApi from '../../../api/software.api';
import * as JobService from "../../../api/job.api";
import {useNotifications} from '../../../context/notificationContext';
import * as WebSocket from '../../../api/webSocket.api';

let calledTechnician = false
let jitsiIsLoaded = false
let api = null;
let count  = 0;
let audio = new Audio(notifySound)
const time = { seconds: 0, minutes: 0, hours: 0 };
let new_on_page = false
let cardFunctionCalled = false;
const TechJobProgress = () => {
	const moment = require('moment');
	const [ratePerTime,setratePerTime] = useState();
	const [MainInvitation,setInvitation] = useState(false);
	const [invitedNumber,setInvitedNumber] = useState('');
	const history = useHistory();
	const {createNotification,fetchNotifications} = useNotifications()
	const currentStep = 0;
	const [extension,setExtension] = useState('')
	const { jobId } = useParams();
	const [DeclinedReason,setDeclinedReasons] = useState('')
	const [meetingJob, setMeetingJob] = useState({});
	const [softwareSettings, setSoftwareSettings] = useState({});
	const [jitsiMeetId,setJitsiMeet] = useState(false);
	const {sethideBadge} = useTools()
	let locale = {
		emptyText: 'No past job found.',
	};
	console.log('jobId from starting>>>>>',jobId)

	const [showDeclineModal,setShowDeclineModal] = useState(false);

	const { setJobTime, fetchJob ,method,setMethod,job,updateJob, getTotalPaidJobs} = useJob();

	const { user } = useUser();
	const { getJitsiMeet, createMeeting, meetingId } = useJitsiMeet();
	const { socket } = useSocket();
	const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [pinCode, setPinCode] = useState('');
	const toggleInviteUserToScreenhare = false;
	const [computerAudioEnabled,setComputerAudioEnabled] = useState(true);
	const jitsiContainerId = '6063bd22202fb514ce26346b';
	const dialInRef = useRef(null);
	const remoteDesktopRef = useRef(null);
	const [showLoader,setShowLoader] = useState(true);
	const [intialTimeVal,setIntialTimeVal] = useState(0);
	const hideButton = useRef()
	const [isScreenShared,setIsScreenShared] = useState(false);
	const tiRef = useRef();
	const textAreaRef = useRef();
	const { CreateEarningReport } = useServices();
	const [notesSaveLoader, setNotesSaveLoader] = useState(false);
	const [alertMessageShow, setAlertMesasgeShow] = useState(false);
	const [waitingForCustomer,setWaitingForCustomer] = useState(false);
	const [notesAvailable,setNotesAvailable] = useState(false);
	const [declinedMessageShow,setDeclinedMessageShow] = useState(false);
	const [softwareList, setSoftwareList] = useState([]);
	const [showSidebarLoader, setShowSidebarLoader] = useState(false);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [showUpdateBlock, setShowUpdateBlock] = useState(false);
	const [jobUpdatedData, setJobUpdatedData] = useState({"software":'',"subSoftware":"","subOption":"","updatedIssueDescription":[],"estimatedTime":""});
	const [jobUpdatedIssueDescription, setJobUpdatedIssueDescription] = useState("");
	const [subOptionsList, setSubOptionsList] = useState([]);
	const [updateJobDetailsLoader, setUpdateJobDetailsLoader] = useState(false);
	const [updateDetailsMessageShow,setUpdateDetailsMessageShow] = useState(false);
	const [subSoftwareList, setSubSoftwareList] = useState([]);
	const [selectedSubSoftware, setSelectedSubSoftware] = useState('');
	const [jobDetailsErrorMsgShow, setjobDetailsErrorMsgShow] = useState(false);
	const [jobDetailsErrorMsg, setjobDetailsErrorMsg] = useState('Please select the required fields');
	const [visible, setVisible] = useState(false);
	const [allJobs,setAllJobs] = useState([]);
	const [issuesList, setIssuesList] = useState([]);
	const [freeSession,setFreeSession] = useState(0)
	const [editIssueIdx, setEditIssueIdx] = useState('');
	const [confirmedIssuesList, setConfirmedIssuesList] = useState([]);
	const [disabledCallYourself, setDisabledCallYourself] = useState(false);
	const [disabledCallCustomer, setDisabledCallCustomer] = useState(false);
	const [isJitsiLoaded,setIsJitsiLoaded] = useState(false)
	const [showStartTimerbtn, setShowStartTimerbtn] = useState(false);
	const [showPauseTimerbtn, setShowPauseTimerbtn] = useState(true);
	const [enableStartPauseTimerButton, setEnableStartPauseTimerButton] = useState(false);
	const [meetingPauseStartTime, setMeetingPauseStartTime] = useState('');
	const [estTimeFrom, setEstTimeFrom] = useState(1);
	const [estTimeTo, setEstTimeTo] = useState(1);
	const [showTransfterCallLoader, setShowTransfterCallLoader] = useState(false);
	const [transferCallErrors, setTransferCallErrors] = useState({});
	const [estTimeFromErrorMsg, setEstTimeFromErrorMsg] = useState('');
	const [estTimeToErrorMsg, setEstTimeToErrorMsg] = useState('');	
	const [jitsiSessionEnd, setJitsiSessionEnd] = useState(false);
	const [disabledEndCall, setDisabledEndCall] = useState(false);
	const [totalJobs,setTotalJobs] = useState(1);
	const [currentPage,setCurrentPage] = useState(1);
	const [disabledStartTimerButton, setdisabledStartTimerButton] = useState(false);
	const [disabledPauseTimerButton, setdisabledPauseTimerButton] = useState(false);
	const [hireExpert,setHireExpert]= useState(false);

	const pollingBoth = ()=>{
		if(!new_on_page){
			new_on_page = true
			window.pollingInterval = setInterval(async()=>{
				let totalHoursInSeconds = (parseInt(time.hours) > 0 ? parseInt(time.hours)*60*60 : 0)
				let totalMinsInSeconds = (parseInt(time.minutes) > 0 ? parseInt(time.minutes)*60 : 0)
				let totalSeconds = parseInt(time.seconds)
				let jobTimerinSeconds = totalHoursInSeconds+totalMinsInSeconds+totalSeconds;
				let updateTimer = JobService.updateTimer({"sample":jobTimerinSeconds,"jobId":jobId})
				console.log("updating the timer second by second")

			},3000)
		}
	}
	window.intialJitsi = setTimeout(()=>{
		if(!isJitsiLoaded){
			initialiseJitsi(computerAudioEnabled)
		}
	},5000)
	window.recordingTimeOut = setTimeout(()=>{
		if(api != null){
			api.executeCommand("startRecording",{
				mode:"file"
			})
		}
	},10000)
	const push_to_job_detail = (e) => {
		const currentJobId = e.currentTarget.name;
		window.open(`/job-details?jobID=${currentJobId}&type=noapply&from=customerhistory`, '_blank').focus();
	};
	const handleParticipantMic = ()=>{
			if (api != null){
				api.executeCommand('toggleAudio');
			}	
	}
	

	const call_fetch_jobs = async (filter,pagination={ page: 1,pageSize:10 }) => {
		
		const res = await JobService.findJobByParams(filter,pagination);
		if(res !==undefined){
			let all_data = [...res.jobs.data]
			for(let i=0;i<= all_data.length -1  ;i++){
				if(all_data[i]['tech_declined_ids']  && all_data[i]['tech_declined_ids'].includes(user.technician.id)){
					all_data[i]['status'] = 'Declined by customer'
				}
			}

			setAllJobs(all_data)
			setTotalJobs(res.totalPages)
			return res.jobs

		}
		else{
			return []
		}
	}

	const handlePagination = async(page,pageSize) =>{
		setCurrentPage(page)

		let pagination={ page: page,pageSize:pageSize }
		let query  = {"customer":job.customer.id,"status":"Completed"}
		call_fetch_jobs(query,pagination)

	 }


	useEffect(()=>{
		if(api != null && MainInvitation){
			// api.invite([{allowed: true,number: `${invitedNumber + '-'+ extension+extension.length}`,originalEntry:`${invitedNumber}`,showCountryCodeReminder: false,type: "phone"}])
			// console.log("extension",extension)
			let extLength = (extension && extension !== '' ? extension.length : "0")
			// console.log("extLength",extLength)
			api.invite([{allowed: true,number: `${invitedNumber + extension+extLength}`,originalEntry:`${invitedNumber}`,showCountryCodeReminder: false,type: "phone"}])
			setInvitation(false)
		}
	},[invitedNumber])

	useEffect(() => {
		try{
			let iframe  =  document.querySelector('[title="Button to launch messaging window"]');
			let buttonIframe = document.querySelector('[title = "Message from company"]')
			if(buttonIframe){
				buttonIframe.style.display = "none"
			}
			if(iframe){
			  iframe.style.visibility = "hidden"
			}
		}
		catch(err){
			console.log("error in hiding the chatbot iframe")
		}
		
		socket.emit('join', jobId);
	}, []);



	useEffect(() => {
		setComputerAudioEnabled(false)
		if(job && job.callStartType != undefined){
			window.jitsiTimeout = setTimeout(()=>{
				if(jitsiMeetId !== false  && jitsiMeetId === getIdFromJobId(jobId) && jitsiIsLoaded === false ){
					initialiseJitsi(computerAudioEnabled)
				}
				
			},4000)
		}

	}, [job]);

	useEffect(()=>{
		(async () => {
			console.log("job in async useeffect**********",job)
			if(job && job.customer && !cardFunctionCalled){                
				cardFunctionCalled = true;
			}
		})();
	},[job]);

	useEffect(()=>{
		socket.on("hangup-all",(data)=>{
			console.log("Received signal to technician hangup-all")
			HandleHangup(data)
		})
		socket.on("setLoaderFalse",()=>{
			setShowLoader(false)
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Jitsi session started',{'JobId':jobId});
			// mixpanel code//

		})

		socket.on("send-tech-to-zoho-session",(data)=>{
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Received Zoho Session',{'JobId':jobId});

			console.log("Received signal to zoho meeting")
			window.open(data['representation']['technician_url'], '_blank');
		})
		socket.on("notification-to-technician-for-timeout",()=>{
			audio.play()
			console.log("Received notification for setting the message")
			openNotificationWithIcon("info","Info","Pleae ask client to continue or decline the meeting.")
		})
		socket.on("mute-signal",(data)=>{
			if(data.job.technician.user.id === user.id){
				if(api != null){
					api.isAudioMuted().then(muted => {
						if(muted === false){
							muted = true
							api.executeCommand("toggleAudio")
						}
					});
				}
			}
		});

		socket.on('send-notes-confirmation-to-technician', data => {
			if (data && data.jobId && jobId && data.jobId === jobId) {
				fetchJob(jobId);      			
				if(tiRef && tiRef != null && tiRef.current != null){
					// setTimerStarted(true);
					tiRef.current.start();
					setEnableStartPauseTimerButton(true);
					// console.log("tiref startred",tiRef)
				}else{
					console.log('tiref is undefined on technician side so lets reload page')
					window.location.reload()
				}
				setWaitingForCustomer(false);
				setNotesAvailable(true);
			}
		});


		 socket.on("free-customer-calculation",(data)=>{
			setFreeSession(data.freeSession)
		})

		socket.on("stop-timer-for-card",()=>{
			if(tiRef && tiRef != null && tiRef.current != null){
					tiRef.current.stop();
			}
			setShowStartTimerbtn(true)
			setShowPauseTimerbtn(false)
			// setdisabledStartTimerButton(true)
			openNotificationWithIcon("info","Info","Timer is Paused Because Customer is updating CC Details")
			// socket.emit("stop-timer",{ id: jobId, timer:time} )
		})
		socket.on("start-timer-for-card",()=>{
			if(tiRef && tiRef != null && tiRef.current != null){
					tiRef.current.start();
			}
			setShowStartTimerbtn(false)
			setShowPauseTimerbtn(true)
		})

		socket.on('send-notes-declined-confirmation-to-technician', data => {
			if (data && data.jobId && jobId && data.jobId === jobId) {
				fetchJob(jobId);
				setWaitingForCustomer(false)
				setNotesAvailable(false)
				setDeclinedMessageShow(true)
			}
		});

	},[socket])

	useEffect(() => {
		
		fetchJob(jobId);
		socket.on('accept-screenshare', () => {
		});
		socket.on('dial-number', () => {
			setIsExtensionModalOpen(true);
		});
		socket.on('start-share', (code) => {
			setPinCode(code);
			setIsOpen(true);
		});
		socket.on('stop-screenshare', () => {
			try{
				if (api) {
					let participant_array = api.getParticipantsInfo()
					console.log("participant_array :::: :",participant_array)
					for (var k in participant_array){
						console.log("participant_array id:::: ",participant_array[k]['participantId'])
						let participant_id = participant_array[k]['participantId']
						if(participant_array[k]['displayname'] != user?.firstName.trim() + user?.lastName.trim()){
							api.executeCommand("kickParticipant",participant_id)
						}
						
					}
					api.executeCommand('hangup');
				}
			}
			catch(err){
				console.log("Error in Technician hangup ::: ")
			}
		});

	}, [jobId]);

	useEffect(() => {

		console.log("jobId :::: inside user ",jobId)
		if (user && jobId && jitsiMeetId ) {
			console.log("inside meeting create Function :::: ",jitsiMeetId)
			// createMeeting({
			// 	email: user.email,
			// 	name: `${user.firstName} ${user.lastName}`,
			// 	avatar:
			// 		'https://www.gravatar.com/avatar/73543542128f5a067ffc34305eefe48a',
			// 	userId: user.id,
			// 	group: 'justwinkit',
			// 	aud: 'jitsi',
			// 	iss: 'panther-core',
			// 	sub: JITSI_URL.BASE_URL,
			// 	room: jitsiMeetId,
			// 	authRoom: '*',
			// 	exp: 24,
			// });

		}
	}, [user, jobId, jitsiMeetId]);


	useEffect(()=>{
		if(api != null && api.getNumberOfParticipants() === -1){
			setJitsiSessionEnd(true);
		}
		if(job && job.id === jobId){
			console.log("job inside useEffect :::: ",job)
			// console.log("jobId ::::: ",jobId)
			setJitsiMeet(getIdFromJobId(job.id))
			
			
			// console.log("job  techincian job progress:: ",job)
			let price = 0;
			if(job.subSoftware && job.subSoftware.rate){
				price = job.subSoftware.rate;
			}else if(job.software && job.software.rate){
				price = job.software.rate;
			}
			setratePerTime(price)

			if(!job.customerDeclinedNotes){
				if(!job.technicianSubmitNotes){
					if(job.allNotes && job.allNotes.trim().length > 0){
						let issuesListArr = job.allNotes.split('|SEP|');
						setIssuesList(issuesListArr);
					}
				}else{

					if(job.allNotes && job.allNotes.trim().length > 0 && !job.customerConfirmedNotes){
						setWaitingForCustomer(true)
					}
					if(job.allNotes && job.allNotes.trim().length > 0 && job.customerConfirmedNotes){
						setNotesAvailable(true)
					}
					if(job.confirmedNotes && job.confirmedNotes.trim().length > 0 && job.customerConfirmedNotes){
						let confirmedIssuesListArr = job.confirmedNotes.split('|SEP|');
						setConfirmedIssuesList(confirmedIssuesListArr)
					}
				}
			}else{
				setDeclinedMessageShow(true)
				setWaitingForCustomer(false)
				setNotesAvailable(false)
				if(job.allNotes && job.allNotes.trim().length > 0){
					let issuesListArr = job.allNotes.split('|SEP|');
					setIssuesList(issuesListArr);
				}
			}
			if(job.meeting_start_time){
				let meeting_start_time = new Date(job.meeting_start_time)
				let now_date = new Date()
				if(job.pause_start_time && job.pause_start_time !== '' && job.meeting_pause){
					now_date = new Date(job.pause_start_time)
				}
				let seconds = (now_date.getTime() - meeting_start_time.getTime()) / 1000;
				seconds = (job.total_pause_seconds ? parseInt(seconds)- job.total_pause_seconds : parseInt(seconds))
				let milliseconds = seconds * 1000
				setIntialTimeVal(milliseconds)    
				setEnableStartPauseTimerButton(true)
				
				if(!job.meeting_pause){
					
					setdisabledStartTimerButton(true)
					window.meeting_pause = setTimeout(				
					function(){ 
						setShowStartTimerbtn(false);	
						setdisabledStartTimerButton(false)					
						setShowPauseTimerbtn(true)				
					}, 4000);
					window.tiRefTimeout = setTimeout(function(){
						if(tiRef && tiRef != null && tiRef.current != null){
							tiRef.current.start() 
						}
					}, 1000);
				}else{
					setdisabledPauseTimerButton(true)
					window.timerButtonTimeout = setTimeout(				
					function(){ 
						setShowPauseTimerbtn(false);
						setdisabledPauseTimerButton(false)
						setShowStartTimerbtn(true)					
					}, 4000);
				}			    
			}
			
			if(job.pause_start_time && job.pause_start_time !== ''){
				setMeetingPauseStartTime(job.pause_start_time)
			}
			pollingBoth()
			let jobDataToUpdate = {
				"software":job.software.id,
				"subSoftware":(job.subSoftware ? job.subSoftware.id : ""),
				"subOption":job.subOption,
				"issueDescription":job.issueDescription,
				"updatedIssueDescription":job.updatedIssueDescription,
				"estimatedTime":(job.estimatedTime ? job.estimatedTime : "")
			};
			if(job.updatedIssueDescription && job.updatedIssueDescription.length > 0){
				setJobUpdatedIssueDescription(job.updatedIssueDescription[job.updatedIssueDescription.length-1].issueDescription)
			}else{
				setJobUpdatedIssueDescription(job.issueDescription);
			}
			setSelectedSubSoftware(job.subSoftware ? job.subSoftware.id : "")

			setJobUpdatedData(jobDataToUpdate);
			let softSettings = (job.subSoftware ? job.subSoftware : job.software)
			setSoftwareSettings(softSettings)
			setMeetingJob(job);
			if(job.status === "Completed" && job.id === jobId){
				history.push("/")
			}

			console.log('user.technician.id>>>>>>>>',user.technician.id)
			if(job.id === jobId && job.tech_declined_ids.includes(user.technician.id)){
				openNotificationWithIcon("info","Info","Job has been declined by you.")
				history.push("/")
			}

			// console.log("softSettings :",softSettings)
			let timeArr = (softSettings.estimatedTime ? softSettings.estimatedTime.split("-") : [])
			let timeFrom = (timeArr[0] ? timeArr[0] : 0)
			let timeTo = (timeArr[1] ? timeArr[1] : timeFrom)
			if(job.estimatedTime){
				timeArr = job.estimatedTime.split("-")
				timeFrom = (timeArr[0] ? timeArr[0] : 0)
				timeTo = (timeArr[1] ? timeArr[1] : timeFrom)
			}
			setEstTimeFrom(timeFrom.trim());
			setEstTimeTo(timeTo.trim());
			let filter_dict = {}
			filter_dict['customer'] = job.customer.id
			filter_dict['status'] = 'Completed'
			// console.log("filter_dict :::: ",filter_dict)
			const res = JobService.findJobByParams(filter_dict,{ page:1,pageSize:10 })
			// console.log("hy res ::::: ",res)
			res.then((result)=>{  
				console.log('result>>>>>>>>>>>>>>',result)
				let all_data = result.jobs.data 
				setTotalJobs(result.totalPages)
				console.log(result)
				if(user.userType === 'technician' && all_data){

					for(let i=0;i<= all_data.length -1  ;i++){
						if(all_data[i]['tech_declined_ids'] && all_data[i]['tech_declined_ids'].includes(user.technician.id)){
							all_data[i]['status'] = 'Declined by customer'
						}
					}
				}
				setAllJobs(all_data)      
			})
		}
	},[job, meetingJob,jitsiMeetId]);

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

	const HandleHangup = (data)=>{
		try{
			setMethod("ComputerAudio")
			data.user_type = user.userType
			if (api != null) {
				let participant_array = api.getParticipantsInfo()
				console.log("participant_array :::: :",participant_array)
				for (var k in participant_array){
					console.log("participant_array id:::: ",participant_array[k]['participantId'])
					let participant_id = participant_array[k]['participantId']
					if(participant_array[k]['displayname'] != user?.firstName.trim() + user?.lastName.trim()){
						api.executeCommand("kickParticipant",participant_id)
					}
					
				}
				api.executeCommand('hangup');
				api = null
			}

			console.log("Tech :All data before hangup is ",data);
			console.log('job.id>>>>>>>>>>HandleHangup',jobId);
			console.log("job data is ",job);
			console.log("meetingJob data is ",meetingJob);

			WebSocket.updateSocket(data['web_socket_id'],{'hitFromTechnicianSide':true})
			window.location.href = `/meeting-feedback/${data.jobId}`
		}
		catch{
			window.location.href = `/meeting-feedback/${data.jobId}`
		}
	}
	const loadJitsiScript = () => {
		let resolveLoadJitsiScriptPromise = null;
		const loadJitsiScriptPromise = new Promise((resolve) => {
			resolveLoadJitsiScriptPromise = resolve;
			});	
		try{	
			console.log("the jitsi script")
			const script = document.createElement('script');
			script.src = JITSI_URL.FULL_URL + 'external_api.js'; // winkit.ml mytestroom
			script.async = true;
			script.onload = () => resolveLoadJitsiScriptPromise(true);
			document.body.appendChild(script);
		}
		catch(err){
			console.log("error in loadJitsiScript ::::",err)
		}

		return loadJitsiScriptPromise;
	};

	const handleModalClose = () => {
		setIsOpen(false);
	};

	const initialiseJitsi = async (computerAudioEnabled) => {
		let startSilentMeeting = false
		let technicianCallingHimself = false
		try {
			console.log(">>>>>>>>> initialiseJitsi >>>>>>>>>>>>>>>>>",computerAudioEnabled)
			if (!window.JitsiMeetExternalAPI) {
				console.log("initialize jitsi error ::::::: ::::")
				await loadJitsiScript();
			}
			if(window.localStorage.getItem("jitsiLocalStorage") != undefined){
				window.localStorage.removeItem("jitsiLocalStorage");
			}
			
			console.log("running again :::initialize-jitsi ::: ",jitsiMeetId)
			console.log("element console :::: ",document.getElementById(jitsiContainerId))
			console.log('jitsiIsLoaded>>>>>>>>>>>>>',jitsiIsLoaded)
			// try{
			// 	if(window.localStorage.getItem("technicianCallingHimSelf") != null && window.localStorage.getItem("technicianCallingHimSelf") == "true"){
			// 	startSilentMeeting = true
			// 	technicianCallingHimself = true
			// 	setAudioIcon(true)
			// 	}
			// }
			// catch(err){
			// 	console.log("err :::: ",err)
			// }

			if(jitsiIsLoaded === false && jitsiMeetId !== false){


				// mixpanel code//
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Jitsi session started',{'JobId':jobId});
				// mixpanel code//


				api = new window.JitsiMeetExternalAPI(JITSI_URL.BASE_URL, {
				interfaceConfigOverwrite: {
					SHOW_PROMOTIONAL_CLOSE_PAGE: false,

					DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
				},
				configOverwrite: {
					startWithAudioMuted: computerAudioEnabled,
					notifications: [],
					startWithVideoMuted:true,
					startSilent:startSilentMeeting,
					toolbarButtons: [
						'microphone',
						'fullscreen',
						'fodeviceselection',
						'profile',
						'chat',
						'desktop'
					],
					startScreenSharing: false,
				},
				
				parentNode: document.getElementById(jitsiContainerId),
				roomName: jitsiMeetId,
				jwt: '',
				userInfo: {
					displayName: user?.firstName.trim() + user?.lastName.trim(),
				},
			});
			if (jitsiMeetId !== false) {
				console.log("jitsiIsLoaded :::::::false made true ",jitsiIsLoaded)
				jitsiIsLoaded =  true
			}
			
			api.isMultipleAudioInputSupported().then(isMultipleAudioInputSupported => {
			})

			api.on('micError',(type,message)=>{
				openNotificationWithIcon("info","Info","Audio Permission Denied")
				})

			api.on('videoConferenceLeft', () => {
				if (jitsiMeetId !== false) {
					jitsiIsLoaded =  true
				}
				let participant_array = api.getParticipantsInfo()
				console.log("participant_array :::: :",participant_array)
				for (var k in participant_array){
					console.log("participant_array id:::: ",participant_array[k]['participantId'])
					let participant_id = participant_array[k]['participantId']
					if(participant_array[k]['displayname'] != user?.firstName.trim() + user?.lastName.trim()){
						api.executeCommand("kickParticipant",participant_id)
					}
					
				}

				api.executeCommand('hangup');
			});
			api.on("recordingStatusChanged",(data)=>{
				console.log("data :::::::::: ",data)
			})

			window.showLoaderTimeout = setTimeout(()=>{setShowLoader(false)},12000)
			api.on('participantJoined', () => {
				setIsJitsiLoaded(true)
				if(hideButton.current && hideButton.current != null){
					hideButton.current.click()
				}
				

				setShowLoader(false);
			})

			api.on('readyToClose', () => {
				setJitsiSessionEnd(true);
				window.location.href = `/meeting-feedback/${job.id}`
				console.log('meeting closesd ::::: Tech Side ');
			});

			api.on('screenSharingStatusChanged', (screen_data) => {
				if(screen_data['on'] ===  true){
					setIsScreenShared(true);
					setShowLoader(false);
				}else{
					setIsScreenShared(false);
				}
				
			});

			api.on("incomingMessage",()=>{
				
				audio.play()
				openNotificationWithIcon("info","Info","New Message from Customer")
			})
			api.on("errorOccurred",(err)=>{
				console.log(err)
			})
			console.log("api :::::::::: ",api)
			}

			window.retryJitsiTimeout = setTimeout(function(){
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
					}else{
						retryJitsi();
					}
				}
				else{
					retryJitsi();
				}

			},35000)
		} catch (error) {
			console.log(">>Error",error)
			setIsJitsiLoaded(false)
			console.log('error from initialize jitsi');
			retryJitsi();
		}
	};

	const retryJitsi = () => {
		if(job && job.id && job.status !== "Completed"){
			console.log("Going to reload page to reinitialize jitsi");
			window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${job.id}`
		}
	}

	const stopShareScreen = () => {
		if(api!=null && isScreenShared){
			api.executeCommand('toggleShareScreen');
		}
	};

	const HandleDeclineJob = async()=>{
		setEstTimeFromErrorMsg('');
		setEstTimeToErrorMsg('');
		let transferCallErrorsTemp = {};
		let goFurther = true;
		let data = {...jobUpdatedData}
		data['subSoftware'] = selectedSubSoftware
		data['estimatedTime'] = estTimeFrom+'-'+estTimeTo;
		if(DeclinedReason === '' || DeclinedReason.trim() === ''){
			transferCallErrorsTemp['emptyReason'] = true;
			goFurther = false;
		}
		
		if(data['software'] === ''){
			goFurther = false;
			transferCallErrorsTemp['emptySoftware'] = true;
		}
		if(selectedSubSoftware === '' && subSoftwareList.length > 0){
			goFurther = false;
			transferCallErrorsTemp['emptySubSoftware'] = true;
		}
		if(data['subOption'] === ''){
			goFurther = false;
			transferCallErrorsTemp['emptyArea'] = true;
		}
		if(jobUpdatedIssueDescription === ''){
			goFurther = false;
			transferCallErrorsTemp['emptyIssueDescription'] = true;
		}
		if(jobUpdatedIssueDescription.length > JOB_CHARACTERS_ALLOWED){
			console.log("jobUpdatedIssueDescription ::::: ")
			goFurther = false
			transferCallErrorsTemp['emptyIssueDescription'] = true
		}
		if(estTimeFrom < 1){
			goFurther = false;
			transferCallErrorsTemp['emptyEstTimeFrom'] = true;
			setEstTimeFromErrorMsg('Please enter `Est. time from` value in minutes.');
		}

		if(estTimeTo > 120){
			goFurther = false;
			transferCallErrorsTemp['emptyEstTimeTo'] = true;
			setEstTimeToErrorMsg('`Est. time to` value cannot be greater than 2 hours.');
		}
		if(estTimeTo < 1){
			goFurther = false;
			transferCallErrorsTemp['emptyEstTimeTo'] = true;
			setEstTimeToErrorMsg('Please enter `Est. time to` value in minutes.');
		}
		if(estTimeFrom > estTimeTo){
			goFurther = false;
			transferCallErrorsTemp['emptyEstTimeFrom'] = true;
			setEstTimeFromErrorMsg('`Est. time from` value should be less as compare to `Est. time to`.');
		}
		setTransferCallErrors(transferCallErrorsTemp);

		let tempDescription = {
			'technician':(user && user.technician ? user.technician.id : user.id),
			'technicianName':(user ? user.firstName+' '+user.lastName : ''),
			'issueDescription':jobUpdatedIssueDescription,
			'updatedAt':new Date()
		}
		let updatedIssueDescriptionArr = [...data['updatedIssueDescription']];
		if(updatedIssueDescriptionArr.length === 0){
			if(data['issueDescription'].toLowerCase().trim() !== jobUpdatedIssueDescription.toLowerCase().trim()){
				updatedIssueDescriptionArr.push(tempDescription)
				data['updatedIssueDescription'] = updatedIssueDescriptionArr
			}
			
		}else{
			let descriptionFound = updatedIssueDescriptionArr.find(o => o.issueDescription === jobUpdatedIssueDescription);
			if(!descriptionFound){
				updatedIssueDescriptionArr.push(tempDescription)
				data['updatedIssueDescription'] = updatedIssueDescriptionArr
			}
		}
		if(goFurther){
			console.log("inside goFurther")
			let techDeclined = [...job.tech_declined_ids]
			let reasonsTech = [...job.reasons];
			techDeclined.push(user.technician.id);
			reasonsTech.push(DeclinedReason);

			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Transfer Call',{'JobId':jobId});
			// mixpanel code//
			
			
			try{
				TechnicianApi.updateTechnician(user.technician.id,{"status":"Available"})
				  let updatedNotifiedTechs =[];
					
				  for(const k in job.notifiedTechs){
					  let jobStatus = job.notifiedTechs[k]['jobStatus'];
					  let notifyEndAt = (job.notifiedTechs[k]['notifyEndAt'])?job.notifiedTechs[k]['notifyEndAt']:new Date();
					  console.log(">>>>>>>>>> job.notifiedTechs", job.notifiedTechs[k], user.technician.id);
					  if(job.notifiedTechs[k]['techId'] == user.technician.id){
						  jobStatus = "tech-decline";
						  notifyEndAt = new Date();
					  }
					  updatedNotifiedTechs[k] = {
						  'techId' :  job.notifiedTechs[k]['techId'],
						  'techStatus':  job.notifiedTechs[k]['techStatus'],
						  'notifyAt' : job.notifiedTechs[k]['notifyAt'],
						  'jobStatus' : jobStatus,
						  'notifyEndAt' : notifyEndAt,
					  }

				  }
				  console.log(">>>>>>>>>> updatedNotifiedTechs", updatedNotifiedTechs);
				await updateJob(jobId,{
					"tech_declined_ids":techDeclined,
					"allNotes":"allNotes",
					"notifiedTechs":updatedNotifiedTechs,
					"reasons":reasonsTech,
					"status":"Waiting",
					"total_time":0,
					"meeting_start_time":'',
					"technician":"",
					"software":data['software'],
					"subSoftware":data['subSoftware'],
					"subOption":data['subOption'],
					"issueDescription":data['issueDescription'],
					"estimatedTime":data["estimatedTime"],
					"updatedIssueDescription":data['updatedIssueDescription'],
					"confirmedNotes":"",
					"customerConfirmedNotes":false,
					"customerDeclinedNotes":false,
					"technicianSubmitNotes":false,
					"total_pause_seconds":0,
					"meeting_pause":false,
					"hire_expert":hireExpert,

				})
				endMeeting(true);
				setShowDeclineModal(!showDeclineModal)
				openNotificationWithIcon('success', 'Success', 'Job declined.');
				window.fetchNotificationTimeOut = setTimeout(function(){
					let notificationData = {
					  user:job.customer.user.id,
					  job:job.id,
					  actionable:false,
					  read:false,
					  title:"Technician has quit your call.Please wait for another technician to join",
							  type:"job_declined_by_technician",

					}
					createNotification(notificationData)
					fetchNotifications({"user":job.customer.user.id})
				},1000)
			}
			catch(error){
				console.log("Error in fetch meeting :::: ")
				// endMeeting(true);
			}
			
			 
		}
	}

	const rejoinPhoneCall = async() => {   
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician - Rejoin',{'JobId':jobId,'meetingMethod':method});
		// mixpanel code//
		if(method === "ComputerAudio"){
			window.location.reload()
		}else{
			window.localStorage.setItem("technicianCallingHimSelf",true)
			window.location.reload()

			let extLength = (job.technician.extension && job.technician.extension !== '' ? job.technician.extension.length : "0")
			let extension = job.technician.extension && job.technician.extension != null ? job.technician.extension : ""
			api.invite([{allowed: true,number: `${job.technician.profile.confirmId.phoneNumber+ extension+extLength}`,originalEntry: `${job.technician.profile.confirmId.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}])
		}
		
	}
	const hideLoader = ()=>{
		setShowLoader(false)
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



	const endMeeting = async (rejected=false) => {		
		setJitsiSessionEnd(true);
		setDisabledEndCall(true)
		clearInterval(window.pollingInterval)
		clearAllTimeOuts()
		console.log("Inside end meeting of technicinan")
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician - End meeting',{'JobId':jobId});
		// mixpanel code//
		console.log('job.id>>>>>>>>>>endMeeting',jobId)
		console.log("Time in end meeting is ",time)
		let data = {jobId : jobId,user_type:user.userType,techId:user.technician.id,userId:user.id}


		let fetchUpdatedJob =  await JobService.retrieveJob(jobId)
		console.log('fetchUpdatedJob>>>>>>>>',fetchUpdatedJob)
		let miliseconds = fetchUpdatedJob.total_seconds*1000
		console.log('miliseconds>>>>>>>',miliseconds)
		data['total_time'] =  convert_millis_to_hms_format(miliseconds)
		console.log(data['total_time'],'.............................')
		
		data['total_seconds'] = fetchUpdatedJob.total_seconds
		data['job_data'] = job
		sethideBadge(true)

		let totalPaidJobsCount = await getTotalPaidJobs({'customer':job.customer.id})
		console.log("totalPaidJobsCount",totalPaidJobsCount)

		data['is_free_job'] = (totalPaidJobsCount > 1 ? false : true)
		
		let totalCostGenerationData = {"jobId":jobId,"customerId":job.customer.id}
		console.log("************************ Job Service Request Total Cost  *****************************************")
		let res = await JobService.generateTotalCost(totalCostGenerationData)
		console.log("************************ Job Service Request Total Cost *****************************************")
		if (api != null) {
			try{
				let participant_array = api.getParticipantsInfo()
				console.log("participant_array :::: :",participant_array)
				for (var k in participant_array){
					console.log("participant_array id:::: ",participant_array[k]['participantId'])
					let participant_id = participant_array[k]['participantId']
					if(participant_array[k]['displayname'] != user?.firstName.trim() + user?.lastName.trim()){
						api.executeCommand("kickParticipant",participant_id)
					}
					
				}
				jitsiIsLoaded = false
				api.executeCommand('hangup');
			}
			catch(err){
				console.log("error in Technician hangup (endMeeting) :::: ")
			}
		}


		if(!rejected){

				await CreateEarningReport(jobId, job, res.total_cost);

				await WebSocket.create({
					user: user.id,
					job : jobId,
					socketType:'meeting-closed',
					userType:user.userType,
					data:data,
				});


				console.log("Data in end meeting is ",data)
							
		}
		else{
			sethideBadge(true)
			socket.emit("rejected",data)
			setTimeout(function(){ window.location.href = '/' }, 2000);
		}
	}

	const submitNotes=async()=>{
		setNotesSaveLoader(true)
		setAlertMesasgeShow(false)
		if(issuesList.length > 0){
			let jobNotes = issuesList.join("|SEP|");
			await updateJob(jobId,{"allNotes":jobNotes,"customerDeclinedNotes":false, "technicianSubmitNotes":true})

			let data = {}
			data['jobId'] = jobId
			data['allNotes'] = jobNotes
			socket.emit("technician-submitted-notes",data)

			mixpanel.identify(user.email);
			mixpanel.track('Technician - Submit the notes',{'JobId':jobId});
			window.notesSaveLoader = setTimeout(function(){
				setNotesSaveLoader(false)
			},1500)
		}else{
			mixpanel.identify(user.email);
			mixpanel.track('Technician - trying to submit the empty notes.',{'JobId':jobId});
			setAlertMesasgeShow(true)
			setNotesSaveLoader(false)
		}

	}

	const handleUserUsingComputer = ()=>{
		try{
			handleParticipantMic()
			window.localStorage.setItem("technicianCallingHimSelf",false)
		}
		catch(err){
			console.log("error ::::: ",err)
		}
	}

	const updateJobDetails = async() => {
		setShowUpdateBlock(true);
		if(!dataLoaded){
			setShowSidebarLoader(true);
			const res = await SoftwareApi.getSoftwareList();
			if (res && res.data) {
				setSoftwareList(res.data);
				setSubSoftwareArray(res.data, meetingJob.software.id);
				let optionsList = (meetingJob.subSoftware ? meetingJob.subSoftware.sub_option : meetingJob.software.sub_option)
				setSubOptionsList(optionsList)
				
				setDataLoaded(true);
				setShowSidebarLoader(false);
				setUpdateJobDetailsLoader(false);
				setUpdateDetailsMessageShow(false);
				setjobDetailsErrorMsgShow(false);
			}
			
		}
	}

	const setSubSoftwareArray = (softwares, software_id) => {
		let subSoftList = []
		softwares.map((s,i)=>{
			if((s.parent !== 0 || s.parent !== "0") && s.parent === software_id){
				subSoftList.push(s)
			}
			if(i+1 === softwares.length){
				setSubSoftwareList(subSoftList);
				if(subSoftList.length === 0){
					setSelectedSubSoftware('');
				}
			}
			return true;
		})
	}

	const submitJobDetails = async() => {
		setjobDetailsErrorMsgShow(false);
		setUpdateDetailsMessageShow(false);
		setUpdateJobDetailsLoader(true);
		console.log("submit job details ::::::::::::::::",jobUpdatedIssueDescription)
		let data = {...jobUpdatedData}
		data['subSoftware'] = selectedSubSoftware
		data['estimatedTime'] = estTimeFrom+'-'+estTimeTo;
		let goFurther = true;
		if(data['software'] === ''){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Please select the software');
		}
		else if(selectedSubSoftware === '' && subSoftwareList.length > 0){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Please select the subsoftware');
		}else if(data['subOption'] === ''){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Please select the area option');
		}else if(jobUpdatedIssueDescription === '' || jobUpdatedIssueDescription.trim() === ''){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Please enter issue description');
		}
		else if(jobUpdatedIssueDescription.length > JOB_CHARACTERS_ALLOWED){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg(`maximum ${JOB_CHARACTERS_ALLOWED} characters are allowed`);
		}
		else if(estTimeFrom < 1){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Please enter `Est. time from` value.');
		}

		else if(estTimeTo > 120){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Est. time to` value cannot be greater than 2 hours.');
		}
		else if(estTimeTo < 1){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('Please enter `Est. time to` value.');
		}
		else if(estTimeFrom > estTimeTo){
			goFurther = false;
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg('`Est. time from` value should be less as compare to `Est. time to`.');
		}
		let tempDescription = {
			'technician':(user && user.technician ? user.technician.id : user.id),
			'technicianName':(user ? user.firstName+' '+user.lastName : ''),
			'issueDescription':jobUpdatedIssueDescription,
			'updatedAt':new Date()
		}
		let tempArr = [...data['updatedIssueDescription']];
		if(tempArr.length === 0){
			if(data['issueDescription'].toLowerCase().trim() !== jobUpdatedIssueDescription.toLowerCase().trim()){
				tempArr.push(tempDescription)
				data['updatedIssueDescription'] = tempArr
			}
			
		}else{
			let descriptionFound = tempArr.find(o => o.issueDescription === jobUpdatedIssueDescription);
			if(!descriptionFound){
				tempArr.push(tempDescription)
				data['updatedIssueDescription'] = tempArr
			}
		}
		if(goFurther){  	

			await updateJob(jobId,data)
			data['jobId'] = jobId;
			socket.emit("technician-updated-job-details",data)
			fetchJob(jobId);
			setUpdateDetailsMessageShow(true);

			mixpanel.identify(user.email);
			mixpanel.track('Technician - Update the job details',{'JobId':jobId});
		}
		setUpdateJobDetailsLoader(false);
	}

	const backFromUpdateJob = () => {
		setShowUpdateBlock(false);

		if(job.updatedIssueDescription && job.updatedIssueDescription.length > 0){
			setJobUpdatedIssueDescription(job.updatedIssueDescription[job.updatedIssueDescription.length-1].issueDescription)
		}else{
			setJobUpdatedIssueDescription(job.issueDescription);
		}
		setSelectedSubSoftware(job.subSoftware ? job.subSoftware.id : "")

		let softSettings = (job.subSoftware ? job.subSoftware : job.software)
		setSoftwareSettings(softSettings)
		let timeArr = (softSettings.estimatedTime ? softSettings.estimatedTime.split("-") : [])
		let timeFrom = (timeArr[0] ? timeArr[0] : 0)
		let timeTo = (timeArr[1] ? timeArr[1] : timeFrom)
		if(job.estimatedTime){
			timeArr = job.estimatedTime.split("-")
			timeFrom = (timeArr[0] ? timeArr[0] : 0)
			timeTo = (timeArr[1] ? timeArr[1] : timeFrom)
		}
		setEstTimeFrom(timeFrom.trim());
		setEstTimeTo(timeTo.trim());


	}

	const mainSoftwareSelectChange = async(e) => {
		let sid = e.target.value;
		setSubSoftwareArray(softwareList, sid);
		updateOptionsList(sid,'software');
	}

	const subSoftwareSelectChange = (e) => {
		setSelectedSubSoftware(e.target.value);
		updateOptionsList(e.target.value,'subSoftware');
	}

	const optionSelectChange = (e) => {
		setjobDetailsErrorMsgShow(false);
		let jobDataToUpdate = {...jobUpdatedData};
		jobDataToUpdate['subOption'] = e.target.value
		setJobUpdatedData(jobDataToUpdate);
	}

	const issueDescriptionChange = (e) => {
		if(e.target.value.length > JOB_CHARACTERS_ALLOWED){
			setjobDetailsErrorMsgShow(true);
			setjobDetailsErrorMsg(`maximum ${JOB_CHARACTERS_ALLOWED} characters are allowed`);
		}
		setJobUpdatedIssueDescription(e.target.value)
	}

	const updateOptionsList = (software_id,col) => {
		setjobDetailsErrorMsgShow(false);
		let obj = softwareList.find(s => s.id === software_id);
		let jobDataToUpdate = {...jobUpdatedData};
		if(obj){
			setSubOptionsList(obj.sub_option)
			jobDataToUpdate['subOption'] = '';
			jobDataToUpdate[col] = software_id;
			setJobUpdatedData(jobDataToUpdate);
			obj.sub_option.map(function(o){
				if(o === meetingJob.subOption){
					jobDataToUpdate['subOption'] = o
					setJobUpdatedData(jobDataToUpdate);
				}	
				return true;			
			})
		}else{
			jobDataToUpdate[col] = software_id;
			setJobUpdatedData(jobDataToUpdate);
		}
	}
	const notesInputSubmit = (e) => {
			setAlertMesasgeShow(false);
			let issueText = textAreaRef.current.value;
			if(issueText !== ''){
				let tempIssuesList = [...issuesList]
				if(editIssueIdx.toString() !== ''){
					tempIssuesList[editIssueIdx] = issueText
				}else{
					tempIssuesList.push(issueText)
				}
				setIssuesList(tempIssuesList);
				setEditIssueIdx('');
				textAreaRef.current.value = ""
			}else{
				setAlertMesasgeShow(true);
			}
	}

	const removeIssueFromList = (idx) => {
		let tempIssuesList = [...issuesList]
		tempIssuesList.splice(idx,1)
		setIssuesList(tempIssuesList);
	}

	const editIssueFromList = (idx) => {
		let tempIssuesList = [...issuesList]
		// setIssueValue(tempIssuesList[idx])
		textAreaRef.current.value = tempIssuesList[idx]
		setEditIssueIdx(idx)
	}
  
	const call_yourself = ()=>{
		handleParticipantMic()
		if(api != null){
			setDisabledCallYourself(true)
			api.invite([{allowed: true,number: `${job.technician.profile.confirmId.phoneNumber+"0"}`,originalEntry: `${job.technician.profile.confirmId.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}])
			window.setDisableCall = setTimeout(function(){ setDisabledCallYourself(false) }, 15000);
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Call himself',{'JobId':jobId});

		}
		console.log("refreshing the page because tech called himself")
		// window.localStorage.setItem("technicianCallingHimSelf",true)
		// window.location.reload()
	}

	const call_customer = ()=>{

		if(api != null){
			setDisabledCallCustomer(true)

			let extLength = (job.customer.extension && job.customer.extension !== null && job.customer.extension !== '' ? job.customer.extension.length : "0")
			let extension =  job.customer.extension && job.customer.extension !== null && job.customer.extension !== '' ? job.customer.extension:''
			api.invite(
				[{allowed: true,number: `${job.customer.phoneNumber+extension+extLength}`,originalEntry:`${job.customer.phoneNumber}`,showCountryCodeReminder: false,type: "phone"}])
			window.setDisableCall = setTimeout(function(){ setDisabledCallCustomer(false) }, 15000);
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Call to customer',{'JobId':jobId});
		}
		
	}

	const pauseTimer = async()=>{
		if(tiRef && tiRef != null && tiRef.current != null){
			setdisabledPauseTimerButton(true)
			tiRef.current.pause()
			let pause_from_time = new Date()					
			window.pauseTimer = setTimeout(				
				function(){ 
					setShowPauseTimerbtn(false);
					setdisabledPauseTimerButton(false)
						setShowStartTimerbtn(true)					
				}, 4000);	
			setMeetingPauseStartTime(pause_from_time)
			socket.emit("stop-timer",{ id: jobId, timer:time} )
			let data = {'meeting_pause':true, 'pause_start_time':pause_from_time,'technician_paused_timer':true}
			await JobService.updateJob(jobId,data)	
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Pause the timer.',{'JobId':jobId});
		}
	}


	const startTimer = async()=>{
		if(tiRef && tiRef != null && tiRef.current != null){  
			setdisabledStartTimerButton(true)
			window.startTimer = setTimeout(				
				function(){ 
					setShowStartTimerbtn(false);	
					setdisabledStartTimerButton(false)					
					setShowPauseTimerbtn(true)				
				}, 4000);

			tiRef.current.start();
			let pauseEndTime = new Date();
			let pauseStartTime = new Date(meetingPauseStartTime);			
			let seconds = (pauseEndTime.getTime() - pauseStartTime.getTime()) / 1000;
			let jobInfo = await JobService.retrieveJob(jobId)
			let totalPauseSeconds = (jobInfo.total_pause_seconds ? jobInfo.total_pause_seconds+seconds : seconds);
			let data = {'meeting_pause':false, 'total_pause_seconds':totalPauseSeconds,'technician_paused_timer':false}	
			socket.emit("start-timer",{ id: jobId,pausedSeconds : totalPauseSeconds })
			await JobService.updateJob(jobId,data)
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Start the timer',{'JobId':jobId});			
			
		}
	}

	const setEstTime = (e, type) => {  		
		let val = e.target.value;
		if(type === 'from'){
			setEstTimeFrom(val);
		}
		if(type === 'to'){
			setEstTimeTo(val)
		}
	}

	const handleTransferCall = async() => {
		setShowTransfterCallLoader(true);
		setShowDeclineModal(!showDeclineModal)
		if(!dataLoaded){
			const res = await SoftwareApi.getSoftwareList();
			if (res && res.data) {
				setSoftwareList(res.data);
				setSubSoftwareArray(res.data, meetingJob.software.id);
				let optionsList = (meetingJob.subSoftware ? meetingJob.subSoftware.sub_option : meetingJob.software.sub_option)
				setSubOptionsList(optionsList)
				
				setDataLoaded(true);
				setShowTransfterCallLoader(false);
			}
			
		}else{
			setShowTransfterCallLoader(false);
		}
	}


	function checkboxChange(e){

		console.log(`checked = ${e.target.checked}`);
		setHireExpert(e.target.checked)
	}

	const columns = [
		{
			title: 'Date',
			dataIndex: 'createdAt',	   
			render: text => <span> { moment(text).format('YYYY-MM-DD')}</span>,
		},
		{
			title: 'Software', 
			render: (text, record) => (
				(record && record.software ? record.software.name : '')   
			),
		},

		{
			title: 'Issue Desc',
			dataIndex: 'issueDescription',
			width: '30%',
			render: text => (
				<p padding="10px 5px" title={text} className="issue-description">
					{(text.length > 100 ? text.substring(0,100)+'...' : text)}
				</p>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
		},
		{
			title: 'Tech',	   
			render: (text, record) => (
				<>
				{ record && record.technician && record.technician.user ?
					record.technician.user.firstName+' '+record.technician.user.lastName : 'NA' 
				}
				</>
			),
			
		},
		 {
			title: 'Action',
		   render: (text, record) => (
			<span>
				<button className="details-btn-history" onClick={push_to_job_detail} name={record.id}><span></span>Details</button>
			</span>

			),
		},
	];

	const handleLogoRedirection = (e) => {
		e.preventDefault()
		localStorage.removeItem('CurrentStep');
		window.location.href = '/dashboard';
	}
	return (
		<Container fluid>
			<Row className="flex-row-reverse1">

				<Col md="3" lg="2" >
					<Row>
						<Col xs={12} className="pt-4">
							<div className="bar-logo-box">
								<Link to="/" onClick={handleLogoRedirection}>
									<Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="Geeker" />
								</Link>

							</div>
						</Col>
						  
						<Col xs={12} className="mt-3 side-menu-bar px-3">
							<Row>
								<Loader height="100%" className={(showSidebarLoader ? "loader-outer" : "d-none")} />
								{waitingForCustomer &&
									<Col xs={12}>
										<h5 className="font-weight-bold">Waiting for client to confirm the solution</h5>
										<ProgressStyled percent={70} showInfo={false} />
									</Col>
								}
								{!waitingForCustomer && !notesAvailable &&
									<>
										{showUpdateBlock &&
											<>
											<Col xs={12}>
												<h5 className="font-weight-bold">Update job details:</h5>
											</Col>
											{updateDetailsMessageShow &&
												<Alert variant='success' className="w-100">
													Details updated successfully.
												</Alert>
											}
											{jobDetailsErrorMsgShow &&
												<Alert variant='danger' className="w-100">
													{jobDetailsErrorMsg}
												</Alert>
											}
											<Col xs={12} className="mt-2">
												<label className="m-0 font-weight-bold">Select Software <span className="red-text pl-1">*</span></label>
												<select className="form-control" onChange={mainSoftwareSelectChange}>
													<option value="">--Select--</option>				      								
													{
														softwareList.map(item => {
															if(item.parent === "0" || item.parent === 0){
																if(item.id === meetingJob.software.id){
																	return (
																		<option value={item.id} selected="selected">{item.name}</option>
																	)
																}else{
																	return (
																		<option value={item.id}>{item.name}</option>
																	)
																}
															}
															return null;
														})
													}
												</select>
											</Col>
											{subSoftwareList.length > 0 &&
												<Col xs={12} className="mt-2">
													<label className="m-0 font-weight-bold">Select Sub Software <span className="red-text pl-1">*</span></label>
													<select className="form-control" onChange={subSoftwareSelectChange}>
														<option value="">--Select--</option>
														{
															subSoftwareList.map(item => {
																if(item.parent !== "0" || item.parent !== 0){
																	if(meetingJob.subSoftware && item.id === meetingJob.subSoftware.id){
																		return (
																			<option value={item.id} selected="selected">{item.name}</option>
																		)
																	}else{
																		return (
																			<option value={item.id}>{item.name}</option>
																		)
																	}
																}
																return null;
															})
														}
													</select>
												</Col>
											}
											<Col xs={12} className="mt-2">
												<label className="m-0 font-weight-bold">Select Area <span className="red-text pl-1">*</span></label>
												<select className="form-control" onChange={optionSelectChange}>
													<option value="">--Select--</option>
													{
														subOptionsList.map(item => {
															
															if(item === meetingJob.subOption){
																return (
																	<option value={item} selected="selected">{item}</option>
																)
															}else{
																return (
																	<option value={item}>{item}</option>
																)
															}
															
														})
													}
												</select>
											</Col>
											<Col xs={12} className="mt-2">
												<label className="m-0 font-weight-bold">Issue Description <span className="red-text pl-1">*</span></label>
												<textarea 
													className="form-control" 
													value={jobUpdatedIssueDescription}
													onChange={issueDescriptionChange}
													spellCheck="true"
													maxLength="200"
												></textarea>
											</Col>
											<Col xs={6} className="mt-2">
												<label className="m-0 font-weight-bold">Est. Time From <span className="red-text pl-1">*</span></label>
												<input 
													type="number" 
													className="form-control" 
													value={estTimeFrom} 
													onChange={(e)=>setEstTime(e,'from')}
													placeholder="From"
													min="1"
												/>
											</Col>
											<Col xs={6} className="mt-2">
												<label className="m-0 font-weight-bold">Est. Time To <span className="red-text pl-1">*</span></label>
												<input 
													type="number" 
													className="form-control" 
													value={estTimeTo} 
													onChange={(e)=>setEstTime(e,'to')}
													placeholder="To"
													min="1"
												/>
											</Col>
											<Col xs={12}>
												<Button className={(updateJobDetailsLoader ? "disabled-btn" : "")+" btn app-btn w-100 mt-3 notes-submit-btn"} disabled={updateJobDetailsLoader} onClick={submitJobDetails}>
													<span/>
													{updateJobDetailsLoader 
														?
															<Spin/>
														:
															<>Update</>
													}				      								
												</Button>
											</Col>
											<Col xs={12}>
												<Button className="btn app-btn app-btn-light-blue w-100 mt-3" onClick={backFromUpdateJob}>
													<span/>
													Back
												</Button>
											</Col>
											</>
										}

										{!showUpdateBlock &&
											<>
											<Col xs={12} className="mb-2">
												<h5 className="font-weight-bold">Confirm the issue with client</h5>
											</Col>
											<Col xs={12}>
												{alertMessageShow &&
													<Alert variant='danger' className="w-100">
														Please write the issue before click on add.
													</Alert>
												}
												{declinedMessageShow &&
													<Alert variant='danger' className="w-100">
														Issues are declined by customer. Please review the issues.
													</Alert>
												}
												<div className="mb-2">
													<textarea 
														className="w-100 form-control" 
														placeholder="Summarize the issue"
														ref={textAreaRef}
													/>
													<Button 
														className="btn app-btn app-btn-light-blue app-btn-small notes-add-btn w-100 mt-2" 
														onClick={notesInputSubmit}
													>
														<span/>
														{editIssueIdx.toString() !== '' 
															? 
																<>Update</>
															:
																<>Add</>
														}
													</Button>
												</div>
												<div className="input-notes-text">
													
													{issuesList.length === 0 &&
														<div className="text-muted small-text">
															No issues summarized yet. <br/>
															Describe the details of the client issue using the textbox above. <br/>
															Select  after each important detail to create a clear, listed outline of the issue
														</div>
													}
													{issuesList.length > 0 &&
														<ul className="small-text p-0 m-0">
															{
																issuesList.map((i,idx)=>{
																	return (
																		<li className="issue-list-item">
																			<span className="issue-num">{idx+1}.</span>
																			<span className="issue-text">{i}</span>
																			<span className="issue-action-btns text-center">
																				<FontAwesomeIcon 
																					className="dark-green-text mr-3" 
																					icon={faPencilAlt} 
																					title="Edit this issue"
																					onClick={()=>editIssueFromList(idx)}
																				/>
																				<FontAwesomeIcon 
																					className="red-text" 
																					icon={faTrash} 
																					onClick={()=>removeIssueFromList(idx)} 
																					title="Remove this issue from list" 
																				/>
																			</span>
																		</li>
																	)
																})
															}
														</ul>
													}
												</div>
											</Col>
											
											<Col xs={12}>
												<Button className={(notesSaveLoader || issuesList.length === 0 ? "disabled-btn" : "")+" btn app-btn w-100 mt-3 notes-submit-btn"} onClick={submitNotes} disabled={notesSaveLoader || issuesList.length === 0}>
													<span/>
													{notesSaveLoader 
														?
															<Spin/>
														:
															<>Submit</>
													}
												</Button>
											</Col>
											<Col xs={12}>
												<Button className="btn app-btn app-btn-light-blue w-100 mt-3" onClick={updateJobDetails}>
													<span/>
													Update Job Details
												</Button>
											</Col>
											</>
										}
									</>
								}
								{notesAvailable &&
									<>
										<Col xs={12}>
											<h5 className="font-weight-bold">Issues confirmed by client :</h5>
										</Col>
										<Col xs={12} className="notes-outer">
											 {confirmedIssuesList.length > 0 &&
												<ul className="small-text p-0 m-0">
													{
														confirmedIssuesList.map((i,idx)=>{
															return (
																<li className="issue-list-item">
																	<span className="issue-num">{idx+1}.</span>
																	<span className="issue-text">{i}</span>
																</li>
															)
														})
													}
												</ul>
											}
										</Col>
									</>
								}                     

								<Col xs={12}>

									<Modal
										title="Customer history"
										centered
										visible={visible}
										onOk={() => setVisible(false)}
										onCancel={() => setVisible(false)}
										width={1000}
										className="rejectJobModal"
										footer={null}
										>
										<Table locale={locale} dataSource={allJobs} columns={columns} rowKey="id" className="jobsdetail-table" pagination={false} id="ThemeLight"/>
										 { totalJobs !== 0 && <Pagination style={{"float":"right",",marginRight":"40px"}} current={currentPage} onChange={handlePagination} total={totalJobs} />} 
									</Modal>
									<Button className="btn app-btn app-btn-light-blue w-100 mt-3" onClick={() => setVisible(true)}>
										<span/>
										Customer History
									</Button>
								</Col>
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
									<button onClick={hideLoader} style={{"visibility":"hidden"}} ref={hideButton}>Hide me</button>Loading the session
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
									<Col lg="5" xs="12">
										<Row>
											<Col xs="12" className="pt-3">
												<Row>
													<Col md="7">
														{meetingJob && meetingJob.customer &&
															<>	<p>
																<span className="meeting-label-name">Software :  </span>
																<span className="meeting-label-value">{job.software.name + (job.subSoftware ? ' ('+job.subSoftware.name+')' : '')}</span>
																</p>
															</>
														}
													</Col>
													<Col md="5" className="d-none1">
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
												</Row>
											</Col>
											<Col xs="12" className="">
												<Row>
													<Col md="7">
														{meetingJob && meetingJob.customer &&
															<>	
																<span className="meeting-label-name">Client:</span>
																<span className="meeting-label-value">
																	{meetingJob.customer.user.firstName} {meetingJob.customer.user.lastName}
																</span>
															</>
														}
													</Col>
													<Col md="5" className="d-none1">
														{meetingJob && meetingJob.estimatedPrice
															?
																<>
																	<span className="meeting-label-name">Est. price:</span>
																	<span className="meeting-label-value">
																		<EstimatedPriceToggle  softwareSettings = {meetingJob}/>
																	</span>
																</>
															:
															<>
																{softwareSettings && softwareSettings.estimatedPrice &&
																	<>
																		<span className="meeting-label-name">Est. price:</span>
																		<span className="meeting-label-value">
																			<EstimatedPriceToggle  softwareSettings = {softwareSettings}/>
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
																	<>Issue (Added by client):</>
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
									<Col lg="7 text-right" xs="12">
										<Row>
											<Col lg="2" xs="12">
												<div key={intialTimeVal} className="meeting-timer">
													<Timer initialTime={intialTimeVal} startImmediately={false} ref={tiRef}>
														{() => (
															<div className="f-16">
																<Timer.Hours
																	formatValue={(value) => {
																		console.log('value>>>>>>>hours',value)
																		value = (value > 9 ?  value : (value < 1) ? '00': '0'+value)
																		time.hours = value || 0;
																		return value || '00';
																	}}
																/>
																:
																<Timer.Minutes
																	formatValue={(value) => {
																		console.log('value>>>>>>>minutes',value)

																		value = (value > 9 ?  value : (value < 1) ? '00': '0'+value)
																		time.minutes = value || 0;
																		return value || '00';
																	}}
																/>
																:
																<Timer.Seconds
																	formatValue={(value) => {
																		console.log('value>>>>>>>seconds',value)

																		value = (value > 9 ?  value : (value < 1) ? '00': '0'+value)
																		time.seconds = value || 0;
																		return value || '00';
																	}}
																/>
															</div>
														)}
													</Timer>
												</div>
											</Col>
											<Col lg="6" xs="12" className="text-right pl-lg-5">
												<Row style={{justifyContent:"center"}}>
													<Col xs="12">
												<Row style={{justifyContent:"center"}}>
															{/* <Col xs="2" className="d-md-block"/> */}
															{ enableStartPauseTimerButton && showStartTimerbtn && 
																<Col md="2" lg="3" xs="12" className="pt-3 text-center" title="Start timer">				                								
																	<Row>
																		<Col md="12" className="text-center p-0">
																			<Button  onClick={()=>{startTimer()}} className={(disabledStartTimerButton ? "disabled-btn" : "") +" meeting-btn"} disabled={disabledStartTimerButton}>
																				<FontAwesomeIcon icon={faClock}/>
																			</Button>
																		</Col>
																		<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																			<a href="#" onClick={()=>{startTimer()}} disabled={disabledStartTimerButton}>Start Timer</a>
																		</Col>
																	</Row>															                							
																</Col>	
															}
														
															{ enableStartPauseTimerButton && showPauseTimerbtn &&
																<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Pause timer">			
																	<Row>					                							                						
																		<Col md="12" className="text-center p-0">
																			<Button className={(disabledPauseTimerButton ? "disabled-btn" : "") +" meeting-btn"} onClick={()=>{pauseTimer()}} disabled={disabledPauseTimerButton}>
																				<FontAwesomeIcon icon={faClock}/>
																			</Button>
																		</Col>
																		<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																			<a href="#" onClick={()=>{pauseTimer()}} disabled={disabledPauseTimerButton}>Pause Timer</a>
																		</Col>
																	</Row>
																</Col>														
															}
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
															<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Transfer call to another technician">
																<Row>
																	<Col md="12" className="text-center p-0">
																		<Button className="meeting-btn" onClick={handleTransferCall}>
																			<FontAwesomeIcon icon={faBan}/>
																		</Button>
																	</Col>
																	<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																		<a href="#" onClick={handleTransferCall}>Transfer</a>
																	</Col>
																</Row>
																
															</Col>
														</Row>
													</Col>
													<Col xs="12">
												<Row style={{justifyContent:"center"}}>
															{/* <Col xs="2" className="d-md-block"/> */}
															<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Call yourself on mobile">
																<Row>															
																	<Col md="12" className="text-center p-0">
																		<Button className={(disabledCallYourself ? "disabled-btn" : "") +" meeting-btn"}  onClick={()=>{call_yourself()}} disabled={disabledCallYourself} title="Call yourself on phone">
																			<FontAwesomeIcon icon={faPhone}/>
																		</Button>
																	</Col>
																	<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																		<a href="#" onClick={()=>{call_yourself()}} disabled={disabledCallYourself}>Call Yourself</a>
																	</Col>
																</Row>
																
															</Col>
															<Col md="2" lg="3" xs="4" className="pt-3 text-center" title="Call customer on mobile">
																<Row>
																	<Col md="12" className="text-center p-0">
																		<Button className={(disabledCallCustomer ? "disabled-btn" : "") +" meeting-btn"}  onClick={()=>{call_customer()}} disabled={disabledCallCustomer} title="Call customer on phone" >
																			<FontAwesomeIcon icon={faPhoneAlt} />
																		</Button>
																	</Col>
																	<Col md="12" className="app-link-outer meeting-btn-link text-center p-0">
																		<a href="#" onClick={()=>{call_customer()}} disabled={disabledCallCustomer}>Call Customer</a>
																	</Col>
																</Row>
																
															</Col>	
														</Row>
													</Col>
												</Row>
											</Col>
											<Col lg="4" xs="12" className="text-center pt-3">
												<Row>
													<Col md="12" className="end-meeting-btn-outer">
														
														<Button
															className={(disabledEndCall ? "disabled-btn" : "") +" app-btn app-btn-red"}
															onClick={() => {
																endMeeting();
															}}													
															title="Click this button to end the meeting."
															disabled={disabledEndCall}
														>
															<span></span>End Meeting
														</Button>
													</Col>
													<Col md="12" className="app-link-outer">
														{ method !== "ComputerAudio" && <> <span>Disconnected?</span> <Button className="app-btn app-btn-transparent joinBtn" onClick={rejoinPhoneCall} > <span></span> Call me again </Button> </>}
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
								

									<Modal title="Decline the job?" onCancel={()=>{setShowDeclineModal(false)}} visible={showDeclineModal} className="rejectJobModal" footer={[
										<Button className="btn app-btn app-btn-light-blue app-btn-small declne-job-btn" onClick={()=>{setShowDeclineModal(false)}}>
										  <span></span>Cancel
										</Button>,
										<Button className="btn app-btn app-btn-small declne-job-btn" onClick={HandleDeclineJob} >
										  <span></span>Submit
										</Button>,            
									]}>
										<Row className="transfer-call-outer">
											<Loader height="100%" className={(showTransfterCallLoader ? "loader-outer" : "d-none")} />
											<Col xs={12} className="">		
												<div className="text-muted small-text input-notes-text input-notes-modal">
													Please correct the job details as per client requirement before decline.
												</div>
											</Col>
											{/*<Col xs={12} className="mt-2">		
												<Checkbox onChange={checkboxChange}>Would you like to hire expert?</Checkbox>
											</Col> */}

											<Col xs={12} className="mt-2">
												<label className="m-0 font-weight-bold">Select Software <span className="red-text pl-1">*</span></label>
												<select className="form-control" onChange={mainSoftwareSelectChange}>
													<option value="">--Select--</option>				      								
													{
														softwareList.map(item => {
															if(item.parent === "0" || item.parent === 0){
																if(item.id === meetingJob.software.id){
																	return (
																		<option value={item.id} selected="selected">{item.name}</option>
																	)
																}else{
																	return (
																		<option value={item.id}>{item.name}</option>
																	)
																}
															}
															return null;
														})
													}
												</select>
												<div className={(transferCallErrors.emptySoftware ? '' : 'd-none') + " red-text"}>Please select the software.</div>
												
											</Col>
											{subSoftwareList.length > 0 &&
												<Col xs={12} className="mt-2">
													<label className="m-0 font-weight-bold">Select Sub Software <span className="red-text pl-1">*</span></label>
													<select className="form-control" onChange={subSoftwareSelectChange}>
														<option value="">--Select--</option>
														{
															subSoftwareList.map(item => {
																if(item.parent !== "0" || item.parent !== 0){
																	if(meetingJob.subSoftware && item.id === meetingJob.subSoftware.id){
																		return (
																			<option value={item.id} selected="selected">{item.name}</option>
																		)
																	}else{
																		return (
																			<option value={item.id}>{item.name}</option>
																		)
																	}
																}
																return null;
															})
														}
													</select>
													<div className={(transferCallErrors.emptySubSoftware ? '' : 'd-none') + " red-text"}>Please select the subsoftware.</div>
												</Col>
											}
											<Col xs={12} className="mt-2">
												<label className="m-0 font-weight-bold">Select Area <span className="red-text pl-1">*</span></label>
												<select className="form-control" onChange={optionSelectChange}>
													<option value="">--Select--</option>
													{
														subOptionsList.map(item => {
															
															if(item === meetingJob.subOption){
																return (
																	<option value={item} selected="selected">{item}</option>
																)
															}else{
																return (
																	<option value={item}>{item}</option>
																)
															}
															
														})
													}
												</select>
												<div className={(transferCallErrors.emptyArea ? '' : 'd-none') + " red-text"}>Please select the area.</div>
											</Col>
											<Col xs={12} className="mt-2">
												<label className="m-0 font-weight-bold">Issue Description <span className="red-text pl-1">*</span></label>
												<textarea 
													className="form-control" 
													value={jobUpdatedIssueDescription}
													onChange={issueDescriptionChange}
													spellCheck="true"
													maxLength="200"
												></textarea>
												<div className={(transferCallErrors.emptyIssueDescription ? '' : 'd-none') + " red-text"}>Please enter issue description.</div>
											</Col>
											<Col xs={6} className="mt-2">
												<label className="m-0 font-weight-bold">Est. Time From <span className="red-text pl-1">*</span></label>
												<input 
													type="number" 
													className="form-control" 
													value={estTimeFrom} 
													onChange={(e)=>setEstTime(e,'from')}
													placeholder="From"
													min="1"
												/>
												<div className={(transferCallErrors.emptyEstTimeFrom ? '' : 'd-none') + " red-text"}>{estTimeFromErrorMsg}</div>
											</Col>
											<Col xs={6} className="mt-2">
												<label className="m-0 font-weight-bold">Est. Time To <span className="red-text pl-1">*</span></label>
												<input 
													type="number" 
													className="form-control" 
													value={estTimeTo} 
													onChange={(e)=>setEstTime(e,'to')}
													placeholder="To"
													min="1"
												/>
												<div className={(transferCallErrors.emptyEstTimeTo ? '' : 'd-none') + " red-text"}>{estTimeToErrorMsg}</div>
											</Col>
											<Col xs={12} className="mt-3">
												<label className="m-0 font-weight-bold">Reason to decline the job <span className="red-text pl-1">*</span></label>
												<textarea onChange={(e)=>{setDeclinedReasons(e.target.value)}} type="text" id="ReasonToDecline" className="rejectJobClass"/>
												<div className={(transferCallErrors.emptyReason ? '' : 'd-none') + " red-text"}>Please enter the reason to decline job.</div>
											</Col>
										</Row>
									</Modal>
								
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

const EstimatedPriceToggle = (props)=>{
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

TechJobProgress.propTypes = {};

export default memo(TechJobProgress);