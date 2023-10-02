import React, { useEffect, useState } from 'react';
import { div ,Modal,Pagination} from 'antd';
import { Row, Col, Tabs, Tab, Button,Dropdown} from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router';
import DashboardTable from '../../../components/Dashboard/Table';
import { useUser } from '../../../context/useContext';
import { useAuth } from '../../../context/authContext';
import { useJob } from '../../../context/jobContext';
import { useSocket } from '../../../context/socketContext';
import * as JobApi from '../../../api/job.api';
import Loader from '../../../components/Loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { openNotificationWithIcon,handleStartCall,get_or_set_cookie,checkJobValidations,queryDecider } from '../../../utils';
import ReactGA from 'react-ga';
import mixpanel from 'mixpanel-browser';
import { GOOGLE_ANALYTICS_PROPERTY_ID } from '../../../constants';
import LogRocket from 'logrocket';
import * as WebSocket from '../../../api/webSocket.api';
import AddToCalendarHOC,{SHARE_SITES} from 'react-add-to-calendar-hoc';
import moment from 'moment';
import * as JobService from "../../../api/job.api";
import FeedbackCompulsionModal from '../../Technician/feedbackCompulsion';
import $ from 'jquery';
import {isMobile} from 'react-device-detect';
import {useServices} from '../../../context/ServiceContext';
import JobCancelFrom from '../components/jobCancelFrom';
import { useTools } from '../../../context/toolContext';
import * as FullStory from '@fullstory/browser';

let mainSoftwareWithoutState = [];
let subSoftwareWithoutState = [];
let activeTabGlobal = ''
const duration = 2



