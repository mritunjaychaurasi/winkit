import React, {
	useEffect, useState, useRef,
} from 'react';
import {
	Layout, Checkbox, Rate, Input, Col, Row, Modal, Radio,
} from 'antd';

import style from 'styled-components';
import { Button, Alert } from 'react-bootstrap';
import Styled from 'styled-components';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { openNotificationWithIcon,handleRefModal,GArevenueEvent } from 'utils';
import mixpanel from 'mixpanel-browser';
import { useReactToPrint } from 'react-to-print';
// import DashboardHeader from '../../components/Dashboard/Header';
import * as DOM from 'react-router-dom';
import { useUser } from '../../context/useContext';
import { useJob } from '../../context/jobContext';
import { useAuth } from '../../context/authContext';
import { useFeedback } from '../../context/feedbackContext';
// import * as SettingsApi from '../../api/settings.api';
import Loader from '../../components/Loader';
import * as CustomerApi from '../../api/customers.api';
import editIcon from '../../assets/images/edit.png';
import Invoice from '../../components/Result/invoice';
import * as JobApi from '../../api/job.api';
import * as customerSourceApi from '../../api/customerSource.api';
import * as ReferalApi  from '../../api/referalDiscount.api';
import * as EarnApi from '../../api/earningDetails.api';
import { klaviyoTrack } from '../../api/typeService.api';
import ReferPeople from './ReferPeople/referPeople';
import * as BillApi from '../../api/billingDetails.api';
import * as PromoApi from '../../api/promo.api';
import * as JobCycleApi from '../../api/jobCycle.api';
import {JobTags, noNeedOfAdminReview,MERCHANT_ID} from '../../constants/index.js'
import getTotalJobTime from '../../components/common/TotalTimeFunction'
import { useSocket } from '../../context/socketContext';
// const { Content } = Layout;
let new_values = [];

