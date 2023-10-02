import React, { useEffect, useState,useRef } from 'react';
import { Row, Col, Typography, Modal, Spin } from 'antd';
import styled from 'styled-components';
// import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { useLocation, useParams } from 'react-router';
import { getFullName, openNotificationWithIcon,get_or_set_cookie } from '../../../../utils';
import { useHistory } from 'react-router-dom';
// import alertIcon from '../../../../assets/images/alert.png';
// import excelIcon from '../../../../assets/images/excel.png';
// import StepButton from '../../../../components/StepButton';

// import { hourlyData } from '../../../../constants';
import * as JobApi from '../../../../api/job.api';
import * as JobCycleApi from '../../../../api/jobCycle.api';
import { JobTags } from '../../../../constants/index.js';
import { useUser } from '../../../../context/useContext';
import { useSocket } from '../../../../context/socketContext';
import * as TechnicianApi from '../../../../api/technician.api';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import * as WebSocket from '../../../../api/webSocket.api';
import {useNotifications} from '../../../../context/notificationContext';
import Loader from '../../../../components/Loader';
import FeedbackCompulsionModal from '../../feedbackCompulsion';
import {useServices} from '../../../../context/ServiceContext';
import { useFeedback } from '../../../../context/feedbackContext';
import * as JobService from "../../../../api/job.api";
import { find } from 'lodash';



const { Text } = Typography;

/*const renderTime = ({ remainingTime }) => {

	// if (remainingTime === 0) {
	//   window.location.href = '/dashboard';
	// }

	return (
		<div className="timer">
			<div className="value">{remainingTime}</div>
		</div>
	);
};*/

