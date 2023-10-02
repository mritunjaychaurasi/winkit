import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Spin, Col, Checkbox , Row ,Select, Modal } from 'antd';
import styled from 'styled-components';
import {useTools} from "./../../../../context/toolContext";
import * as Antd from 'antd';
import { useHistory, useLocation } from 'react-router';
import { Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import { openNotificationWithIcon, GAevent } from 'utils';
import {
	// StepActionContainer,
	StepTitle,
	// IssueSelect,
	BodyContainer,
	// SectionTitle,
	// WarningText,
	// TitleContainer,
} from '../../ProfileSetup/steps/style';
// import * as JobService from '../../../../api/job.api';
import * as CustomerApi from '../../../../api/customers.api';
import * as JobCycleApi from '../../../../api/jobCycle.api';
// import StepButton from '../../../../components/StepButton';
import H2 from '../../../../components/common/H2';
// import TechImages from '../../../../components/TechImages';
import { PLATFORM, INACTIVE_ACCOUNT_MESSAGE, STRIPE_KEY, STRIPE_TEST_KEY, JobTags } from '../../../../constants';
import { isLiveUser } from '../../../../utils';
import Box from '../../../../components/common/Box';
import { useUser } from '../../../../context/useContext';
import Loader from '../../../../components/Loader';
import { useJob } from '../../../../context/jobContext';
import { useAuth } from '../../../../context/authContext';
import JobAlive from './JobAlive';
import { convertToRaw } from 'draft-js';
import { useSocket } from '../../../../context/socketContext';
import NotAccepted from './NotAccepted';
import Schedule from './Scehdule';
import { klaviyoTrack } from '../../../../api/typeService.api';
import IssueDescription from '../../ProfileSetup/steps/IssueDescription';
import * as SoftwareApi from '../../../../api/software.api';
import AddCardForm from '../../Profile/steps/addCardForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChartBar,
	faQuestionCircle,
	faUserCircle,

} from '@fortawesome/free-regular-svg-icons';
import { faEdit,faArrowRight,faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import RoundSelectors from '../../../../components/Selectors';
import Logo from 'components/common/Logo';

import { isMobile, isTablet } from 'react-device-detect';
const { Text } = Antd.Typography;
let findTechnicainCalled = false;
let cardFunctionCalled = false;
let checkGeekerAvailabilityTimeVariable = false;

function JobDetailView({
	handleDecline,setJobFlowStep,jobFlowsDescriptions, setGuestJobId,setStep,setMainPageStep, softwareissue, repost, jobId, job, estimatedPrice, estimatedTime, estimatedWait, estimatedDuration, intialPrice, finalPrice, priceLoaded, fetchJob, mainEstimatedWait, isScheduleJob, componentToRenderIssue, setComponentToRenderIssue, setIssueDescription, set_price_value, newPost, setInitialPrice, setFinalPrice, btnclickedObj, setAfterGeekerHours
}) {
	const{setIfScheduleJob} = useTools()
	const history = useHistory();
	const { user, refetch } = useUser();
	const location = useLocation();
	// console.log("the location here 1 -------")
	const queryParams = new URLSearchParams(location.search);
	console.log(">>>>>>>queryParams >>>>>>>",queryParams)
	const repostJob = queryParams.get('repost') ? queryParams.get('repost') : false;
	console.log("newpost :::::::::: ",queryParams.get("newpost"))
	let newPostJob = newPost != undefined ? newPost : queryParams.get("newpost")
	let isMobilePost = queryParams.get("isMobilePost")? queryParams.get("isMobilePost") :false
	const hireExpertTransferJob = queryParams.get('hireExpertTransferJob') ? queryParams.get('hireExpertTransferJob') : false;
	// const duration = useMemo(() => job && job.expertise ? job.expertise.levels[job.level] : { from: 0, to: 0 }, [job]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [cardsInfo, setCardsInfo] = useState(false);
	const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId") : false
	const postAgainJobReference = queryParams.get("jobId") ? queryParams.get("jobId") : false
	// let params = new URLSearchParams(location.search)
	const [newCardAdded, setNewCardAdded] = useState(false);
	const [showLoader, setShowLoader] = useState(true);
	const [scheduleJob, setScheduleJob] = useState(false);
	const {
		createJobAsGuest, createJob, updateJob, getTotalJobs, getTotalPaidJobs,setJob
	} = useJob();
	const { getGuestUser } = useAuth();
	const [componentToRender, setComponentToRender] = useState(((jobId && job && jobId === job.id) || (repostJob || (newPostJob != 'yes')) ? '' : 'jobDetailsView'))
	const [updatedJobData, setUpdatedJobData] = useState(job);
	const [notFound, setNotFound] = useState(false);
	const { socket } = useSocket();
	const [loading, setLoading] = useState(false);
	const [totalJobs, setTotalJobs] = useState();
	const [totalPaidJobs, setTotalPaidJobs] = useState();
	const [isTechNotFoundInSearch, setIsTechNotFoundInSearch] = useState(false);
	const [cardFunctionCalledFindTech, setcardFunctionCalledFindTech] = useState(false);
	const [disableButton, setDisableButton] = useState(false);
	const [hireValue, setHireValue] = useState(false);
	const [currentStep, setCurrentStep] = useState((jobId ? 1 : 0));
	const [software, setSoftware] = useState();
	const [subSoftware, setSubSoftware] = useState();
	const [expertise, setExpertise] = useState();
	const [subOption, setSubOption] = useState();
	const [selectedVal, setSelectedVal] = useState();
	const [issueDescription, setIssueDescriptionback] = useState('');
	const [audio, setAudio] = useState(true);
	const [guestJobValue, setGuestJobValue] = useState()
	const [showTwoTierMessage, setShowTwoTierMessage] = useState(false)
	// const [afterGeekerHours, setAfterGeekerHours] = useState(false)
	let liveUser = isLiveUser(user)
	const lessThan2Hours = 'less than 2 hours'
	const moreThan2Hours = 'more than 2 hours'
	const stripePromise = liveUser ? loadStripe(STRIPE_KEY) : loadStripe(STRIPE_TEST_KEY)
	const [showToolTip, setShowToolTip] = useState(false)
	
	useEffect(() => {
		if((!job || job['success'] == false) && queryParams.get("jobId") && queryParams.get("newpost") && queryParams.get("isMobilePost")){
			console.log(">>>>> jobs >>>>>> auth ::: ", job, queryParams);
			window.location.href = "/login?job-id="+queryParams.get("jobId")+"&isMobilePost="+queryParams.get("isMobilePost")
		}
		console.log('JOBDETAILS VIEW jobId in details view ::', job, job.status, job.status != "Draft");
		//console.log('JOBDETAILS VIEW job.id  :::::: ', job.id);
		console.log('JOBDETAILS VIEW repostJob ::', repostJob);
		//console.log("job.customer.user.id ", job, job.customer.user.id, user.id )
		if(job && user && (job.customer && (job.customer.user && (job.customer.user.id != user.id)))){
			window.location.href = "/dashboard?invaildUser=yes"
			return false
		}
		let jobStatusNot = ["Pending", "Draft"]
		console.log("jobStatusNot.indexOf(job.status) < 0 ", jobStatusNot.indexOf(job.status), jobStatusNot.indexOf(job.status) < 0)
		if(job &&  jobStatusNot.indexOf(job.status) < 0 && newPostJob == 'yes'){
			console.log(" job.status: after :: ", job)
			window.location.href = "/dashboard?mobileJobId="+jobId
			return false
		}
		sessionStorage.removeItem("hideHearAboutUsModal")	
		if (jobId !== '' && job && job.id && jobId === job.id && !repostJob  && newPostJob != 'yes') {

			// console.log("repost ::::::: ",repost)
			// console.log('job in detail view is ::',job)
			setTimeout(() => {
				setShowLoader(false);
			}, 800);
			if (isScheduleJob === 'yes') {
				console.log('isScheduleJob>>>>>>>>>>>>>>>>>>>>>>>>>');
				setScheduleJob(true)
				if (cardsInfo){
					setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
					// setComponentToRender('schedualeLater');
				}
				else{
					setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
					// setComponentToRender('jobDetailsView');
				}
			}
			else if (hireExpertTransferJob) {
				console.log('hireExpertTransferJob>>>>>>>>>>>>>>>>>>>>>>>>>');
				setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
				// setComponentToRender('jobDetailsView')
				setTimeout(() => {
					setShowTwoTierMessage(true)
					let softwareObject = job.subSoftware || job.software
					setPriceValueInThisComponent(softwareObject, true);
				}, 1000);
			}
			else {
				setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
				// setComponentToRender('jobDetailsView')
			}
			
		}else {
			setTimeout(() => {
				setShowLoader(false);
			}, 800);
			setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
			// setComponentToRender('jobDetailsView');
		}
	}, []);

	useEffect(() => {
		(async () => {
			// setIsLoading(true);
			const res = await SoftwareApi.getSoftwareList();
			if (res && res.data) {
				if (job && job.software) {
					let obj = res.data.find(obj => obj.id == job.software.id);
					setSoftware(obj);
				}
			}
		})();
	}, [job]);


	useEffect(() => {
		(async () => {
			console.log(">>> newCardAdded >>>",newCardAdded)
			console.log(">>>>> scheduleJob >>>> ",scheduleJob)
			console.log(">>>>> cardsInfo >>>>>>> ",cardsInfo, newPostJob)
			if (newCardAdded && job && user) {
				let lifeCycleTag = ''
				if (job && job.is_transferred && job.is_transferred == true) {
					lifeCycleTag = JobTags.CARD_ADDED_AFTER_TRANSFER;
				} else {
					lifeCycleTag = JobTags.CARD_ADDED;
				}

				if (job && job.id) {
					await JobCycleApi.create(lifeCycleTag, job.id);
				} else {
					await JobCycleApi.create(lifeCycleTag, false, user.id);
				}
			}

			console.log("newCardAdded::::::::::: ",newCardAdded)
			console.log("cardsInfo ::::::::: ",cardsInfo)
			console.log("newPostJob ::::::::",newPostJob)
			console.log("scheduleJob :::::::", scheduleJob)
			console.log("main condition ::: ",newCardAdded || ((cardsInfo && newPostJob == 'yes') && !scheduleJob))

			if (newCardAdded || ((cardsInfo && newPostJob == 'yes') && !scheduleJob)) {
				console.log(" job.status:: before :: ", job.status)
				if( job.status == "Accepted" && newPostJob == 'yes'){
					console.log(" job.status: after :: ", job.status)
					return window.location.href = "/dashboard?mobileJobId="+job.id
				}

				if (newPostJob == 'yes') {
					// this variable is used because it indicates that customer has visit this page after coming from geeker homepage 
					//and if geeker is asking card then its his second job ,while coming from home page job is already created so no need to create 
					//it again.
					const jobData = await updateJob(job.id, { status: "Pending" });
					GAevent('Conversion','new_job','Conversion',job.customer.id)
					let sendJobData = { ...job }
					// if(isMobile || isTablet){
					// 	if(sendJobData.status != "Pending"){
					// 		await confirmModaloFMobileTabletJobPosting("newPostJob ")
					// 		await emailOFMobileTabletJobPosting(sendJobData)
					// 	}
					// }else{
					// 	callFindTechnician(sendJobData);
					// }
					sendJobData.status = 'Pending'
					setUpdatedJobData(sendJobData);
					if(isMobile || isTablet){
						await confirmModaloFMobileTabletJobPosting("newPostJob 2 ")
						await emailOFMobileTabletJobPosting(sendJobData)
					}else{
						callFindTechnician(sendJobData);
					}

				} 
				else if ((newCardAdded && scheduleJob)) {
					setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
					// setComponentToRender('schedualeLater');
				}
				else {
					
					console.log("new cardAdded else part ")
					const dataToSave = getJobVar();
					dataToSave.customer = job.customer.id ? job.customer.id : job.customer;
					dataToSave.guestJob = false;
					console.log("dataToSave  >>>>>>>>>>", dataToSave);
					const jobData = await createJob(dataToSave);
					setJob(jobData)
					GAevent('Conversion','new_job','Conversion',dataToSave.customer)
					setUpdatedJobData(jobData);
					if(isMobile || isTablet){
						await confirmModaloFMobileTabletJobPosting("newPostJob 3")
						await emailOFMobileTabletJobPosting(jobData)
					}else{
						callFindTechnician(jobData);
					}
					setNewCardAdded(false);
				}
			}
			if (newCardAdded && scheduleJob  || (cardsInfo && scheduleJob)) {
				setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
				// setComponentToRender('schedualeLater');
			}
		})();
	}, [newCardAdded, cardsInfo]);

	useEffect(() => {
		(async () => {
			console.log("isScheduleJob ::::::::::::::::",isScheduleJob)
			if (job) {
				socket.emit("join", job.id)
			}
			// console.log('job>>>>>>>>>>>>',job)
			// console.log('job.id>>>>>>>>>>>>',job.id)
			if (user && job && job.id && !cardFunctionCalledFindTech) {
				fetchMyCardsInfo();
				setcardFunctionCalledFindTech(true);
				console.log(">>>>>>.here in the card section")
				const customerTypeValid = (user.customer.customerType ? user.customer.customerType !== 'test' : true);
				checkForCard(user, customerTypeValid)
			}


			if (jobId !== '' && job && job.id && jobId === job.id && !repostJob && !findTechnicainCalled && newPostJob != 'yes') {
				setTimeout(() => {
					setShowLoader(false);
				}, 800);
				setUpdatedJobData(job);
				findTechnicainCalled = true;
				if (isScheduleJob === 'yes') {
					console.log('isScheduleJob>>>>>>>>>>>>>>>>>>>>>>>>>');
					setScheduleJob(true)
					// setComponentToRender('schedualeLater');				
				} else if (hireExpertTransferJob) {
					console.log('hireExpertTransferJob>>>>>>>>>>>>>>>>>>>>>>>>>');
					setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
					// setComponentToRender('jobDetailsView')
					setTimeout(() => {
						setShowTwoTierMessage(true)
						setPriceValueInThisComponent(job.software, true);
					}, 1000);
				} else {
					console.log("inside usefeffect 3 >>>>>>>>>")
					// callFindTechnician(job);
				}
			}

		})();
	}, [user, job]);

	useEffect(() => {
		cardFunctionCalled = false;
		jobAndPaidJobHandler()
	}, []);

	useEffect(() => {
		if (user) {
			mixpanel.track('Customer - On Job Ready To Go Live Page', { 'Email': user.email });
		}
		jobAndPaidJobHandler();
	}, [user]);

	const jobAndPaidJobHandler = async () => {
		if (user && user.customer && !cardFunctionCalled) {
			const totalJobsCount = await getTotalJobs({ customer: user.customer.id });
			const totalPaidJobs = await getTotalPaidJobs({ customer: user.customer.id });
			console.log('totalJobsCount', totalJobsCount);
			console.log("totalPaidJobs >>>>>>>>",totalPaidJobs)
			setTotalJobs(totalJobsCount);
			setTotalPaidJobs(totalPaidJobs);
			cardFunctionCalled = true;
		}
	}

	// console.log("duration value "+ job.selectedValdur );
	const postDecline = () => {
		if (user) {
			let userId = user.id
			handleDecline(false, userId)
		}
	}

	//utkarsh Dixit
	//purpose : adjusting width of help chat
	useEffect(() => {
		let buttonIframe = document.querySelector('[title = "Message from company"]');
		if (buttonIframe) {
			// console.log("query selector ", buttonIframe);
			buttonIframe.classList.add("chatwidth");
		}
	}, [])

	const checkForCard = async (user, customerTypeValid) => {
		try {
			if (user && user.customer) {
				let customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
					user: user,
					liveUser: liveUser
				});
				console.log("customer_info >>>>>>>>>>>>", customer_info)
				if (customer_info.has_card_or_subscription == false && customerTypeValid) {
					// mixpanel code//
					setDisableButton(true)
					mixpanel.identify(user.email);
					mixpanel.track('Customer - Ask Credit Card');
					mixpanel.people.set({
						$first_name: user.firstName,
						$last_name: user.lastName,
					});
					// mixpanel code//
					setJobFlowStep(jobFlowsDescriptions['creditCardInformation'])
					// setIsModalOpen(true);
				}
			}
		}

		catch (err) {
			console.log("error in checkForCard")
		}
	}

	

	const findTechnician = async () => {
		checkGeekerAvailabilityTime(job);
		localStorage.setItem("btnClicked", btnclickedObj['getHelpNow'])
		// setBtnclicked(btnclickedObj['getHelpNow'])
		setDisableButton(true);
		// console.log('user ::',user)
		// if(!jobId || jobId === ''){
		setScheduleJob(false)
		setIfScheduleJob(false)
		console.log("findTecnician function running")
		let customer_info = { has_card_or_subscription: false }
		if (user) {
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Click on Get help Now');
		}
		//setTimeout(setDisableButton(false),10000);
		const dataToSave = await getJobVar();
		if (!user) {
			dataToSave.customer = `guest_${new Date().getTime()}`;
			dataToSave.guestJob = true;
			dataToSave.status = 'Draft'

			console.log("dataToSave", dataToSave)
			const res = await getGuestUser();
			console.log("this is the response :::::::: ", res)
			// console.log("setStep >>>>>>>>>>>>>>",setStep(1))
			if (res && res.token) {
				createJobAsGuest(dataToSave, res.token.accessToken).then(async (res) => {
					mixpanel.track('Customer guest Job Created', { 'JobID': res.id })
					setGuestJobId(res.id)
					await JobCycleApi.create(JobTags.DRAFT_JOB_CREATED, res.id);
					console.log(">>>>>>>>>>>>>>>>>>> 1  >>>>>>>>>>>>")
        			await emailOFMobileTabletJobPosting(res)
					setJobFlowStep(jobFlowsDescriptions['customerRegisterPage'])          
					// setJobFlowStep(4)
					// history.push(`/customer/register/${res.id}`);
				});
			}
		} else {
			let lifeCycleTag = ''
			if (job && job.is_transferred && job.is_transferred == true) {
				lifeCycleTag = JobTags.GET_HELP_NOW_AFTER_TRANSFER;
			} else {
				lifeCycleTag = JobTags.GET_HELP_NOW;
			}
			await JobCycleApi.create(lifeCycleTag, false, user.id);
			dataToSave.customer = job.customer.id ? job.customer.id : job.customer;
			dataToSave.guestJob = false;
			const totalJobsCount = await getTotalJobs({ customer: job.customer.id ? job.customer.id : job.customer });
			console.log('totalJobsCount>>>>>>>>>>>>>>', totalJobsCount);
			// if (totalJobsCount >= 1) {
			const customerTypeValid = (user.customer.customerType ? user.customer.customerType !== 'test' : true);
			if (user && user.customer) {
				customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
					user: user,
					liveUser: liveUser
				});
			}
			if (customer_info.has_card_or_subscription == false && customerTypeValid) {
				// mixpanel code//
				mixpanel.identify(user.email);
				mixpanel.track('Customer - Ask Credit Card');
				mixpanel.people.set({
					$first_name: user.firstName,
					$last_name: user.lastName,
				});
				// mixpanel code//
				// let data = checkAndCreateNewJob(dataToSave, totalJobsCount,false,false)
				// await fetchJob(data.id)
				//mixpanel code
				// mixpanel.identify(user.email);
				// mixpanel.track('Customer - Job created')
				setJobFlowStep(jobFlowsDescriptions['creditCardInformation'])
				// setIsModalOpen(true);
			} else {
				let lifeCycleTag = ''
				if (job && job.is_transferred && job.is_transferred == true) {
					lifeCycleTag = JobTags.HAVE_CARD_AFTER_TRANSFER;
				} else {
					lifeCycleTag = JobTags.HAVE_CARD;
				}
				
				if (job && job.id && !repostJob) {
					await JobCycleApi.create(lifeCycleTag, job.id, user.id);
				} else{
					await JobCycleApi.create(lifeCycleTag, false, user.id);
				}
				if (technicianId) {
					dataToSave['post_again'] = true
					dataToSave['post_again_reference_job'] = postAgainJobReference
					dataToSave['post_again_reference_technician'] = technicianId
				}
				if (repostJob) {
					let res =  checkAndCreateNewJob(dataToSave)
					// await fetchJob(job.id)
				} 
				if (hireExpertTransferJob) {
					console.log("inside usefeffect 5 >>>>>>>>>")
					if(isMobile || isTablet){
						await confirmModaloFMobileTabletJobPosting("newPostJob 4")
						await emailOFMobileTabletJobPosting(job)
					}else{
						callFindTechnician(job)
					}
				} else if (jobId !== '' && job && job.id && jobId === job.id && newPostJob != 'yes') {
					console.log("inside usefeffect 5 >>>>>>>>>")
					if(isMobile || isTablet){
						await confirmModaloFMobileTabletJobPosting("newPostJob 5")
						await emailOFMobileTabletJobPosting(job)
					}else{
						callFindTechnician(job)
					}
				} 
				else {
					let data = checkAndCreateNewJob(dataToSave, totalJobsCount)
					// await fetchJob(data.id)
					//mixpanel code
					mixpanel.identify(user.email);
					mixpanel.track('Customer - Job created')
					//mixpanel code
				}

			}
			// 	} else {
			// 		// mixpanel code//
			// 		if (technicianId){
			// 			dataToSave['technician'] = job.technician.id
			// 		}

			// 		if(hireExpertTransferJob){
			// 			callFindTechnician(job)
			// 		}else{
			// 			checkAndCreateNewJob(dataToSave,totalJobsCount,true)
			// 			//mixpanel code
			// 			mixpanel.identify(user.email);
			// 			mixpanel.track('Customer - First Job created')		
			// 			//mixpanel code
			// 		}


			// 	}
			// }
		}
	};

	/**
	 * Function will create a new job if not already posted and make the job live.
	 * @params =  dataToSave (Type:Object), totalJobsCount (Type:Number),firstjob(Type:Boolean)
	 * @response : Will call callFindTechnician function so the job gets live
	 * @author : Manibha
	 */
	const checkAndCreateNewJob = async (dataToSave, totalJobsCount, firstjob = false,sendTofindTechnician=true) => {
		console.log("function checkAndCreateNewJob called ........ *** ")
		if (newPostJob !== 'yes') {
			console.log("Inside if part of checkAndCreateNewJob ... *-*-*-*")
			if(isMobile || isTablet){
				dataToSave.status = 'Draft'
			}
			console.log("=== checkAndCreateNewJob before create job ",dataToSave)
			const jobData = await createJob(dataToSave);
			console.log("=== checkAndCreateNewJob after create job ",dataToSave)
			setJob(jobData)
			GAevent('Conversion','new_job','Conversion',jobData.customer.id)
			//Call Klaviyo api
			callKlaviyoAPI(jobData, totalJobsCount, firstjob)

			// console.log("jobData",jobData)
			setUpdatedJobData(jobData);
			console.log("inside usefeffect 7 >>>>>>>>>")
			if(isMobile || isTablet){
				await confirmModaloFMobileTabletJobPosting("newPostJob 5")
				await emailOFMobileTabletJobPosting(jobData)
			}else{
				if(sendTofindTechnician){
					callFindTechnician(jobData);
				}
			}
		} else {
			console.log("Inside else part of checkAndCreateNewJob ... *-*-*-*")
			console.log("inside usefeffect 8 >>>>>>>>>")
			
			if(isMobile || isTablet){
				await confirmModaloFMobileTabletJobPosting("newPostJob 6")
        		await emailOFMobileTabletJobPosting(job)
			}else{
				console.log(" job.status: before :: ", job.status)
				if( job.status == "Accepted" && newPostJob == 'yes'){
					console.log(" job.status: after :: ", job.status)
					return window.location.href = "/dashboard?mobileJobId="+job.id
				}
				console.log("inside usefeffect 8 >>>>>>>>>")
				if(sendTofindTechnician){

					//Call Klaviyo api
					callKlaviyoAPI(job, totalJobsCount, firstjob)
					
					callFindTechnician(job);
				}
			}
		}
	}

	/**
	* mixpanel track and show modal that you need to switch to desktop for technician redirect to dashboard
	* @author : Ridhima Dhir
	*/
	const confirmModaloFMobileTabletJobPosting = async (message = '') => {
		if(user && user.email){
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Job created from mobile or tablet')
		}
		Modal.confirm({
			title: "To better assist you please join from your computer.",
			content: 'Thanks for submitting a job, We are locating a Geek for you, Once a Geek is located We will notify you by email with a link to the job',
			okText: 'Ok',
			cancelButtonProps : { style: { display: 'none' } },
			className:'app-confirm-modal',
			onOk() {
				history.push("/")
			},
		});
	}

	/**
	* send email with job link for desktop
	* @params : job
	* @author : Ridhima Dhir
	*/
	const emailOFMobileTabletJobPosting = async (jobData) => {
		socket.emit('mobile_tablet_job_post_email', jobData);
	}

	const getJobVar = useCallback(() => {
		console.log("Data for job ", job);
		const dataToSave = {};
		dataToSave.software = job.software.id;
		dataToSave.subSoftware = (job.subSoftware && job.subSoftware.id ? job.subSoftware.id : job.subSoftware);
		dataToSave.expertise = job.expertise;
		dataToSave.subOption = job.subOption;
		dataToSave.issueDescription = job.issueDescription;
		dataToSave.jobDuration = job.selectedValdur;
		dataToSave.level = 'advanced';
		dataToSave.estimatedTime = (job.software ? job.software.estimatedTime : '0-0');
		if (hireValue) {
			dataToSave.estimatedPrice = (job.software ? job.software.twoTierEstimatePrice : '0-0');
		} else {
			dataToSave.estimatedPrice = (job.software ? job.software.estimatedPrice : '0-0');
		}
		dataToSave.status = 'Pending';
		dataToSave.hire_expert = hireValue;
		return dataToSave;
	});

	useEffect(() => {
		socket.on('not-found-30min', () => {
			setNotFound(true);
			setLoading(false);
			setJobFlowStep(jobFlowsDescriptions['notAccepted'])
		});
	}, []);

	const scheduleForLater = async () => {
		setIfScheduleJob(true)
		localStorage.setItem("btnClicked", btnclickedObj['scheduleJobLater'])
		// setBtnclicked(btnclickedObj['scheduleJobLater'])
		const dataToSave = {};
		setScheduleJob(true)
		let customer_info = { has_card_or_subscription: false }
		dataToSave.software = job.software.id;
		dataToSave.subSoftware = (job.subSoftware && job.subSoftware.id ? job.subSoftware.id : job.subSoftware);
		dataToSave.expertise = job.expertise;
		dataToSave.subOption = job.subOption;
		dataToSave.issueDescription = job.issueDescription;
		dataToSave.level = 'advanced';
		dataToSave.estimatedTime = (job.software ? job.software.estimatedTime : '0-0');
		dataToSave.estimatedPrice = (job.software ? job.software.estimatedPrice : '0-0');
		dataToSave.status = 'Draft';
		dataToSave.hire_expert = hireValue;
		if (user) {
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Click on Schedule for later button ');
		}
		if (!user) {
			dataToSave.customer = `guest_${new Date().getTime()}`;
			dataToSave.guestJob = true;
			dataToSave.scheduleJob = true;
			const res = await getGuestUser();
			if (res && res.token) {
				createJobAsGuest(dataToSave, res.token.accessToken).then(async (res) => {
					setGuestJobId(res.id)
					await JobCycleApi.create(JobTags.DRAFT_JOB_CREATED, res.id);
					setJobFlowStep(jobFlowsDescriptions['customerRegisterPage'])
				});
			}
		} else {
			console.log(' Job data>>>schedule', job)
			let lifeCycleTag = ''
			if (job && job.is_transferred && job.is_transferred == true) {
				lifeCycleTag = JobTags.SCHEDULE_AFTER_TRANSFER;
			} else {
				lifeCycleTag = JobTags.SCHEDULE;
			}
			await JobCycleApi.create(lifeCycleTag, false, user.id);
			const klaviyoData = {
				email: user.email,
				event: 'Scheduled Job Created',
				properties: {
					$first_name: user.firstName,
					$last_name: user.lastName,
				},
			};
			await klaviyoTrack(klaviyoData);

			setScheduleJob(true);
			if (user && user.customer) {
				customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
					user: user,
					liveUser: liveUser
				});
			}
			console.log("cardsInfo >>>>>>>>> in schedule later ", customer_info)
			setCardsInfo(customer_info.has_card_or_subscription)
			if (customer_info.has_card_or_subscription == false && user.customer.customerType === 'live') {
				// setIsModalOpen(true);
				setJobFlowStep(jobFlowsDescriptions['creditCardInformation'])
			} else {
				console.log('schedule>>>>>>>>>>>>>>>>>>>>>>>>');
				if (job && job.id && !repostJob) {
					await JobCycleApi.create(JobTags.HAVE_CARD, job.id, user.id);
				} else {
					await JobCycleApi.create(JobTags.HAVE_CARD, false, user.id);
				}
				setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
				// setComponentToRender('schedualeLater');
			}
		}
	};

	useEffect(() => {
		if (job) {
			if (job.id === jobId) {
				fetchMyCardsInfo();
			} else if (jobId === '') {
				fetchMyCardsInfo();
			}
		}
	}, [job]);
	useEffect(() => {
		console.log("cardsInfo after >>>>>>>>> set", cardsInfo)
	}, [cardsInfo])
	async function fetchMyCardsInfo() {
		await refetch();
		// console.log('user in fetchMyCardsInfo',user)
		if (user && user.customer) {
			const customer_info = await CustomerApi.checkIfOrganisationHasSubscription({
				user: user,
				liveUser: liveUser
			});
			console.log("customer_info :::::: ", customer_info)
			setCardsInfo(customer_info.has_card_or_subscription);
		}
		if (newPostJob != 'yes') {
			setShowLoader(false);
		}
	}

	/**
	 * Checking Geeker Availability of time
	 * @params = ''
	 * @response : Will check if the job post time is between 9am to 9pm (EDT) and returns boolean value.
	 * @author : Manibha
	 */

	function checkGeekerAvailabilityTime(jobData) {
		const nonWorkingDays = [6, 7];
		const usTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
		const usDay = usTime.getDay();
		const workingHours = usTime.getHours(); 
		const customerTypeValid = (user && user?.customer?.customerType ? user?.customer?.customerType !== 'test' : true);
		console.log("workingHours :::: >>>>>>",workingHours)
		if ((((workingHours > 21 || workingHours < 9) && customerTypeValid)) || (nonWorkingDays.includes(usDay) && customerTypeValid)) {
			// mixpanel code//
			mixpanel.identify(user?.email);
			mixpanel.track('Customer - Before or after hours job', { 'usTime': usTime, 'issue': jobData.id });
			mixpanel.people.set({
				$first_name: user?.firstName,
				$last_name: user?.lastName,
			});
			// mixpanel code//
			if(!checkGeekerAvailabilityTimeVariable){
				openNotificationWithIcon('info', 'Info', "Please note that as it's after Geeker business hours, we cannot guarantee a technician at this time. But we understand that tech emergencies happen at all hours, so we'll do our best to locate one of our experts for you!");
				checkGeekerAvailabilityTimeVariable = true;	
			}
			setAfterGeekerHours(true)

		}
	}

	async function callFindTechnician(jobData) {
		console.log('callFindTechnician CALLED.........................', jobData);
		checkGeekerAvailabilityTime(jobData);
		console.log('Call function for checking time tech availability')
		if (user.aciveStatus === false) {
			return openNotificationWithIcon('info', 'Info', INACTIVE_ACCOUNT_MESSAGE);
		}
		if (jobData) {
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Find Technician');
			mixpanel.people.set({
				$first_name: user.firstName,
				$last_name: user.lastName,
			});
			// mixpanel code//
			let lifeCycleTag = ''
			if (jobData && jobData.is_transferred && jobData.is_transferred == true) {
				lifeCycleTag = JobTags.FINDTECH_AFTER_TRANSFER;
			} else {
				lifeCycleTag = JobTags.FINDTECH;
			}
			await JobCycleApi.create(lifeCycleTag, jobData.id);
			await JobCycleApi.update({ "UserId": user.id, "JobId": jobData.id })
			await fetchJob(jobData.id)
			setJobFlowStep(jobFlowsDescriptions['jobAlivePage'])
			// setComponentToRender('jobAlive');
		}
	}

	const issueDescriptionValue = useMemo(() => {
		let value = '';
		if (issueDescription && typeof (issueDescription) != 'string') {
			const { blocks } = convertToRaw(issueDescription.getCurrentContent());
			value = (blocks && blocks.length) && blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
			value = value === '\n' ? '' : value;
		}
		if (typeof (issueDescription) == 'string') {
			value = issueDescription;
		}
		return value
	}, [issueDescription]);

	function setback() {
		if (job) {
			setSubSoftware((job.subSoftware ? job.subSoftware : undefined));
			setExpertise(job.expertise);
			setSubOption(job.subOption);
			setIssueDescriptionback(job.issueDescription);
			setGuestJobValue(job.guestJob)
			// setMainPageStep(1)
			setJobFlowStep(jobFlowsDescriptions['issueDescription'])
			// setComponentToRender('issueDescription')
		}
	}

	const hireCheckboxChange = (e) => {
		const value = e.target.checked;
		setHireValue(value);
		setShowLoader(true);

		if (value) {
			set_price_value(job.software, true);
		} else {
			set_price_value(job.software);
		}

		setTimeout(() => {
			setShowLoader(false);
		}, 800);
	};


	const calculatePrice = (softwareData,hire_expert=false,forfreeMinutes=false)=>{
		let initPriceToShow = 0;
		let finalPriceToShow = 0;
		try{
			let price_per_six_min = softwareData.rate
			let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
			let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)
			let main_price = ''
			if (hire_expert) {
				main_price = softwareData.twoTierEstimatePrice
			} else {
				main_price = softwareData.estimatedPrice
			}
			console.log("> main price >>>>>>>>> ",main_price)
			let price1 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[0]) : 0)
			let price2 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[1]) : 0)

			price1 = (price1 ? price1 : price_per_six_min)
			price2 = (price2 ? price2 : price_per_six_min)
			initPriceToShow = forfreeMinutes ?(Math.ceil(time1 / 6)-1) * parseInt(price1) :Math.ceil(time1 / 6) * parseInt(price1)
			finalPriceToShow = forfreeMinutes ? (Math.ceil(time2 / 6) - 1) * parseInt(price2) : Math.ceil(time2 / 6) * parseInt(price2)

			initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 0)
			finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 0)
			
			console.log("initPriceToShow >>>>>>>>>> ",initPriceToShow)
		}
		catch(err){
			console.log("issue in calculating price :::: ",err)
		}
		return {initPriceToShow:initPriceToShow,finalPriceToShow:finalPriceToShow}
	}

	/**
	 * Function will set price value according to the hire expert variable.
	 * @params =  softwareData (Type:Object), hire_expert (Type:Boolean)
	 * @response : no response
	 * @author : Manibha
	 */
	const setPriceValueInThisComponent = (softwareData, hire_expert = false) => {
		let {initPriceToShow,finalPriceToShow} = calculatePrice(softwareData,hire_expert)
		setInitialPrice(initPriceToShow)
		setFinalPrice(finalPriceToShow)
	}
	
	/**
	 * Function will send the data to Klaviyo when added new job
	 * @params =  jobData (Type:Object), totalJobsCount (Type:Int), firstjob (Type:Bool)
	 * @response : no response
	 * @author : Karan
	 */
	const callKlaviyoAPI = async(jobData, totalJobsCount, firstjob) => {
		try{
			console.log("User data ::", user)
			console.log("jobData data ::", jobData)
			if(user && jobData){
				console.log("Inside if part of callKlaviyoAPI ")
				const klaviyoData = {
					email: user.email,
					event: 'Job Created',
					properties: {
						$first_name: user.firstName,
						$last_name: user.lastName,
						$job: jobData.id,
						$total_jobs: totalJobsCount,
						$software_name: jobData?.software?.name,
					},
				};
				if (firstjob) {
					klaviyoData['properties']['$first_job'] = true
				}
				console.log("klaviyoData ::",klaviyoData)
				await klaviyoTrack(klaviyoData);
			}			
		}
		catch (err) {
			mixpanel.identify(user?.email);
			mixpanel.track('There is catch error while creating job (callKlaviyaAPI) ::::', { scheduleJobData: jobData, errMessage: err.message });
			console.log('There is catch error while creating job (callKlaviyaAPI)  :::: '+ err.message)
		}
	}


	return (
		<>
			{showLoader? <Loader height="100%" className={'loader-outer'} /> :
				(
					<Container span={24} className="">
						{/*newPostJob === 'yes'&&
							<Loader  height="100%" className={'loader-outer'} />
						*/}
						{/* <Loader height="85%" className={(showLoader ? 'loader-outer' : 'd-none')} /> */}
						<Logo user={user} />
						<StepTitle className=" job-heading-text mt-30 font-nova my-0">Let us solve your problem - fast.</StepTitle>
						<div className="subHeading text-centre mx-auto font-nova mar-bot-20">
                            <span>Please review your summary and estimates.</span>
                        </div>
						<BodyContainer span={24} className="px-0">

							<Row className=" col-xs-12 px-0 d-flex flex-row flex-start font-nova"> 
								<Col className="col-lg-5 col-xs-12 px-0 d-flex">
	                                <ItemLabel className="col-xs-lg-12 px-0 float-left d-flex flex-wrap justify-around text-label font-nova textTransform-none max-width-990-soft-name">
	                                    <span className="mr-3 padding-top-5" >Software </span> <RoundSelectors  software={job.subSoftware || job.software}   onClick={()=>{return}} active={false} isBtn={false} ></RoundSelectors>
	                                 </ItemLabel>
	                            </Col>
	                            { job &&  job?.subOption != undefined && job?.subOption != "" && 
	                            	<Col className="col-lg-5 col-xs-12 px-0 col-sm-12">
		                                 <ItemLabel className="col-xs-lg-12 px-0 float-left d-flex flex-wrap justify-around text-label font-nova textTransform-none max-width-990-soft-name">
		                                    <span className="mr-3 padding-top-5">Area  </span>  <RoundSelectors software={job.subOption} onClick={()=>{return}} active={false} isBtn={false}></RoundSelectors>
		                                 </ItemLabel>
	                            	</Col>
	                            }
                            </Row>
							<Description className="text-left font-nova mb-4">
								<ItemLabel className=" text-left text-label my-0 textTransform-none">

                                    Description 
                                 </ItemLabel>
								<div>
									<span className="desc-format font-nova" title={job ? job.issueDescription : ''}>
										{console.log("job.issueDescription>>>>>>>>>>>>>>>>>>>>",job.issueDescription)}
										{job ? job.issueDescription : ''}
										{' '}
										{repostJob && <FontAwesomeIcon style={{cursor:'pointer'}} icon={faEdit} onClick={setback} title="Click to change job summary." />}
									</span>
								</div>

							</Description>


							{!priceLoaded && (
								<Box display="flex" justifyContent="center">
									<div className="myspindiv">
										{' '}
										<Spin />
									</div>
								</Box>
							)}																														

							{priceLoaded
								&& (
									<div className="d-flex justify-content-between col-10 mx-0 px-0   solution-review-box text-label font-nova">
										{/*job.selectedValdur == lessThan2Hours && 
											<ContentAccordingToLongJob totalJobs={totalJobs} user={user} showToolTip={showToolTip} setShowToolTip={setShowToolTip} job={job} estimatedDuration ={estimatedDuration} intialPrice={intialPrice} finalPrice={finalPrice} totalPaidJobs={totalPaidJobs} />
										*/}
										<ContentAccordingToLongJob totalJobs={totalJobs} user={user} calculatePrice={calculatePrice}  showToolTip={showToolTip} setShowToolTip={setShowToolTip} job={job} estimatedDuration ={estimatedDuration} estimatedWait ={estimatedWait} intialPrice={intialPrice} finalPrice={finalPrice} totalPaidJobs={totalPaidJobs} softwareData = {job.subSoftware || job.software} />
									</div>
								)}
							{job.selectedValdur == moreThan2Hours && 
								<div className=" text-left long-job-text font-italic">
									Your technician is moments away. On an initial call, you'll get a full quote of how long your job will take, and an exact price. (Don't worry: this is free.)
								</div>
							}


							{ /*code commented by manibha on 15 april 22 as meyer is not ready for 2-tier. */}
							{/* <Box width="100%" className="hire-expert-div">
									    <Checkbox className="hire-expert-check" onChange={hireCheckboxChange}>Would you like to hire expert with premium price?</Checkbox>
									</Box>  */}


							<Row width="100%" className="job-detail-btn mt-200 d-flex justify-content-between">
								<div className=""> 
								{!repostJob && (
									<Button onClick={setback} className="btn sm-btn-back hw-60 float-left"><span> </span><FontAwesomeIcon icon={faArrowLeft} className='arr-size' /></Button>
								)}
								</div>
								
								<div>
									<Button type="back" onClick={scheduleForLater} title="Schedule your job for a later date." className="btn font-nova app-btn float-left btn-schedule-later ml-3 min-height min-width-247 max-width-btn-width">
									Schedule help for later
									{' '}
									<span />
								</Button>
								<Button onClick={findTechnician} disabled={disableButton} className="btn font-nova app-btn app-btn float-left btn-get-help min-height decline-btn max-width-btn-width">
									{disableButton ? <Spin /> : "Get help now"}
									<span />
								</Button>
								</div>
							</Row>
						</BodyContainer>


						<Box display="flex" justifyContent="center" width="100%" marginTop={14}>
                              
						</Box>

						{user && user.customer && user.customer.customerType && user.customer.customerType !== 'test' && job &&
							<Elements stripe={stripePromise}>
								<AddCardForm user={user} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} cardsInfo={cardsInfo} setCardsInfo={setCardsInfo} newCardAdded={newCardAdded} setNewCardAdded={setNewCardAdded} showCards={false} setDisableButton={setDisableButton}
								/>
							</Elements>
						}

					</Container>
				)}
			{/* {componentToRender === 'jobAlive'
				&& (
					<JobAlive
						updateJob={updateJob}
						job={updatedJobData}
						setComponentToRender={setComponentToRender}
						estimatedWait={estimatedWait}
						mainEstimatedWait={mainEstimatedWait}
						setIsTechNotFoundInSearch={setIsTechNotFoundInSearch}
						afterGeekerHours = {afterGeekerHours}
						scheduleForLater = {scheduleForLater}
					/>
				)}

			{componentToRender === 'notAccepted'
				&& <NotAccepted handleDecline={handleDecline} job={updatedJobData} setComponentToRender={setComponentToRender} notFound={notFound} loading={loading} setLoading={setLoading} afterGeekerHours={afterGeekerHours} />}

			{componentToRender === 'schedualeLater'
				&& (
					<Schedule
						createJob={createJob}
						handleDecline={handleDecline}
						job={updatedJobData}
						setComponentToRender={setComponentToRender}
						cardsInfo={cardsInfo}
						totalJobs={totalJobs}
						setIsModalOpen={setIsModalOpen}
						isTechNotFoundInSearch={isTechNotFoundInSearch}
						hireValue={hireValue}
						technicianId={technicianId}
						repostJob={repostJob}
						postAgainJobReference={postAgainJobReference}

					/>
				)} */}

		</>
	);
}