const MeetingFeedback = () => {
	const { socket } = useSocket();
	const { TextArea } = Input;
	const { user, refetch } = useUser();
	const { getCustomerSubscription } = useAuth();
	const [IsSolved, setIsSolved] = useState(true);
	const [showYesBlock, setshowYesBlock] = useState(true);
	const [showPartiallyBlock, setshowPartiallyBlock] = useState(false);
	const [showNoBlock, setshowNoBlock] = useState(false);
	// const [activeStatus, setActiveStatus] = useState(false);
	const [issueDescription, setIssueCheckboxOne] = useState([]);
	const [totalCost, settotalCost] = useState(0);
	const [paymentCost, setPaymentCost] = useState(0);
	const [freeSessionAmount, setFreeSessionAmount] = useState(0);
	const [freeSessionMinutes, setFreeSessionMinutes] = useState(6);
	const [meetingPaused, setMeetingPaused] = useState(false);
	const [pausedMinutes, setPausedMinutes] = useState(0);
	const [pausedSeconds, setPausedSeconds] = useState(0);
	const [showHomeButton,setShowHomeButton] = useState(false);
	// const [role, setRole] = useState('');
	const [rating, setRating] = useState();
	const { jobId } = useParams();
	const {
		job, fetchJob, getTotalJobs, getTotalPaidJobs,
	} = useJob();
	const history = useHistory();
	const { createFeedback,checkForFeedback } = useFeedback();
	const [summary, setSummary] = useState('');
	const [isloading, setisloading] = useState(false);
	const [showPageLoader, setShowPageLoader] = useState(true);
	const [showWhereToModal, setShowWhereToModal] = useState(false);
	const [meetingTotalTime, setMeetingTotalTime] = useState('');
	// const location = useLocation();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [chargeData, setChargeData] = useState('');
	const invoiceRef = useRef();
	const [customerFirstJob, setCustomerFirstJob] = useState(false);
	const [isJobModalVisible, setIsJobModalVisible] = useState(false);
	const [jobDesciption, setJobDesciption] = useState(false);
	const [customerFeedWhereToCome, setCustomerFeedWhereToCome] = useState(false);
	const [otherComeFeedBack, setOtherComeFeedBack] = useState('');
	const [feedBackGivenToCustomer, setFeedBackGivenToCustomer] = useState(false);
	const [showWhereToFieldError, setShowWhereToFieldError] = useState(false);
	const [whereHeComeFrom, setWhereHeComeFrom] = useState(false);
	const [showRequired, setShowRequired] = useState(false);
	const [subscriptionDetails, setSubscriptionDetails] = useState({});
	const [minutesFreeForClient, setMinutesFreeForClient] = useState(6);
	const [stripeErrorMessage, setStripeErrorMessage] = useState('');
	const [hasSubscription, sethasSubscription] = useState(false);
	const [discountedCost, setDiscountedCost] = useState(false);
	const [DeductionSubscriptionTime, setDeductionSubscriptionTime] = useState(false);
	const [showPaymentDeductModal, setShowPaymentDeductModal] = useState(false);
	const [techPaymentAnswer, setTechPaymentAnswer] = useState('yes');
	const [disableSubmitButton, setDisableSubmitButton] = useState(false);
	const [referalDiscount,setReferalDiscount] = useState(false)
	const [showReferal, setShowRferal] = useState(true);
	const [copySuccess, setCopySuccess] = useState('');
	const textAreaRef = useRef(null);
	const [systemRating,setSystemRating] = useState();
	const [paidJobs, setPaidJobs] =useState();
	const feedBackGivenBy = user.userType
	const [isDontChargeWithoutAdminReview, setIsDontChargeWithoutAdminReview] =useState(false);
	const showJobModal = () => {
		setIsJobModalVisible(true);
	};

	const handleJobOk = () => {
		if (job) {
			if (jobDesciption.trim() === '') {
				openNotificationWithIcon('error', 'Error', 'Description cannot be empty.');
				setJobDesciption(job.issueDescription);
				setIsJobModalVisible(false);
			} else {
				JobApi.updateJob(job.id, { issueDescription: jobDesciption });
				setIsJobModalVisible(false);
				openNotificationWithIcon('success', 'Success', 'Job description has been updated.');
				fetchJob(jobId);
			}
		} else {
			openNotificationWithIcon('error', 'Error', 'Job not found.');
			setIsJobModalVisible(false);
		}
	};

	const handleJobCancel = () => {
		setIsJobModalVisible(false);
	};
	/**
	 * this function will handle the star rating for system
	 * @params : systemRate(Type:Number)
	 * @response  :{void}
	 * @author : sahil
	 * */
	const handleSystemRating = (systemRate)=>{
		setSystemRating(systemRate)
	}

	useEffect(()=>{
        (async()=>{
			if(user &&  user.userType === "customer" && !user.customer.subscription && job && job.status === 'Completed' && job.technician && job.technician.promo_id){
				let data = await PromoApi.create({
					customer_id:user.customer.id,
					technician_id:job.technician.id,
					promo_code:job.technician.promo_code,
					redeemed:false,
					technician_earn:10,
					promo_id: job.technician.promo_id
				})
			}
        })();
    },[user, job,paidJobs])


	/* const get_time_string = (time) => {
		let time_string = ''; 
		if (time && time !== '') {
			if (time.hours !== 0) {
				time_string = `${time.hours} hrs `;
			}
			if (time.minutes !== 0) {
				time_string = `${time_string + time.minutes} min `;
			}
			if (time.seconds !== 0) {
				time_string = `${time_string + time.seconds} sec `;
			}
			return time_string;
		}
	}; */

	//
	// console.log(settings,".........")
	// const meeting_total_time = useMemo(() => location.state ? get_time_string(location.state.time) : '', [location.state]);
	// const total_time = useMemo(() => location.state ? location.state.time : '', [location.state]);
	const ratingChanged = (newRating) => {
		setRating(newRating);
	};

	function toggle() {
		if(user){
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track(`${user.userType}`== 'technician' ? `${user.userType}  has not solved customer problem` :`${user.userType} problem not solved`, { JobId: jobId });
		// mixpanel code//
		}
		new_values = [];
		setIsSolved(false);
		if (new_values.length > 0 && summary !== '') {
			setisloading(false);
		} else {
			// setisloading(true);
		}
		setshowYesBlock(false);
		setshowPartiallyBlock(false);
		setshowNoBlock(true);
	}

	function toggle_solved() {
		if(user){
		// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType}`== 'technician' ? `${user.userType}  solved customer problem` :`${user.userType} problem solved`, { JobId: jobId });
		// mixpanel code//
		}
		new_values = [];
		setIssueCheckboxOne([]);
		setIsSolved(true);
		setisloading(false);
		setshowYesBlock(true);
		setshowPartiallyBlock(false);
		setshowNoBlock(false);
	}

	function toggle_partially_solved() {
		if(user){
		// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track(`${user.userType}`== 'technician' ? `${user.userType}  solved customer problem partially` :`${user.userType} problem partially solved`, { JobId: jobId });
		// mixpanel code//
		}
		new_values = [];
		setIssueCheckboxOne([]);
		setIsSolved(true);
		setisloading(false);
		setshowYesBlock(false);
		setshowPartiallyBlock(true);
		setshowNoBlock(false);
	}

	const handleCustomerFeed = e => {
		setOtherComeFeedBack('');
		setShowWhereToFieldError(false);
		setCustomerFeedWhereToCome(e.target.value);
	};

	const handleChangeCustomerFeed = e => {
		setFeedBackGivenToCustomer(e.target.value);
	};
	function return_dashboard() {
		if (user.userType === 'technician') {
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Cancel feedback', { JobId: jobId });
			// mixpanel code//
		} else {
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Cancel feedback', { JobId: jobId });
			// mixpanel code//
		}
		refetch();

		 localStorage.removeItem('CurrentStep')
		window.location.href = '/dashboard/?t=cmp';
	}

	useEffect(() => {
		fetchJob(jobId);
		setTimeout(() => {
			
			setShowPageLoader(false);
		}, 4000);
	}, [ jobId]);


	const handleNewCustomer = async () => {
		if (user && user.userType == 'customer') {
			if (user.customer.subscription && user.customer.subscription.plan_id) {
							setSubscriptionDetails(user.customer.subscription);
			}
			const totalJobsCount = await getTotalJobs({ customer: user.customer.id });
			console.log('totalJobsCount ::::::', totalJobsCount);
			if (totalJobsCount == 1) {
							const response = await customerSourceApi.isCustomerExist({ user_id: user.id });
							console.log('response :::::', response);
				if (!response.sourceAlreadyGiven) {
					setShowWhereToModal(true);
				}
			}
			const totalJobsCountForFreeSessions = await getTotalPaidJobs({ customer: user.customer.id });
			setPaidJobs(totalJobsCountForFreeSessions)
			console.log('totalJobsCountForFreeSessions ::::::', totalJobsCountForFreeSessions);
			if (totalJobsCountForFreeSessions > 1) {
							setFreeSessionMinutes(0);
			} else {
							console.log('setting customer');
							setCustomerFirstJob(true);
			}
		}
	};
	useEffect(() => {
		if(user){
			mixpanel.track(`${user.userType} - On FeedBack Page `, { 'Email': user.email });
		}
		const clInt = window.clear_interval;
		console.log(clInt);
		if (clInt) {
			console.log('inside clear Interval ::::::', clInt);
			clearInterval(clInt);
		}

		handleNewCustomer();
	}, [user]);

	useEffect(() => {
		console.log('updated job is :::', job);

		if (job && job.status && job.status === 'Completed') {
			setJobDesciption(job.issueDescription);
			// console.log("inside if part")

			if (job.total_cost != null) {
				settotalCost(job.total_cost.toFixed(2));
			} else {
				settotalCost(0);
			}

			if (job.free_session_total && job.free_session_total != null && job.free_session_total != 0) {
				setFreeSessionAmount(job.free_session_total);
			}
			if(job.referalDiscount && job.referalDiscount != null && job.referalDiscount != 0){
				setReferalDiscount(job.referalDiscount)
			}
			if (job.discounted_cost && job.discounted_cost != null && job.discounted_cost != 0) {
				setDiscountedCost(`$ ${job.discounted_cost}`);
			}

			if (job.total_pause_seconds && job.total_pause_seconds != 0) {
				// console.log('pause job 00000>>>>>>>>',job.total_pause_seconds)
				setMeetingPaused(true);
				if (job.total_pause_seconds < 60) {
					setPausedSeconds(parseInt(job.total_pause_seconds));
				}
				setPausedMinutes(parseInt(parseInt(job.total_pause_seconds) / 60));
			}

			const totalJobTime = job ? job.is_long_job && job.long_job_with_minutes === "no" ? job.long_job_hours + " hours" : (job.total_time ? job.total_time : getTotalJobTime(job).totalTime) : ""
			const final_string = get_confirmation_time(job);
			if (totalJobTime && job.id === jobId) {
				setMeetingTotalTime(totalJobTime);
			}

			if (user.userType == 'customer' && job.id === jobId && job.is_long_job === false) {
				openNotificationWithIcon('info', 'Info', 'Payment Information will be sent to you on your registered email.');
			}

			let customerId;
			if (typeof (job.customer) === "object") {
				customerId = job.customer.id
			}
			else {
				customerId = job.customer
			}
			if (user && user.userType === 'customer' && job.GA_revenue_event_called === undefined) {
				if (job.total_cost != null) {
					let totalCost = parseFloat(job.total_cost.toFixed(2))
					GArevenueEvent('Revenue', 'job_cost', customerId, jobId, totalCost)
				} else {
					GArevenueEvent('Revenue', 'job_cost', customerId, jobId, 0)
				}
				JobApi.updateJob(job.id, { GA_revenue_event_called: 'yes' });
			}
			// if (user.userType == 'technician' && job.id === jobId && job.technician_charged_customer == undefined &&  !job.is_long_job) {
			// 	console.log('this is function')
			// 	handleMoneyDeduction()
			// }
		}
	}, [job, jobId]);

	function get_confirmation_time(job) {
		const var_start_call_time = new Date(job.start_call_time);
		const var_confirmaion_time = new Date(job.meeting_start_time);
		const millis = var_confirmaion_time.getTime() - var_start_call_time.getTime();
		// console.log('millis>>>>>>>>>',millis)
		if (isNaN(millis)) {
			return '00:00:00';
		}
		const formatted_string = convert_millis_to_hms_format(millis);
		return formatted_string;
	}

	function convert_millis_to_hms_format(millis) {
		let sec = Math.floor(millis / 1000);
		const hrs = Math.floor(sec / 3600);
		sec -= hrs * 3600;
		let min = Math.floor(sec / 60);
		sec -= min * 60;

		sec = `${sec}`;
		sec = (`00${sec}`).substring(sec.length);

		if (hrs > 0) {
			if (hrs < 10) {
				min = `${min}`;
				min = (`00${min}`).substring(min.length);
				return `0${hrs}:${min}:${sec}`;
			}
			min = `${min}`;
			min = (`00${min}`).substring(min.length);
			return `${hrs}:${min}:${sec}`;
		}
		console.log('min ::::', min);
		if (min === 0) {
			return `00:00:${sec}`;
		} if (min > 0 && min < 10) {
			console.log('min > 0 && min < 10 :::::', min > 0 && min < 10);
			return `00:0${min}:${sec}`;
		}
		console.log('condition 2::::::', min > 0 && min < 10);
		return `00:${min}:${sec}`;
	}

	function capitalizeFirstLetter(str, locale = navigator.language) {
		if (str) {
			return str.replace(/^\p{CWU}/u, char => char.toLocaleUpperCase(locale));
		}
		return '';
	}

	if (!user) {
		history.push('/login');
	}

	const handleChangeText = e => {
		const data = e.target.value;
		if (data.trim() === '') {
			// setisloading(true);
		} else {
			setSummary(e.target.value);
			if (new_values.length > 0 && summary !== '' && typeof (IsSolved) === 'boolean') {
				setisloading(false);
			}
			if (summary !== '' && typeof (IsSolved) === 'boolean') {
				setisloading(false);
			}
		}
	};

	const handleJobText = e => {
		const data = e.target.value;
		// console.log('data>>>>>>>>>>>', data);
		setJobDesciption(data);
	};

	function setIssueCheckbox(checkedValues) {
		if (checkedValues.target.checked === true) {
			console.log("new_values :::", new_values)
			new_values.push(checkedValues.target.value);
		} else {
			const index = new_values.indexOf(checkedValues.target.value);
			if (index > -1) {
				new_values.splice(index, 1);
			}
		}
		console.log("new_values :::", new_values, isDontChargeWithoutAdminReview)
		setIsDontChargeWithoutAdminReview(false)
		let intersection = new_values.filter(x => noNeedOfAdminReview.includes(x));
		console.log("before intersection :::: ", intersection, intersection.length)
		if(intersection.length > 0 ){ 
			console.log("after intersection :::: ", intersection, intersection.length)
			setIsDontChargeWithoutAdminReview(true); 
		}
	
		console.log("setIsDontChargeWithoutAdminReview :::", isDontChargeWithoutAdminReview)
		setIssueCheckboxOne(new_values);
		/* if (new_values.length === 0 || summary === '') {
			setisloading(true);
		} */

		if (new_values.length > 0 && summary !== '') {
			setisloading(false);
		}
	}

	

	const handleNext = () => {
		setShowRequired(false);
		if (IsSolved === false) {
			if (issueDescription.length === 0) {
				openNotificationWithIcon('error', 'Error', 'Please select one reason.');
			} else if (user.userType === 'technician') {
				if (summary === '') {
					openNotificationWithIcon('error', 'Error', 'Meeting summary is required.');
					setShowRequired(true);
				} else {
					save_feedback();
				}
			} else if (user.userType === 'customer') {
				if (summary === '') {
					openNotificationWithIcon('error', 'Error', 'Comments are required.');
					setShowRequired(true);
				} else {
					save_feedback();
				}
			} else {
				save_feedback();
			}
		} else if (IsSolved === true) {
			if (user.userType === 'technician') {
				if (summary === '') {
					openNotificationWithIcon('error', 'Error', 'Meeting summary is required.');
					setShowRequired(true);
				} else {
					save_feedback();
				}
			} else {
				save_feedback();
			}
		} else {
			save_feedback();
		}
		/* if (user.userType === 'customer') {
			setisloading(true);
		} */
	};

	
	const handleWhereToCome = async () => {
		let theVar = '';
		if (customerFeedWhereToCome == false) {
			openNotificationWithIcon('error', 'Error', 'Please select an option');
			return;
		}
		if (customerFeedWhereToCome == 'Others' && otherComeFeedBack == '') {
			setShowWhereToFieldError(true);
			setWhereHeComeFrom('');
			return;
		}
		if (customerFeedWhereToCome == 'Others') {
			theVar = otherComeFeedBack;
			setWhereHeComeFrom(otherComeFeedBack);
		} else {
			theVar = customerFeedWhereToCome;
			setWhereHeComeFrom(customerFeedWhereToCome);
		}
		if (user && user.userType == 'customer') {
			const dataToSaveinSource = {
				user: user.id,
				source: theVar,
			};
			const apiCall = await customerSourceApi.createCustomerSource(dataToSaveinSource);
		}

		setShowWhereToModal(false);
		
	};

	/**
	 * If feedbeck submit by technician. 
	 * 	-- check user type is technician and job have customer details
	 * 	-- Deduct money from customer if there is no issues selected by customer
	 * 	-- if any issue is reported by tech then job will go for admin review
	 *  -- add rating for klaviyo track
	 * 	-- miaxpanel identify and track
	 * 	-- add jobCycle
	 * 	-- redirect to dashboard
	 * @params : job useState object
	 * @author : Ridhima Dhir
	 */
	const isTechSubmitFeedback = async () =>{
		try{
			if (user.userType === 'technician' && job && job.customer && job.customer.user){
				isDeductionMoneyFromCustomer()
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
				// mixpanel code//
				mixpanel.identify(user.email);
				mixpanel.track('Technician - Submit feedback', { JobId: jobId });
				// mixpanel code//

				let lifeCycleTag = JobTags.TECHNICIAN_SUBMIT_FEEDBACK;
				if(job && job.is_transferred && job.is_transferred == true ){
					lifeCycleTag = JobTags.TECHNICIAN_SUBMIT_FEEDBACK_AFTER_TRANSFER;
				}
				await JobCycleApi.create(lifeCycleTag, jobId);

				setTimeout(() => { history.push('/dashboard/?t=cmp'); }, 3000);
			}
		}catch(err){
			console.log("catch error while submiting tech feedback", err)
		}
	}

	/**
	 * If feedbeck submit by customer. 
	 * 	-- run handleRefModal function form utils  
	 *  -- add rating for klaviyo track
	 * 	-- miaxpanel identify and track
	 *  -- create jobCycle
	 *  -- setShowHomeButton true
	 * @params : job useState object
	 * @author : Ridhima Dhir
	 */
	const isCustomerSubmitFeedback = async () =>{
		try{
			if(user.userType === 'customer' && job && job.technician && job.technician.user){
				handleRefModal()
				const klaviyoData = {
					email: job.technician.user.email,
					event: 'Technician rating',
					properties: {
						$first_name: job.technician.user.firstName,
						$last_name: job.technician.user.lastName,
						$job: job.id,
						$rating: rating,
					},
				};
				await klaviyoTrack(klaviyoData);

				// mixpanel code//
				mixpanel.identify(user.email);
				mixpanel.track('Customer -  Submit feedback', { JobId: jobId });
				// mixpanel code//

				// create job life cycle 
				let lifeCycleTag = JobTags.CUSTOMER_SUBMIT_FEEDBACK;
				if(job && job.is_transferred && job.is_transferred == true ){
					lifeCycleTag = JobTags.CUSTOMER_SUBMIT_FEEDBACK_AFTER_TRANSFER;
				}
				await JobCycleApi.create(lifeCycleTag, jobId);

				// Show home button if user is customer
				setShowHomeButton(true)
			}
		}catch(err){
			console.log("catch error while submiting customer feedback", err)
		}
	}
	const waitFor3secondsToRedirect = ()=>{
		let a = new Promise((resolve, reject) => {
			setTimeout(() => {
			  resolve(true);
			}, 3000);
		  });
		return a;
	}

	/**
	 * create new feedback and show browser notification
	 * @params : job useState object
	 * @author : Ridhima Dhir
	 */
	const submitFeedback = async()=>{
		try{
			let alreadyFeedBackGiven = await checkForFeedback({"userId":user.id,"jobId":jobId})
			if(alreadyFeedBackGiven){
				openNotificationWithIcon("info","Info","Feedback is already given for this job")
				let waited = await waitFor3secondsToRedirect()
				if(waited){
					return window.location.href="/"
				}
			}
			await createFeedback({
				job: jobId,
				jobDesciption: job.issueDescription,
				user: user.id,
				userName: user.firstName,
				is_solved: IsSolved,
				rating,
				comments: summary,
				issues: issueDescription,
				to: (feedBackGivenBy === 'customer')? job.technician.user.id: job.customer.user.id,
				WhereDidHeFoundUs: whereHeComeFrom,
				userType: user.userType,
				systemRating,
			});
			openNotificationWithIcon('success', 'Success', 'Thank you for your feedback!.');
		}catch(err){
			console.log("catch error while submiting feedback", err)
		}
	}


	/**
	 * save feedback for tech or customer. 
	 * @params : job useState object
	 * @author : Ridhima Dhir
	 */
	const save_feedback = async () => {
		try{
			console.log("save feedback clicked")
			setisloading(true);
			// submit feedback details 
			await submitFeedback()
			// Is feedback submit by tech
			await isTechSubmitFeedback()
			// Is feedback submit by customer
			await isCustomerSubmitFeedback()
		}catch(err){
			console.log("catch error while submiting feedback", err)
		}
	}

	const showModal = () => {
		setIsModalVisible(true);
	};

	/* const handleOk = () => {
		setIsModalVisible(false);
	}; */

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	/* const getPaymentDateTime = (t) => {
		const date = new Date(t * 1000);
		if (date) {
		const h = date.getHours();
		return `${date.getDate()
			}/${date.getMonth() + 1
			}/${date.getFullYear()
			} ${date.getHours()
			}:${date.getMinutes()
			} ${h > 12 ? 'PM' : 'AM'}`;
		}
		return 'NA';
	}; */
	const handlePrint = useReactToPrint({
		content: () => invoiceRef.current,
	});

	/**
	 * Calls the refund Api if technician do cut payment
	 * @params : job(Type:Object)
	 * @response: Calls the refund referal amount Api if it does not exist
	 * @author : Sahil
	 **/
	async function callRefundApi(job){
		try{
			let refundMoneyData = {
				"jobId":job.id,
				"query":{"customer":job.customer.id}
			}
			let refundMoney = await ReferalApi.refundUserAmount(refundMoneyData)
		}
		catch(err){
			console.log("error in callRefundApi ::: ",err)
		}
	}

	const handleLogoRedirection = (e) => {

		e.preventDefault()
		localStorage.removeItem('CurrentStep');
		window.location.href = '/dashboard';
	};

	const handleMoneyDeduction = async () => {
		console.log('techPaymentAnswer>>>>', techPaymentAnswer);
		// setDisableSubmitButton(true)
		// setShowPaymentDeductModal(false);
		const totalJobTime = job.total_time;
		const final_string = get_confirmation_time(job);
		if (totalJobTime && job.id === jobId && techPaymentAnswer == 'yes') {
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Charged Customer Successfully', { JobId: jobId });
			// mixpanel code//
			console.log('i am going to charge the customer>>>>>');
			let charge = CustomerApi.takeChargeFromCustomer({'totalJobTime':totalJobTime,'final_string':final_string,'jobId':jobId,'user_id':job.customer.user.id,'user_role':job.customer.user.roles[0],'user_parent':job.customer.user.parentId,'customer_type':job.customer.customerType,'minutesFreeForClient':minutesFreeForClient,'technician_user_id':job.technician.user.id,'software_rate':job.software.rate})
			console.log("ChargeDataaaaa",charge)
		} else {
			callRefundApi(job)
			JobApi.updateJob(job.id, { technician_charged_customer: 'no' });
			CustomerApi.meetingEndEmails({ JobId: job.id });
			updateOrCreateZeroTechnicianEarning(job)
			updateOrCreateZeroBillingReport(job)
		}
	};

	const isDeductionMoneyFromCustomer = async () => {

		if(IsSolved){
			await deductionMoneyFromCustomer()
		}
		
		if(!IsSolved && isDontChargeWithoutAdminReview){
			console.log("dont_charge_without_review :::::::", !IsSolved, isDontChargeWithoutAdminReview);
			socket.emit('dont_charge_without_review', {
				'jobId':job.id,
				'email':job.customer.user.email,
				'firstName':job.customer.user.firstName,
				'programName': job.software['name'],
				'jobDescription':job.issueDescription,
				'techName':job.technician['user'].firstName,
				'dontChargeReason':issueDescription.join(', ')
			});
		}

		if(!IsSolved && !isDontChargeWithoutAdminReview){
			socket.emit('admin_review_email', {
				'email':"",
				'firstName':job.customer.user.firstName,
				'programName': job.software['name'],
				'jobDescription':job.issueDescription,
				'techName':job.technician['user'].firstName,
				'dontChargeReason':issueDescription.join(', '),
				'adminJobDetailLink':"<a href='"+process.env.REACT_APP_ADMIN_PAGE+"/service_details/"+job.id+"'>"+job.JobId+"</a>"
			});
			if(!job.payment_id){
				socket.emit('admin_review_customer_email', {
					'email':job.customer.user.email,
					'firstName':job.customer.user.firstName,
					'programName': job.software['name'],
					'jobDescription':job.issueDescription,
					'techName':job.technician['user'].firstName
				});
			}
			JobApi.updateJob(job.id, { adminReview: true });
		}
	};

	const deductionMoneyFromCustomer= async()=>{
		console.log('techPaymentAnswer>>>>', techPaymentAnswer);
		// setDisableSubmitButton(true)
		// setShowPaymentDeductModal(false);
		const totalJobTime = job.total_time;
		const final_string = get_confirmation_time(job);
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician - Charged Customer Successfully', { JobId: jobId });
		// mixpanel code//
		console.log('i am going to charge the customer>>>>>');
		let charge = CustomerApi.takeChargeFromCustomer({'totalJobTime':totalJobTime,'final_string':final_string,'jobId':jobId,'user_id':job.customer.user.id,'user_role':job.customer.user.roles[0],'user_parent':job.customer.user.parentId,'customer_type':job.customer.customerType,'minutesFreeForClient':minutesFreeForClient,'technician_user_id':job.technician.user.id,'software_rate':job.software.rate})
		console.log("ChargeDataaaaa",charge)
	}

	/**
	 * update the earning to zero if technician does not charge the customer.
	 * @params : job(Type:object)
	 * @response: no response
	 * @author : Manibha
	 **/
	async function updateOrCreateZeroTechnicianEarning(job){
		const earnData =  await EarnApi.getEarningDetailsByJob(job.id) 
		let dataToSave = {}	
		dataToSave['commision'] = 0
		dataToSave['amount_earned'] = 0
		dataToSave['transaction_type'] = 'Denied'	
		dataToSave['transaction_status'] = 'Denied'	
		// when earning detail is already there then update it. 
		if(earnData.id != undefined){							
			await EarnApi.updateEarningDetails(earnData.id,dataToSave)
		}else{
			// in case earning report does not get generated while end meeting.
			dataToSave['job_id'] = job.id
			dataToSave['customer_user_id'] = job.customer.id
			dataToSave['technician_user_id'] = job.technician.id
			dataToSave['total_amount'] = job.total_cost				
			await EarnApi.createEarningDetails(dataToSave)
		}			
	}

	/**
	 * update the billing to zero if technician does not charge the customer.
	 * @params : job(Type:object)
	 * @response: no response
	 * @author : Manibha
	 **/
	async function updateOrCreateZeroBillingReport(job){
		const billData =  await BillApi.getBillingDetailsByJob(job.id) 
		let dataToSave = {}	
		dataToSave['total_amount'] = 0
		if(billData.id != undefined){	
			// when billing detail is already there then update it with amount 0. 					
			await BillApi.updateBillingDetails(billData.id,dataToSave)
		}else{
			// in case billing report does not get generated while end meeting.
			dataToSave['job_id'] = job.id
			dataToSave['customer_user_id'] = job.customer.id
			dataToSave['technician_user_id'] = job.technician.id
			await BillApi.createBillingDetails(dataToSave)
		}			
	}

	const deduct_money_yes = () => {
		if(user){
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician - Charge the Customer', { JobId: jobId });
		// mixpanel code//
		}
		//console.log('deduct_money_yes>>>>>>>>');
		setTechPaymentAnswer('yes');
	};

	const deduct_money_no = async() => {
		if(user){
		// mixpanel code//

			mixpanel.identify(user.email);
			mixpanel.track('Technician - Not Charge the Customer', { JobId: jobId });
		// mixpanel code//
		}
		console.log('deduct_money_no>>>>>>>>');
		setTechPaymentAnswer('no');
	};

	if (showPageLoader) {
		return (
			<Col md="12" className="px-4 py-5">
				<Row>
					<Loader height="100%" className={`mt-5 ${showPageLoader ? 'loader-outer' : 'd-none'}`} />
				</Row>

			</Col>
		);
	}
	const copyPromoCode = async(e)=>{
		textAreaRef.current.select();
		document.execCommand('copy');
    	e.target.focus();
    	setCopySuccess('Copied!');
	}
	const updateSale = async () =>{
		await JobApi.updateJob(job.id, { shareASale:true  });
		fetchJob(job.id)
	}

	return (

		<>
			<Layout>
				<MainLayout>
					<div className="main_section_feedback">
						<div className="section_one">
							{user && user.userType === 'customer' && user.customer.customerType !== 'test' && chargeData.success == false && chargeData.total_cost > 0
										&& (
										<>
												<Alert variant="danger" className="w-75 ml-auto mr-auto mt-4 text-center">
													{stripeErrorMessage}
												</Alert>
											</>
										 )}

							{ job && !job.shareASale && job.total_cost &&
								<>
									<img src={`https://www.shareasale.com/sale.cfm?tracking=${job.id}&amount=${job.total_cost}&merchantID=${MERCHANT_ID}&transtype=sale`} width="0" height="0"/>

										{
											setTimeout(() => {
											updateSale()
											}, 3000)
										}
								</>
							}				

							{user && user.userType === 'customer' && user.customer.customerType !== 'test' && chargeData.success
										&& (
										<>
												<Alert variant="success" className="w-75 ml-auto mr-auto mt-4 text-center">
														Payment has been deducted.
														<a onClick={showModal}><b> Click here</b></a>
													{' '}
														to view payment details.
												</Alert>
												<Modal title="Payment Details" visible={isModalVisible} onOk={handlePrint} onCancel={handleCancel} className="app-confirm-modal payment-details-modal" closable={false} okText="Download Invoice" cancelText="Close">
													<table cellPadding="10">
														<tr>
															<td className="font-weight-bold">Transaction ID</td>
															<td className="text-center" width="50">:</td>
															<td>{chargeData.id}</td>
														</tr>
														<tr>
															<td className="font-weight-bold">Total Amount</td>
															<td className="text-center" width="50">:</td>
															<td>
																{chargeData.currency.toUpperCase()}
																{' '}
																{chargeData.amount / 100}
															</td>
														</tr>
														{chargeData.amount_refunded > 0
																&& (
																<tr>
																		<td className="font-weight-bold">Refunded</td>
																		<td className="text-center" width="50">:</td>
																		<td>{chargeData.amount_refunded}</td>
																</tr>
																)}
														{chargeData.payment_method_details && chargeData.payment_method_details.card
																&& (
																<tr>
																		<td className="font-weight-bold">Payment Method</td>
																		<td className="text-center" width="50">:</td>
																		<td>{`${capitalizeFirstLetter(chargeData.payment_method_details.card.brand)}`}</td>
																</tr>
																)}
														{chargeData.payment_method_details && chargeData.payment_method_details.card
																&& (
																<tr>
																		<td className="font-weight-bold">Last 4 digit</td>
																		<td className="text-center" width="50">:</td>
																		<td>{`xxxx xxxx xxxx ${chargeData.payment_method_details.card.last4}`}</td>
																</tr>
																)}
														<tr>
															<td className="font-weight-bold">Status</td>
															<td className="text-center" width="50">:</td>
															<td>{capitalizeFirstLetter(chargeData.status)}</td>
														</tr>
													</table>
													<div style={{ display: 'none' }}>
														<div ref={invoiceRef}>
															<Invoice chargeData={chargeData} job={job} />
														</div>
													</div>
												</Modal>
										</>
										)}
										<Row align="center" className="mt-5" style={{ width: '100%', height: '100%' }}>
												<Col align="center" span={6}>
												<Link to="/" onClick={handleLogoRedirection}>
													<Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
													</Link>
												</Col>
										</Row>
										
										<p className="title"> CALL SUMMARY </p>
										<div className="section_sub_one">
												<table className="details-table" cellPadding="10">
														<tbody>
																<tr>
																		<th width="200">Support Time</th>
																		<td>
																				<span className="job-value">
																						{' '}
																						{meetingTotalTime}
																				</span>
																		</td>
																</tr>
																{meetingPaused  && <tr>
																			<th>Meeting Paused</th>
																			<td>
																					<span className="job-value">
																							{pausedMinutes>1 && <>{pausedMinutes} minutes</>} 
																							{pausedMinutes == 1 && <>{pausedMinutes} minute</>}
																							{pausedMinutes < 1 && <>{pausedSeconds} seconds</>}
																					</span>
																			</td>
																	</tr>
															}

															{user && user.userType=="Customer" && freeSessionMinutes!= 0 && <tr>
																			<th>Free Minutes</th>
																			<td>
																					<span className="job-value">
																							{freeSessionMinutes} minutes
																					</span>
																			</td>
																	</tr>
															}

															{user && user.userType=="customer" &&
																<tr>
																		<th>Total Job Cost</th>
																		<td>
																				<span className="job-value">
																						{' '}
																						$
																						{' '}
																						{  totalCost }
																				</span>
																		</td>
																</tr>
															}
																{customerFirstJob && (job.long_job_hours === 0 || job.long_job_hours === null || job.long_job_hours === undefined)  && <tr>
																			<th>Amount to be Paid</th>
																			<td>
																					<span className="job-value">
																							{' '}
																							$
																							{' '}
																							{freeSessionAmount}
																					</span>
																			</td>
																	</tr>
															}
															 {hasSubscription && user.userType == 'customer' &&

																	<tr>
																			<th>Subscription time deducted</th>
																			<td>
																					<span className="job-value">
																						{' '}			                                        
																							{  DeductionSubscriptionTime }
																					</span>
																			</td>
																	</tr>
															}

															{discountedCost &&
																<tr>
																			<th>Discounted Cost</th>
																			<td>
																					<span className="job-value">
																						{' '}			                                        
																							{  discountedCost }
																					</span>
																			</td>
																	</tr>


															}
															{referalDiscount &&
																<tr>
																			<th>Referal Discount </th>
																			<td>
																					<span className="job-value">
																						{' '}			                                        
																							$ {referalDiscount}
																					</span>
																			</td>
																	</tr>


															}
																<tr>
																		<th>
																				Job Summary{user.userType === 'technician'
																				&& (
																				<img alt="" onClick={showJobModal} src={editIcon} width="20px" height="20px" className="feedback-job-edit" />
																				)}
											</th>
											<td>
												<p className="job-value desc-class" title={job ? job.issueDescription : ''}>
													{job ? job.issueDescription : ''}
													{' '}
												</p>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<Modal title="How did you hear about us ?" visible={showWhereToModal} closable={false} destroyOnClose={false} className="change-feedback-modal title-bold" footer={<Button className="btn app-btn" key="submit" onClick={handleWhereToCome}>Submit</Button>}>
							<div className="section_three">
								<div className="section_sub_three">
									<Radio.Group onChange={handleCustomerFeed} className="radioBoxes" value={customerFeedWhereToCome}>
										<Radio value="Facebook">
											Facebook
										</Radio>
										<br />
										<Radio value="Twitter">
											Twitter
										</Radio>
										<br />
										<Radio value="LinkedIn">
											LinkedIn
										</Radio>
										<br />
										<Radio value="friend">
											Friend
										</Radio>
										<br />
										<Radio value="Others">
											Others please specify
										</Radio>
									</Radio.Group>
								</div>
								{ customerFeedWhereToCome == 'Others' && (
									<div className="section_five">
										<div className="section_sub_five col-12 ml-0 p-0 mt-4 form-group">
											<input spellCheck rows={4} className="form-control" onChange={(e) => { setShowWhereToFieldError(false); setOtherComeFeedBack(e.target.value); }} id="textarea" />
											{showWhereToFieldError && <p className="m-0 p-0" style={{ color: 'red' }}> Required Field</p> }
										</div>
									</div>
								)}
							</div>
						</Modal>

						{/* // @author Utkarsh Dixit
						// Purpose : To Show Referal */}
                        {/* <ReferPeople />	*/}

					
						
						

						<Modal title="Do you want to charge the customer for your assistance?" 
							visible={showPaymentDeductModal} 
							closable={false} 
							destroyOnClose={false} 
							className="deduction_modal title-bold" 
							footer={
								<Button className="btn app-btn" key="submit" onClick={handleMoneyDeduction} disabled={disableSubmitButton}>Submit</Button>
							}
						>
							<div className="section_one">
								<div className="section_sub_one">
									<Button className="btn app-btn app-btn-super-small" onClick={deduct_money_yes}>
										<span />
										Yes
									</Button>
									<Button onClick={deduct_money_no} className="btn app-btn app-btn-super-small">
										<span />
										No
									</Button>
								</div>

							</div>
						</Modal>

						<Modal title="Update Job description" visible={isJobModalVisible} onOk={handleJobOk} onCancel={handleJobCancel} className="selectCallTypeModal" okText="Save">
							<TextArea spellCheck rows={4} value={jobDesciption} onChange={handleJobText} />
						</Modal>

						<div className="section_two">
							{user && user.userType === 'customer'
										&& <p className="title"> {(user.firstName).toUpperCase()}, IS YOUR PROBLEM SOLVED?</p>}
							{user && user.userType === 'technician'
										&& <p className="title"> WAS CLIENT PROBLEM RESOLVED?</p>}
							<div className="section_sub_one">
								<Button className={`${showYesBlock ? '' : 'app-btn-light-blue'} btn app-btn app-btn-super-small feeback-btn`} onClick={toggle_solved}>
									<span />
									Yes
								</Button>
								<Button className={`${showPartiallyBlock ? '' : 'app-btn-light-blue'} btn app-btn app-btn-super-small feeback-btn`} onClick={toggle_partially_solved}>
									<span />
									Partially
								</Button>
								<Button onClick={toggle} className={`${showNoBlock ? '' : 'app-btn-light-blue'} app-btn app-btn-super-small feeback-btn`}>
									<span />
									No
								</Button>
							</div>
						</div>

						{ !showNoBlock && (
							<div className="section_three">
								<p className="title"> Glad we could help!</p>
							</div>
						)}

						{showNoBlock && user.userType === 'customer' && (
							<div className="section_three">
								<p className="title"> Sorry we couldn't solve your issue. Help us understand what went wrong! </p>
								<div className="section_sub_three">
									<Checkbox
										value="Technician was not knowledgeable."
										onChange={setIssueCheckbox}
									>
										Technician was not knowledgeable.
									</Checkbox>
									<br />
									<Checkbox
										value="Audio or screen share was not clear."
										onChange={setIssueCheckbox}
									>
										Audio or screen share was not clear.
									</Checkbox>
									<br />
									<Checkbox
										value="I couldn't understand technician's language."
										onChange={setIssueCheckbox}
									>
										I couldn't understand technician's language.
									</Checkbox>
									<br />
									<Checkbox
										value="Others."
										onChange={setIssueCheckbox}
									>
										Others.
									</Checkbox>

								</div>
							</div>
						)}

						{showNoBlock && user.userType === 'technician' && (
							<div className="section_three">
								<p className="title"> Sorry we couldn't solve your issue. Help us understand what went wrong! </p>
								<div className="section_sub_three">
									<Checkbox
										value="Didn't speak to customer/ wrong category."
										onChange={setIssueCheckbox}
									>
										Didn't speak to customer/ wrong category.
									</Checkbox>
									<br />
									<Checkbox
										value="Issue was with third party."
										onChange={(e)=>{setIssueCheckbox(e); setIsSolved(!IsSolved)}}
									>
										Issue was with third party.

									</Checkbox>
									<br />
									<Checkbox
										value="Out of my scope."
										onChange={setIssueCheckbox}
									>
										Out of my scope.
									</Checkbox>

								</div>
							</div>
						)}

						{ user.userType == 'customer' &&
							<div className="section_four">
							<p className="title"> RATE THE SYSTEM </p>
							<div className="section_sub_four">
								<Rate onChange={handleSystemRating} value={systemRating} style={{ fontSize: 30, color: '#1BD4D5' }} />
							</div>
						</div>}

						<div className="section_four">
							{user.userType === 'technician' ? <p className="title"> RATE THE CLIENT </p> : <p className="title"> RATE YOUR GEEK </p>}

							<div className="section_sub_four">
								<Rate onChange={ratingChanged} value={rating} style={{ fontSize: 30, color: '#1BD4D5' }} />
							</div>
						</div>

						<div className="section_five">
							{user.userType === 'technician'
								? (
									<p className="title">
										Meeting Notes
										<span className="redColor">*</span>
									</p>
								)
								: 										(
									<p className="title">
										COMMENTS
										{IsSolved ? '' : <span className="redColor pl-1">*</span>}
									</p>
								)}
							<div className="section_sub_five text-left">
								<TextArea spellCheck rows={4} onChange={handleChangeText} id="textarea" />
								{showRequired
											&& <span className="redColor"><i>Required field</i></span>}
							</div>
						</div>

						<div className="section_six">
							<div className="section_sub_one">
								{!showHomeButton &&
									<Button onClick={return_dashboard} className="btn app-btn app-btn-transparent">
										<span />
										Cancel
									</Button>
								}
								{!showHomeButton &&
									<Button disabled={isloading} onClick={handleNext} className={`${isloading ? 'disabled-btn ' : ''}job-btn-feedback btn app-btn`}>
									<span />
									Submit Feedback
								</Button>}
								{showHomeButton && 
									<Button onClick={()=>{window.location.href="/"}}  className="job-btn-feedback btn app-btn w205">
									<span />
										Back to dashboard
									</Button>
								}
							</div>
						</div>

					</div>
					{/*<div className="divarea">
						<Button onClick={handleRefModal} className="btn app-btn">
							<span></span> Refer person
						</Button>
					  </div>*/}
				</MainLayout>
			</Layout>
		</>
	);
};

