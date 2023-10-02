import React, { useEffect, useState, useCallback,useRef } from 'react';
import {
	Modal, Rate, Collapse, Checkbox, Spin,Space
} from 'antd';
import {
	Button, Row, Col, Table, Alert, InputGroup, Dropdown
} from 'react-bootstrap';
import * as DOM from 'react-router-dom';
import style from 'styled-components';
import { useHistory, useLocation } from 'react-router';
import mixpanel from 'mixpanel-browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import queryString from 'query-string';
import { useUser } from '../../context/useContext';
import { useJob } from '../../context/jobContext';
import { useFeedback } from '../../context/feedbackContext';
import { useSocket } from '../../context/socketContext';
import { useNotifications } from '../../context/notificationContext';
import  {getTalkChatUser} from '../../api/chat.api'
import Loader from '../../components/Loader';
import './jobdetail.css';
import * as EarningDetailsApi from '../../api/earningDetails.api'
import { openNotificationWithIcon,handleStartCall,get_or_set_cookie,checkJobValidations } from '../../utils';
import * as JobApi from '../../api/job.api';
import * as WebSocket from '../../api/webSocket.api';
import { send_email_to_customer } from '../../api/serviceProvider.api';
import {updateReferalDiscount} from '../../api/referalDiscount.api'
import { retrieveTechnician } from '../../api/technician.api';
import * as JobService from "../../api/job.api";
import {updateUserByParam} from '../../api/users.api';
import FeedbackCompulsionModal from '../Technician/feedbackCompulsion';
import {useServices} from '../../context/ServiceContext';
import { klaviyoTrack } from '../../api/typeService.api';
import {useChatEngineTools} from '../../context/chatContext';
import {CHAT_PROJECT_KEY,CHAT_APP_PASS} from '../../constants';
import {useAuth} from '../../context/authContext';
import LongJobSubmission from './longJobSubmission';
import * as CustomerApi from '../../api/customers.api';
import getTotalJobTime from '../../components/common/TotalTimeFunction'
import * as PromoApi from '../../api/promo.api';
import * as JobCycleApi from '../../api/jobCycle.api';
import { JobTags } from '../../constants/index.js';
import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import AddToCalendarHOC,{SHARE_SITES} from 'react-add-to-calendar-hoc';
import moment from 'moment';
import ApplyScheduleJobFrom from './applySchduleJobForm';
import EditScheduleJobFrom from './editSchduleJobForm';
import JobCancelFrom from '../Dashboard/components/jobCancelFrom';
import { useTools } from '../../context/toolContext';

let timeInt = false

const { Panel } = Collapse;


	/**
	 * A custom component which renders total spent money of customer
	 * @params = job (Type:Object)
	 * @response : it returns the total amount customer spent on the job.
	 * @author : Sahil
	*/
	const JobBilling = ({job})=>{
		if(job && job?.is_free_job && job?.free_session_total){
			return <>${job.free_session_total}</>
		}
		else if(job && job.total_subscription_seconds !==0 && job.total_subscription_seconds === job.total_seconds){
			return <>${0.00}</>
		}
		else if(job && job.total_subscription_seconds !== 0 && job.total_subscription_seconds < job.total_seconds && job.discounted_cost > 0){
			return <>${job.discounted_cost}</>
		}
		else if(job && job?.total_cost && !job?.is_free_job){
			return <>${job.total_cost}</>
		}
		else if(job && job?.long_job_cost){
			return <>${job.long_job_cost}</>
		}
		else if(job && job.long_job_cost == undefined && job.status == 'long-job'){
			return<>${0.00}</>
		}
		return<>${0.00}</>
	}

	/**
	 * A custom component which renders total earned  money of technician
	 * @params = job (Type:Object)
	 * @response : it returns the total amount technician earned in job sessions
	 * @author : Manibha, Vinit
	*/
	const TechEarning = ({job}) =>{
		const [technicianEarnedMoney, setTechnicianEarnedMoney] = useState(0.00);
		useEffect(() => {
			async function getData() {
				let earnedMoney = 0.00
				if(job && job.total_cost){
					let getBillingDetail =  await EarningDetailsApi.getEarningDetailsByJob(job.id)
					if(Object.keys(getBillingDetail).length > 0){
						earnedMoney = getBillingDetail.amount_earned
						setTechnicianEarnedMoney(earnedMoney)
					}
					else{
					setTechnicianEarnedMoney(job.total_cost)
					}
				}else{
					setTechnicianEarnedMoney(earnedMoney)
				}
			}
			getData();
		 }, [job])	
	return <>${technicianEarnedMoney.toFixed(2)}</>;
};