const Container = styled(Col)`
	display: flex !important;
	width: 100%;
	border-radius: 10px;
	margin-top: 20px;
	flex-direction: column;
`;

const Description = styled(Text)`
	font-size: 18px;
	font-weight: 600;
	opacity: 0.8;
	p{
		width:100%;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight:bold;
		cursor:pointer;
		margin-bottom:unset;
	}
`;

const ItemLabel = styled.div`
	color: #8c8c8c;
	font-weight: 700;
	opacity: 0.4;
	text-transform: uppercase;
	margin-top: 30px;
	margin-bottom: 30px;
`;

const ItemDescription = styled(Text)`
	opacity: 0.8;
	font-weight: 700;
	font-style: italic;
`;

const EstimationItem = styled(Text)`
	font-family: var(--novaboldtheme) !important;
	color: #2F3F4C !important;
	font: normal normal bold 24px/40px Proxima Nova;
`;

/* const DeclineButton = styled(Button)`
	display: flex !important;
	border: none !important;
	font-weight: 700 !important;
	padding: 0 30px !important;
	height: 60px !important;
	justify-content: center;
	align-items: center;
`; */

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

/* const SystemIcon = styled.img`
	width: 35px;
	padding: 5px;
`; */
const SoftwareImage = styled.img`
	width: 50px;
	height: auto;
`;