export default MeetingFeedback;
const Image = style.img`
	display: block;
	width: 160px;
`;
const Link = style(DOM.Link)`
	font-size: 16px;
`;

const MainLayout = Styled(Layout)`
	background-color: #EDF4FA !important;
	min-height: fit-content !important;
	width:100%;

	& .main_section_feedback{
	background-color: #fff;
	width: 40%;
	margin: 5% auto;    
	box-shadow:4px 9px 4px 9px #F4F4F4;	
	@media screen and (max-width: 991px) {
		width: 75%;
	}
@media screen and (max-width: 763px) {
	width:95% !important;
}
	}

	& .redColor{
	color:#e47676;
	}
	& .details-table{
	font-size:17px;
	width: 85%;
	margin: auto;

	.desc-class{
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 300px;
		font-weight:bold;
		cursor:pointer;
		margin-bottom: unset;
		color:#656060;
	}
	}
	
 & .section_one .title,.section_two .title, .section_three .title, .section_four .title,.section_five .title{
	font-size:17px;
	text-align:center;
	font-weight:bold;
	letter-spacing: 1.5px;
	margin:3% auto;
	width: 100%;
	padding:20px 30px;
 }


 & .section_one  p a{
	color: #4AD4D5;
 }
 & .section_one .section_sub_one span{
	font-size:18px;
	text-align :center;
	color: #656060;
	font-weight:bold;
 }

	& .section_sub_four{
	text-align:center;
 }

 & .section_three .section_sub_three{
	width: 100%;
	padding:20px 50px;
 }

 & .section_three .section_sub_three label{
	font-size:20px;
	margin-top:10px;
 } 

	& .section_sub_five {
	width: 85%;
	margin: auto;  
	text-align:center;
	@media screen and (max-width: 763px) {
		width:95% !important;
		margin-bottom:30px;
	}
 }

 
	& .section_two .section_sub_one button,.section_six .section_sub_one button{
	margin-left: 13px;
	border-color: #4AD4D5;
	color: #fff;
	background: #4AD4D5;
	font-size: 17px;
	border-radius: 10px;
	font-weight: bold;
	margin-right: 13px;
 }
 & .section_six .section_sub_one button{
	width: 178px;
	margin-bottom:30px !important
	height:50px !important;
	@media screen and (max-width: 763px) {  
		width: 46% !important;
		min-width: auto !important;
		font-size: 14px !important;
		padding: 0 !important;
	}
 }

 & .section_six .section_sub_one{
	 text-align:center;    
	 margin-top:2%;
	 @media screen and (max-width: 763px) {
		display: flex;
		align-items: center;
		justify-content: space-between;
	 }
 }

& .section_two .section_sub_one{
	text-align:center;    
	@media screen and (max-width: 763px) {
		display:flex
	}
}

& .ant-checkbox + span{
	font-size: 19px;
}
& .section_one .section_sub_one .job-value{
	@media screen and (max-width:764px){
		font-size:16px;
		font-weight:unset;
	}
 }
}

`;

/* const SiteLayoutContent = Styled(Content)`
	margin: 24px 16px,
	padding: 24px,
	min-height: 280px,
`; */