const JobDetail = ({ jobId, type, setCurrentStep = null }) => {
	console.log("  type :::::::::; ", type)
	const { socket } = useSocket();
	const { user} = useUser();
	const { job, fetchJob } = useJob();
	const inboxRef = useRef();
	const [techType, setTechtype] = useState(type);
	const  {createNewChat,newChatUser,getChatUser} = useChatEngineTools();
	const {chatUser,createChatUser} = useAuth()
	const [scheduleAccptOn, setscheduleAccptOn] = useState('primary');
	const history = useHistory();
	const location = useLocation();
	//const [tempJobId, setTempJobId] = useState(location.state.jobid ? location.state.jobid : jobId);
	const [tempJobId, setTempJobId] = useState(jobId);
	const [isLoading, setIsLoading] = useState(true);
	const { getFeedback, createFeedback, updateFeedback } = useFeedback();
	// const [feedbackData,setFeedbackData ] =  useState(false);
	const [customerFeedback, setCustomerFeedback] = useState(false);
	const [technicianFeedback, setTechnicianFeedback] = useState(false);
	// const [showLoader, setShowLoader] = useState(true);
	const [rejectedCalls, setRejectedCalls] = useState([]);
	const [techCancellation, setTechCancellation]= useState([]);
	const [fromEmail, setFromEmail] = useState(false);
	const [allIssuesList, setAllIssuesList] = useState([]);
	const [confirmedIssuesList, setConfirmedIssuesList] = useState([]);
	// const timerRef = useRef;
	const [showTimer, setShowTimer] = useState(false);
	const [fromVar, setFromVar] = useState('');
	const [showChangeFeedbackModal, setShowChangeFeedbackModal] = useState(false);
	const showChangeFeedbackLoader = false;
	const [checkboxIssues, setCheckboxIssues] = useState([]);
	const [showYesBlock, setshowYesBlock] = useState(false);
	const [showNoBlock, setshowNoBlock] = useState(false);
	const [rating, setRating] = useState();
	const [summary, setSummary] = useState('');
	// const [changeFeedbackBtnDisabled, setChangeFeedbackBtnDisabled] = useState(false);
	const [problemSolved, setProblemSolved] = useState('');
	const [myFeedbackData, setMyFeedbackData] = useState({});
	const [submitFeedbackCalled, setSubmitFeedbackCalled] = useState(false);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [FeedbackJobId, setFeedbackJobId] = useState('');
	const [match, setMatch] = useState('');
	const {createChatUsers,createTalkUserSession,joinTalkChatConversation,createOrGetTalkChatConversation} = useChatEngineTools()
	const { checkIfTwoTierJobAndExpertTech,CreateEarningReport,CreateBillingReport } = useServices();
	const [showLoader,setShowLoader] = useState(null)
	const [disableSubmitbutton, setDisableSubmitbutton] = useState(false);
	const [disableapprovalbtn, setDisableapprovalbtn] = useState(false);
	const [showSubmisssionModal, setShowSubmisssionModal] = useState(false);
	const [showApproveButtons, setShowApproveButtons] = useState(false);
	const [showAdditionalHoursApproveButtons, setshowAdditionalHoursApproveButtons] = useState(false);
	const {createNotification} = useNotifications();
	const [showSubmitLongJobButtonTech, setShowSubmitLongJobButtonTech] = useState(true);
	const [showJoinBtn, setShowJoinBtn] = useState(true);
	const[totalSecondsToPass, setTotalSecondsToPass] = useState(0)
	const [totalJobTimeToPass, setTotalJobTimeToPass] = useState('00:00:00')
	const [dataFromScoket, setDataFromScoket] = useState({})
	const AddToCalendarDropdown = AddToCalendarHOC(Button, Dropdown);
	const now_time = moment();
	const [duration, setDuration] = useState('')
	const [disableApplyForJobButton, setDisableApplyForJobButton] = useState(false);
	const [disableEditForJobButton, setDisableEditForJobButton] = useState(false);
	const [disableDeclineJobButton, setDisableDeclineJobButton] = useState(false);
	const [isApplyScheduleJob, setIsApplyScheduleJob] = useState(false);
	const [isEditScheduleJob, setIsEditScheduleJob] = useState(false);
	const [isCancelModal, setIsCancelModal] = useState(false);
	const [cancelJobId, setCancelJobId] = useState(false);
	const [userType, setUserType] = useState(false)
	const [showChat, setShowChat] = useState(false)
	const [autoApproveJob, setAutoApproveJob] = useState(new Date())

	//const [techCancellation, setTechCancellation]= useState([]);

  const {jobFlowStep,setJobFlowStep,jobFlowsDescriptions} = useTools()
	const scheduledCancelByCustomer = (e) => {
		const job = e.currentTarget.name;
		setUserType("Customer")
		setCancelJobId(job)
		setIsCancelModal(true)
	}


	const scheduledCancelByTech = (e) => {
		const job = e.currentTarget.name;
		setUserType("Technician")
		setCancelJobId(job)
		setIsCancelModal(true)
	}

	const scheduledDeclineByTech = async (e) => {
		const jobid = e.currentTarget.name;
		let msg = "Are you sure you want to decline this job?";
		Modal.confirm({
			title: msg,
			okText: "Yes",
			cancelText: "No",
			className:'app-confirm-modal',
			onOk() {
				setDisableDeclineJobButton(true)
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Job declined from dashboard',{'JobId':jobid});
				decline_job_by_technician(jobid,false)
			},
		})
	}

	/**
	* This function will is common function for decline the job by tech
	* @response : jobid(Type: String): Job id which is declined by tech
	*		techAlert(Type:Boolean): True for other case and in schedule job decline it will only decline the without notification
	* @author : unknown
	* @note: this function updated by Ridhima Dhir by adding techAlert flag
	*/

	const decline_job_by_technician = async (jobid, alert = true, reason = null) => {
		try {
			// find job details 
			let selectedJob = await JobApi.retrieveJob(jobid)
			let tech_id = user.technician.id
			let notifiedTechs = selectedJob.notifiedTechs;
			console.log("notifiedTechs ::: before", notifiedTechs)
			// get notifiedTech object and reverse the object bcz notifiedTech have multiple same value 
			// bcz after decline find tech function will work and push tech values agagin.
			// in secondryTime true: notification again goes to all tech but exclude declined techs.
			notifiedTechs.reverse().forEach(function (techs, index) {
				if (techs['techId'] == tech_id) {
					notifiedTechs[index]['jobStatus'] = "tech-decline"
					notifiedTechs[index]['notifyEndAt'] = new Date();
				}
				tech_id = false;
			});
			console.log("notifiedTechs ::: after", notifiedTechs)

			let dataToUpdate = {
				$unset: { schedule_accepted_by_technician: 1, technician: 1, schedule_accepted_on: 1 },
				schedule_accepted: false,
				notifiedTechs: notifiedTechs.reverse(),
				$push: { tech_declined_ids: user.technician.id }
			}
			await JobApi.updateJob(jobid, dataToUpdate)

			if (alert) {
				let checkScheduleJobStatus = await JobApi.checkScheduleJobAvailability(jobid)
				if (!checkScheduleJobStatus['scheduleDetails']['scheduleExpired']) {
					socket.emit("technician:schedule-job-declined", {
						"jobId": selectedJob.id,
						"technician_user": user,
						"reason": reason
					})
					console.log(">>>>>>>>>>>>>>>>>>>>>>sending schedule job >>>>>>>>>>>>>>>>", selectedJob)
					await socket.emit("send-schedule-alerts", {
						jobId: jobid,
						accepted: false,
						customerTimezone: selectedJob.customer.user.timezone,
						jobObj: selectedJob,
						primaryTime: selectedJob.primarySchedule,
						secondryTime: selectedJob.secondrySchedule,
						phoneNumber: selectedJob.customer.user.phoneNumber,
						customerEmail: selectedJob.customer.user.email,
						customerName: selectedJob.customer.user.firstName,
						technicianId: false,
						decliedTechnician: user.id
					})
					JobApi.sendSmsForScheduledDeclinedJob({ 'jobId': jobid, 'technicianName': user.firstName })
				}
			}

			setTimeout(() => {
				window.location.reload()
			}, 3000)
		}
		catch (err) {
			openNotificationWithIcon('error', 'Error', err.message);
			setDisableDeclineJobButton(false)
		}
	}
	
	if(timeInt){
		clearInterval(timeInt);
	}
	
	const checkFeedback = async () => {
		const findJob = await JobService.findJobByParams({'technician':user.technician.id},{page:1,pageSize:1});
		if(findJob != undefined){
			if(findJob.jobs != undefined && findJob.jobs.data != undefined && findJob.jobs.data.length > 0){
				if(findJob.jobs.data[0].status === 'Completed'){
					// console.log("value of find job",findJob);
					const feedbackDataRes = await getFeedback(findJob.jobs.data[0].id);
					setFeedbackJobId(findJob.jobs.data[0].id);
					// console.log("Value of feedback res", feedbackDataRes);
					if(feedbackDataRes.length == 0){
						setShowFeedbackModal(true);
						return false;
					}else{
						return true;
					}
				}else{
					return true;
				}
			}else{
				return true
			}			
		}else{
			return true;
		}
		
  };
	
	const handleCustomerJoin = (job)=>{
		get_or_set_cookie(user)
		window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${job.id}`
	}

/**
	* getOrCreates a chat user and create session for chat user
	* @params : user(Type:Object),
	* @response : Returns user and create a talk chat session for user
	* @author : Sahil
**/
	const handleTalkChatUser = async(user)=>
	{   
		try
		{

		    let chatUser = await getTalkChatUser(user)
		    if (!chatUser)
		    {	
		        let dataToCreateUser = {
		          "name":user.firstName,
		          "id":user.id,
		          "chatId":user.userIntId,
		          "role":user.userType
		        }
		        let createChatUser = await createChatUsers(dataToCreateUser)
		        if (createChatUsers){
		          let userCreated = await getTalkChatUser(user)
		          return userCreated
		        }
		    }
		    else{
		      return chatUser
		    }
		}
		catch(err){
		  console.log("error in handleTalkChat ::: ",err)
		}
	}
	
	const distanceCalc = (job, DATE_OPTIONS) => {
		let selectedTime = '';
		if (job.schedule_accepted_on === 'primary') {
			selectedTime = new Date(job.primarySchedule).toLocaleTimeString('en-US', DATE_OPTIONS);
		} else {
			selectedTime = new Date(job.secondrySchedule).toLocaleTimeString('en-US', DATE_OPTIONS);
		}
		const countDownDate = new Date(selectedTime).getTime();
		const timeNow = new Date().getTime();
		const distance = countDownDate - timeNow;
		return distance;
	};
	const createUserForChat = async (user)=>{
		let data = {
        "username":user?.firstName + "_" + user?.lastName,
        "first_name":user?.firstName,
        "last_name":user?.lastName,
        "secret":CHAT_APP_PASS,
		}
		let username = await newChatUser(data,user.id)
		return username;
	}

	const createOrGetUserChat = async (particiants,jobId,software,job)=>{
		let data = {
				"id":jobId,
				"jobId":job.chatRoomId ? job.chatRoomId :Math.floor(Math.random() * 50000),
			    "particiants": particiants,
			    "subject": `${software}(${jobId})`,
			}
		return data
	}
	const fetchSingleJob = async()=>{
		try{
			
			let response = await JobService.retrieveJob(jobId)
			setDuration(moment.duration(moment(response.primarySchedule).diff(now_time)))
			if(response.is_long_job || response.schedule_accepted){
				setShowLoader(true)
				let customerDataObject = {...response.customer.user}
				if (customerDataObject.userIntId === null || customerDataObject.userIntId === undefined){
					customerDataObject.userIntId = Math.floor(Math.random() * 50000);
					let updateUserResponse = await updateUserByParam({"_id":customerDataObject.id,"data":{"userIntId":customerDataObject.userIntId}})
				}
				let technicianDataObject = {...response.technician.user} 
				if (technicianDataObject.userIntId === null || technicianDataObject.userIntId === undefined){
					technicianDataObject.userIntId = Math.floor(Math.random() * 50000);
					let updateUserResponse = await updateUserByParam({"_id":technicianDataObject.id,"data":{"userIntId":technicianDataObject.userIntId}})
				}
				let customerChatUser =  await handleTalkChatUser(customerDataObject)
				let technicianChatUser = await handleTalkChatUser(technicianDataObject)
				if(user.userType == 'technician'){
					createTalkUserSession(technicianChatUser)
				}
				else{
					createTalkUserSession(customerChatUser)
				}
				let conversationData = await createOrGetUserChat([JSON.stringify(customerDataObject.userIntId),JSON.stringify(technicianDataObject.userIntId)],response.id,response.software.name,response)
				let conversation = await createOrGetTalkChatConversation(conversationData)
				let userInbox =  await joinTalkChatConversation({"customer":customerChatUser,"technician":technicianChatUser,"conversationId":response.chatRoomId ? response.chatRoomId:conversationData.jobId})
				setTimeout(()=>{
					if(userInbox){
						setShowLoader(false)
						setTimeout(()=>{
							if(inboxRef.current != undefined){
								userInbox.mount(inboxRef.current)
							}
							if(user.userType === 'technician'){
								setShowChat(true)
							}
						},2000)
					}
				},4000)			
			}		
				
			
			
		}
		catch(err){
			console.log("error in fetchSingleJob >>")
		}
	}
	
	useEffect(()=>{
		console.log("setShowChat::::",showChat)
		console.log("changed")
		console.log("jobId >>>>>>",jobId)
		if (showChat){
			socket.emit("toStartChat-WithCustomer",{"jobId":jobId})
		}
	},[showChat])

	useEffect(()=>{
		fetchSingleJob()
	},[user])

	useEffect(() => {
		(async () => {
			// let emailJob = new URLSearchParams(location.search)
			const emailJob = queryString.parse(location.search);
			// console.log(">>>emailJob>>emailJob")
			// console.log('emailJob>>>>>>>>>>>>>>>',emailJob)
			if (emailJob) {
				const jobid = emailJob.jobID;
				const { type } = emailJob;
				const { from } = emailJob;
				// console.log(">>>>jonid",jobid)
				if (jobid) {
					// setFromEmail(true)
					setFromVar(from);
					setTempJobId(tempJobId);
					fetchJob(jobid);
					const feedbackDataRes = await getFeedback(jobid);
					//console.log('feedbackDataRes>>>>>>>>>>>>>>>>>>',feedbackDataRes)
					setDataForFeedback(feedbackDataRes);
					setTimeout(() => {
						setIsLoading(false);
					}, 800);

					// console.log("type >>>",type)
					setTechtype(type);
				} else {
					setFromEmail(false);
					// console.log("------------------i am in -----------")
					call_fetch_job();
				}
			}
		})();
	}, [tempJobId]);

	useEffect(() => {
		if(jobId){
			socket.emit("join",jobId)
		}
		
		socket.on("refresh-customer", async ()=> {
			fetchJob(jobId)
			if(user?.userType === 'customer'){
				setTimeout(() => {
					fetchSingleJob()
				}, 7000);
			}
        	})
		
		socket.on('set-join-on-dashboard', (data) => {
			// console.log("data::::::: :::::::: ",jobId,data)
			// console.log("condition 1 :::::: ",toString(data.jobid)==toString(jobId))
			if (data.jobId === jobId) {
				// console.log("jobId------- ")
				fetchJob(data.jobId);
			}
		});

		socket.on("call:started-customer",()=>{
			fetchJob(jobId)
		})

		socket.on("long-job-submission-to-cust",(data)=>{			
			if(user.userType  === 'customer'){
				console.log('long-job-submission-to-cust>>>>>>>>>>>>>>>>>')
				fetchJob(data.jobId)
				setShowApproveButtons(true)
				setDisableapprovalbtn(false)
			}
		})
	
		socket.on("re-submit-job-to-tech",()=>{
			if(user.userType  === 'technician'){
				setShowSubmitLongJobButtonTech(true)
				setDisableSubmitbutton(false)
			}
			if(user.userType  === 'customer'){
				setDisableapprovalbtn(false)
			}
		})		

		socket.on("long-job-approved-to-tech",(data)=>{	
			openNotificationWithIcon('success', 'Success', 'Please provide feedback by clicking on give feedback button.');
			setShowJoinBtn(false)
			setDisableSubmitbutton(false)
			fetchJob(data.jobId)
		})

        socket.on("update-additional-hours", async (data)=> {
			fetchJob(jobId)
			console.log('update-additional-hours', data);
			setshowAdditionalHoursApproveButtons(true);
			console.log("additional hours", showAdditionalHoursApproveButtons);
		})

		socket.on("job-updated", async ()=> {
			fetchJob(jobId)
			console.log('job-updated :::', jobId);
		})

		socket.on("additional-hours-approved", async (data)=> {
			fetchJob(jobId)
			console.log('additional-hours-approved', data);
		})

		socket.on("refresh-customer", (data)=> {
	
			fetchJob(jobId)
			
		})

		socket.on("refresh-chat", (data)=> {
			if(user.userType === 'customer'){
				console.log("refresh-chat")
				fetchSingleJob()
			}
             
		})
		// setshowAdditionalHoursApproveButtons(true);

	}, [ jobId, socket]);


	//Utkarsh Dixit
	//purpose : approve button will be visible even after reload

	useEffect(() => {
		(async () => {
			console.log("This is to check if job is updated", job);
			// fetchJob(jobId)
			console.log('checkScheduleJobStatus::: ', jobId);
			let checkScheduleJobStatus = await JobApi.checkScheduleJobAvailability(jobId)
			console.log('checkScheduleJobStatus::: ', checkScheduleJobStatus);
			if(job != undefined && job.additional_hours_submission != undefined && job.additional_hours_submission == "yes"){
				setshowAdditionalHoursApproveButtons(true);
				console.log("additional hours", showAdditionalHoursApproveButtons);	
			}
		})();
	}, []);
	
	const DATE_OPTIONS = {
		weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: user.timezone,
	};
	const JoinJob = () => {
		
		if(user && job){
			mixpanel.identify(user.email);
			mixpanel.track(user.userType+' - Click on join button from job details page', { 'JobId': job.id });
		}

		if(user.userType === 'customer' && job.status == 'long-job'){
			 window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${job.id}`

		}
		if(user.userType === 'technician' && job.status == 'long-job'){
			 window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${job.id}`
			
		}

		if (user.userType === 'customer' && job.status == 'Inprogress') {
			let filter_dict = {'status':'Inprogress','customer':user.customer.id}
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result)=>{    
				console.log('result.data>>>>>>>>>>>>',result)
				if(job.id  == result.jobs.data[0].id){
				 	window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${job.id}`
				}
				else{
					openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
				}

			});
		}			 
		if (user.userType === 'technician' && job.status == 'Inprogress' ) {
			let filter_dict = {'status':'Inprogress','technician':user.technician.id}
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result)=>{    
				if(job.id  == result.jobs.data[0].id){
					window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${job.id}`         
				}
				else{
					openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
				}
					
			})
			 
		}
	};
	const AcceptJob = async (job) => {
    	let feedb = await checkFeedback();
		if(feedb){
			const jobId = job.id;
			const res = await JobApi.retrieveJob(jobId);
			Modal.confirm({
				title: 'Are you sure you want to accept this job?',
				okText: 'Yes',
				cancelText: 'No',
				className: 'app-confirm-modal',
				async onOk() {
					const check_feedback = await JobApi.checkLastJobFeedback({'technician':user.technician.id});

					if(check_feedback.job_id != undefined){
						// console.log('check_feedback>>>>>>>',check_feedback)
						setShowFeedbackModal(true)
						setFeedbackJobId(check_feedback.job_id)
					}else{
						let validation = checkJobValidations(user,jobId,location)
						if (validation) {
							try {
								JobApi.sendJobAcceptEmail(jobId);
							} catch (err) {
								setTechtype('noapply');
								openNotificationWithIcon('success', 'Success', 'Thanks for applying the job. you can join the meeting from dashboard when customer starts the call ');
								history.push('/');
							}
						}else{
							openNotificationWithIcon('error', 'Error', 'Sorry! The job has been taken by someone else.');
						}								
					}
				}
			});
		}
		
	};

	const startCall = async () => {
		console.log(job.status === 'Accepted', 'the condition');
		 let filter_dict = {'status':'Inprogress','customer':user.customer.id}
		const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
		findInprogressLatestJob.then(async (result)=>{    
			if(result.jobs.totalCount >= 1){
				openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
			}else{
				 if (job.status === 'Accepted' || job.schedule_accepted === true) {
						// socket.emit('accept-job', job);
						try {
							const webdata = await WebSocket.create({
								user: user.id,
								job: job.id,
								socketType: 'accept-job',
								userType: user.userType,
								hitFromCustomerSide: true,
							});

							job.web_socket_id = webdata.websocket_details.id;
							await WebSocket.customer_start_call(job);
						} catch (err) {
							console.log('onSubmit error in InviteTech page>>>', err);
							await WebSocket.customer_start_call(job);
						}
					}
					await JobCycleApi.create(JobTags.CUSTOMER_START_SCHEDULE_CALL, job.id);
					socket.emit('invite-technician', { job: job.id, tech: job.technician });
						window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${job.id}`
			}

		})    
	};

	const handleScheduleBtn = (e) => {
		setscheduleAccptOn(e.currentTarget.id);
	};

	if (!user) {
		history.push('/login');
	}


	const call_fetch_job = async () => {
		// console.log("call_fetch_job>>>>>>>>>>>>>>>>>",jobId)
		await fetchJob(jobId);
		const feedbackDataRes = await getFeedback(jobId);
		setDataForFeedback(feedbackDataRes);
		setTimeout(() => {
			setIsLoading(false);
		}, 800);
	};

	useEffect(() => {
		console.log("job**********************",job)
		// console.log("feedbackData",feedbackData)
		if (job) {
			let jobCreatedTime = new Date(job?.long_job_sent_approval_at);
			let updateDate =  jobCreatedTime.setDate(jobCreatedTime.getDate() + 3);
			setAutoApproveJob(moment(updateDate).format('lll'))
			setDuration(moment.duration(moment(job.primarySchedule).diff(now_time)))
			const res = getTotalJobTime(job);
			console.log('response is', res);
			setTotalSecondsToPass(res.totalSeconds);
			setTotalJobTimeToPass(res.totalTime);

			const distance = distanceCalc(job, DATE_OPTIONS);
			if (distance > 0) {
				// console.log("::::: distance :::::",distance)
				setShowTimer(true);
			} else {
				// console.log("::::: distance :::::",distance)
				setShowTimer(false);
			}
			if(job && job.submission === 'yes' && job.status === 'long-job'){
				setShowApproveButtons(true)
				setDisableSubmitbutton(true)

			}
			const arr = [];
			job.tech_declined_ids.map((t, i) => {
				// console.log("t,i",t,i)
				const o = {};
				o.reason = (job.reasons && job.reasons[i] ? job.reasons[i] : 'NA');
				retrieveTechnician(t).then((d) => {
					// console.log("d",d)
					o.technician = (d.user ? `${d.user.firstName} ${d.user.lastName}` : '');
					arr.push(o);
				});
				if (i + 1 === job.tech_declined_ids.length) {
					setTimeout(() => {
						setRejectedCalls(arr);
					}, 600);
				}
				return true;
			});
			/*const techCancellationArr = [];
			job.techCancellation.map((t, i) => {
				let o = {};
				o.reason = (t.reasons && t.reasons[i] ? t.reasons[i] : 'NA');
				retrieveTechnician(t.technician).then((d) => {
					// console.log("d",d)
					o.technician = (d.user ? `${d.user.firstName} ${d.user.lastName}` : '');
					techCancellationArr.push(o);
				});
				if (i + 1 === job.tech_declined_ids.length) {
					setTimeout(() => {
						setTechCancellation(arr);
					}, 600);
				}
				return true;
			});*/

			const techCancellationArr = [];
			if (job.techCancellation){
					job.techCancellation.map(async (t, i) => {
					let o = {};
					o.reason = (t.reason ? t.reason : 'NA');
					await retrieveTechnician(t.technician).then((d) => {
						// console.log("d",d)
						o.technician = (d.user ? `${d.user.firstName} ${d.user.lastName}` : '');
						techCancellationArr.push(o);
						console.log("techCancellationArr :::::: ", techCancellationArr)
						
					});
					setTechCancellation(techCancellationArr);
					return true;
				});
			}
			

			const DeclinedIdTech = [];
			for (let i = 0; i < job.tech_declined_ids.length; i++) 
			{
				DeclinedIdTech.push(job.tech_declined_ids[i]);
			}
			if(user.userType === "technician")
			{
				const matchvalue = DeclinedIdTech.find(e => e === user.technician.id);
				return(
				setMatch(matchvalue)
				)
			}
		}
		
		if (job && job.allNotes && job.allNotes.trim().length > 0) {
			const allIssuesListArr = job.allNotes.split('|SEP|');
			setAllIssuesList(allIssuesListArr);
		}
		if (job && job.confirmedNotes && job.confirmedNotes.trim().length > 0) {
			const confirmedIssuesListArr = job.confirmedNotes.split('|SEP|');
			setConfirmedIssuesList(confirmedIssuesListArr);
		}

		// The following if condition is used to show approve/reject buttons on customer side technician hits submit for approval in long job.
		if(job && job.submission != undefined && job.submission === 'yes'){
			setShowApproveButtons(true)
		}
		
	}, [job]);

	const setDataForFeedback = useCallback((feedbackDataRes) => {
		if (feedbackDataRes) {
			for (let i = 0; i <= feedbackDataRes.length - 1; i++) {
				// console.log("feedbackDataRes[i]['user']",feedbackDataRes[i],feedbackDataRes[i]['user'])
				if (feedbackDataRes[i].user && feedbackDataRes[i].user.userType) {
					if (feedbackDataRes[i].user.userType === 'customer') {
						setCustomerFeedback(feedbackDataRes[i]);
					}
					if (feedbackDataRes[i].user.userType === 'technician') {
						setTechnicianFeedback(feedbackDataRes[i]);
					}

					if (user && user.userType === feedbackDataRes[i].user.userType) {
						setMyFeedbackData(feedbackDataRes[i]);
						setRating(feedbackDataRes[i].rating);
						setSummary(feedbackDataRes[i].comments);
						setCheckboxIssues(feedbackDataRes[i].issues);
						if (feedbackDataRes[i].is_solved) {
							setshowYesBlock(true);
							setshowNoBlock(false);
							setProblemSolved('yes');
						} else {
							setshowYesBlock(false);
							setshowNoBlock(true);
							setProblemSolved('no');
						}
					}
				}
			}
		}
	});

	/* function CapitlizeString(word) {
				return word.charAt(0).toUpperCase() + word.slice(1);
		} */

	
	const applyForJob = async () => {
		setDisableApplyForJobButton(true)
		let feedb = await checkFeedback();

		if(feedb){
			let resultVal = await checkIfTwoTierJobAndExpertTech(user.technician,job)
			const check_feedback = await JobApi.checkLastJobFeedback({'technician':user.technician.id});
	
			if(resultVal == false){
				openNotificationWithIcon('error', 'Error', 'This job is only for experts.Please contact admin to make you one.');
				window.location.reload();					
			}
	
			else if(check_feedback.job_id != undefined){
				//console.log('check_feedback>>>>>>>',check_feedback)
				setShowFeedbackModal(true)
				setFeedbackJobId(check_feedback.job_id)
			}else{
				const res = await JobApi.retrieveJob(job.id);
				if (res.technician === null || !res.technician) {
					if (user && user.technician) {
						if (res.status === 'Scheduled') {
							await JobApi.updateJob(job.id, {
								technician: user.technician.id, schedule_accepted_by_technician: user.id, schedule_accepted_on: scheduleAccptOn, schedule_accepted: true,
							});
						} else {
							await JobApi.updateJob(job.id, { technician: user.technician.id, status: 'Accepted' });
						}
						send_email_to_customer(job.id);
					}
	
					// mixpanel code//
					mixpanel.identify(user.email);
					mixpanel.track('Technician - Job applied from job details page successfully', { 'JobId': job.id });
					// mixpanel code//
					await JobCycleApi.create(JobTags.TECH_ACCEPT_SCHEDULE_JOB, job.id);
					openNotificationWithIcon('success', 'Success', 'We received your application and you’ll be hearing from us shortly.');
	
					socket.emit('scheduled-job-accepted-by-technician', {
						job: res, techEmail: user.email, timezone: user.timezone, techDetails: user.technician, techName: user.firstName, scheduleAccptOnVar: scheduleAccptOn,techName:user.firstName
					});
					if (fromEmail) {
						window.location.href = `/job-details?jobID=${job.id}&type=noapply`;
					}
					fetchJob(job.id);
					setTechtype('noapply');
				} else {
					// mixpanel code//
					mixpanel.identify(user.email);
					mixpanel.track('Technician - Job applied from job details page not successfully', { 'JobId': job.id });
					// mixpanel code//
					openNotificationWithIcon('success', 'Success', 'Sorry!. The job has been taken.');
					if (fromEmail) {
						window.location.href = `/job-details?jobID=${job.id}&type=noapply`;
					}
					fetchJob(job.id);
					setTechtype('noapply');
				}
			}
		}
		
	};

	const try_again_post_job = () => {
		if (user && user.userType === 'customer' && user.customer) {
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Try again from job-details page.', { JobId: job.id });
			setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
			history.push(`/customer/start-profile-setup?jobId=${job.id}&repost=true`);
		} else {
			openNotificationWithIcon('error', 'Error', 'User not found.');
		}
	};

	const handleChangeFeedback = async () => {
		if (problemSolved === '') {
			openNotificationWithIcon('error', 'Error', 'Please select between Yes or No. is problem solved?');
			return false;
		}
		// console.log("user.usertype",user.userType);
		// console.log("summary",summary)
		if (user && user.userType === 'technician' && (!summary || summary.trim() === '')) {
			openNotificationWithIcon('error', 'Error', 'Meeting summary is required.');
			return false;
		}
		// console.log("change feedback submitted...",myFeedbackData)

		const newFeedbackData = {};
		newFeedbackData.is_solved = (problemSolved === 'yes');
		let checkboxFinalValues = [];
		if (problemSolved === 'no') {
			checkboxFinalValues = checkboxIssues;
		} else {
			// checkboxValues = [];
		}
		newFeedbackData.issues = checkboxFinalValues;
		newFeedbackData.rating = rating;
		newFeedbackData.comments = summary;

		if (problemSolved !== '' && problemSolved === 'no' && checkboxIssues.length === 0) {
			openNotificationWithIcon('error', 'Error', 'Please select the reason why problem is not solved.');
			return false;
		}

		setSubmitFeedbackCalled(true);
		let feedbackRes = {};
		if (myFeedbackData && myFeedbackData.id) {
			feedbackRes = await updateFeedback(myFeedbackData.id, newFeedbackData);
			if (feedbackRes) {
				setMyFeedbackData(feedbackRes);
				if (user && user.userType === 'customer') {
					// console.log("feedbackRes cust",feedbackRes)
					setCustomerFeedback(feedbackRes);
          const klaviyoData = {
            email: job.technician.user.email,
            event: 'Client rating',
            properties: {
              $first_name: job.technician.user.firstName,
              $last_name: job.technician.user.lastName,
              $job: job.id,
              $rating: rating,
            },
          };
          await klaviyoTrack(klaviyoData);
				}
				if (user && user.userType === 'technician') {
					// console.log("feedbackRes tech",feedbackRes)
					setTechnicianFeedback(feedbackRes);
          const klaviyoData = {
            email: job.customer.user.email,
            event: 'Client rating',
            properties: {
              $first_name: job.customer.user.firstName,
              $last_name: job.customer.user.lastName,
              $job: job.id,
              $rating: rating,
            },
          };
          await klaviyoTrack(klaviyoData);
				}
				setShowChangeFeedbackModal(false);
				openNotificationWithIcon('success', 'Success', 'Feedback changed successfully.');
				// mixpanel code//
				mixpanel.identify(user.email);
				mixpanel.track('Feedback changed', { JobId: job.id });
				// mixpanel code//
			} else {
				openNotificationWithIcon('error', 'Error', 'Failed to update feedback. Please reload your page and try again.');
			}
		} else {
			let feedBackGivenTo = '';
			if (user.userType === 'technician') {
				feedBackGivenTo = job.customer.user.id;
        const klaviyoData = {
          email: job.customer.user.email,
          event: 'Client rating',
          properties: {
            $first_name: job.customer.user.firstName,
            $last_name: job.customer.user.lastName,
            $job: job.id,
            $rating: rating,
          },
        };
        await klaviyoTrack(klaviyoData);
			} else {
				feedBackGivenTo = job.technician.user.id;
        const klaviyoData = {
          email: job.technician.user.email,
          event: 'Client rating',
          properties: {
            $first_name: job.technician.user.firstName,
            $last_name: job.technician.user.lastName,
            $job: job.id,
            $rating: rating,
          },
        };
        await klaviyoTrack(klaviyoData);
			}

			newFeedbackData.job = job.id;
			newFeedbackData.user = user.id;
			newFeedbackData.to = feedBackGivenTo;
			await createFeedback(newFeedbackData);
			feedbackRes = await getFeedback(job.id);
			if (feedbackRes) {
				setDataForFeedback(feedbackRes);
				setShowChangeFeedbackModal(false);
				openNotificationWithIcon('success', 'Success', 'Feedback changed successfully.');
			}
		}

		setSubmitFeedbackCalled(false);
	};

	const toggle_solved = (res) => {
		// console.log("res",res)
		setProblemSolved(res);
		if (res === 'yes') {
			setshowYesBlock(true);
			setshowNoBlock(false);
		} else {
			setshowYesBlock(false);
			setshowNoBlock(true);
		}
	};

	const setIssueCheckbox = (checkedValues) => {
		// console.log("checkedValues.target.checked",checkedValues.target.checked)
		const tempCheckValues = [...checkboxIssues];
		if (checkedValues.target.checked === true) {
			tempCheckValues.push(checkedValues.target.value);
		} else {
			const index = tempCheckValues.indexOf(checkedValues.target.value);
			if (index > -1) {
				tempCheckValues.splice(index, 1);
			}
		}
		// console.log("tempCheckValues",tempCheckValues)
		setCheckboxIssues(tempCheckValues);
		/* if (tempCheckValues.length === 0 || summary === '') {
						setChangeFeedbackBtnDisabled(true);
				}

				if (tempCheckValues.length > 0 && summary !== '') {
						setChangeFeedbackBtnDisabled(false);
				} */
	};

	const ratingChanged = (newRating) => {
		setRating(newRating);
	};

	const handleChangeText = e => {
		const data = e.target.value;
		if (data.trim() === '') {
			// setChangeFeedbackBtnDisabled(true);
		} else {
			setSummary(e.target.value);
			/* if (checkboxValues.length > 0 && summary !== '' && typeof (IsSolved) === 'boolean') {
								setChangeFeedbackBtnDisabled(false);
						}
						if (summary !== '' && typeof (IsSolved) === 'boolean') {
								setChangeFeedbackBtnDisabled(false);
						} */
		}
	};


	async function handleApprovalModal(total_cost){
		try{
			Modal.confirm({
				title: 'Are you sure you want to submit job for approval?',
				okText: "Yes",
				cancelText: "No",
				className:'app-confirm-modal',
				async onOk() {
					if(user){
						mixpanel.identify(user.email);
						mixpanel.track('Technician - Click on Yes for Long-job approval',{'JobId':job.id});			
					}
					let lifeCycleTag = ''
					if(job.additional_hours_submission === 'yes'){
						lifeCycleTag = JobTags.TECH_SUBMIT_FOR_APPROVAL_WITH_EDIT;
					}else{
						lifeCycleTag = JobTags.TECH_SUBMIT_FOR_APPROVAL_WITHOUT_EDIT;
					}
					await JobCycleApi.create(lifeCycleTag, job.id);
					jobSubmitCompletion(total_cost);
				}
			})	
		}
		catch(err){
			console.log("error in handleApprovalModal ::: ",err)
		}
	}


	/**
	* Function will run when technician will submit the long job for approval by customer and will update the job.
	* @params =  no params
	* @response : no response
	* @author : Karan
	*/
	const handleLongJobSubmission = async() =>{
		if(user){
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Click on Submit for approval for Long-Job ',{'JobId':job.id});			
		}
		console.log(">>>>.job >>>>>>>",job)
		if(job.long_job_with_minutes && job.long_job_with_minutes === 'yes'){
			setShowSubmisssionModal(true)
		}else{
			handleApprovalModal()
		}
	}

	/**
	* Function will run when technician will submit the long job for approval by customer and will update the job.
	* @params =  no params
	* @response : no response
	* @author : Manibha
	*/
	const jobSubmitCompletion = async(total_cost) =>{
		let data = {}
		setShowSubmitLongJobButtonTech(false)
		setDisableSubmitbutton(true)
		await JobApi.updateJob(job.id, {
			'submission':'yes',
			'total_cost':total_cost,
			'long_job_cost':total_cost,
			"long_job_sent_approval_at":new Date()
		
		});
		socket.emit("long-job-submission-by-tech", { "jobId": job.id })
		data['jobId'] = job.id	
		data['userType'] = user.userType
		JobApi.pauseStartLongJobTimer({action:"pauseTimer",JobId:job.id,userType:job.technician.user.userType})
		longJobSubmitNotification()
		setShowSubmisssionModal(false)
		JobApi.sendTextForJobSubmission({'customerNumber':job.customer.phoneNumber,'jobId':job.id,'customerName':job.customer.user.firstName,'techName':job.technician.user.firstName,'softwareName':job.software.name})
		JobApi.sendEmailForJobSubmission({'email':job.customer.user.email,'firstName':job.customer.user.firstName,'lastName':job.customer.user.lastName})
		openNotificationWithIcon('success', 'Success', 'Submission taken successfully.We will send you a notification when customer will approve/reject your submission.');
	}


	/**
	* Function will created a new notification when technican will submit the long job.
	* @params =  no params
	* @response : no response
	* @author : Manibha
	*/
	const longJobSubmitNotification = ()=>{
		const notificationData = {
			user: job.customer.user.id,
			job: job.id,
			read: false,
			actionable: true,
			shownInBrowser: false,
			title: 'Technician have submitted long job.',
			type: 'long_job_notifcation',
		};
		createNotification(notificationData);
	}

	/**

	 * Function will run when technician submit the long job with per six minute calculation
	 * @params =  totalJobCost (Type: Number), jobTotalSeconds (Type: Number),totalJobTime (Type: Number)
	 * @response : will update the job details in db
	 * @author : Karan
	 */
	const minutesLongJobSubmission = async (
		totalJobCost,
		jobTotalSeconds,
		totalJobTime
	) => {
		setShowSubmitLongJobButtonTech(false);
		setDisableSubmitbutton(true);
		const discountData  = await CustomerApi.handleReferralDiscount({'customerId':job.customer.id,'totalCost':totalJobCost})

		await JobApi.updateJob(job.id, {
			submission: "yes",
			long_job_cost: totalJobCost,
			total_cost: totalJobCost,
			total_time: totalJobTime,
			total_seconds: jobTotalSeconds,
			referalDiscount:discountData.referalDiscountCost
		});

		longJobSubmitNotification();
		socket.emit("long-job-submission-by-tech", { jobId: job.id });
		JobApi.sendTextForJobSubmission({
			customerNumber: job.customer.phoneNumber,
			jobId: job.id,
			customerName: job.customer.user.firstName,
			techName: job.technician.user.firstName,
			softwareName: job.software.name,
		});

		setShowSubmisssionModal(false)
		openNotificationWithIcon('success', 'Success', 'Submission taken successfully.We will send you a notification when customer will approve/reject your submission.');
	}

	/**
	* Function will check if the technician submission is approved or reject by customer and will update the job accordingly.
	* @params =  answer (Type:String), status (Type:String)
	* @response : no response
	* @author : Manibha
	*/
	// console.log("Checking job data for charge",job);

	const job_approval_status = (answer,status)=>{
		let modal_title = ''
		console.log("Checking job data for charge",job);
		if(answer == 'yes'){
			// mixpanel code//
			if(user){
				mixpanel.identify(user.email);
				mixpanel.track('Customer -Click on Approve Button', { 'JobId': job.id });
			}
			// mixpanel code//
			// modal_title = 'Are you sure you want to '+status+' this job?.If you select yes money will be deducted from your card and job will be marked as completed.'
			modal_title = 'Are you sure you are ready to mark your job as complete? This action cannot be undone, and once done, your job will be marked as final.'
			
		}else{
			if(user){
				mixpanel.identify(user.email);
				mixpanel.track('Technician -Click on Reject Button', { 'JobId': job.id });
			}
			modal_title =  'Are you sure you want to '+status+' this job?.If you select yes the job will remain same and technician will have to submit the job completion again.'
		}
		Modal.confirm({
			title: modal_title,
			okText: "Yes",
			cancelText: "Go Back",
			className:'app-confirm-modal',
			async onOk() {
				if(user){
					mixpanel.identify(user.email);
					mixpanel.track(`Technician -Click on Yes to ${status} Job`, { 'JobId': job.id });
				}
				// console.log('job_approval_status>>>>>>',answer)
				setDisableapprovalbtn(true)
				setShowApproveButtons(false)
				console.log('hiding>>>>>>>>>>>>>')				
				if(answer === 'no'){
					await JobCycleApi.create(JobTags.CUSTOMER_REJECT_LONG_JOB_APPROVAL, job.id);
					console.log("Answer is no")
					await JobApi.updateJob(job.id, {
						'approval_status':answer,
						'submission':''
					});

					const notificationData = {
						user: job.technician.user.id,
						job: job.id,
						read: false,
						actionable: true,
				        shownInBrowser: false,
						title: 'Your long job submission was rejected by customer.',
						type: 'long_job_notifcation',
					};
					createNotification(notificationData);
					JobApi.pauseStartLongJobTimer({action:"startTimer",JobId:job.id,userType:job.technician.user.userType})
					socket.emit("re-submit-job-by-cust", { "jobId": job.id })
					openNotificationWithIcon('success', 'Success', 'Response taken successfully.We will send you a notification when technician resubmits the job.');
					JobApi.sendEmailForJobRejection({ 'email': job.technician?.user?.email, 'firstName': job.technician?.user?.firstName, 'date': new Date(job.long_job_sent_approval_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: job.technician?.user?.timezone }) })
				}

				if(answer === 'yes'){
					await JobCycleApi.create(JobTags.CUSTOMER_ACCEPT_LONG_JOB_APPROVAL, job.id);
					// console.log("answer is yes");
					let charge = false
					setShowJoinBtn(false)
					const totalMeetingSeconds = Math.round(getTotalJobTime(job).totalSeconds)
					const updatedDataFirst  = await JobApi.updateJob(job.id, {
						
						'approval_status':answer, 'meeting_end_time':new Date(), 'technician_charged_customer':'yes', 'total_seconds': totalMeetingSeconds
					});

					if(updatedDataFirst.long_job_with_minutes != undefined && updatedDataFirst.long_job_with_minutes === 'yes'){
						const totalMeetingTime = getTotalJobTime(job).totalTime
						await JobApi.updateJob(job.id, {'total_time': totalMeetingTime});
						charge = await CustomerApi.chargeCustomer({ jobData: job });
					}else{
						if(updatedDataFirst.payment_id != undefined && updatedDataFirst.payment_id !== ''){
							charge =  await CustomerApi.retrieveCharge({charge_id:updatedDataFirst.payment_id});
							// console.log("long_job_with_minutes not true ")
						}							
					}	
					if(user &&  user.userType === "customer" && !user.customer.subscription && job && job.status === 'Completed'){				
						const createPromoData = await PromoApi.create({
							customer_id:user.customer.id,
							technician_id:job.technician.id,
							promo_code:job.technician.promo_code,
							redeemed:false,
							technician_earn:10,
						});
						// console.log("after create Promo data");

					}
					// console.log("Value of charge", charge);
					if(charge){
						// console.log("charge true");
						const updatedData = await JobApi.updateJob(job.id, {
							'status':'Completed'
						});
						let dataToSave = {}
						dataToSave['total_amount']  = updatedData.long_job_cost
						dataToSave['transaction_type'] = capitalizeFirstLetter(charge?.payment_method_details?.card?.brand)
						dataToSave['transaction_status'] = capitalizeFirstLetter(charge.status)
						const result = updatedData?.payment_id?.match("ch_")
						if(updatedData.is_long_job == true && updatedData.status == "Completed" && result[0] == "ch_"){
							dataToSave['is_stripe_called']  = true
						}
						else{
							dataToSave['is_stripe_called'] = false
						}
						console.log("going to generate billing report ")
						await CreateBillingReport(job.id,job,dataToSave);

						console.log("job Id :::::::::: ",job.id)
						console.log("updated data ::::::::: ",updatedData.long_job_with_minutes)
						console.log("data to save:::::::::::::::::::::",dataToSave)
						if(updatedData.long_job_with_minutes == undefined || updatedData.long_job_with_minutes === 'no'){
							console.log("going to generate earning report")
							await CreateEarningReport(job.id,job, updatedData.long_job_cost,dataToSave,true);		
						}else{
							console.log("going to generate billing report in else")
							await CreateEarningReport(job.id,job, updatedData.long_job_cost,dataToSave);	
						}	

						socket.emit("long-job-approved-by-cust", { "jobId": job.id })

						const notificationData = {
							user: job.technician.user.id,
							job: job.id,
							read: false,
							actionable: true,
							shownInBrowser: false,
							title: 'Greetings! Customer has approved your long job submission.',
							type: 'long_job_notifcation',
						};

						CustomerApi.meetingEndEmails({ JobId: job.id });
						createNotification(notificationData);
						try{
							let responseForReferals = await updateReferalDiscount({"customerId":job.customer.id})
							console.log("responseForReferals :::::::::::::::",responseForReferals)
						}
						catch(err){
							console.log("error in response :::")
						}
						openNotificationWithIcon('success', 'Success', 'Job has been approved and marked as completed.');						
						setTimeout(()=>{
							pushToFeebackPage()
						},1500)
									
					}else{
						openNotificationWithIcon('error', 'Error', 'Seems like there is some issue with the job.Please try again later.');	
					}	
					JobApi.sendEmailForJobApproval({ 'email': job.technician.user.email, 'firstName': job.customer.user.firstName, 'lastName': job.customer.user.lastName, 'date': new Date(job.long_job_sent_approval_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: job.technician.profile.schedule.timezone }), 'JobId': job.JobId })
				}
				
				
			}
		})		
	}

	/**
	* This function changes the first letter of string to capital.
	* @params = str (Type:String)
	* @response : returns the string with first letter capitalize
	* @author : Manibha
	*/

	function capitalizeFirstLetter(str) {
		if (str) {
			return str.replace(/^\p{CWU}/u, char => char.toLocaleUpperCase());
		}
		return '';
	}



	if (isLoading) {
		return (
			<Col md="12" className="px-4 py-5">
				<Row>
					<Loader height="100%" className={`mt-5 ${isLoading ? 'loader-outer' : 'd-none'}`} />
				</Row>

			</Col>
		);
	}


	/**
	* This function helps in column sizing.
	* @params = no params
	* @response : returns the number for the column size
	* @author : Manibha
	*/
	function firstColSize(){
		if(user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes' && (job.approval_status == undefined || job.approval_status == 'no')){
			return "6"
		}else if(user && user.userType === 'technician' && job.status === 'long-job' && job.submission == 'yes' && (job.approval_status == undefined || job.approval_status == 'no')){
			return "8"
		}else if(user && user.userType === 'customer'){
			return "6"
		}else{
			return "8"
		}
	}

	/**
	* This function helps in column sizing.
	* @params = no params
	* @response : returns the number for the column size
	* @author : Manibha
	*/
	function secondColSize(){
		if(user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes' && (job.approval_status == undefined || job.approval_status == 'no')){
			return "6"
		}else if(user && user.userType === 'technician' && job.status === 'long-job' && job.submission == 'yes' && (job.approval_status == undefined || job.approval_status == 'no')){
			return "4"
		}else if(user && user.userType === 'customer'){
			return "6"
		}
		else{
			return "4"
		}
	}


	/**
	* This function shows feedback button in case of long job if feedback not given.
	* @params = no params
	* @response : returns boolean value which decides to show feeback button or not 
	* @author : Manibha
	*/
	function checkShowFeebackButton(){
		if(job && job.is_long_job  && job.status === 'Completed' && !customerFeedback && user.userType === 'customer'){
			return true
		} 

		if(job && job.is_long_job  && job.status === 'Completed' && !technicianFeedback && user.userType === 'technician'){
			return true
		} 

		return false
	}

	/**
	* This function changes the url to feedback page.
	* @params = no params
	* @response : no response
	* @author : Manibha
	*/
	function pushToFeebackPage(){
		window.location.href = `/meeting-feedback/${job.id}`
	}


	/**
	* This function checks if the job is long job or not.
	* @params :  
	* @response : true /false
	* @author : Vinit
	*/
	const isLongJob = ()=> {
		return job.is_long_job;
	}

	/**
	* This function checks if job is minute or hour based long job.
	* @params :  
	* @response : true /false
	* @author : Vinit
	*/
	const isLongJobWithMinutes = ()=> {
		return (job.long_job_with_minutes === "yes"? true : false)
	}

	/**
	* This function will open a modal for tech to update long job hours..
	* @params :  
	* @response : 
	* @author : Vinit
	*/
	const handleHoursEdit = async () => {
		if(job.is_long_job && job.long_job_with_minutes === 'no'){
			if(user){
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Click on Edit to increase hours for Long-Job ',{'JobId':job.id});			
			}
			setShowSubmisssionModal(true)
		}
	}

	/**
	* This function will open a modal for customer to approve or reject additional long job hours..
	* @params :  
	* @response : 
	* @author : Vinit
	*/
	const handleAdditionalHoursApproval = async ()=> {
		// console.log('inside click');
		if(user){
			console.log('on clicking', user);
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Click on Approve Additional Hours button to check more hours added by technician for Long-Job ',{'JobId':job.id});			
		}
		await JobApi.updateJob(jobId, {additional_hours_submission:'no'});
		setShowSubmisssionModal(true)
	}

	

	return (
		<Col md="12" className="">
			<Col md="12">
				<Row>

					<Col xs="12" className="mt-5 mb-4">

						{ fromEmail
							? (
								<Link to="/" className="back-link">
									<FontAwesomeIcon icon={faChevronLeft} />
									<span className="pl-3">View All Jobs</span>
								</Link>
							)
							: (
								<>

									{fromVar !== 'customerhistory'
										&& (
											<a className="back-link" onClick={() => { setCurrentStep(0)}}>
												<FontAwesomeIcon icon={faChevronLeft} />
												<span className="pl-3">Recent Jobs</span>
											</a>
										)}


								</>
							)}
					</Col>

					<Col xs="12" md={firstColSize()}>
						<h3 className="app-heading">{ job ? (job.issueDescription.length > 40 ? `${job.issueDescription.substring(0, 40)}...` : job.issueDescription) : ''}</h3>
					</Col>

					<Col xs="12" md={secondColSize()} className="text-right">

						{user && user.userType === 'technician' && job && job.status === 'Waiting' && !job.tech_declined_ids.includes(user.technician.id) && !job.declinedByCustomer.includes(user.technician.id)
								&& (
									<Button className="btn app-btn app-btn-small app-btn-light-blue" title="Accept this job" onClick={() => { AcceptJob(job); }}>
										<span />
										Accept
									</Button>
								)}
                
						{ user && user.userType === 'customer' && job && job.customer !== null && user.id === job.customer.user.id && (job.status === 'Inprogress'|| job.status === "long-job") && showJoinBtn 

								&& (
									<Button className="btn app-btn app-btn-small app-btn-light-blue" title="Join the meeting" onClick={JoinJob}>
										<span />
										Join
									</Button>
								)}


						{ user && user.userType === 'technician' && job && job.technician && job.technician.user && user.id === job.technician.user.id && (job.status === 'Inprogress' || job.status === "long-job" ) && !job.tech_declined_ids.includes(job.technician.id) &&  showJoinBtn
							&& (
								<Button className="btn app-btn app-btn-large app-btn-light-blue mb-3" title="Join the meeting" onClick={JoinJob}>
									<span />
									Join
								</Button>
							)}

						{job && job.schedule_accepted === true && (job.customer.user.id === user.id ||  (job.technician && job.technician.user.id === user.id)) && (
							<>
								<ScheduleTimer job={job} DATE_OPTIONS={DATE_OPTIONS} setShowTimer={setShowTimer} />
								{showTimer
								&& (
									<>
										<div>
											<p className="d-block label-total-value">
												{' '}
												<span className="label-value">Time left -</span>
												{' '}
												<span id="timingDiv" />
											</p>
										</div>

									</>
								)}							
							</>
						)}
						{job.status === "Scheduled" && job && ((user.userType === 'customer' && job.customer !== null && user.id === job.customer.user.id) || (user.userType === 'technician' && job.technician && job.technician.user && user.id === job.technician.user.id)) &&
							<>
								<Button className="mr-2 btn app-btn mb-2" 
										onClick={() => { setIsEditScheduleJob(true); }} disabled={disableEditForJobButton}
										name={job.id} 
										title="">Edit<span></span></Button>
								<EditScheduleJobFrom 
									isEditScheduleJob={isEditScheduleJob} 
									setIsEditScheduleJob={setIsEditScheduleJob} 
									job={job} 
									user={user}
									checkFeedback={checkFeedback}
									checkIfTwoTierJobAndExpertTech={checkIfTwoTierJobAndExpertTech}
									setShowFeedbackModal={setShowFeedbackModal}
									setFeedbackJobId={setFeedbackJobId}
									fromEmail={fromEmail}
									fetchJob={fetchJob}
									setTechtype={setTechtype}
									DATE_OPTIONS={DATE_OPTIONS}
									setDisableEditForJobButton={setDisableEditForJobButton}
									socket= {socket}
								/>
								
							</>
						}
						{job.status === "Scheduled" && user.userType === 'customer' && job && job.customer !== null && user.id === job.customer.user.id &&
							<>
								<Button className="mr-2 btn app-btn mb-2"
										onClick={scheduledCancelByCustomer} 
										name={job.id} 
										title="You will no longer see this job if you click on this button.">Cancel<span></span></Button>
							</>
						}

						<JobCancelFrom 
									isCancelModal={isCancelModal} 
									setIsCancelModal={setIsCancelModal} 
									cancelJobId={cancelJobId} 
									user={user} 
									type={userType} 
									decline_job_by_technician={decline_job_by_technician}
									setcurrentStep={setCurrentStep}
								/>
						{techType === 'apply' && job.status === 'Pending' && user.userType === 'technician' && (
							<Button className="btn app-btn app-btn-large app-btn-light-blue mr-3" title="Apply for this job" onClick={() => { AcceptJob(job); }}>
								<span />
								Accept job
							</Button>
						)}
						{techType === 'noapply' && job && user && job.technician && job.technician.user.id !== user.id && (
							<Button className="btn app-btn app-btn-large app-btn-transparent mr-3">
								<span />
								Not Available
							</Button>
						)}
						{job && user && job.technician && job.technician.user.id === user.id && job.status === 'ScheduledsubOption' && (
							<Button className="btn app-btn app-btn-small  mr-3">
								<span />
								Accepted
							</Button>
						)}
						{user && user.userType === 'customer' && (job.status === 'Completed' || job.status === 'Pending') && (
							<Button className="btn app-btn app-btn-large app-btn-light-blue" title="Click on this button to make this job live." onClick={try_again_post_job}>
								<span />
								Post Again
							</Button>
						)}

						{ (user && user.userType === 'technician' && job.status === 'long-job' && job.submission != 'yes' && (job.approval_status == undefined || job.approval_status == 'no') && showSubmitLongJobButtonTech ) &&
							<Button className="btn app-btn app-btn-small app-btn-large" title="Click on this button to submit for job completion." onClick={handleLongJobSubmission} disabled={disableSubmitbutton}>
								<span />
								Job is Complete
							</Button>
						}
					
						<MeetingButton showTimer={showTimer} user={user} job={job} startCall={startCall} handleStartCall={handleStartCall} socket={socket} handleCustomerJoin={handleCustomerJoin} />
																
						{/* The following if condition works for customer to show approve/reject buttons only if technician submits the long job for approval ,
						showApproveButtons is a state variable use to hide or show the buttons when socket is recieved by this page. */}

						{ (user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes'  && showApproveButtons) &&
							<>
							<Button className="btn app-btn app-btn-small app-btn ml-2 mr-2" title="Click on this button to approve job completion." onClick={()=>job_approval_status('yes','approve')} disabled={disableapprovalbtn}>
								<span />
								Approve
							</Button>
							<Button className="btn app-btn app-btn-small app-btn-transparent" title="Click on this button to reject job completion." onClick={()=>job_approval_status('no','reject')} disabled={disableapprovalbtn}>
								<span />
								Reject
							</Button>
							</>
						}

						{
							(user && user.userType === 'customer' && job.status === 'long-job' && job.additional_hours_submission === 'yes' && showAdditionalHoursApproveButtons) &&
							<>
							<Button className="btn app-btn app-btn-small app-btn ml-2 mr-2" title="Click on this button to approve job completion." onClick={()=>handleAdditionalHoursApproval()} disabled={disableapprovalbtn}>
								<span />
								Approve Additional Hours
							</Button>
							</>
						}
						
						{ checkShowFeebackButton() && 
							<Button className="btn app-btn app-btn-large app-btn-light-blue ml-2" title="Click on this button to give feedback." onClick={ pushToFeebackPage }>
								<span />
								Give Feedback
							</Button>
						}
						{job && job.status === 'Scheduled' && !job.scheduleDetails && !job.scheduleDetails.scheduleExpired && techType === 'apply'
							&& (
								<Col className= "card-element-outer ml-2 mr-2">
									<Col xs="12" className= "card-element-inner pb-3 iframe-outer" >
										<div className="addToCalendar-geeker mb-2">                               
											<AddToCalendarDropdown 
												event={{
															'title': 'Geeker Job',
															duration,
															'description': job.issueDescription,
															'startDatetime': moment.utc(job.primarySchedule).format('YYYYMMDDTHHmmssZ'),
															'endDatetime': moment.utc( new Date(new Date(job.primarySchedule).setHours(new Date(job.primarySchedule).getHours() + 2))).format('YYYYMMDDTHHmmssZ'),
														}}
												buttonProps={{
													'className':'addToCalendarDropdownButton'
												}} 
												items={[SHARE_SITES.GOOGLE, SHARE_SITES.OUTLOOK]}
											/>
										</div>
									</Col>                            
								</Col>					
							)}
						
					</Col>

					<Col xs="12" className="">
					{ (user && user.userType === 'technician' && job.status === 'long-job' &&  disableSubmitbutton)  &&	
						<div  className="col-12 mb-4 px-4 mt-4 notification-badge  jobBadge1 ">
							<Row>

								<span>
									<p className='schedule-text float-left'> Job is submitted by you and waiting for customer approval</p>
							</span>	
							</Row>	
					 </div>}

					 { (user && user.userType === 'customer' && job.status === 'long-job' && job.submission == 'yes'  && showApproveButtons) &&
						<div  className="col-12 mb-4 px-4 mt-4 notification-badge  jobBadge1 ">
						<Row>

							<span>
								<p className='schedule-text float-left'> {`Your job will be approve automatically on ${autoApproveJob}`}</p>
						</span>	
						</Row>	
				 </div>
						}
						<span className="job-status">
							{job && job.status === 'Scheduled'
								&& (
									<>
										<b>Scheduled Primary Time : </b> 
										{new Date(job.primarySchedule).toLocaleTimeString('en-US', DATE_OPTIONS) }
										<br />
										<b>Scheduled Secondary Time : </b>
										{new Date(job.secondrySchedule).toLocaleTimeString('en-US', DATE_OPTIONS) }
									</>
								)}
							<br />
							{job
								&& (
									<>
										<b>Created at : </b>
										{new Date(job.createdAt).toLocaleTimeString('en-US', DATE_OPTIONS) }
									</>
								)}
						</span>						

					</Col>

					{job && job.status === 'Completed'
						&& (
							<Col xs="12" className="">
								<span className="job-status">
									{job.status}
									{' '}
									:
									{' '}
									{new Date(job.updatedAt).toLocaleTimeString('en-US', DATE_OPTIONS) }
								</span>
								<span className="job-rating">
									{user && user.userType === 'technician'
												&& <Rate disabled defaultValue={customerFeedback.rating} />}
									{user && user.userType === 'customer'
												&& <Rate disabled defaultValue={technicianFeedback.rating} />}
								</span>
							</Col>
						)}

					<Col xs="12" className="ant-collapse-outer mt-4">
						<Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6','7']}>
							<Panel header="Job Details" key="1" className="mb-4 py-3 px-2">
								<Row>
									<Col xs="12">
										<div className="job-detail-table">
											<Table responsive={true}>
												<thead>
													<tr>
														<th className="label-name">Software</th>
														<th className="label-name">Area</th>
														<th className="label-name">Status</th>
														<th className="label-name">
															{
																user && user.userType === 'customer'
																	? 'Technician'
																	: 'Customer'
															}
														</th>
														<th className="label-name">
															{(() => {
																if(user.userType==='technician')
																{
																return (
																<>  
																	{user && user.userType === 'technician' && 'Total Earnings'}
																</>
															
																);
																}
																else{
																	return (
																		<> 
		
																			{user && user.userType === 'customer' && 'Total Cost'}
																																		
																		</>
																	)
																}
															})()}
														</th>
														<th className="label-name">Total Time</th>
														<th className="label-name">Is Long Job</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td className="label-value">{ job && job.software ? job.software.name : 'NA'}</td>
														<td className="label-value">{ job && job.subOption ? job.subOption : 'NA'}</td>

														{user.userType === 'technician'
														 && (
															 <>
																 {job && job.schedule_accepted && job.technician &&job.technician.user.id === user.id && job.status !== 'Completed'
																	 ? <td className="label-value">Scheduled & Accepted</td>
																	 : <td className="label-value">{ job && job.status ? job.status : 'NA'}</td>}
															 </>
														 )}

														{user.userType === 'customer'
														&& (
															<>
																{job && job.schedule_accepted && job.customer.user.id === user.id && job.status !== 'Completed' ? <td className="label-value">Scheduled & Accepted</td> : <td className="label-value">{ job && job.status ? job.status : 'NA'}</td>}

															</>
														)}

														<td className="label-value">
															{
																user && user.userType === 'customer'
																	? (job && job.technician && job.technician.user ? `${job.technician.user.firstName} ${job.technician.user.lastName}` : 'NA')
																	: (job && job.customer && job.customer.user ? `${job.customer.user.firstName} ${job.customer.user.lastName}` : 'NA')
															}
														</td>
														<td className="label-value">


															{(() => {
																if (job && user.userType === "technician") {
																	return (
																		<>
																			{user?.technician?.tag !== 'employed' && user.technician.id !== match? <TechEarning job={job} /> : 'NA'}
																		</>
																	);
																} else {

																	return <JobBilling job={job} />;
																}
															})()}
														</td>
														<td className="label-value">
															{(() => {
																if(user.userType==='technician'){
																	return(
																		// <>{ job && job.total_time && user.technician.id!= match ? job.total_time : 'NA'}</>
																		<>{ job && job.is_long_job && job.long_job_with_minutes === "no" ? job.long_job_hours + " hours" : job.long_job_with_minutes === 'yes'? totalJobTimeToPass : job && job.total_time && user.technician.id!= match ? job.total_time : 'NA'}{" "}
																		
																		{isLongJob && job.status==="long-job" && job.long_job_with_minutes === "no" && 
																			<FontAwesomeIcon 
																				className="dark-green-text mr-3" 
																				icon={faPencilAlt} 
																				title="Add more hours"
																				onClick={handleHoursEdit}
																			/>}
																		
																	</>
																	)
																}
																else{
																	return(
																		// <>{ job && job.total_time ? job.total_time : 'NA'}</>
																		<>{ job && job.is_long_job && job.long_job_with_minutes === "no" ? job.long_job_hours + " hours" : job.long_job_with_minutes === 'yes'? totalJobTimeToPass : job && job.total_time ? job.total_time : 'NA'}</>
																	)
																}
															})()}
														</td>
														<td className="label-value">
															{job && job.is_long_job ? 'Yes' : "No"}
														</td>
													</tr>
												</tbody>
											</Table>
										</div>
										{(customerFeedback.is_solved !== undefined || technicianFeedback.is_solved !== undefined) && (
											<>
												<Table className="mb-2">
													<thead className="m-0">
														<tr>
															{customerFeedback.is_solved
																				&& (
																					<td className="p-0">
																						<th className="label-name">
																							Issue Solved from Client End
																						</th>
																					</td>
																				)}
														</tr>
													</thead>
													<tbody className="m-0">
														<tr>
															<td className="label-value pt-0 ">
																{customerFeedback.is_solved !== undefined
																	? (
																		<>
																			{customerFeedback.is_solved ? 'Yes' : 'No'}
																		</>
																	)
																	: <></>}
															</td>
														</tr>
													</tbody>
												</Table>
												<Table className="mb-2">
													<thead className="m-0">
														<tr>
															{technicianFeedback.is_solved !== undefined
																						&& (
																							<td className="p-0">
																								<th className="label-name">
																									Issue Solved from technician End
																								</th>
																							</td>
																						)}
														</tr>
													</thead>
													<tbody>
														<tr>
															<td className="label-value pt-0 ">
																{technicianFeedback.is_solved !== undefined
																	? (
																		<>
																			{technicianFeedback.is_solved ? 'Yes' : 'No'}
																		</>
																	)
																	: <></>}
															</td>
														</tr>
													</tbody>
												</Table>
											</>
										)}
										<Table className="my-4">
											<thead>

												<tr>
													<th className="label-name pt-0">
														{job && job.updatedIssueDescription && job.updatedIssueDescription.length > 0
															? (
																<>
																	{user && user.userType === 'technician'
																		? <>Issue added by client :</>
																		: <>Issue added by you :</>}

																</>
															)
															: <>Issue</>}
													</th>
												</tr>
											</thead>
											<tbody>

												<tr>
													<td className="label-value medium-font">{ job ? job.issueDescription : 'NA'}</td>
												</tr>
											</tbody>
										</Table>
										{job && job.updatedIssueDescription && job.updatedIssueDescription.length > 0 && (
											<>
												{
													job.updatedIssueDescription.map((i, d) => (

														<Table className="mb-4">
															<thead>
																<tr>
																	<th className="label-name">
																		Issue updated by
																		{' '}
																		{i.technicianName}
																		{' '}
																		at
																		{' '}
																		{new Date(i.updatedAt).toLocaleTimeString('en-US', DATE_OPTIONS)}
																		:
																	</th>
																</tr>
															</thead>
															<tbody>
																<tr>
																	<td className="label-value medium-font">{i.issueDescription}</td>
																</tr>
															</tbody>
														</Table>
													))
												}
											</>
										)}
										{job && job.customer && job.schedule_accepted && job.customer.user.id === user.id && (
											 <Table className="mb-4">
												 <thead>
													 <tr>
														 <th className="label-name">Meeting At </th>
													 </tr>
												 </thead>
												 <tbody>
													 <tr>
														 <TimeDecider job={job} DATE_OPTIONS={DATE_OPTIONS} />
													 </tr>
												 </tbody>
											 </Table>
										 )}
										{(job && job.technician) && job.schedule_accepted && job.technician.user.id === user.id && (
											 <Table className="mb-4">
												 <thead>
													 <tr>
														 <th className="label-name">Meeting At </th>
													 </tr>
												 </thead>
												 <tbody>
													 <tr>
														 <TimeDecider job={job} DATE_OPTIONS={DATE_OPTIONS} />
													 </tr>
												 </tbody>
											 </Table>
										 )}
										
										{
											techType === 'apply' && job.status === 'Scheduled' && !job.scheduleDetails.scheduleExpired && user.userType === 'technician'
												? (
													<div className="mb-6 col-12 d-flex justify-content-around">
														
														<div className="col-12 text-right">
															<Button className="btn app-btn app-btn-large btn-primary job-accept-btn mr-3 mb-2" onClick={() => { setIsApplyScheduleJob(true); }} disabled={disableApplyForJobButton}>
																<span />
																{disableApplyForJobButton ? <Spin /> : "Accept job"}
															</Button>
															{job.status === 'Scheduled' && !job.technician && user.technician && !job.tech_declined_ids.includes(user.technician.id)
																		&& <Button className="btn app-btn job-accept-btn mr-3 mb-2" 
																			onClick={scheduledDeclineByTech}
																			disabled={disableDeclineJobButton} 
																			name={job.id} 
																			title="You will no longer see this job if you click on this button.">{disableDeclineJobButton ? <Spin /> : "Decline"}<span></span></Button>
															}
															<ApplyScheduleJobFrom 
																isApplyScheduleJob={isApplyScheduleJob} 
																setIsApplyScheduleJob={setIsApplyScheduleJob} 
																job={job} 
																user={user}
																checkFeedback={checkFeedback}
																checkIfTwoTierJobAndExpertTech={checkIfTwoTierJobAndExpertTech}
																setShowFeedbackModal={setShowFeedbackModal}
																setFeedbackJobId={setFeedbackJobId}
																fromEmail={fromEmail}
																fetchJob={fetchJob}
																setTechtype={setTechtype}
																DATE_OPTIONS={DATE_OPTIONS}
																setDisableApplyForJobButton={setDisableApplyForJobButton}
																fetchSingleJob={fetchSingleJob}
															/>
														</div>
													</div>
												)
												: <></>
										}
										{job.status === 'Scheduled' && !job.scheduleDetails.scheduleExpired
											? (
												<div className="mb-6 col-12 d-flex justify-content-around">
													<div className="col-12 text-right">
														{job.status === 'Scheduled' && user.technician && (job.technician && job.technician.id === user.technician.id) && !job.tech_declined_ids.includes(user.technician.id)&& 
															<>
																<Button className="btn app-btn mr-3 mb-2" 
																		onClick={scheduledCancelByTech} 
																		name={job.id} 
																		title="You will no longer see this job if you click on this button.">Cancel<span></span></Button>
																
															</>
														}
													</div>
												</div>
											)
											: <></>
										}

										{rejectedCalls.length > 0
											&& <hr className="w-100" />}
										{rejectedCalls.length > 0
											&& rejectedCalls.map((j) => (
												<Table>
													<thead>
														<tr>
															<th className="label-name">
																<b>Rejected by:</b>
																{' '}
																{j.technician}
															</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td className="label-value medium-font">
																<b>Reason:</b>
																{' '}
																{j.reason}
															</td>
														</tr>
													</tbody>
												</Table>
											))}

										{techCancellation.length > 0
											&& <hr className="w-100" />}
										{techCancellation.length > 0
											&& techCancellation.map((j) => (
												<Table>
													<thead>
														<tr>
															<th className="label-name">
																<b>Canceled by:</b>
																{' '}
																{j?.technician}
															</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td className="label-value medium-font">
																<b>Reason:</b>
																{' '}
																{j?.reason}
															</td>
														</tr>
													</tbody>
												</Table>
											))}

										{job?.custCancellation?.reason && 
											<>
												<Table>
													<thead>
														<tr>
															<th className="label-name">
																<b>Canceled By:</b>
																{' '}
																{user.userType === 'customer' &&
																	'You'
																}
																{user.userType === 'technician' && job.customer &&
																	<>
																	Customer {job.customer.user.firstName+' '+job.customer.user.lastName}
																	</>
																}
															</th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td className="label-value medium-font">
																<b>Reason:</b>
																{' '}
																{job.custCancellation.reason}
															</td>
														</tr>
													</tbody>
												</Table>
											</>
										}

									</Col>

									<Col xs="12" />
								</Row>
							</Panel>

							{ !fromEmail && (
								<>
									{ job.status != 'long-job' && 
										<Panel header={(user && user.userType === 'technician' ? 'Client Comments' : 'Technician Comments')} key="4" className="mb-4 py-3 px-2">
											{user && user.userType === 'technician'
												&& (
													<>
														{ customerFeedback.issues && customerFeedback.issues.length > 0
																&& (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{customerFeedback.issues.map((ci) => (<li>{ci}</li>))}
																		</ul>
																	</span>
																)}
														{ customerFeedback.comments && customerFeedback.comments !== ''
															? (
																<span className="medium-font">
																	{ customerFeedback.comments }
																</span>
															)
															: <span className="medium-font">No comments available.</span>}
													</>
												)}
											{user && user.userType === 'customer'
												&& (
													<>
														{ technicianFeedback.issues && technicianFeedback.issues.length > 0
																&& (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{technicianFeedback.issues.map((ti) => (<li>{ti}</li>))}
																		</ul>
																	</span>
																)}
														{ technicianFeedback.comments && technicianFeedback.comments !== ''
															? (
																<span className="medium-font">
																	{ technicianFeedback.comments }
																</span>
															)
															: <span className="medium-font">No comments available.</span>}
													</>
												)}
										</Panel>
									}

									{ job.status != 'long-job' && 
										<Panel header={`${job && job.customer && job.customer.user ? (job.customer.user.id === user.id ? "Your" : "Your")  : "Your"} comments to ${user && user.userType === 'technician' ? 'client' : 'technician'}`} key="5" className="mb-4 py-3 px-2">
											{user && user.userType === 'customer'
												&& (
													<>
														{ customerFeedback.issues && customerFeedback.issues.length > 0
																&& (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{customerFeedback.issues.map((ci) => (<li>{ci}</li>))}
																		</ul>
																	</span>
																)}
														{ customerFeedback.comments && customerFeedback.comments !== ''
															? (
																<span className="medium-font">
																	{ customerFeedback.comments }
																</span>
															)
															: <span className="medium-font">No comments available.</span>}
													</>
												)}
											{user && user.userType === 'technician'
												&& (
													<>
														{ technicianFeedback.issues && technicianFeedback.issues.length > 0
																&& (
																	<span className="medium-font">
																		<ul className="pl-3 m-0 mb-2">
																			{technicianFeedback.issues.map((ti) => (<li>{ti}</li>))}
																		</ul>
																	</span>
																)}
													
													{ technicianFeedback.comments && technicianFeedback.comments !== ''
														? (
															<span className="medium-font">
																{ technicianFeedback.comments }
															</span>
														)
														: <span className="medium-font">No comments available.</span>}
												</>
											)}
									</Panel>
									}
									{ job.is_long_job &&
										<Panel header="My Conversations" key="7" className="mb-4 py-3 px-2">
											<Col md="12" className="mt-3 mb-4">
												{showLoader ?
													<div style={{"margin":"auto","width":"0px"}}>
														<Spin size="large"  />
													</div>
												:
													<div style={{"height":"500px","margin":"auto"}} ref={inboxRef}></div>
												}
											</Col>
										</Panel>
									}
									{ job?.schedule_accepted && job.status !== "Completed" && 
										<Panel header="Conversations" key="7" className="mb-4 py-3 px-2">
											<Col md="12" className="mt-3 mb-4">
												{showLoader ?
													<div style={{"margin":"auto","width":"0px"}}>
														<Spin size="large"  />
													</div>
												:
													<div style={{"height":"500px","margin":"auto"}} ref={inboxRef}></div>
												}
											</Col>
										</Panel>
									}
									
								</>

							)}

							{job && job.status === 'Completed' && (
								<Panel header="Feedback" key="6" className="mb-4 py-3 px-2 feedback-panel">
									<Row>
										<Col md="6" className="mt-3 mb-4">
											<Row>
												<Col xs="12">
													<span className="label-name medium-font">
														{user && user.userType === 'technician'
																					&& <>Client`s </>}
														{user && user.userType === 'customer'
																					&& <>Tech`s </>}
														feedback to you
													</span>
												</Col>
												<Col xs="12" className="mt-4">
													<span className="job-rating">
														{user && user.userType === 'technician'
																					&& (
																						<>
																							<Rate disabled defaultValue={customerFeedback.rating} />
																							{' '}
																							<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(customerFeedback.rating && customerFeedback.rating > 0 ? `${customerFeedback.rating}.00` : '0.00')}</span>
																						</>
																					)}
														{user && user.userType === 'customer'
																					&& (
																						<>
																							<Rate disabled defaultValue={technicianFeedback.rating} />
																							{' '}
																							<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(technicianFeedback.rating && technicianFeedback.rating > 0 ? `${technicianFeedback.rating}.00` : '0.00')}</span>
																						</>
																					)}
													</span>
												</Col>
											</Row>
										</Col>
										<Col md="6" className="mt-3 mb-4">
											<Row>
												<Col xs="12">
													<span className="label-name medium-font">
														{job && job.customer && job.customer.user ? ( job.customer.user.id === user.id ? "Your" : job.technician.user.firstName  ) : "Your" }  feedback to a
														{user && user.userType === 'technician'
																					&& <> client</>}
														{user && user.userType === 'customer'
																					&& <> tech</>}
														.
													</span>
												</Col>
												<Col xs="12" className="mt-4">
													<span className="job-rating">
														<span className="job-rating">
														{user && user.userType === 'customer'
																							&& (
																								<>
																									{/* <p className="job-comments" title={customerFeedback.comments}>{customerFeedback.comments}</p> */}
																									<Rate disabled value={customerFeedback.rating} />
																									{' '}
																									<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(customerFeedback.rating && customerFeedback.rating > 0 ? `${customerFeedback.rating}.00` : '0.00')}</span>
																								</>
																							)}
														{user && user.userType === 'technician'
																							&& (
																								<>

																									{/* <p className="job-comments" title={technicianFeedback.comments}>{technicianFeedback.comments}</p> */}
																									<Rate disabled value={technicianFeedback.rating} />
																									{' '}
																									<span className="rating-text large-font font-weight-bold pl-3 pt-1">{(technicianFeedback.rating && technicianFeedback.rating > 0 ? `${technicianFeedback.rating}.00` : '0.00')}</span>
																								</>
																							)}
													</span>
													</span>
												</Col>
												<Col xs="12" className="mt-4 pl-5">
													<Modal
														title="Change Feedback"
														onCancel={() => { setShowChangeFeedbackModal(false); }}
														visible={showChangeFeedbackModal}
														className="change-feedback-modal"
														footer={[
														<Button
																className="btn app-btn app-btn-light-blue app-btn-small"
																onClick={() => { setShowChangeFeedbackModal(false); }}
																disabled={submitFeedbackCalled}
															>
																<span />
																Cancel
															</Button>,
														<Button
																className="btn app-btn app-btn-small"
																onClick={handleChangeFeedback}
																disabled={submitFeedbackCalled}
															>
																{submitFeedbackCalled
																	? <Spin />
																	: (
																		<>
																			<span />
																			Submit
																		</>
																	)}
															</Button>,
														]}
													>
														<Row className="transfer-call-outer">
														<Loader height="100%" className={(showChangeFeedbackLoader ? 'loader-outer' : 'd-none')} />

														<Col xs={12} className="my-3 text-center">
																<h6 className="title font-weight-bold">
																	WAS
																	{' '}
																	{(user && user.userType === 'customer' ? 'YOUR' : 'CLIENT')}
																	{' '}
																	PROBLEM RESOLVED?
																</h6>
																<div className="section_sub_one mt-2">
																	<Button
																		className={`${problemSolved === 'yes' ? 'active' : ''} change-feedback-btn yes mr-3`}
																		onClick={() => { toggle_solved('yes'); }}
																	>
																		<span />
																		{' '}
																		Yes
																	</Button>
																	<Button
																		className={`${problemSolved === 'no' ? 'active' : ''} change-feedback-btn no`}
																		onClick={() => { toggle_solved('no'); }}
																	>
																		<span />
																		{' '}
																		No
																	</Button>
																</div>
															</Col>

														{showYesBlock && (
																<Col xs={12} className="my-3 text-center">
																	<Alert variant="success" className="p-0 pt-2">
																		<div className="alert-heading h5">Glad we could help!</div>
																	</Alert>
																</Col>
															)}

														{showNoBlock && user && user.userType === 'customer' && (
																<Col xs={12} className="my-3">
																	<p className="title font-weight-bold"> Sorry we couldn't solve your issue. Help us understand what went wrong! </p>
																	<div className="section_sub_three">
																		<Checkbox
																			value="Technician was not knowledgeable."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf('Technician was not knowledgeable.') !== -1}
																		>
																			Technician was not knowledgeable.
																		</Checkbox>
																		<br />
																		<Checkbox
																			value="Audio or screen share was not clear."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf('Audio or screen share was not clear.') !== -1}
																		>
																			Audio or screen share was not clear.
																		</Checkbox>
																		<br />
																		<Checkbox
																			value="I couldn't understand technician's language."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf("I couldn't understand technician's language.") !== -1}
																		>
																			I couldn't understand technician's language.
																		</Checkbox>
																		<br />
																		<Checkbox
																			value="Others."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf('Others.') !== -1}
																		>
																			Others.
																		</Checkbox>
                                    									
																		<Panel header={`${job && job.customer && job.customer.user ? (job.customer.user.id === user.id ? "Your" : "Your")  : "Your"} comments to ${user && user.userType === 'technician' ? 'client' : 'technician'}`} key="5" className="mb-4 py-3 px-2">
																			{user && user.userType === 'customer'
																				&& (
																					<>
																						{ customerFeedback.issues && customerFeedback.issues.length > 0
																								&& (
																									<span className="medium-font">
																										<ul className="pl-3 m-0 mb-2">
																											{customerFeedback.issues.map((ci) => (<li>{ci}</li>))}
																										</ul>
																									</span>
																								)}
																						{ customerFeedback.comments && customerFeedback.comments !== ''
																							? (
																								<span className="medium-font">
																									{ customerFeedback.comments }
																								</span>
																							)
																							: <span className="medium-font">No comments available.</span>}
																					</>
																				)}
																			{user && user.userType === 'technician'
																				&& (
																					<>
																						{ technicianFeedback.issues && technicianFeedback.issues.length > 0
																								&& (
																									<span className="medium-font">
																										<ul className="pl-3 m-0 mb-2">
																											{technicianFeedback.issues.map((ti) => (<li>{ti}</li>))}
																										</ul>
																									</span>
																								)}
																						{ technicianFeedback.comments && technicianFeedback.comments !== ''
																							? (
																								<span className="medium-font">
																									{ technicianFeedback.comments }
																								</span>
																							)
																							: <span className="medium-font">No comments available.</span>}
																					</>
																				)}
																		</Panel>
																	</div>
																</Col>
															)}

														{showNoBlock && user && user.userType === 'technician' && (
																<Col xs={12} className="my-3">
																	<p className="title font-weight-bold"> Sorry we couldn't solve your issue. Help us understand what went wrong! </p>
																	<div className="section_sub_three">
																		<Checkbox
																			value="Customer was not knowledgeable."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf('Customer was not knowledgeable.') !== -1}
																		>
																			Customer was not knowledgeable.
																		</Checkbox>
																		<br />
																		<Checkbox
																			value="Audio or screen share was not clear."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf('Audio or screen share was not clear.') !== -1}
																		>
																			Audio or screen share was not clear.
																			{checkboxIssues.indexOf('Audio or screen share was not clear.')}
																		</Checkbox>
																		<br />
																		<Checkbox
																			value="I couldn't understand customer's language."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf("I couldn't understand customer's language.") !== -1}
																		>
																			I couldn't understand customer's language.
																			{checkboxIssues.indexOf("I couldn't understand customer's language.")}
																		</Checkbox>
																		<br />
																		<Checkbox
																			value="Others."
																			onChange={setIssueCheckbox}
																			className="checkbox-font"
																			checked={checkboxIssues.indexOf('Others.') !== -1}
																		>
																			Others.
																		</Checkbox>

																	</div>
																</Col>
															)}

														<Col xs={12} className="my-3 text-center">
																{user && user.userType === 'technician' ? <p className="title font-weight-bold"> RATE THE CLIENT </p> : <p className="title font-weight-bold"> RATE YOUR GEEK </p>}


																<div className="section_sub_four">
																	<Rate onChange={ratingChanged} value={rating} style={{ fontSize: 30, color: '#1BD4D5' }} />
																</div>
															</Col>

														<Col xs={12} className="my-3 text-center">
																{user && user.userType === 'technician'
																	? (
																		<p className="title font-weight-bold">
																			Meeting Notes
																			{' '}
																			<span className="red-text">*</span>
																		</p>
																	)
																	: <p className="title"> COMMENTS </p>}
																<div className="section_sub_five">
																	<textarea className="w-100 p-2" spellCheck rows={4} onChange={handleChangeText} id="textarea">
																		{summary}
																	</textarea>
																</div>
														</Col>

														

													</Row>
													</Modal>
													
												</Col>
											</Row>
										</Col>

									</Row>
								</Panel>
							)}
						</Collapse>
					</Col>

					{ setShowFeedbackModal && <FeedbackCompulsionModal user={user} isModalOpen={showFeedbackModal} jobId={FeedbackJobId} />}

					<LongJobSubmission 
						showSubmisssionModal = {showSubmisssionModal}
						setShowSubmisssionModal = {setShowSubmisssionModal}
						minutesLongJobSubmission = {minutesLongJobSubmission}
						job={job}
						handleApprovalModal = {handleApprovalModal}
						totalJobTimeToPass = {totalJobTimeToPass}
						totalSecondsToPass = {totalSecondsToPass}
						user = {user}
						setshowAdditionalHoursApproveButtons = {setshowAdditionalHoursApproveButtons}
					/>
				</Row>
			</Col>
		</Col>
	);
};