const Dashboard = ({setcurrentStep,setjobId,setType,setOpenNotification,ShowBadge,hideBadge, setActiveMenu, toggle}) => {
	// console.log("running Dashboard ::: ")
	const { checkIfTwoTierJobAndExpertTech } = useServices();
	const { socket } = useSocket();
	const [showLoader, setShowLoader] = useState(true);
	// const {fetchNotifications,allNotifications} = useNotifications()
	const {refetch} = useAuth();
	const { user } = useUser();
	const { fetchJobByParams, allJobs,fetchJob,totalJobs,setTotalJobs,setAllJobs} = useJob();
	// const [isOpen, setIsOpen] = useState(true);
	const [activeStatus, setActiveStatus] = useState(false);
	// const [tierJobStatus, setTierJobStatus] = useState(false);
	// const [role, setRole] = useState('');
	const [socketJobUpdated,setSocketJobUpdated] = useState(false)
	const history = useHistory();
	// const [verificationSent,setVerificationSent] = useState(false)
	// const [columns, setColumns] = useState([]);
	// const [hideEmailmsg,sethideEmailmsg] = useState(false)
	const [tableData, setTableData] = useState();
	// const [notifyCount,setNotifyCount] = useState(0)
	// const [showNotificationBadge,setShowNotificationBadge] = useState(false)
	// const detailRef = useRef()
	// const [forScheduled,setForScheduled] = useState(false)
	// const [fetchNow,setFetchNow] = useState(false)
	// const [forJoin,setforJoin] = useState(false)
	const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' ,hour: '2-digit', minute:'2-digit'};
	const [isLoading, setIsLoading] = useState(true);
	// const [activeData, setActiveData] = useState();
	const [completedData, setCompletedData] = useState();
	const [pendingData, setPendingData] = useState();
	const [proposalsData, setProposalsData] = useState();
	const [techCompletedData, setTechCompletedData] = useState();
	const [techDeclinedData, setTechDeclinedData] = useState();
	const [techMainSoftwares, setTechMainSoftwares] = useState([]);
	const [techSubSoftwares, setTechSubSoftwares] = useState([]);
	const [activeTabKey,setActiveTabKey] = useState('');
	const [currentPage,setCurrentPage] = useState(1);
	const [storedData,setStoredData] = useState({})
	const search = useLocation().search;
	// const [tabNameInUrl,setTtabNameInUrl] = useState(new URLSearchParams(search).get('t'));
	const tabNameInUrl = new URLSearchParams(search).get('t');
	const [tabInUrlLoaded, setTabInUrlLoaded] = useState(false);
	const AddToCalendarDropdown = AddToCalendarHOC(Button, Dropdown);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [FeedbackJobId, setFeedbackJobId] = useState('');
	const [isCancelModal, setIsCancelModal] = useState(false);
	const [cancelJobId, setCancelJobId] = useState(false);
	const [userType, setUserType] = useState(false);
	const {jobFlowStep,setJobFlowStep,jobFlowsDescriptions} = useTools()

	const HandleHide = () => {
		toggle();
	};

	if(user && GOOGLE_ANALYTICS_PROPERTY_ID != null){
		// const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' ,hour: '2-digit', minute:'2-digit',timeZone: user.timezone }
		ReactGA.initialize(GOOGLE_ANALYTICS_PROPERTY_ID);
		ReactGA.ga('set', 'userId',user.id)
		ReactGA.ga('set', 'dimension1',user.id)
		ReactGA.ga('send', 'pageview','/dashboard')

		LogRocket.identify(user.id, {
		  name: user.firstName,
		  email: user.email,
		});

		FullStory.identify(user.id, {
			displayName: user.firstName,
			email: user.email
		});
	}

	const calevent = {
	 title: 'Sample Event',
	  description: 'This is the sample event provided as an example only',
	  location: 'Portland, OR',
	  startTime: '2016-09-16T20:15:00-04:00',
	  endTime: '2016-09-16T21:45:00-04:00'
  }

	useEffect(()=>{
		// console.log("tabNameInUrl now is :",tabNameInUrl)
		if(tabNameInUrl && !tabInUrlLoaded && user){
			// console.log("Now load the data of ",tabNameInUrl)
			setTabInUrlLoaded(true);
			if(tabNameInUrl === 'cmp'){
				let main_software = [];
				let sub_software = [];
				if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed" )) {
					const { expertise } = user.technician;
					fillSoftwares(expertise,main_software,sub_software)                    
				}
				setTimeout(function(){
					if(user && user.userType === "technician"){
						setTechMainSoftwares(main_software)
						setTechSubSoftwares(sub_software)
						mainSoftwareWithoutState = main_software;
						subSoftwareWithoutState = sub_software;
						// console.log("main_software before changetab is ::",main_software)
						changeTab('Completed Jobs Tech')
					}else{
						changeTab('Completed Jobs')
					}
				},500)
			}
			if(tabNameInUrl === 'sub'){
				setTimeout(function(){
					if(user && user.userType === "technician"){
						
					}else{
						setcurrentStep(10);
						//setActiveMenu('subscriptions');
						//HandleHide();
					}
				},500)
			}
		}
	},[tabNameInUrl])

	/*useEffect(()=>{
		$("body").on("click",function(e){
			e.preventDefault();
			console.log("e",e,$(".addToCalendar-geeker .dropdown").length, $(".addToCalendar-geeker .btn-primary").hasClass('open-class'))
			if($(".addToCalendar-geeker .dropdown") && $(".addToCalendar-geeker .dropdown").length > 0 && $(".addToCalendar-geeker .btn-primary").hasClass('open-class')){
				$(".addToCalendar-geeker .dropdown").hide();
				// $(".addToCalendar-geeker .btn-primary.open-class").trigger('click').removeClass('open-class').addClass('close-class')
			}
		})       
	},[])*/

	useEffect(()=>{
		if(ShowBadge){
			 // setNotifyCount(0)
			// setShowNotificationBadge(false)
			// console.log(notifyCount)
		}
	   
	},[ShowBadge])

	useEffect(()=>{
		// console.log("the hide badge -------")
		if(hideBadge){
			// setNotifyCount(0)
			// setShowNotificationBadge(false)
		}
	},[hideBadge])

	/**
	 * @params : job Type(Object)
	 * @response: join rooms for the accepted jobs  technicians and customers
	 * @author :Sahil
	 * */


	const joinRoomsForAcceptedJobsCustomerAndTechnician = (job)=>{
		try{
			if (job.status === 'Accepted' || job.status === 'Inprogress' )
			{
				socket.emit("join",job.id)
			}
		}
		catch(err){
			console.log("error in joinRoomsForAcceptedJobsCustomerAndTechnician >>>",err)
		}
	}

	const fillSoftwares = (expertise,main_software,sub_software) =>{
		for (let i = 0; i <= expertise.length - 1; i++) {
			if (expertise[i].software_id) {
				if (!expertise[i].parent || expertise[i].parent === '0') {
					if (!main_software.includes(expertise[i].software_id)) {
						main_software.push(expertise[i].software_id);
					}
				} else {
					if (!main_software.includes(expertise[i].parent)) {
						main_software.push(expertise[i].parent);
					}
					if (!sub_software.includes(expertise[i].software_id)) {
						sub_software.push(expertise[i].software_id);
					}
				}
			}

		}
	}

	const findSameTechnician = async(e)=>{
		let jobId = e.currentTarget.name
		let retrievedJob = await JobService.retrieveJob(jobId)
		Modal.confirm({
			title: 'Are you sure you want to post this job again?',
			okText: "Yes",
			cancelText: "No",
			className:'app-confirm-modal',
			onOk() {
				mixpanel.identify(user.email)
				history.push(`/customer/profile-setup?jobId=${jobId}&repost=true&technicianId=${retrievedJob?.technician?.user?.id}`);
			}
		})
		// }
	}

	const handlePagination = async(page,pageSize) =>{
		setIsLoading(true)
		setCurrentPage(page)
		let demoStoredData = {...storedData}
		let pagination={ page: page,pageSize:pageSize }
		let query  = queryDecider(activeTabKey,user,false,techMainSoftwares,techSubSoftwares,mainSoftwareWithoutState,subSoftwareWithoutState)
		// let mainCondition =!Object.keys(demoStoredData).includes(activeTabKey)
		const res = await call_fetch_jobs(query,pagination)
		let temp = {}
		temp[[JSON.stringify(page)]] = res
		temp['totalJobs'] = totalJobs
		demoStoredData[activeTabKey] =temp
		// console.log("demoStoredData ::::::: ",demoStoredData)
		setStoredData(demoStoredData)
		setIsLoading(false)
	}

	const changeTab = async(k,fromSocket=false)=>{
		setIsLoading(true)
		let query = queryDecider(k,user,false,techMainSoftwares,techSubSoftwares,mainSoftwareWithoutState,subSoftwareWithoutState)
		let technicianAcceptanceArr = ["incomplete_profile","completed"]
		setActiveTabKey(k)
		let demoStoredData = {...storedData}
		let condition1 = k !== activeTabKey && !Object.keys(demoStoredData).includes(k) 
		if(user.userType === "technician" && !technicianAcceptanceArr.includes(user.technician.registrationStatus)){
			setIsLoading(false)
			return ;
		}
		if(condition1 || fromSocket){
			const res = await call_fetch_jobs(query)
			let theKey = JSON.stringify(1)
			let temp = {}
			setCurrentPage(1)
			temp[theKey] = res
			demoStoredData[k] = temp
			setStoredData(demoStoredData)
		}
		else{
			if(demoStoredData !== undefined && demoStoredData !== null && Object.keys(demoStoredData).length != 0 && Object.keys(demoStoredData[k]).length != 0){
				let data = storedData[k][Object.keys(demoStoredData[k])[0]]["data"]
				setTotalJobs(storedData[k][Object.keys(demoStoredData[k])[0]]['totalCount'])
				setAllJobs({"data":data})
				setCurrentPage(parseInt(Object.keys(demoStoredData[k])[0]))
			}						
		}
		 setIsLoading(false)
	   
	 }
	const location = useLocation();
	/*const toggle = () => {
		setIsOpen(!isOpen);
	};*/


	/*const HandleDetailsDashboard = (e)=>{
		 history.push(`/technician/new-job/${e.currentTarget.id}`, { userIds: [user.id],appendedJob:e.currentTarget.id });
	}*/

	/*const sendVerificationMail = ()=>{
		verificationEmailHandler({"email":user.email})
		// setVerificationSent(true)

		// setTimeout(()=>{sethideEmailmsg(true)},3000)
	}*/
	const push_to_job_detail = async(e) => {
		const jobid = e.currentTarget.name;
		await fetchJob(jobid)
		await setjobId(jobid)
		let jobResponse = await JobService.retrieveJob(jobid)
		setType("details")
		if (jobResponse.schedule_accepted== false && user && user.userType == 'technician' && jobResponse.tech_declined_ids.includes(user.technician.id) == false){
			setType("apply")
		}
		if(user.userType === 'technician'){
			mixpanel.identify(user.email);
			mixpanel.track('Technician  - Click on Job details from dashboard page ',{'JobId':jobid});
		}else{
			mixpanel.identify(user.email);
			mixpanel.track('Customer -  Click on Job details from dashboard page',{'JobId':jobid});
		}
		setcurrentStep(6)
	};

	const push_to_job_detail_with_apply_button = (e) => {
		const jobid = e.currentTarget.name;
		fetchJob(jobid)
		setjobId(jobid)
		setType("apply")
		setcurrentStep(6)
		if(user){
			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType}- Apply for this job from dashboard` ,{'JobId':jobid});	
		}
	};

	const CancelTheJob = (e) => {
		const job = JSON.parse(e.currentTarget.name);
		console.log(" job ::::: ", job.id)
		setUserType("Customer")
		setCancelJobId(job.id)
		setIsCancelModal(true)
		// setTimeout(function(){
		// 	window.location.reload()
		// },1000)
	}



	useEffect(() => {
		try {
			if(user && user.userType === "technician"){
				// console.log("filters sockets ::: ")
				filterJobsByTech()
			}
		} catch (err) {
			return
		}
	}, [socketJobUpdated,user])


	/**
	 * Function will check to show the scheduled job to technician or not if the job is post again reference to same technician.
	 * @params : user_id Type(String),JobData Type(Object)
	 * @response : return boolean value
	 * @author : Manibha
	 **/
	const checkIfPostAgainWithSameTech = (user_id,JobData)=>{
		let checkVal = false
		if(JobData.status === 'Scheduled' && JobData.post_again_reference_technician != undefined && JobData.post_again_reference_technician === user_id){
			checkVal = true
		}else if(JobData.status === 'Scheduled' && JobData.post_again_reference_technician == undefined){
			checkVal = true
		}
		return checkVal
	}


	const handleAccepted = async (e) => {

		let job = JSON.parse(e.currentTarget.name)
		let jobId = job.id
		const res = await JobApi.retrieveJob(jobId);


		Modal.confirm({
			title: 'Are you sure you want to accept this job?',
			okText: "Yes",
			cancelText: "No",
			className:'app-confirm-modal',
			async onOk () {
				let resultVal = await checkIfTwoTierJobAndExpertTech(user.technician,job)
				const check_feedback = await JobApi.checkLastJobFeedback({'technician':user.technician.id});

				if(resultVal == false){
					openNotificationWithIcon('error', 'Error', 'This job is only for experts.Please contact admin to make you one.');
					window.location.reload();					
				}
				else if(check_feedback.job_id != undefined){
					// console.log('check_feedback>>>>>>>',check_feedback)
					setShowFeedbackModal(true)
					setFeedbackJobId(check_feedback.job_id)
				}else{
					let validation = checkJobValidations(user,jobId,location)
					if (validation) {
						try 
						{
							await JobApi.sendJobAcceptEmail(jobId);
						} catch (err) {
							console.log("this is error in dashboard.js:: ", err)                        
						}

					}
				}

			},
		});

	}
	/**
	 * @params : event Type(Object)
	 * @response : starts a call for technician
	 * @author : Sahil
	 * */
	const handleTechnicianCall = (e)=>{
		let jobId = e.currentTarget.name
		handleStartCall(jobId,socket)
	}

	const push_to_post_job = (e) => {
		if(user && user.userType === 'customer' && user.customer){
		   let data = e.currentTarget.name
			Modal.confirm({
				title: 'Are you sure you want to post this job again?',
				okText: "Yes",
				cancelText: "No",
				className:'app-confirm-modal',
				onOk() {
					const jobid = data;
					mixpanel.identify(user.email);
					mixpanel.track('Customer - Post again from dashboard',{'JobId':jobid});
					setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
				    history.push(`/customer/start-profile-setup?jobId=${jobid}&repost=true`)
				},
			})
		}
		
	};
	
	const try_again_post_job = (e) => {
		if(user && user.userType === 'customer' && user.customer){
			const jobid = e.currentTarget.name;
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Try again from dashboard',{'JobId':jobid});
			setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
		    history.push(`/customer/start-profile-setup?jobId=${jobid}&repost=true`)
		}
		
	};


	const handleDecline = (e) => {
		const jobid = e.currentTarget.name;
		let msg = "Are you sure you want to decline this job?";
		if (user.userType === 'customer') {
			msg = "Are you sure you want to delete this job?";
		}
		Modal.confirm({
			title: msg,
			okText: "Yes",
			cancelText: "No",
			className:'app-confirm-modal',
			onOk() {
				if (user.userType === 'customer') {
					mixpanel.identify(user.email);
					mixpanel.track('Customer - Job deleted from dashboard',{'JobId':jobid});
					decline_the_job(jobid)
				} else {

					mixpanel.identify(user.email);
					mixpanel.track('Technician - Job declined from dashboard',{'JobId':jobid});
					decline_job_by_technician(jobid)
				}
			},
		})
	}

	const handleScheduledDecline = async (e) => {
		const jobid = e.currentTarget.name;
		let msg = "Are you sure you want to decline this job?";
		Modal.confirm({
			title: msg,
			okText: "Yes",
			cancelText: "No",
			className:'app-confirm-modal',
			onOk() {
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Job declined from dashboard',{'JobId':jobid});
				decline_job_by_technician(jobid,false)
			},
		})
	}

	const handleScheduledCancel = (e) => {
		//const jobid = e.currentTarget.name;
		const job = e.currentTarget.name;
		setUserType("Technician")
		setCancelJobId(job)
		setIsCancelModal(true)
	}



	const decline_the_job = async (jobid) => {
		await JobApi.removeJob(jobid)
		window.location.reload();
	}

	/**
	* This function will is common function for decline the job by tech
	* @response : jobid(Type: String): Job id which is declined by tech
	*		techAlert(Type:Boolean): True for other case and in schedule job decline it will only decline the without notification
	* @author : unknown
	* @note: this function updated by Ridhima Dhir by adding techAlert flag
	*/

	const decline_job_by_technician = async (jobid, alert=true, reason=null) => {  
		// find job details 
		let selectedJob = await JobApi.retrieveJob(jobid)
		let tech_id = user.technician.id
		let notifiedTechs = selectedJob.notifiedTechs;
		console.log("notifiedTechs ::: before",notifiedTechs)
		// get notifiedTech object and reverse the object bcz notifiedTech have multiple same value 
		// bcz after decline find tech function will work and push tech values agagin.
		// in secondryTime true: notification again goes to all tech but exclude declined techs.
		notifiedTechs.reverse().forEach(function (techs, index) {
			if(techs['techId'] == tech_id){
				notifiedTechs[index]['jobStatus']="tech-decline"
				notifiedTechs[index]['notifyEndAt']= new Date();
			}
			tech_id=false;
		});
		console.log("notifiedTechs ::: after",notifiedTechs)

		let dataToUpdate = {
			$unset: { schedule_accepted_by_technician: 1 ,technician: 1,schedule_accepted_on: 1 },
			schedule_accepted:false,
			notifiedTechs:notifiedTechs.reverse(),
			$push: { tech_declined_ids: user.technician.id }
		}
		await JobApi.updateJob(jobid,dataToUpdate)
		
		if(alert){
			socket.emit("technician:schedule-job-declined",{
				"jobId":selectedJob.id,
				"technician_user":user,
				"reason":reason
			})
			console.log(">>>>>>>>>>>>>>>>>>>>>>sending schedule job >>>>>>>>>>>>>>>>", selectedJob)
			await socket.emit("send-schedule-alerts",{
					jobId: jobid,
					accepted: false,
					customerTimezone: selectedJob.customer.user.timezone,
					jobObj: selectedJob,
					primaryTime:selectedJob.primarySchedule,
					secondryTime:selectedJob.secondrySchedule,
					phoneNumber:selectedJob.customer.user.phoneNumber,
					customerEmail:selectedJob.customer.user.email,
					customerName:selectedJob.customer.user.firstName,
					technicianId:false,
					decliedTechnician:user.id
			})
			JobApi.sendSmsForScheduledDeclinedJob({'jobId':jobid,'technicianName':user.firstName})
		}
		
		setTimeout(()=>{
			window.location.reload()
		},3000)
	}

	const pushToMeeting = async(e)=>{
		const job= JSON.parse(e.currentTarget.name);
		if(job.status == 'long-job' && user && user.userType){
			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType} - Join long-job from dashboard`,{'JobId':job.id});
			window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/${user.userType}/${job.id}`
		}
		if(job.status === "Accepted"){
				mixpanel.identify(user.email);
				mixpanel.track(`${user.userType} -Start Call from dashboard`,{'JobId':job.id});
			try {
				  const webdata  = await WebSocket.create({
							user: user.id,
							job : job.id,
							socketType:'accept-job',
							userType:user.userType,
							hitFromCustomerSide:true,
					});

			
				  job['web_socket_id'] = webdata['websocket_details']['id']
				   await WebSocket.customer_start_call(job)
				}
			catch(err) {
			  // console.log('pushToMeeting error in dashboard page one>>>',err)
			   await WebSocket.customer_start_call(job)
			}

		}

		if (user.userType === "customer") {
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Join Call from dashboard',{'JobId':job.id});
			let filter_dict = {'status':'Inprogress','customer':user.customer.id}
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result)=>{    
				// console.log('result.data>>>>>>>>>>>>',result)
				if(job.id  == result.jobs.data[0].id){
					try {
						const webdata  = await WebSocket.create({
								user: user.id,
								job : job.id,
								socketType:'accept-job',
								userType:user.userType,
								hitFromCustomerSide:true,
						});

				
						job['web_socket_id'] = webdata['websocket_details']['id']
					   await WebSocket.customer_start_call(job)
					}
					catch(err) {
						// console.log('pushToMeeting error in dashboard page two>>>',err)
						 await WebSocket.customer_start_call(job)
					}
					socket.emit("invite-technician", { "job": job.id, "tech": job.technician })
					// console.log('change here 4444444444444444444444')
					get_or_set_cookie(user)
					window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${job.id}`
				}else{
					openNotificationWithIcon('error', 'Error', 'Looks like you are already in a meeting.Please end the meeting to start another one.');
				}
			});            
			
		}
		else {
			let filter_dict = {'status':'Inprogress','technician':user.technician.id}
			const findInprogressLatestJob = JobService.findJobByParams(filter_dict)
			findInprogressLatestJob.then(async (result)=>{    

				if(job.id  == result.jobs.data[0].id){
					mixpanel.identify(user.email);
					mixpanel.track('Technician - Join Call from dashboard',{'JobId':job.id});
					get_or_set_cookie(user)
					window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${job.id}`
				}else{
					openNotificationWithIcon('error', 'Error', 'Looks like you are busy in another meeting. Please end the other meeting to join this one.')
				}

			});
			// let technicianData = await TechnicianService.retrieveTechnician(user.technician.id)
			// console.log('technicianData>>>>>>>>',technicianData)
			// if(technicianData.status == 'Available'){
			//     mixpanel.identify(user.email);
			//     mixpanel.track('Technician - Join Call from dashboard',{'JobId':job.id});
			//     history.push({pathname: `/technician/job/${job.id}`,jobId:job.id});
			// }else{
			//     openNotificationWithIcon('error', 'Error', 'Looks like you are busy in another meeting. Please end the other meeting to join this one.')
			// }
		   
		}

		
	}

	const SetPostAgainButton = ({job,data})=>{
		let stat_arr = ['Completed','Draft']
		if (stat_arr.includes(job.status)){
			if(stat_arr.includes(job.status)){
				return <>
						<TableButton index={data.index} onClick={data.postAgain} jobId = {data.jobId} text="Post Again" />
						<TableButton index={data.index} onClick={data.sameTech} jobId = {data.jobId} text="Post again with same technician" />
					</>
			}
			else{
				return <TableButton index={data.index} onClick={data.tryAgain} jobId = {data.jobId} text="Post Again" />
			}
		}
		else{
			return <></>
		}
	}


	const setData = async(JobData, data, doneData, pendingData, declineData,techCompletedData,techDeclinedData,techProposalsData, jobId = false, technicianId = false, loader = false) => {
		// console.log('user.technician.id',user.technician.id)
		// console.log('JobData',JobData)
		if (JobData.length > 0) {
			// console.log(">>>>running after ",user)
			for (var k in JobData) {
				let temp = {};

				temp.key = k.jobId;
				if (JobData[k].software) {
					temp.software = JobData[k].software.name;
				} else {
					temp.software = 'None';
				}

				if (JobData[k].subSoftware) {
					temp.SubSoftware = JobData[k].subSoftware.name;
				} else {
					temp.SubSoftware = 'Others';
				}

				temp.date = JobData[k].createdAt;

				 if(JobData[k].technician != undefined && JobData[k].technician.user != undefined && JobData[k].technician.user.firstName != undefined){
						
					temp.technician = JobData[k].technician.user.firstName
				}
				else{
					temp.technician = "None"
				}

				if(JobData[k].customer  &&  JobData[k].customer.user){
						
					temp.customer = JobData[k].customer.user.firstName
				}
				else{
					temp.customer = "None"
				}
				if (user && user.userType === 'customer') {
					console.log("runinig >>>>")
					console.log("JobData[k] .accepted >>>",JobData[k])
					joinRoomsForAcceptedJobsCustomerAndTechnician(JobData[k])
					let jobId = JobData[k].id
					let index = k
					let tryAgain = try_again_post_job
					let postAgain = push_to_post_job
					let sameTech = findSameTechnician
					let dataForComp = {
								index : index,
								postAgain:postAgain,
								tryAgain:tryAgain,
								jobId:jobId,
								sameTech:sameTech
					}
					temp.action = (

						<Col key={JobData.id}>
							<SetPostAgainButton job={JobData[k]} data={dataForComp} />
							<Button className="mb-2 btn app-btn" onClick={push_to_job_detail} name={`${JobData[k].id}`} title="Click to see job details.">Details<span></span></Button>
							{(JobData[k].status === 'Pending' || JobData[k].status === 'Accepted' || JobData[k].status === 'Waiting' || JobData[k].status === 'Draft')
								&& <Button className="mb-2 btn app-btn" onClick={handleDecline} name={`${JobData[k].id}`} title="Job will be marked as declined and will be pushed to completed jobs.">Delete<span></span></Button>}

							{JobData[k].status === "Scheduled" && 
								<>    
								<div className="addToCalendar-geeker mb-2">                               
								 <AddToCalendarDropdown
									event={{
												'title': 'Geeker Job',
												duration,
												'description': JobData[k].issueDescription,
												'startDatetime': moment.utc(JobData[k].primarySchedule).format('YYYYMMDDTHHmmssZ'),
												'endDatetime': moment.utc( new Date(new Date(JobData[k].primarySchedule).setHours(new Date(JobData[k].primarySchedule).getHours() + 2))).format('YYYYMMDDTHHmmssZ'),
											}}
									buttonProps={{
										'className':'thisssssssssss'
									}} 
									items={[SHARE_SITES.GOOGLE, SHARE_SITES.OUTLOOK]}
								  />
								  </div>

								  	
									<Button className="mb-2 btn app-btn" onClick={CancelTheJob} data-tech={`${technicianId}`} name={`${JSON.stringify(JobData[k])}`}>Cancel<span></span></Button>  
								</> 
							}

							{/*{JobData[k].technician && JobData[k].status === "Scheduled" && JobData[k].id === jobId && !isMobile
								&& <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={`${technicianId}`} name={`${JSON.stringify(JobData[k])}`}>Join<span></span></Button>}*/}
							<MeetingButton job = {JobData[k]} pushToMeeting={pushToMeeting} user={user} isMobile={isMobile} technicianId={technicianId} />


						</Col>
					);

					if (JobData[k].status === 'Scheduled' || JobData[k].status === 'Accepted' || JobData[k].status === 'Waiting' 
						|| (JobData[k].status === 'Inprogress' && JobData[k].technician && user.technician && JobData[k].technician.id === user.technician.id)
						|| (JobData[k].status === 'Inprogress' && JobData[k].customer && user.customer) || JobData[k].status === 'ScheduledExpired' || JobData[k].status === 'long-job')
					{
						console.log('JobData[k].status>>>>>>>>',JobData[k].status)
						temp.stats = JobData[k].status;

						if (JobData[k].status === 'ScheduledExpired'  && user.id === JobData[k].customer.user.id) {
							temp.stats = 'Scheduled & Expired'
						}
						if (JobData[k].status === 'Scheduled' && (JobData[k].technician && JobData[k].technician !== '') && user.id === JobData[k].customer.user.id) {
							temp.stats = 'Scheduled & Accepted'
						}
						if (JobData[k].status === 'Waiting' && (JobData[k].technician && JobData[k].technician !== '') && user.id === JobData[k].customer.user.id) {
							temp.stats = JobData[k].status
						}
						if (JobData[k].status === 'Scheduled' || JobData[k].status === 'Waiting' || JobData[k].status === 'Accepted' || JobData[k].status === 'Inprogress' || JobData[k].status === 'ScheduledExpired' || JobData[k].status === 'long-job') {
							data.push(temp);
						}
					} 


				} else if (user && user.userType === 'technician' && user.technician) {
					
					joinRoomsForAcceptedJobsCustomerAndTechnician(JobData[k])
					// console.log("the temp ::::::::: ,",temp)
					temp.action = (
						<Row key={JobData[k].id}>
							<Col xs="12">
								<Button className="mb-2 btn app-btn" onClick={push_to_job_detail} name={`${JobData[k].id}`} title="Click to see job details.">Details<span></span></Button>
								{JobData[k].status === 'Scheduled' && (JobData[k].technician === undefined || !JobData[k].technician) && !JobData[k].tech_declined_ids.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn" onClick={push_to_job_detail_with_apply_button} name={`${JobData[k].id}`} title="Click to see job details and apply for this job.">Apply<span></span></Button>}
								{JobData[k].status === 'Scheduled' && (JobData[k].technician && JobData[k].technician.id === user.technician.id) && !JobData[k].tech_declined_ids.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn" 
										onClick={handleScheduledCancel} 
										name={JobData[k].id} 
										title="You will no longer see this job if you click on this button.">Cancel<span></span></Button>}
								{JobData[k].status === 'Scheduled' && !JobData[k].technician  && !JobData[k].tech_declined_ids.includes(user.technician.id)
									&& <Button className="mb-2 btn app-btn" 
										onClick={handleScheduledDecline} 
										name={JobData[k].id} 
										title="You will no longer see this job if you click on this button.">Decline<span></span></Button>}
								{JobData[k].technician && JobData[k].status === "Scheduled" && JobData[k].id === jobId && JobData[k].technician.user.id === technicianId && !isMobile
								&& <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={`${technicianId}`} name={`${JSON.stringify(JobData[k])}`}>Join<span></span></Button>}
								{(JobData[k].status === 'Inprogress' && JobData[k].technician && JobData[k].technician.id === user.technician.id) && !isMobile
									&& <Button className="mb-2 btn app-btn" onClick={pushToMeeting} name={`${JSON.stringify(JobData[k])}`} >Join<span></span></Button>}

								{(JobData[k].status === 'long-job' && JobData[k].technician && JobData[k].technician.id === user.technician.id) && !isMobile
									&& <Button className="mb-2 btn app-btn" onClick={pushToMeeting} name={`${JSON.stringify(JobData[k])}`} >Join<span></span></Button>}


								{(JobData[k].status === 'Waiting' && !JobData[k].tech_declined_ids.includes(user.technician.id)) && !JobData[k].declinedByCustomer.includes(user.technician.id) && !isMobile
									&& <Button className="mb-2 btn app-btn" onClick={handleAccepted} name={`${JSON.stringify(JobData[k])}`} title="Accept the current job">Accept<span></span></Button>}


								{JobData[k].status === 'Scheduled' && JobData[k].technician && JobData[k].technician.id === user.technician.id && 
									<>    
									<div className="addToCalendar-geeker mb-2">                               
									 <AddToCalendarDropdown
										event={{
													'title': 'Geeker Job',
													duration,
													'description': JobData[k].issueDescription,
													'startDatetime': moment.utc(JobData[k].primarySchedule).format('YYYYMMDDTHHmmssZ'),
													'endDatetime': moment.utc( new Date(new Date(JobData[k].primarySchedule).setHours(new Date(JobData[k].primarySchedule).getHours() + 2))).format('YYYYMMDDTHHmmssZ'),
												}} 
												buttonProps={{
										'className':'thisssssssssss'
									}}
										items={[SHARE_SITES.GOOGLE, SHARE_SITES.OUTLOOK]}
									  />
									  </div> 
									</> 
								}

								{JobData[k].status === 'Accepted' && JobData[k].technician && JobData[k].technician.id === user.technician.id && 
								<Button className="mb-2 btn app-btn" onClick={handleTechnicianCall} name={JobData[k].id} title="Accept the current job">Start call with customer<span></span></Button>
								}
							</Col>
							
						</Row>
					);

					if((techMainSoftwares.includes(JobData[k].software.id) || techSubSoftwares.includes(JobData[k].software.id)) && (JobData[k].status === 'Pending' || JobData[k].status === 'Scheduled' || JobData[k].status === 'Waiting') &&  JobData[k].tech_declined_ids && !JobData[k].tech_declined_ids.includes(user.technician.id) && JobData[k].declinedByCustomer && !JobData[k].declinedByCustomer.includes(user.technician.id)){

						if(JobData[k].status == 'Waiting' || JobData[k].status == 'Scheduled'){
							console.log('JobData[k].status>>>>>>>>>>',JobData[k].issueDescription)
							let resultVal = await checkIfTwoTierJobAndExpertTech(user.technician,JobData[k])
							let checkVal = checkIfPostAgainWithSameTech(user.id,JobData[k])
							
							if(resultVal && checkVal){
								temp.stats = JobData[k].status
								techProposalsData.push(temp)
							}
						}else{
							temp.stats = JobData[k].status
							techProposalsData.push(temp)
						}
						
					}

					console.log('main>>>>>>>>>>',JobData[k].status)

					if((JobData[k].status === 'Accepted' || JobData[k].status === 'Inprogress' || JobData[k].status === 'long-job') && JobData[k].technician && user.technician && JobData[k].technician.id === user.technician.id ){

						console.log('JobData[k].status>>>>>>>>>>',JobData[k].status)

						temp.stats = JobData[k].status
						techProposalsData.push(temp)
						
					}

					 if (JobData[k].status === 'Scheduled' && JobData[k].technician && JobData[k].technician.id === user.technician.id) {
						temp.stats = 'Scheduled & Accepted'
					} 

					if (JobData[k].tech_declined_ids.includes(user.technician.id)) {
						temp.stats = 'Declined by You';
						techDeclinedData.push(temp);
					}


					if (JobData[k].declinedByCustomer.includes(user.technician.id)) {
						temp.stats = 'Declined by Customer'
						techDeclinedData.push(temp)
					}
				}

				temp.issuedesc = JobData[k].issueDescription;

				if(JobData[k].status === 'Scheduled'){
					temp.date = JobData[k].primarySchedule;
				}

				if (JobData[k].status === 'Completed' || JobData[k].status === 'Declined' || JobData[k].status === 'Expired') {
					if (user.userType === 'customer') {
						temp.stats = JobData[k].status;
						doneData.push(temp);
					}else {
						if (user.userType === 'technician' && JobData[k].technician && JobData[k].technician.id === user.technician.id) {
							temp.stats = JobData[k].status;
							techCompletedData.push(temp);
						}                     
					}
				}

				else if (JobData[k].status === 'Pending' || JobData[k].status === 'Draft') {                   
					if (user.userType === 'customer') {
						temp.stats = JobData[k].status;
						pendingData.push(temp);                       
					}
				}

			}
		}

		setCompletedData(doneData);
		setTableData(data);
		setPendingData(pendingData);
		console.log('techProposalsData>>>>>>>>>>>',techProposalsData)
		setProposalsData(techProposalsData)
		setTechCompletedData(techCompletedData)
		setTechDeclinedData(techDeclinedData)
		setShowLoader(false);
	   
	}

	useEffect(()=>{
		activeTabGlobal = activeTabKey
	},[activeTabKey])

	useEffect(() => {
		let JobData = []
		socket.on("scheduled-call-alert", function (receiver) {
			JobData = receiver.allJobs
			try {
				console.log("Inside socket FetchJob ::::1")
				
				filterJobsByTech()
			  
			} catch (err) {
				console.log("this is the error",err)
			}
		})
		socket.on('update-dashboard-status',()=>{
			if(user.userType === "technician"){
				filterJobsByTech()
				}
		})
		socket.on("join-scheduled-call", function (receiver) {
			JobData = receiver.allJobs

			try {
				console.log("Inside socket FetchJob ::::2")
				filterJobsByTech()
			  
			   
			} catch (err) {
				console.log("join-scheduled-call error :",err)
			}
		})

		socket.on("set-join-on-dashboard", function (receiver) {
			JobData = receiver.allJobs
			if (receiver.tech) {
				console.log("inside receiver.tech")
				if (user === undefined) {
					refetch()
				}
				try {
					filterJobsByTech()                    
				} catch (err) {
					refetch()
				}
			}
		})
		socket.on("technician:assigned",(data)=>{
			console.log("data >>>>>>",data)
			try{
				if (user && user.technician && data.technician == user.technician.id){
					console.log("activeTabKey >>>>>",activeTabGlobal)
					let query = queryDecider(activeTabGlobal,user,false,techMainSoftwares,techSubSoftwares,mainSoftwareWithoutState,subSoftwareWithoutState)
					call_fetch_jobs(query) 
				}
			}
			catch(err){
				console.log("error in technician:assigned socket >>>",err)
			}
			
		})
		socket.on("decline-technician", (receiver) => {
			if (user && user.technician && receiver.res != undefined && user.technician.id === receiver.res.id) {
				JobData = receiver.allJobs
				let query = queryDecider(activeTabKey,user,false,techMainSoftwares,techSubSoftwares,mainSoftwareWithoutState,subSoftwareWithoutState)
				call_fetch_jobs(query)               
			}
		})
		socket.on("call:started-customer",()=>{
			if (user){
				let query = queryDecider(activeTabKey,user,false,techMainSoftwares,techSubSoftwares,mainSoftwareWithoutState,subSoftwareWithoutState)
				call_fetch_jobs(query) 
			}
			
		})
	}, [socket])

	useEffect(() => {
		const data = [];
		const doneData = [];
		let JobData = []
		const pendingData = []
		const declineData = []
		const techCompletedData = []
		const techDeclinedData = []
		const techProposalsData = []
		if(user.customer){
			if (allJobs) {
				JobData = allJobs.data
			}
		}

		if(user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed" )){
			if (allJobs) {
				JobData = allJobs.data
			}
		}else if(user.technician){
			 setIsLoading(false)
		}
		if (JobData && JobData.length > 0) {
			try {
				setData(JobData, data, doneData, pendingData, declineData,techCompletedData,techDeclinedData,techProposalsData, true)
			} catch (err) {
				console.log("useEffect dashboard.js ", err)
			}
		}
		// setforJoin(false)
	}, [allJobs, history,socket,user]);

	/*const handleCheck = key => {
		if (key === 'activeStatus') {
			const transData = {
				userId: user.id,
				activeStatus: !activeStatus,
			};

			updateUserInfo(transData).then((userRes) => {
				setActiveStatus(userRes.activeStatus);
				notification.success({
					message: 'Success',
				});
			}).catch(() => { });
		} else {
			setTierJobStatus(!tierJobStatus);
		}
	};*/

	const filterJobsByTech = () => {
		let main_software = [];
		let sub_software = [];
		if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed" )) {
			const { expertise } = user.technician;
			fillSoftwares(expertise,main_software,sub_software)
			mainSoftwareWithoutState = main_software;
			setTechMainSoftwares(main_software)
			setTechSubSoftwares(sub_software)
			let newSoftArray =  main_software.concat(sub_software)
			const query = {
					   software: { "$in": newSoftArray },$or:[{ status: {$in:["Waiting"]},
					   tech_declined_ids : {$nin:[user.technician.id]} },
					   {$and:[{status:"Accepted"},{technician:user.technician.id}]},
					   {"$or":[{"$and":[{"status":["Scheduled"]},{"schedule_accepted_by_technician":user.id}]},{
							"$and":[{"status":['Scheduled']},{"schedule_accepted":false}]
									}
						]},
						 {"$or":[{"$and":[{"status":"Inprogress"},{"technician":user.technician.id}]},
						 ]},
						 {"$or":[{"$and":[{"status":"long-job"},{"technician":user.technician.id}]},
						 ]},

					   ] }
			console.log("filterJobsByTech query :::: ",query)
			call_fetch_jobs(query)
		}      
		else{
			setTotalJobs(0)
		}
	}

	useEffect(() => {
		if (user) {
			if (user.userType === 'customer') {
				if (user.customer) {
					setActiveTabKey("Active Jobs")
					// mixpanel code//
					mixpanel.identify(user.email);
					mixpanel.track('Customer - On dashboard page');
					mixpanel.people.set({
						$first_name: user.firstName,
						$last_name: user.lastName,
					});
					// setIsLoading(false)
					// mixpanel code//
					call_fetch_jobs({ customer: `${user.customer.id}`,'$or'  :[{ status: {$in:["Scheduled","Inprogress","Waiting","Accepted","ScheduledExpired","long-job"]} }] })
					
					
				}else{
					// when new customer registers,we get only user information in this file and no customer data, it is the final stage where code stops in this file , so here we will refetch user so that we can get customer data within it(manibha)
					refetch()
				}
			} else {
				let main_software = [];
				let sub_software = [];
				setActiveTabKey("Proposals")
				if (user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === "completed" )) {
					 // mixpanel code//
					setActiveTabKey("Proposals")
					mixpanel.identify(user.email);
					mixpanel.track('Technician - On dashboard page');
					mixpanel.people.set({
						$first_name: user.firstName,
						$last_name: user.lastName,
					});
					// mixpanel code//
					
					const { expertise } = user.technician;
					fillSoftwares(expertise,main_software,sub_software)
					setTechMainSoftwares(main_software);
					setTechSubSoftwares(sub_software);
					let newSoftArray =  main_software.concat(sub_software)
					// console.log('main_software>>>>>>>>',main_software)
					const query = queryDecider("Proposals",user,newSoftArray,techMainSoftwares,techSubSoftwares,mainSoftwareWithoutState,subSoftwareWithoutState)
					// const query = { software: { "$in": newSoftArray },$or:[{ status: {$in:["Waiting"]},
					//    tech_declined_ids : {$nin:[user.technician.id]} },
					//    {$and:[{status:"Accepted"},{technician:user.technician.id}]},
					//    {"$or":[{"$and":[{"status":["Scheduled"]},{"schedule_accepted_by_technician":user.id}]},{
					// 		"$and":[{"status":['Scheduled']},{"schedule_accepted":false}]
					// 	 }

					// 	 ]},
					// 	 {"$or":[{"$and":[{"status":"Inprogress"},{"technician":user.technician.id}]}
					// 	 ]},

					// 	 {"$or":[{"$and":[{"status":"long-job"},{"technician":user.technician.id}]},
					// 	 ]},

					//    ] }
  
					console.log('useeffect query::',query)                   
					call_fetch_jobs(query)
				}    
				else{
					setTotalJobs(0)
					}       
			}
			
			// setRole(user.userType);
			setActiveStatus(user.activeStatus);
		}
	}, [user]);

	const call_fetch_jobs = async (filter,pagination={ page: 1,pageSize:10 }) => {
		const res = await fetchJobByParams(filter,pagination)
		setTimeout(function(){
			setIsLoading(false)
		},1500)

		console.log("call_fetch_jobs response :::::: ",res)
		if(res){
			return res.jobs
		}
		else{
			return []
		}
	}

	if (!user) {
		history.push('/login');
	}
	return (
				

			<Col md="12" className="py-4 mt-1">
				<Loader height="100%" className={(isLoading ? "loader-outer" : "d-none")}  />
				<Col xs="12" className="pb-3">
					<Row>
						<JobCancelFrom 
							isCancelModal={isCancelModal} 
							setIsCancelModal={setIsCancelModal} 
							cancelJobId={cancelJobId} 
							user={user} 
							type={userType} 
							decline_job_by_technician={decline_job_by_technician}
							setcurrentStep={setcurrentStep}
						/>

						<Col md="12" className="py-4 mt-1">                            
							<Col xs="12" className="p-0 dashboard-tables-outer">
							 {user && user.userType === 'customer' &&
								<Tabs defaultActiveKey="Active Jobs" id="cust-dashboard" className="mb-3 tabs-outer" activeKey={activeTabKey} onSelect = {(k)=>{changeTab(k)}}>
									<Tab eventKey="Active Jobs" title="Active Jobs" className="col-md-12 p-0">
										<DashboardTable data={tableData} isLoading={showLoader}  user_data={user} date_options={DATE_OPTIONS} />
										
									</Tab>
									<Tab eventKey="Completed Jobs" title="Completed & Declined Jobs" className="col-md-12 p-0">
										<DashboardTable data={completedData} isLoading={showLoader}  user_data={user} date_options={DATE_OPTIONS}/>
									   
									</Tab>

									<Tab eventKey="Pending Jobs" title="Pending Jobs" className="col-md-12 p-0">
										<DashboardTable data={pendingData} isLoading={showLoader}  user_data={user} date_options={DATE_OPTIONS}/>

									</Tab>

								</Tabs>
							}

							{user && user.userType === 'technician' &&
								<Tabs defaultActiveKey="Proposals" id="tech-dashboard" className="mb-3 tabs-outer" activeKey={activeTabKey} onSelect = {(k)=>{changeTab(k)}}>
									<Tab eventKey="Proposals" title="Available Jobs" className="col-md-12 p-0">
										<DashboardTable data={proposalsData} isLoading={showLoader}  user_data={user} date_options={DATE_OPTIONS}/>
									</Tab>
									<Tab eventKey="Completed Jobs Tech" title="Completed Jobs" className="col-md-12 p-0">
										<DashboardTable data={techCompletedData} isLoading={showLoader}  user_data={user} date_options={DATE_OPTIONS}/>
									</Tab>

									<Tab eventKey="Declined Jobs Tech" title="Declined Jobs" className="col-md-12 p-0">
										<DashboardTable data={techDeclinedData} isLoading={showLoader}  user_data={user} date_options={DATE_OPTIONS}/>
									</Tab>

								</Tabs>


							}
							{ totalJobs !== 0 && <Pagination style={{"float":"right","margin-right":"40px"}} current={currentPage} onChange={handlePagination} total={totalJobs} />}    
							</Col>
							{ setShowFeedbackModal && <FeedbackCompulsionModal user={user} isModalOpen={showFeedbackModal} jobId={FeedbackJobId} />}
						</Col>
					</Row>
				</Col>
				
			</Col>
					
	)
};



export default Dashboard;

const TableButton = ({index,onClick,jobId,text})=>{
	return (<>
		<Button className="mb-2 btn app-btn" id={index} onClick={onClick} name={jobId} title="Click on this button to create a new similar job.">{text}<span></span></Button>
	</>)
}


/**
 * @params : job Type(Object) , pushToMeeting Type(Function), user Type(Object), isMobile Type(Boolean) , technicianId Type(String)
 * @response : Creates a component that returns start call buttons for Customer according to conditions
 * @author : Sahil
 * **/
const MeetingButton = ({job,pushToMeeting,user,isMobile,technicianId})=>{		
	if(job.technician && (job.status === "Inprogress" || job.status === "long-job" || job.technician_started_call) && job.customer.id === user.customer.id && !isMobile){
		return <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={`${technicianId}`} name={`${JSON.stringify(job)}`}>Join<span></span></Button>
	}
	if(job.technician && job.status === "Accepted" && job.customer.id === user.customer.id && !isMobile){
		return <Button className="mb-2 btn app-btn" onClick={pushToMeeting} data-tech={job.technician.id} name={`${JSON.stringify(job)}`}>Start Call<span></span></Button>
	}
		
	return <></>


}