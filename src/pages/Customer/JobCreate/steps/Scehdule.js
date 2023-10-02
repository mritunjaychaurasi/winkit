import React, { useState, useEffect,useMemo } from 'react';
import { Row, Col, Modal ,Spin } from 'antd';
import * as Antd from 'antd';
import { useHistory } from 'react-router';
import styled from 'styled-components';
// import { DatePicker } from 'antd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import {message} from 'antd';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import $ from 'jquery';
import './Schedule.css';
import { openNotificationWithIcon, GAevent, consoleLog } from 'utils';
import mixpanel from 'mixpanel-browser';
import { useNotifications } from '../../../../context/notificationContext';
import TechImages from '../../../../components/TechImages';
import { useAuth } from '../../../../context/authContext';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';
import {
	StepTitle,
	BodyContainer,
} from '../../ProfileSetup/steps/style';
import ReactTimeslotCalendar from 'react-timeslot-calendar';
import * as JobApi from '../../../../api/job.api';
import * as JobCycleApi from '../../../../api/jobCycle.api';
import { JobTags } from '../../../../constants';
import { INACTIVE_ACCOUNT_MESSAGE } from '../../../../constants';
import { klaviyoTrack } from '../../../../api/typeService.api';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import { Eventcalendar, getJson, toast } from '@mobiscroll/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faCheck, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
// import {
// 	faExclamation
// } from '@fortawesome/free-brands-svg-icons';
import Logo from 'components/common/Logo';
import ScheduleModal from './ScheduleModal'
let selectedSchedule = {}
const Schedule = ({
	handleDecline, job, setComponentToRender, jobFlowsDescriptions, setJobFlowStep, createJob, cardsInfo, totalJobs, setIsModalOpen, isTechNotFoundInSearch, hireValue,technicianId,repostJob,postAgainJobReference, showGoBackBtn, showGoBackBtnRedirection
}) => {
	consoleLog('hireValue>>>>>>>>>>Schedule'+ hireValue +' technicianId '+ technicianId);
	const [errMsg, setErrMsg] = useState('')
	const { createNotification, fetchNotifications } = useNotifications();
	const { user } = useAuth();
	const { socket } = useSocket();
	const history = useHistory();
	 const [myEvents, setEvents] = useState([])
	const [primaryTime, setPrimaryTime] = useState(false);
	const [secondryTime, setSecondaryTime] = useState(false);
	const minDate = new Date();
	const maxDate = new Date();
	const invalids = [{
        start: '12:00',
        end: '13:00',
        title: 'Lunch break',
        type: 'lunch',
        recurring: {
            repeat: 'weekly',
            weekDays: 'MO,TU,WE,TH,FR'
        }
    }];
	const [disableButton, setDisableButton] = useState(false);
	const [showModal, setShowModal] = useState(false)

	maxDate.setDate(maxDate.getDate() + 7);

	const primaryDateHandler = (selectedTime) => {
		if (selectedTime === undefined) {
			return openNotificationWithIcon('error', 'Error', 'Preffered time slot is Needed.');
		}
		setPrimaryTime(selectedTime);
	};
	useEffect(()=>{
		if(user){
			mixpanel.track('Customer - On Schedule Job Page ', { 'Email': user.email });      
		}
	},[user])
	
	const secondaryDateHandler = (selectedTime) => {
		if (selectedTime === undefined) {
		 return openNotificationWithIcon('error', 'Error', 'Secondary time slot  is Needed.');
		}
		setSecondaryTime(selectedTime);
	};

	/**
	 * Validate primary and secondry time slot is not empty
	 * @params : isVaild(Type:Boolean) : we are using use state variables in this function
	 * @returns: true/ false const invalids = [{
        start: '12:00',
        end: '13:00',
        title: 'Lunch break',
        type: 'lunch',
        recurring: {
            repeat: 'weekly',
            weekDays: 'MO,TU,WE,TH,FR'
        }
    }];
	 * @author : Ridhima Dhir
	 */
	const checkIsEmptyPrimarySecondryTime = (isValid) =>{
		if (!primaryTime && !secondryTime) {
			setErrMsg('Preffered time and Secondary time slot is required.')
			// openNotificationWithIcon('error', 'Error', 'Preffered time and Secondary time slot is required.');
			isValid = false;
		}
		if (!primaryTime && secondryTime) {
			setErrMsg('Preffered time slot is required.')
			// openNotificationWithIcon('error', 'Error', 'Preffered time slot is required.');
			isValid = false;
		}
		if (primaryTime && !secondryTime) {
			setErrMsg('Secondary time slot is required.')
			// openNotificationWithIcon('error', 'Error', 'Secondary time slot is required.');
			isValid = false;
		}
		return isValid 
	}

	/**
	 * Validate primary and secondry time
	 * @params : isVaild(Type:Boolean) : we are using use state variables in this function 
	 * @returns : true/ false 
	 * @author : Ridhima Dhir
	 */
	const validatePrimarySecondryTimeSlot = (isValid) =>{
		const now_time = moment().now;
		const now_time_obj = new Date()
		const secondryTimeInSeconds = new Date(secondryTime).setSeconds(0, 0);
		const primaryTimeInSeconds = new Date(primaryTime).setSeconds(0, 0);
		consoleLog("secondryTimeInSeconds ::: "+parseInt(secondryTimeInSeconds) +" primaryTimeInSeconds :::::: "+parseInt(primaryTimeInSeconds))
		consoleLog("moment >>>>>>>>>>>>>>>>>>>>>>>>> now >>>>>>>",now_time)
		consoleLog("primaryTime >>>>>>>>>>>>>>>>>>> ",moment(primaryTimeInSeconds))
		const hours = moment.duration(moment(primaryTime).diff(now_time)).asHours();
		var date1 = new Date(now_time_obj);
		var date2 = new Date(primaryTime);
		var hoursdiff = Math.floor(Math.abs(date1.getTime() - date2.getTime()) / 36e5); 
		//Primary and current time should have half hour difference
		if (hoursdiff < 0.5) {
			setErrMsg('Preffered time slot should be atleast half an hour from now.')
			// openNotificationWithIcon('error', 'Error', 'Preffered time slot should be atleast half an hour from now.');
			isValid = false;
		}
		//Primary and secondry time cannot be same
		if (secondryTimeInSeconds === primaryTimeInSeconds) {
			setErrMsg('Secondary time slot cannot be same as preffered time slot.')
			// openNotificationWithIcon('error', 'Error', 'Secondary time slot cannot be same as preffered time slot.');
			isValid = false;
		}
		//Secondry time should be greater than primary time
		if (secondryTime < primaryTime) {
			setErrMsg('Secondary time slot should be greater than preffered time slot.')
			// openNotificationWithIcon('error', 'Error', 'Secondary time slot should be greater than preffered time slot.');
			isValid = false;
		}
		consoleLog("validatePrimarySecondryTimeSlot :::::::"+isValid)
		return isValid 
	}

	/**
	 * Validate primary and secondry time  
	 * @params : we are using use state variables in this function as params
	 * @returns : true/ false 
	 * @author : Ridhima Dhir
	 */
	const ScheduleJobValidation = async () => {
		let isValid = true
		consoleLog('primaryTime ::: '+ primaryTime);
		//Check primary and secondry time is not empty then show message and return false
		isValid = await checkIsEmptyPrimarySecondryTime(isValid)

		//Check user status. If not active then show message and return false
		if (user.activeStatus == false) {
			openNotificationWithIcon('info', 'Info', INACTIVE_ACCOUNT_MESSAGE);
			isValid = false;
		}

		//Check if both time is selected by user.
		//Primary and current time should have half hour difference
		//Primary and secondry time cannot be same
		//Secondry time should be greater than primary time
		if(secondryTime && primaryTime){
			consoleLog('validatePrimarySecondryTimeSlot ::: ');
			isValid = await validatePrimarySecondryTimeSlot(isValid)
			if(isValid){
				setErrMsg("")
			}
		}
		return isValid
	}

	/**
	 * Closes schedule modal  	 
	 * @author : Vinit Verma
	 */
	const handleCancel = () => {
		setShowModal(false)
		// selectedSchedule={}

	}


	/**
	 * Post a schedule job
	 * @author : Vinit Verma
	 */
	const handleConfirm = async () => {

		const is_vaild = await ScheduleJobValidation()
			if(!is_vaild){
				consoleLog('Validate false primary Time ::: '+ primaryTime +' and secondry Time '+ secondryTime);
				return false
			}
		setDisableButton(true)
		//This variable will contails job detail.
		let jobStats={}

		//check customer is vaild and not a test customer 
		const customerTypeValid = (user.customer.customerType ? user.customer.customerType !== 'test' : true);

		//Open add card modal if 
		// TotalJobs is grater then 1
		// CardInfo is empty
		// Customer is a vaild 
		if (totalJobs >= 1 && cardsInfo == false && customerTypeValid) {
			consoleLog('inside :: cards if and open add card modal');
			setIsModalOpen(true);
		}

		//update only status and add primaryTime and secondryTime if job comming from keep searching screen. 
		//Job is already created but tech not found and customer decide to change job status to schedule.
		if (isTechNotFoundInSearch) {
			consoleLog('inside if isTechNotFoundInSearch:::: ' + isTechNotFoundInSearch);
			jobStats = await JobApi.updateJob(job.id, { primarySchedule: primaryTime, secondrySchedule: secondryTime, status: 'Scheduled' });
		}

		// prepare schedule job data and create / update job 
		await prepareScheduleJob(jobStats)
		
	}

	/**
	 * submit schedule job
	 * @params : we are using use state variables in this function
	 * @returns: redirect to schedule detail page. (/dashboard?&schedule=true&jobId='+jobStats.id)
	 * @author : Ridhima Dhir
	 */
	const createScheduleJob = async () => {
		try{
			//validate schedule Job
			const is_vaild = await ScheduleJobValidation()
			if(!is_vaild){
				consoleLog('Validate false primary Time ::: '+ primaryTime +' and secondry Time '+ secondryTime);
				return false
			}
			consoleLog("Users ::::::::: "+ user.id);
			setShowModal(true)
			// confirmation modal: If ok then create schedule job
			// <Modal.confirm({
			// 	title: 'Wait! Before you confirm, please make sure the times you selected are correct.',
			// 	okText: 'Yes',
			// 	cancelText: 'No',
			// 	className: 'app-confirm-modal',
			// 	async onOk() {
			// 		setDisableButton(true)
			// 		//This variable will contails job detail.
			// 		let jobStats={}

			// 		//check customer is vaild and not a test customer 
			// 		const customerTypeValid = (user.customer.customerType ? user.customer.customerType !== 'test' : true);

			// 		//Open add card modal if 
			// 		// TotalJobs is grater then 1
			// 		// CardInfo is empty
			// 		// Customer is a vaild 
			// 		if (totalJobs >= 1 && cardsInfo == false && customerTypeValid) {
			// 			consoleLog('inside :: cards if and open add card modal');
			// 			setIsModalOpen(true);
			// 		}

			// 		//update only status and add primaryTime and secondryTime if job comming from keep searching screen. 
			// 		//Job is already created but tech not found and customer decide to change job status to schedule.
			// 		if (isTechNotFoundInSearch) {
			// 			consoleLog('inside if isTechNotFoundInSearch:::: ' + isTechNotFoundInSearch);
			// 			jobStats = await JobApi.updateJob(job.id, { primarySchedule: primaryTime, secondrySchedule: secondryTime, status: 'Scheduled' });
			// 		}

			// 		// prepare schedule job data and create / update job 
			// 		await prepareScheduleJob(jobStats)
			// 	},
			// });
			

		}catch(err){
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while submit schedule job ', { primaryTime:primaryTime, secondryTime:secondryTime, errMessage: err.message });
			consoleLog('There is catch error while submit schedule job  :::: '+ err.message)
		}
	};

	const view = useMemo(() => {
        return {
            schedule: {
                type: 'week',
                startDay: 0,
                endDay: 7,
                startTime: '09:00',
                endTime: '22:00'
            }
        };
    }, [])


	/**
	 * Prepare Schedule Job States for create/ update a job
	 * @params : scheduleJobData(Type:Object): have job fields with there values 
	 * @returns : job data 
	 * @author : Ridhima Dhir
	 */
	const prepareScheduleJobStates= (scheduleJobData) =>{
		let scheduleDetails = {
            'primaryTimeAvailable':true,
            'primaryTimeExpiredAt':null,
            'secondaryTimeAvailable':true,
            'secondaryTimeExpiredAt':null,
            'scheduleExpired':false,
            'scheduleExpiredAt':null
        }
		scheduleJobData.software = job.software.id;
		scheduleJobData.subSoftware = job.subSoftware ? job.subSoftware.id : '';
		scheduleJobData.expertise = job.expertise;
		scheduleJobData.subOption = job.subOption;
		scheduleJobData.issueDescription = job.issueDescription;
		scheduleJobData.level = 'advanced';
		scheduleJobData.estimatedTime = (job.software ? job.software.estimatedTime : '0-0');
		scheduleJobData.estimatedPrice = (job.software ? job.software.estimatedPrice : '0-0');
		scheduleJobData.status = 'Scheduled';
		scheduleJobData.customer = job.customer.id ? job.customer.id : job.customer;
		scheduleJobData.guestJob = false;
		scheduleJobData.primarySchedule = primaryTime;
		scheduleJobData.secondrySchedule = secondryTime;
		console.log("scheduleExpiredAt :::",secondryTime, new Date(secondryTime.getTime() - 20 * 60000));
		// scheduleJobData.scheduleDetails = {... job.scheduleDetails, 
		// 	scheduleExpiredAt:new Date(secondryTime.getTime() - 20 * 60000)
		// };
		scheduleJobData.scheduleDetails = {... scheduleDetails,
            scheduleExpiredAt:new Date(secondryTime.getTime() - 20 * 60000)
        };
		
		//if technician then update job as post again and add tech as reference
		if(technicianId){
			scheduleJobData.post_again = true
			scheduleJobData.post_again_reference_technician = technicianId
			scheduleJobData.post_again_reference_job = postAgainJobReference
		}
		//update hire_expert if job is alery created
		if (!job.id) {
			scheduleJobData.hire_expert = hireValue;
		}
		return scheduleJobData
	}

	/**
	 * create / update schedule job, create job cycle, emit socket send-schedule-alerts and create/fetch notifications 
	 * @params : 
	 * 		useState params:
	 * 		jobStats(Type:Object): Have job object id job already created or empty in case of new job  
	 * @returns : redirect to schedule detail page
	 * @author : Ridhima Dhir
	 */
	const prepareScheduleJob = async (jobStats) =>{
		try{
			// will have job stat for create a new job or for update job
			let scheduleJobData = {};
			//add job data in the object
			scheduleJobData = await prepareScheduleJobStates(scheduleJobData)
			//Check job object is not empty, jobStates length is 0/false/undefine and not a repost. 
			//after all checks update job
			if (job && job.id && !jobStats.length && !repostJob) {
				consoleLog(" job update:::::::::::"+ job.id)
				//Update job if job is alreay created 
				jobStats = await JobApi.updateJob(job.id, scheduleJobData);
			} 

			//Check job object is 0/false/undefine or job is repost by customer.
			//(Repost case can be created after click on (Post Again button) job form pending jobs detail page)
			if (!job.id || repostJob) {
				consoleLog('new Job:::: ');
				//created new Job
				jobStats = await saveScheduleJob(scheduleJobData)
			}
			consoleLog('new Job:::: return '+ jobStats.id);
			setTimeout(async () => {
				consoleLog('new Job:::: return inside'+ jobStats.id);
				mixpanel.identify(user.email);
				mixpanel.track('Customer - Submit Button on job schedule page.', { JobId: jobStats.id });

				//call notification function
				await emitSocketCreateFetchNotification(jobStats)
				consoleLog("after send-schedule-alerts :::::::::::")
				//call add new job cycle function
				await addJobCycle(jobStats)
				setDisableButton(false)
				//redirect schedule job creating job
				window.location.href = '/dashboard?&scheduleJobId='+jobStats.id;

			}, 1000);
		}catch(err){
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while prepare schedule job', { jobStats:jobStats, errMessage: err.message });
			consoleLog('There is catch error while prepare schedule job  :::: '+ err.message)
		}
	}

	

	/**
	 * create new schedule job and add klaviyoTrack
	 * @params : scheduleJobData(Type:Object): have job fields with there values
	 * @returns : job details
	 * @author : Ridhima Dhir
	 */
	const saveScheduleJob = async (scheduleJobData) =>{
		try{
			//create job by hitting api
			const newSecheduleJob = await createJob(scheduleJobData);
    		GAevent('Conversion','scheduled_job','Conversion',scheduleJobData.customer)
			consoleLog("after save :::: ", newSecheduleJob)

			//prepare klaviyoStat object for klaviyo track api;
			const klaviyoStat = {
				email: user.email,
				event: 'Scheduled Jobs',
				properties: {
					$first_name: user.firstName,
					$last_name: user.lastName,
					$job: newSecheduleJob.id,
					$total_jobs: totalJobs,
					$first_job: false,
					$software_name: newSecheduleJob.software.name,
					$primary_schedule: scheduleJobData.primarySchedule,
					$secondry_schedule: scheduleJobData.secondrySchedule,
				},
			};
			//save record in klaviyo for tracking.
			await klaviyoTrack(klaviyoStat);
			//return newly created job details
			return newSecheduleJob
		}catch(err){
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while creating schedule job', { scheduleJobData: scheduleJobData, errMessage: err.message });
			consoleLog('There is catch error while creating schedule job  :::: '+ err.message)
		}
	}

	/**
	 * create job cycle entry for the job
	 * @params : jobStats(Type:Object): Have job details
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const addJobCycle = async (jobStats)=> {
		try{
			//job cycle tag should we "SCHEDULE_POST"
			let Tag = JobTags.SCHEDULE_POST;
			// but check job states have values and job is transferred then update it as "SCHEDULE_POST_TRANSFER"
			if(jobStats && jobStats.is_transferred && jobStats.is_transferred == true ){
				// add tag "SCHEDULE_POST_TRANSFER" in case of trasfer
				Tag = JobTags.SCHEDULE_POST_TRANSFER;
			}
			await JobCycleApi.create(Tag, jobStats.id)
		}catch(err){
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while creating job cycle job', { jobStats: jobStats, errMessage: err.message });
			consoleLog('There is catch error while creating job cycle job  :::: '+ err.message)
		}
	}

	/**
	 * emit send-schedule-alerts socket and create / fetch notification customer notifications
	 * @params : jobStats(Type:Object): Have job details
	 * @returns : null
	 * @author : Ridhima Dhir
	 */
	const emitSocketCreateFetchNotification = async (jobStats) =>{
		try{
			console.log("send-schedule-alerts :::::::::::")
			//Notification for customer
			const notificationData = {
				user: user.id,
				job: jobStats.id,
				read: false,
				actionable: false,
				title: 'We are finding a technician for you. We will inform you when we find the technician',
				type: 'Scheduled Job',
			};
			console.log("notificationData ::::::::", notificationData)
			await createNotification(notificationData);
			await fetchNotifications({ user: user.id });

			// call send-schedule-alerts socket from backend.
			// It will find available techs and send alerts by sms/email/notification
			socket.emit('send-schedule-alerts', {
				jobId: jobStats.id,
				customerTimezone: user.timezone,
				jobObj: jobStats,
				primaryTime,
				secondryTime,
				phoneNumber:user.customer.phoneNumber,
				customerName:user.firstName,
				customerEmail:user.email,
				technicianId:technicianId,
			});
		}catch(err){
			mixpanel.identify(user.email);
			mixpanel.track('There is catch error while create/fetch notification', { jobStats: jobStats, errMessage: err.message });
			consoleLog('There is catch error while create/fetch notification  :::: '+ err.message)
		}
	}

	const getSundays = () => {
		const y = new Date().getFullYear();
		const A = [];
		const D = new Date(y, 0, 1);
		const day = D.getDay();
		if (day != 0) D.setDate(D.getDate() + (7 - day));
		A[0] = new Date(D);
		while (D) {
			D.setDate(D.getDate() + 7);
			if (D.getFullYear() != y) return A;
			A.push(new Date(D));
		}
		return A;
	};

	const returnIcon = ()=>{
		return <FontAwesomeIcon icon={faCheck} />
	}
	const handleCellClick = (event,ist)=>{
		try{
			setErrMsg('')
			let now_time_obj = new Date()
			let date = new Date(event.date)
			let keysLength = Object.keys(selectedSchedule).length
			if(keysLength === 0 && date > now_time_obj){
				selectedSchedule['primary'] = date.getTime()
				setPrimaryTime(moment(date))
				event.target.classList.add("primary-border-class")
				event.target.innerHTML =`<i style="font-size:24px; color:#01D4D5"  class="fa">&#xf00c;</i>`
			}

			if(keysLength > 0 && keysLength < 2 && date.getTime() !== selectedSchedule['primary']){
				if(date.getTime() < selectedSchedule['primary']){
					setErrMsg('Secondary time should be greater than primary time')
					return 
					// openNotificationWithIcon("error","Error","Secondary time should be greater than primary time")
				}

				selectedSchedule['secondry'] = date.getTime()
				setSecondaryTime(date)
				event.target.classList.add("secondry-border-class")
				event.target.innerHTML =`<i style="font-size:24px; color:#293742"  class="fa">&#xf00c;</i>`
			}

			if(keysLength === 2  && selectedSchedule['secondry'] === date.getTime()){
				delete selectedSchedule['secondry']
				event.target.classList.remove("secondry-border-class")
				event.target.innerHTML =``
				setSecondaryTime(null) 
			}
			if(keysLength === 1  && selectedSchedule['primary'] === date.getTime()){
				delete selectedSchedule['primary']
				event.target.classList.remove("primary-border-class")
				event.target.innerHTML =``
				setPrimaryTime(null)
			}
			
		}
		catch(err){
			console.log("error in handleCellClick",err)
		}
	}

	/**
	 * Checking Geeker Availability of time for datetimepicker time values
	 * @params = ''
	 * @response : Will check if the job post time is between 9am to 9pm (EDT) and returns boolean value to disable or enable time values in datepicker.
	 * @author : Manibha
	 */

	const filterPassedTime = (time) => {
		const currentDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
		const selectedDate = new Date(time.toLocaleString('en-US', { timeZone: 'America/New_York' }));
		const workingHours = selectedDate.getHours();
		const currentWorkingHours = currentDate.getHours();

		if (workingHours > 21 || workingHours < 9) {
				return false        
		}else{
				if(currentWorkingHours === workingHours){
					return false
				}else{
					return true
				}
		}
	};

	const getSaturdays = () => {
		const y = new Date().getFullYear();
		const A = [];
		const D = new Date(y, 0, 1);
		const day = D.getDay();
		if (day != 6) D.setDate(D.getDate() + (7 - day));
		A[0] = new Date(D);
		while (D) {
			D.setDate(D.getDate() + 7);
			if (D.getFullYear() != y) return A;
			A.push(new Date(D));
		}
		return A;
	};
	const allSunday = getSundays();
	const allSaturday = getSaturdays();
	const excludeDates = allSunday.concat(allSaturday);

	function setback() {
		if(showGoBackBtnRedirection){
			setJobFlowStep(jobFlowsDescriptions['jobAlivePage'])
		}else{
			setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
		}
	}

	return (
		<Container span={24} className="select-job-container find-tecnhician-container font-nova">

			<Modal className="app-confirm-modal modal-container" closable={false}  
			footer={null} 
			visible={showModal} 
			// selectedSchedule={selectedSchedule}
			>
			{/* ]} visible={showModal} onOk={handleOk} > */}
			{ScheduleModal(selectedSchedule, handleCancel, handleConfirm)}
			</Modal>

			<Logo user={user}/>
			<StepTitle className="margin-bot-0 job-heading-text">We'll schedule this for a time that suits you.</StepTitle>
			<div className="select-box-labels text-centre mb-4 ">
                <span>Select the best time for a Geeker to help you with your issue.</span>
            </div>
			<BodyContainer span={24} className="select-job-body pt-0 pb-0 bg-tr ">
				<Row className="d-flex flex-column mb-4">

					<Col span={12} className="mx-auto mb-2 " >
						<span className="hg-text"> Please choose two time preferences </span>
					</Col>
					<Col span={18} className="mx-auto">
						<span className=""> Please select two time slots in the event your technician is unavailable at the requested time. </span>
					</Col>
				</Row>
				<Row span={24}>
					<Eventcalendar
		            theme="ios" 
		            themeVariant="light"
		            onCellClick = {(event,ist)=>{handleCellClick(event,ist)}}
		            view = {view}
		            onPageChange = {(event, inst) =>{selectedSchedule = {}}}
		            allDayText = {''}
					timeFormat="hh:mm A"
					// controls={['time']}
		       />
				</Row>
				<Row span={24}>
					<Col className="col-7 d-flex justify-content-start align-items-center">
						{errMsg !== "" && 
						<div>
							<FontAwesomeIcon icon={faExclamationCircle} style={{color:'red'}} />
							{/* <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" /> */}
							<span className='errText'>{errMsg}</span>
						</div>}
					</Col>
					<Col className="float-right col-5 px-0">
						<div className='d-flex'>
							{showGoBackBtn && <Button type="back" onClick={setback} title="Go back to the job details page" className="btn font-nova float-left go-back-btn ml-3 min-height">
								Go Back
							</Button>}
							<Button onClick={createScheduleJob} className="btn app-btn app-btn float-right new-design-btn" disabled={ Object.keys(selectedSchedule).length < 2 ? true :false || disableButton}>
								{disableButton ? <Spin className="spinner" /> : "Schedule Now"}
								{ Object.keys(selectedSchedule).length < 2 ? "" :<span />}

							</Button>
						</div>
					</Col>

				</Row>


				
				{/*<Box className="select-job-body find-technician-screen">
					
					<Summary className="light-bg radius-4">
						<SummaryItem>
							<ItemLabel className="card-label dark text-left">Job Summary</ItemLabel>
							<Description className="text-left">
								{job.issueDescription}
							</Description>
						</SummaryItem>
						<SummaryItem style={{ textAlign: 'right' }}>
							<ItemLabel className="card-label dark">duration</ItemLabel>
							<Item>
								{job && job.software.estimatedTime ? `${job.software.estimatedTime} mins` : '25 mins'}
							</Item>
						</SummaryItem>
					</Summary>
					<Description className="text-left">Please select your preferred time slot for a technician to reach you.</Description>
					<div className="text-left">
						<DatePicker
							selected={primaryTime}
							onChange={primaryDateHandler}
							minDate={minDate}
							maxDate={maxDate}
							showTimeSelect
							filterTime={filterPassedTime}
							dateFormat="MM/dd/yyyy, h:mm aa"
							timeIntervals={15}
							excludeDates={excludeDates}
							placeholderText="Select date"
						/>
					</div>primaryTime
					<Description className="text-left">Select a secondary time slot</Description>
					<div className="text-left">


						<DatePicker
							selected={secondryTime}
							onChange={secondaryDateHandler}
							minDate={minDate}
							maxDate={maxDate}
							showTimeSelect
							dateFormat="MM/dd/yyyy, h:mm aa"
							timeIntervals={15}
							filterTime={filterPassedTime}
							excludeDates={excludeDates}
							placeholderText="Select date"
						/>
					</div>
					<Antd.Divider />
					<Row style={{ justifyContent: 'flex-end' }}>
						<Button type="back" onClick={() => setComponentToRender('jobDetailsView')} className="btn app-btn app-btn app-btn-light-blue float-right mr-15">
							Cancel
							<span />
						</Button>
						<Button onClick={createScheduleJob} className="btn app-btn app-btn job-accept-btn float-right">
							{disableButton ? <Spin /> : "Submit"}
							<span />
						</Button>
					</Row>
				</Box>*/}
			</BodyContainer>
		</Container>
	);
};

const Container = styled(Col)`
	display: flex !important;
	width: 100%;
	border-radius: 10px;
	margin-top: 20px;
	flex-direction: column;
`;
const Summary = styled.div`
	display: flex;
	background-color: #f4f4f4;
	padding: 30px;
`;

const SummaryItem = styled.div`
	width: 50%;
`;

const Description = styled.div`
	font-size: 18px;
	font-weight: 600;
	margin: 15px 0;
	color:#000;
`;

const ItemLabel = styled.div`
	color: #8c8c8c;
	font-weight: 700;
	opacity: 0.4;
	text-transform: uppercase;
	margin-bottom: 20px;
`;

const Item = styled.div`
	font-weight: 700;
	text-align: right;
	font-size: 24px;
	color:#000;
`;
const FileButtonContainer = styled.button`
	display: flex;
	justify-content: flex-end;
	margin-top: 0px;
	height: 60px;
	line-height: 60px;
	padding: 0 15px;
	align-items: center;
	font-size: 22px;
	border: 0;
	float: right;
`;
const SystemIcon = styled.img`
	width: 35px;
	padding: 5px;
`;
export default Schedule;