const NewJob = ({ setStep,job_arr,handleDecline ,set_job_arr,hiddenElement,setHiddenElement,mainJob,key,setKey,active,setMainJob,setWebSocketId,handleStartCall}) => {
	const { jobId } = useParams();
	const clock = useRef()
	const [techId,setTechId] = useState("");
	const { user } = useUser();
	const location = useLocation();
	const { socket } = useSocket();
	const history = useHistory();
	
	const {fetchNotifications} = useNotifications();
	const [isLoading, setIsLoading] = useState(true);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [FeedbackJobId, setFeedbackJobId] = useState('');
	const [showDisableAcceptbutton, setShowDisableAcceptbutton] = useState(false);
	const { checkIfTwoTierJobAndExpertTech } = useServices();
	const { getFeedback, createFeedback, updateFeedback } = useFeedback();
		

	// const appendedBorder = active=> ({border:"1px solid green"})
	// const [selectedJob, setSelectedJob] = useState({});
	const paramsJobId = useParams("jobId")
	const [acceptClicked, setAcceptClicked] = useState(true);
	useEffect(()=>{
		if(job_arr && job_arr[0] && paramsJobId.jobId === job_arr[0].id){
			socket.emit("join",jobId)
		}
	},[])
	useEffect(()=>{
		if(job_arr && job_arr[0] && paramsJobId.jobId === job_arr[0].id){
			setIsLoading(false);
			setAcceptClicked(false)
		}
		setTimeout(function(){
			setIsLoading(false);
		},30000)
	},[job_arr])
	useEffect(()=>{
		if(job_arr.length >0 && job_arr.length === hiddenElement.length){
			window.location.href= "/"
		}
	},[hiddenElement])
	
	/*const removeJob = (e)=>{
		let job = JSON.parse(e.currentTarget.name)
		console.log(">>>>>>>",job)
	}*/


	useEffect(()=>{
		socket.on('accept-job', async(job) => {
		console.log("jobId >>>>>>>>>>>>>>>>>>>>> ",jobId)
		console.log("job >>>>>>>>>>>>>>>>>>>>>>>>>>>",job)
		console.log("accept-job socket received on technician side to change the page to meeting")
		if(job.technician && user ){
		  try {
				 WebSocket.updateSocket(job['web_socket_id'],{'hitFromTechnicianSide':true})
				
			  }
		  catch(err) {
			  console.log('accept-job error in newjob  one>>>',err)
		  }

		  try{
			 const res =  await JobApi.retrieveJob(jobId);
				console.log("res >>>>>>>>>>>>>>>>>>>>>>>>> ",res)
				if(res.technician.user.id === user.id){
					get_or_set_cookie(user)
				   window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
				}
			  }catch(err) {
			  	get_or_set_cookie(user)
			  console.log('accept-job error in newjob two>>>',err)
			  if(jobId == job.id){
				  window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
			  }
		  }
		 
		}
	   
	  });
	},[socket])	


	useEffect(() =>{
		if(user){
			mixpanel.track('Technician - On New Job Request Page ', { 'Email': user.email });
		}
		(async () => {
			if(user != undefined && user.technician != undefined && mainJob != undefined){
				console.log("job_arr >>>>>>>",job_arr)
			 	let value = await checkIfTwoTierJobAndExpertTech(user.technician,mainJob)
			 	console.log('value>>>>>>> of expert array',value)
				console.log("useeffect, before if");
			 	if(!value){
				console.log("useeffect, in If");
				console.log('value>>>>>>>',value)

			 		setShowDisableAcceptbutton(true)
					openNotificationWithIcon('error', 'Error', 'This job is for expert technicians.You cannot accept this job.');
                    value = undefined;
			 	}
			}
		})();

	},[user,mainJob])



	const handleOnDecline = (e,job)=>{
			Modal.confirm({
				title: 'Are you sure you want to decline this job?',
				okText: 'Yes',
				cancelText: 'No',
				className:'app-confirm-modal',
				onOk(e) {
					handleOnDeclineSubmit(job);
					Modal.destroyAll()
				},
			});
	}
	const handleOnDeclineSubmit = (selectedJob)=>{
		if(user){
			 // mixpanel code//
			 fetchNotifications({"user":user.id})
			 mixpanel.identify(user.email);
			 mixpanel.track('Technician - Job declined',{'JobId':jobId});
			// mixpanel code//
			}
		// console.log("selectedJob",selectedJob)
		// let jobData = JSON.parse(e.target.name)
		handleDecline(selectedJob)
	}
	const handleAccept = async (e) => {
		setAcceptClicked(true)
		let job = JSON.parse(e.currentTarget.name)
		let jobId = job.id
		setMainJob(job.id)
		const check_feedback = await JobApi.checkLastJobFeedback({'technician':user.technician.id});
		let TwoTiervalue = await checkIfTwoTierJobAndExpertTech(user.technician,job)
		const res = await JobApi.retrieveJob(jobId);

		if(check_feedback.job_id != undefined){
			// if feedback not given
			console.log('check_feedback>>>>>>>',check_feedback)
			setShowFeedbackModal(true)
			setFeedbackJobId(check_feedback.job_id)
		}	
		else if(!TwoTiervalue){
			openNotificationWithIcon('error', 'Error', 'This job is for expert technicians.You cannot accept this job.');
			setTimeout(()=>{
				history.push('/')
			},500)  
		}
		else if(res.status === 'Declined'){
			openNotificationWithIcon('error', 'Error', `The job has been declined by customer.`)
			if(job_arr.length === 1){
					history.push('/')
			}else{
				set_job_arr(job_arr.filter(item => item.id !== job.id))
			}
		}
		else if(res.declinedByCustomer.includes(user.technician.id)){
			openNotificationWithIcon('error', 'Error', `Your proposal has been declined by customer.`)
			if(job_arr.length === 1){
				history.push('/')
			}else{
				set_job_arr(job_arr.filter(item => item.id !== job.id))
			}
		}
		else if(res.technician && res.technician.id && res.technician.id === user.technician.id){
			if(user){
				 // mixpanel code//
				 mixpanel.identify(user.email);
				 mixpanel.track('Technician - Same job accepted again.',{'JobId':jobId});
				// mixpanel code//
			}

			openNotificationWithIcon('success', 'Success', 'Job has already been accepted by you.');
			setTimeout(()=>{
				history.push('/')
			},500)  

		}else if(res.technician){
			if(user){
				 // mixpanel code//
				 mixpanel.identify(user.email);
				 mixpanel.track('Technician - Job accepted but job already taken.',{'JobId':jobId});
				// mixpanel code//
			}

			openNotificationWithIcon('error', 'Error', 'Sorry!.The job has been taken.');
			setTimeout(()=>{
				history.push('/')
			},500)  

		}else{
			// accept job if nothing else is wrong
			if(res.status !==  'Declined' && !res.declinedByCustomer.includes(user.technician.id)){
				acceptJobFinally(jobId,user,res)
				let lifeCycleTag = ''
				if(job.is_transferred && job.is_transferred == true){
					lifeCycleTag = JobTags.TECHNICIAN_ACCEPT_AFTER_TRANSFER;
				}else{
					lifeCycleTag = JobTags.TECH_ACCEPT_JOB;
				}
				await JobCycleApi.create(lifeCycleTag, jobId);
			}
		}

	};



	const acceptJobFinally = async(jobId,user,job)=>{
		if(user){
			// mixpanel code//
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Job accepted',{'JobId':jobId});
			// mixpanel code//
		}

		let webSocket = await WebSocket.create({'hitFromTechnicianSide':true,'user':user.id,'job':job.id,'socketType':'new-appointment-request','userType':'technician'})
		let data_to_send = {
			jobId,
			customerEmail:(job && job.customer) ? job.customer.user.email : '',
			mainJob :job,
			technicianName : (user && user.technician) ? user.firstName : "*****",
			customer: (job && job.customer) ? job.customer.id : '',
			technician: (user && user.technician) ? user.technician.id : techId,
			userIds:
				location.state && location.state.userIds
					? location.state.userIds.filter(item => item !== user.id)
					: [],
			web_socket_id : webSocket.websocket_details.id,
			softwareName:job.software.name
		}

		setWebSocketId(webSocket.websocket_details.id)
		if(user.technician && user.technician.id){
			WebSocket.technician_accepted_customer(data_to_send)
		}else{
			window.location.reload()
		}
		
		socket.on("call-failed",(msg)=>{
				openNotificationWithIcon('error', 'Error', `Call not Connected Due to  ${msg}`)
				setStep(2);
		})
		try {
			JobApi.sendJobAcceptEmail(jobId);
			openNotificationWithIcon('success', 'Success', 'We have sent email to the customer.');
			setStep(2);
		} catch (err) {
			openNotificationWithIcon('error', 'Error', 'We have failed to send email.');
		}
	}

	const getEstimateEarning = (job) => {
		if(job){

			let softwareData = (job.subSoftware ? job.subSoftware : job.software)

			let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
			let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1  ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)

			let price_per_six_min = softwareData.rate
			let price1 = (softwareData && String(softwareData.estimatedPrice).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedPrice).split("-")[0]) : 0)
			let price2 = (softwareData && String(softwareData.estimatedPrice).indexOf('-') !== -1  ? parseInt(String(softwareData.estimatedPrice).split("-")[1]) : 0)
			// console.log("price_per_six_min customer/jobcreate :: ",price_per_six_min)            
			// if(price_per_six_min > 0){
			price1 = (price1 ? price1 : price_per_six_min )
			price2 = (price2 ? price2 : price_per_six_min )
			console.log("price1 >>>>>>",price1)
			console.log("price 2 >>>>>>",price2)
			let initPriceToShow = (time1/6)*parseInt(price1)
			initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 'NA')
			let finalPriceToShow = (time2/6)*parseInt(price2)
			finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 'NA')
			console.log("initPriceToShow >>>",parseInt(initPriceToShow))
			console.log("finalPriceToShow >> ",parseInt(finalPriceToShow))
			let initPriceAfterComission = "$"+(parseInt(initPriceToShow) - ((parseInt(softwareData.comission)/100) * parseInt(initPriceToShow))).toFixed(0)
			let finalPriceAfterComission = "$"+(parseInt(finalPriceToShow) - ((parseInt(softwareData.comission)/100) * parseInt(finalPriceToShow))).toFixed(0)

			return `${initPriceAfterComission}-${finalPriceAfterComission}`;
		}else{
			return 'NA';
		}
		
	}

	/*useEffect(()=>{
		if(user){
			console.log("job is ")
			console.log("user is ",user)
		}
	},[user])*/


	// @ autor : Utkarsh Dixit
	// purpose : check feedback for last job and set modal true
	const checkFeedback = async () => {
			// console.log("In side the fucntion")
			const findJob = await JobService.findJobByParams({'technician':user.technician.id},{page:1,pageSize:1});
			if(findJob != undefined){
				if(findJob.jobs != undefined && findJob.jobs.data != undefined && findJob.jobs.data.length > 0){
					if(findJob.jobs.data[0].status === 'Completed'){
						// console.log("value of find job",findJob);
						const feedbackDataRes = await getFeedback(findJob.jobs.data[0].id);
						setFeedbackJobId(findJob.jobs.data[0].id);
						// console.log("Value of feedback res", feedbackDataRes);
						if(feedbackDataRes && feedbackDataRes.length == 0){
							setShowFeedbackModal(true);
						}
					}
				}	
			}		
	  };

	useEffect(()=>{
     checkFeedback();
	},[])

	if (isLoading) return <Loader height="100%" />;



	return (
		<Container span={15}>
			<StepContainer ref={clock}>
				{job_arr.length > 0 &&
					<>
					{ job_arr.map((job,index)=> 
						<NewJobContainer  className={((hiddenElement.indexOf(job.id) !== -1 && hiddenElement != null  )?" hideOnJob ":"")+(job.appended?" appendedBorder ":"")}>
							<Div> 
								<Row
									span={24}
									style={{
										alignItems: 'left',
										marginBottom: '30px',
									}}
								>
									<Col xs={24}  lg={12}>
										<Row>
											<AlertTileBox>
												<FontAwesomeIcon className="alert-icon" icon={faExclamationCircle} />
												<Title className = "alert-title">{user.firstName} there's a job request waiting for you! {job.hire_expert && '(2-Tier)'}</Title>
											</AlertTileBox>
										</Row>
									</Col>
									<Col xs={24}  lg={12} >
										<FileButtonContainer span={24} style={{ marginTop: '0px' }}>
											{/*<SystemIcon src={excelIcon} />*/}
											<SoftwareImage src={job.subSoftware ? job.subSoftware.blob_image : job.software.blob_image} />
											{' '}
											{job.subSoftware ? job.subSoftware.name : job.software.name}
										</FileButtonContainer>
									</Col>	
								</Row>

								<Row style={{ marginBottom: '20px' }}>
									<Title className="title-font" style={{ fontSize: '20px' }} >
										{job && getFullName(job.customer?.user)}
										{' '}
										is looking for help with
									</Title>
								</Row>

								<Row>
									<Title className="label-name" >ISSUE</Title>
								</Row>
								<Row>

									<SubTitle className="label-value"><p title={job ? job.issueDescription : ''}>{job ? job.issueDescription : ''} </p></SubTitle>
								</Row>

								<Row>
									<Title className="label-name mt-3" >JOB DURATION</Title>
								</Row>
								<Row>

									<SubTitle className="label-value"><p title={job ? job.jobDuration : ''}>{job ? job.jobDuration: ''} </p></SubTitle>
								</Row>

								<Row style={{ marginTop: 30 }} className="divider"  >
									<Col xs={24} md={12} lg={8} xl={6} style={{ marginBottom: 30 }}>
										<Row style={{ marginBottom: '10px' }}>
											<TextHeader  className="label-name" >ESTIMATED TIME</TextHeader>
										</Row>
										<Row>
											<TextHeader2>
												{ (job.subSoftware 
														? 
															job.subSoftware.estimatedTime  + " mins" 
														: 
															job.software
																?
																	job.software.estimatedTime  + " mins" 
																: 'NA'
												)}
											</TextHeader2>
										</Row>
									 
									</Col>
									<Col xs={24} md={12} lg={8} xl={6} style={{ marginBottom: 30 }}>
										{user?.technician?.tag !== 'employed' && 
											<>
												<Row style={{ marginBottom: '10px' }}>
													<TextHeader  className="label-name estimated-earning-job-alert" > Estimated Earning</TextHeader>
												</Row>
												<Row>
													<TextHeader2>
														{getEstimateEarning(job)}
															{/*(job.subSoftware 
																? 
																	'$'+job.subSoftware.estimatedPrice
																: 
																	job.software
																		?
																			'$'+job.software.estimatedPrice
																		: 'NA'
															)*/}
													</TextHeader2>
												</Row>
											</>
										}
									</Col>
									
									<Col xs={24} md={24} lg={24} xl={12} style={{ marginBottom: 30 }}>

										<ButtonContainer style={{ marginTop: 0 }} className="new-job-btn" > 
										{ job.status !== "Accepted" && job.status !== "Inprogress" && job.status !== "Completed"
											?
												<>                                                                              
													<Button className={(acceptClicked ? 'disabled-btn' : '') + " app-btn app-btn-light-blue mr-3"} name={JSON.stringify(job)}  onClick={(e)=>handleOnDecline(e,job)} disabled={acceptClicked}>
														<span></span>Decline
													</Button>

													{ (showDisableAcceptbutton == false) &&
														<Button name={JSON.stringify(job)} className={(acceptClicked ? 'disabled-btn' : '') + " app-btn job-accept-btn"} onClick={handleAccept} disabled={acceptClicked}>
															<span></span>
															{acceptClicked
																?
																	<Spin/>
																:
																	<>Accept</>
															}
														</Button>
													}

													{ (showDisableAcceptbutton)  &&
														<Button className={"disabled-btn app-btn job-accept-btn"} disabled="disabled" title="This job is for expert technicians.You cannot accept this job.">
															<span></span>														
																<>Accept</>
														</Button>
													}

												</>

											:

												<> 
													{job && user && job.technician && job.technician.user && job.technician.user.id === user.id 
														?
															<>
																<Button className="app-btn app-btn-light-blue mr-3" onClick={()=>{window.location.href="/"}}><span></span> Back to dashboard  </Button>
																{job.status === 'Inprogress' &&
																	
																	<Button className="app-btn" onClick={()=>{window.location.href=process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`}} ><span></span>Join </Button>	
																}
																
																{job.status === 'Accepted' &&
																	<Button className="app-btn" onClick={handleStartCall} ><span></span>Start Call </Button>	
																}	
																	
																
															</>
														:
														<>
															<Button className="app-btn app-btn-light-blue mr-3" onClick={()=>{window.location.href="/"}}><span></span> Back to dashboard  </Button>
															<Button className="app-btn" ><span></span>Not Available </Button>
														</>
													}
												</>
										}
										</ButtonContainer>
									</Col>
								</Row>
							</Div>
						</NewJobContainer> 
					) }
					</>
				}
				{job_arr.length === 0 &&
					<NewJobContainer  className="">
						<Div> 
							<Row span={24} style={{alignItems: 'left',marginBottom: '30px'}}>
								<Col xs={24} lg={16}>
									<Row>
										<AlertTileBox>
											<FontAwesomeIcon className="alert-icon" icon={faExclamationCircle} />
											<Title className = "alert-title">New job request!</Title>
										</AlertTileBox>
									</Row>
								</Col>
							</Row>
							<Row>
								<SubTitle className="label-value">
									<p>Looking like job you are trying to accept is no more available.</p>
								</SubTitle>
							</Row>
							<Row style={{ marginTop: 30 }} className="divider"  >								
								<Col xs={24} md={24} lg={24} xl={12} style={{ marginBottom: 30 }}>
									<ButtonContainer style={{ marginTop: 0 }} className="new-job-btn" > 
										<Button className="app-btn mr-3" onClick={()=>{window.location.href="/"}}><span></span> Back to dashboard  </Button>
									</ButtonContainer>
								</Col>
							</Row>
						</Div>
					</NewJobContainer> 
				}

				{ setShowFeedbackModal && <FeedbackCompulsionModal user={user} isModalOpen={showFeedbackModal} jobId={FeedbackJobId} />}
			</StepContainer>
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;

	& .hideOnJob {
		display:none
	}
	& .appendedBorder{
		border:2px solid green;
	}
`;

const Div = styled.div`
	width: 100%;
`;

const AlertTileBox = styled.div`
		width:100%;
		display: flex;
		position: relative;
		img{
				position: absolute;
				left: 0;
				top: -3px;
				padding:4px 4px 4px 0px;
		}
}
`;
const Title = styled.p`
	margin-bottom: 0.5em;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
	font-size: 20px;
	line-height: 1.4;
	font-family:Arial;
`;
const SubTitle = styled.p`
	margin-bottom: 0.5em;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 300;
	font-size: 20px;
	line-height: 1.4;

	p{
		text-overflow: ellipsis;
		font-weight:bold;
		cursor:pointer;
		margin-bottom:unset;
		width: 100%;
		font-size:14px;
		color:#92A9B8;
	}

`;

const ButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	margin-top: 30px;
	@media (max-width: 1366px) {
		justify-content: space-between;
	}
	@media screen and (max-width: 763px) {
		flex-direction:column;
	}
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
	background-color:#EDF4FA;
	float: right;
	@media screen and (max-width: 991px) {
		flex-direction:column;
		margin-top: 29px !important;
		overflow: hidden;
		height: auto;
		float: none;
		width: 100%;
		padding-top: 20px;
	}
	}
`;
/*const DeclineButton = styled.button`
	height: 60px;
	background: transparent;
	display: flex;
	font-weight: bold;
	border-radius: 10px;
	padding: 0px 40px;
	margin-left: 15px;
	line-height: 60px;
	border: 0px;
	font-size: 18px;
	cursor: pointer;
	color: #464646;
`;*/
const TextHeader2 = styled(Text)`
	font-size: 18px;
	font-weight: 600;
	color:#92A9B8 !important;
`;

const NewJobContainer = styled.div`
	background: #fff;
	margin-bottom: 50px;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	margin-top: 50px;
	align-items: flex-start;
	padding: 60px;
	padding-bottom: 30px;
	
@media screen and (max-width: 763px) {
	padding: 20px;
}
	box-shadow: 0px 15px 50px 0px #d5d5d566;
	flex: 1;
`;

/*const SystemIcon = styled.img`
	width: 35px;
	padding: 5px;
`;*/

const TextHeader = styled(Text)`
	font-size: 20px;
	font-weight: 600;
	color: #c9c9c9;
`;

const StepContainer = styled.div`
	width: 90%;
	height: 100%;
	margin: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
`;
const SoftwareImage = styled.img`
	width: 50px;
	height: auto;
	@media screen and (max-width: 991px) {
		width:200px;
	}
`;

export default NewJob;