//Following comopnent displays the estimated duration and price for long job
const ContentAccordingToLongJob = (props)=>{
	const GetPrice = (props)=>{
		try{
			let {initPriceToShow:initPriceToShow,finalPriceToShow:finalPriceToShow} = props.calculatePrice(props.softwareData,false,true)
			console.log("initPrice to show :::::::::::: ",initPriceToShow)
			console.log("finalPriceToShow >>>>>>>>>>>>>>>>>>> ",finalPriceToShow)
			return <>${initPriceToShow}-${finalPriceToShow}</>
		}
		catch(err){
			console.log("error in GetPrice",err)
		}
		return <></>
	}
		return <>
				<div className='text-left'>
					<ItemLabel className="text-label mar-bot-neg-10 mb-1 dark text-left textTransform-none ">Estimated wait time</ItemLabel>

					<EstimationItem>
						{(props.estimatedWait !== 'NA' ? `${props.estimatedWait}` : props.estimatedWait)}
					</EstimationItem>

				</div>
				
				<div  className='text-left'>
					<ItemLabel className="text-label mar-bot-neg-10 mb-1 text-left textTransform-none">Estimated task completion time</ItemLabel>
					<EstimationItem className='text-left'>
						{(props.estimatedDuration !== 'NA' ? `${props.estimatedDuration} minutes`  : props.estimatedDuration)}
					</EstimationItem>
				</div>
				

				<div  className='text-left'>
					<ItemLabel className="text-label mb-1 dark text-left textTransform-none mar-bot-neg-10">Estimated price</ItemLabel>
					<EstimationItem>
						<div className="d-flex">
							<div className={(!props.user || props.totalPaidJobs === 0 ?'strike-through' : "")}>
							{(props.intialPrice !== 'NA' ? `$${props.intialPrice}-$${props.finalPrice}` : props.intialPrice)}</div>&nbsp;&nbsp;
							{!props.user || props.totalPaidJobs === 0 ? (props.intialPrice !== 'NA' ? <GetPrice softwareData={props.softwareData} calculatePrice={props.calculatePrice} /> : props.intialPrice) : ""}

							<div className='toolTipwrapper font-nova'>
								{!props.user || props.totalPaidJobs === 0  ?  <FontAwesomeIcon onMouseEnter={()=>props.setShowToolTip(true)} onMouseLeave={()=>props.setShowToolTip(false)} style={{fontSize: '25px', cursor: 'pointer', marginTop: '10px', marginLeft: '20px',color: '#1bd4d5'}} icon={faQuestionCircle} ></FontAwesomeIcon> : ""}
								{/* {props.user  ? "" : <FontAwesomeIcon onMouseEnter={()=>props.setShowToolTip(true)} onMouseLeave={()=>props.setShowToolTip(false)} style={{fontSize: '25px', cursor: 'pointer', marginTop: '10px', marginLeft: '20px',color: '#1bd4d5'}} icon={faQuestionCircle} ></FontAwesomeIcon>} */}
								{props.showToolTip && (<><div className="triangle"></div>
								<div className="toolTip">
									First 6 minutes free for new user!
								</div></>)}
							</div>
						</div>
					</EstimationItem>
				</div>
			</>
	}

export default JobDetailView;