export default JobDetail;

const TimeDecider = (props) => {
	let selectedDate = '';
	if (props.job.schedule_accepted_on === 'primary') {
		selectedDate = new Date(props.job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
	} else {
		selectedDate = new Date(props.job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
	}
	return <td className="label-value medium-font">{selectedDate}</td>;
};

const ScheduleTimer = (props) => {
	// var TimeDiv = `<div id="timingDiv" ></div>`
	timeInt = setInterval(() => {
		let selectedTime = '';
		if (props.job.schedule_accepted_on === 'primary') {
			selectedTime = new Date(props.job.primarySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
		} else {
			selectedTime = new Date(props.job.secondrySchedule).toLocaleTimeString('en-US', props.DATE_OPTIONS);
		}
		const countDownDate = new Date(selectedTime).getTime();
		const timeNow = new Date().getTime();
		const distance = countDownDate - timeNow;
		let days = Math.floor(distance / (1000 * 60 * 60 * 24));
		let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((distance % (1000 * 60)) / 1000);

		if (days < 9 || days === 9) {
			days = `0${days}`;
		}
		if (hours < 9 || hours === 9) {
			hours = `0${hours}`;
		}
		if (minutes < 9 || minutes === 9) {
			minutes = `0${minutes}`;
		}
		if (seconds < 9 || seconds === 9) {
			seconds = `0${seconds}`;
		}
		const timeLeft = `${days} : ${hours} : ${minutes} : ${seconds}`;
		if (distance > 0) {
			if (document.getElementById('timingDiv') != null) {
				document.getElementById('timingDiv').innerHTML = timeLeft;
			}
		}
		if (distance < 0) {
			props.setShowTimer(false);
			clearInterval(timeInt);
		}
	}, 1000);

	return <></>;
};
const MeetingButton = ({showTimer,user,job,startCall,handleStartCall,socket,handleCustomerJoin})=>{
	if (!showTimer && user && user.userType=='customer' && job && job.status === 'Accepted' && job.schedule_accepted && job.technician_started_call)
	{
		return <Button className="btn app-btn app-btn-large app-btn-light-blue" onClick={()=>{handleCustomerJoin(job)}}>
			<span />
				Join
		</Button>
	}

	if (!showTimer && user && user.userType=='customer' && job && job.status === 'Scheduled' && job.schedule_accepted !== false)
	{
		return <Button className="btn app-btn app-btn-large app-btn-light-blue" onClick={startCall}>
			<span />
			Start Call with Technician
		</Button>
	}
	if (!showTimer && user && user.userType=='technician' && job && job.status === 'Scheduled' && job.schedule_accepted !== false && job.technician.user.id === user.id){
	 	return <Button className="btn app-btn app-btn-large app-btn-light-blue mb-2" onClick={()=>{handleStartCall(job.id,socket)}}>
				<span />
				Start Call with Customer
		</Button>
	}
	return <></>

}
const Link = style(DOM.Link)`
		cursor:pointer;
`;

/* const getTechName = (props) =>{
		retrieveTechnician(props.tech_id).then(function(d){
				console.log("d>>>>>>>>>>>>>>>>>>>>",d.user.firstName)
				return <>{d.user.firstName}</>
		})
		return <>testdsd</>
} */

/* feedback code
	{user && fromVar !== 'customerhistory'
																												&& (
																													<Button
																														className="btn app-btn app-btn-large app-btn-transparent"
																														onClick={() => { setShowChangeFeedbackModal(true); }}
																													>
																														<span />
																														Change Feedback
																													</Button>
																												)}
*/
