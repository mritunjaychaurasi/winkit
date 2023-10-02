import React, { useEffect, useState, useRef } from 'react';
// import { useHistory } from 'react-router-dom';
// import { Progress } from 'antd';
import { Row, Col } from 'react-bootstrap';
import { Alert } from 'antd';
import styled from 'styled-components';
import * as Antd from 'antd';
import { Helmet } from 'react-helmet';
// import StepButton from '../../../../components/StepButton';
import H2 from '../../../../components/common/H2';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';
import { message, Modal } from 'antd';
import { useTools } from '../../../../context/toolContext';
import { useLocation } from 'react-router';
import { NotificationNumber } from '../../../../constants';
import { Player } from '@lottiefiles/react-lottie-player';
// import { Carousel } from 'react-circular-carousel'
import 'react-circular-carousel/dist/index.css';
// import Slider from "react-slick";
// import { set } from 'lodash';
// import queryString from 'query-string';
// import { useLocation } from 'react-router';
import {
	// StepActionContainer,
	StepTitle,
	StepHeader,
	BodyContainer,
} from '../../ProfileSetup/steps/style';
import { Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import Loader from '../../../../components/Loader';
//import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from 'react-loader-spinner'
// import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
import { klaviyoTrack } from '../../../../api/typeService.api';
import Logo from 'components/common/Logo';
import jsonAnimation from "../../../../assets/animations/animation.json"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faEnvelope, faArrowRight, faCalendarDay } from "@fortawesome/free-solid-svg-icons";
import { ImPhone } from "react-icons/im";
import { BsInfoCircle } from "react-icons/bs";
import Countdown, { zeroPad, } from 'react-countdown';
import * as JobCycleApi from '../../../../api/jobCycle.api'
import { JobTags } from '../../../../constants/index.js';
// import { useHistory } from "react-router-dom";
// let timer;
// let val = 0;
// let call_counter_again = false;
// let suggestionsIndex = 0
// var settings = {
// 	dots: false,
// 	infinite: true,
// 	speed: 500,
// 	autoplay: true,
// };

const JobAlive = ({ job, setComponentToRender, updateJob, estimatedWait, mainEstimatedWait, setIsTechNotFoundInSearch, isTechNotFoundInSearch, afterGeekerHours, scheduleForLater, setJobFlowStep, jobFlowsDescriptions, notFound, setShowGoBackBtn, setshowGoBackBtnRedirection }) => {

	// const [percent, setPercent] = useState(0);
	// const [percentTwo, setPercentTwo] = useState(0);
	const { openMobileDialogBox, useTimer, setUseTimer } = useTools()
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search)
	const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId") : false
	const { socket } = useSocket();
	const [sch, setsch] = useState(false);
	// const sliderRef = useRef()
	// const [suggestions, setSuggestion] = useState([
	// 	`Did you know You can use voice in Google docs? Simply go to Tools, enable voice typing`,
	// 	`To add an image from its web address go to Insert>Image>By URL`,
	// 	`You can fully adjust the page setup of any Google Doc. Just go to File>Page Setup and make your changes.`,
	// 	`Download the Translate add-on (Links to an external site.) to translate a single word in your document.`
	// ])
	const [isLoading, setIsLoading] = useState(true);
	const [autoCount, setAutoCount] = useState(false);
	const [showAllBtn, setShowAllBtn] = useState(false);
	const [countAgain, setCountAgain] = useState(true)
	// const [buttonName, setButtonName] = useState('Keep Searching');
	// const [statusText, setStatusText] = useState("Hmm... We searched everywhere, but it looks like all our technicians are busy helping others right now. But don't worry! You can always schedule a call for later.")
	// useEffect(() => {
	// 	if (technicianId) {
	// 		setStatusText('Same technician is not available at this time.You can choose to keep searching with other technicians or schedule job with same technician at some other time.')
	// 		// setButtonName("Search for another technicians")
	// 	}
	// }, [])
	// const Counter = () => {
	// 	if (val === 100) {
	// 		val = 0;
	// 		clearInterval(timer);
	// 		// setTurn(prev => prev+1)
	// 		if (!call_counter_again) {
	// 			call_counter_again = true
	// 			// setPercent(0)
	// 			timer = setInterval(Counter, 1000);
	// 			// setLoadingMessage("Connecting to the technician")
	// 		}
	// 	} else {
	// 		if (val <= 100) {
	// 			if (call_counter_again) {
	// 				val += 0.1
	// 			}
	// 			else {
	// 				val += 1;
	// 			}
	// 			if (call_counter_again) {
	// 				setPercentTwo(Math.round(val));
	// 			} else {
	// 				setPercent(Math.round(val));
	// 			}
	// 		}
	// 	}
	// };

	useEffect(() => {
		if (job) {
			setIsLoading(false);
			setAutoCount(true);
			socket.emit("join", job.id)
			if (job.id) {
				mixpanel.identify(job.customer.user.email);
				mixpanel.track('Customer - Connecting techinician progress bar');
				mixpanel.people.set({
					$first_name: job.customer.user.firstName,
					$last_name: job.customer.user.lastName,
				});

				socket.emit('new-job-alert', {
					jobData: job,
					posted: true,
					status: "Pending",
					postedTime: new Date(),
					EstimatedWait: mainEstimatedWait,
					searchSameTech: technicianId ? true : false,
					technicianId: technicianId
				});

				socket.on("meeting:join-button", (props) => {
					window.location.href = `/customer/accept-job/${props.res}`
				})
			}
		};
	}, [job]);

	useEffect(() => {
		if (openMobileDialogBox) {
			setAutoCount(false);
			// clearTimeout(window.progressBar)
			Modal.info({
				title: "Technician accepted your job",
				content: "An email is sent to you with a link kindly join from Computer.",
				closable: false,
				okText: "Dashboard",
				className: "app-confirm-modal",
				onOk: function () {
					window.location.href = "/"
				}
			})
		}

	}, [openMobileDialogBox])

	// useEffect(() => {
	// if (timer) {
	// 	clearInterval(timer);
	// 	val = 0
	// }

	// window.intervalTimer = setTimeout(() => {
	// 	timer = setInterval(Counter, 100);
	// 	setIsLoading(false)
	// }, 1000);

	// setIsLoading(false)
	// call_counter_again = false

	// if (technicianId != undefined && technicianId != false) {
	// 	setUseTimer(300000)
	// }

	// }, []);

	// useEffect(() => {
	// 	if (job) {
	// 		socket.emit("join", job.id)
	// 	}

	// 	if (percent === 100 && job && job.id) {
	// 		// if (sliderRef && sliderRef.current) {
	// 		// 	sliderRef.current.slickPlay()
	// 		// }
	// 		// mixpanel code//
	// 		mixpanel.identify(job.customer.user.email);
	// 		mixpanel.track('Customer - Connecting techinician progress bar');
	// 		mixpanel.people.set({
	// 			$first_name: job.customer.user.firstName,
	// 			$last_name: job.customer.user.lastName,
	// 		});
	// 		// mixpanel code//
	// 		// console.log(">>>>>>>>> jobData >>>>>>",job)
	// 		socket.emit('new-job-alert', {
	// 			jobData: job,
	// 			posted: true,
	// 			status: "Pending",
	// 			postedTime: new Date(),
	// 			EstimatedWait: mainEstimatedWait,
	// 			searchSameTech: technicianId ? true : false,
	// 			technicianId: technicianId
	// 		});

	// 		socket.on("meeting:join-button", (props) => {
	// 			window.location.href = `/customer/accept-job/${props.res}`
	// 		})
	// 		// setPercent(0)
	// 		// let startTime = new Date().getMilliseconds();
	// 		window.progressBar = setTimeout(() => {
	// 			// let timeNow = new Date().getMilliseconds()
	// 			// let time = timeNow - startTime
	// 			// console.log("time in getMilliseconds ::: ",time)
	// 			// val = 0
	// 			// if (setIsTechNotFoundInSearch) {
	// 			// 	console.log('coming form not found screen remove by ridhima')
	// 				// setIsTechNotFoundInSearch(true)
	// 				// setComponentToRender('notAccepted');
	// 				// console.log('val>>>>>>>>>>>>>>>>>>>clearInterval')					
	// 			// }

	// 			setIsTechNotFoundInSearch(true)
	// 			// setComponentToRender('notAccepted');
	// 			setJobFlowStep(jobFlowsDescriptions['notAccepted'])
	// 			clearInterval(timer);
	// 		}, useTimer);
	// 	}
	// }, [job, percent, socket]);



	/*useEffect(()=>{
		console.log("there is a job >>>>>>>>> ",job)
		if(job){
			
			//Call Klaviyo api
			const klaviyoData = {
				email: res?.user?.email,
				event: 'Job Post Button Click',
				properties: {
					$first_name: res?.user?.firstName,
					$last_name: res?.user?.lastName
				},
			};
			await klaviyoTrack(klaviyoData);   
			
			mixpanel.track('Customer - On Finding Technician Page', { 'Email': job?.customer?.user?.email });	
		}
	},[job]);*/

	useEffect(() => {
		(async () => {
			if (job) {
				//Call Klaviyo api
				const klaviyoData = {
					email: job?.customer?.user?.email,
					event: 'Job Created',
					properties: {
						$first_name: job?.customer?.user?.firstName,
						$last_name: job?.customer?.user?.lastName,
						$job: job.id,
						//$total_jobs: totalJobsCount, //::TODO For Later
						$software_name: job?.software?.name,
					},
				};
				await klaviyoTrack(klaviyoData);

				mixpanel.track('Customer - On Finding Technician Page', { 'Email': job?.customer?.user?.email });
			}
		})();
		setShowGoBackBtn(false)
		setshowGoBackBtnRedirection(true)
	}, []);


	const handleRedirect = () => {
		setIsTechNotFoundInSearch(true);
		setAutoCount(false);
		setIsLoading(false);
		setUseTimer(0);
		setCountAgain(false);
		setShowGoBackBtn(true)
	};



	/* const HandleCancel = async() =>{
		Modal.confirm({
			title: 'Are you sure you want to cancel this job?',
			okText: 'Yes',
			cancelText: 'No',
			className:'app-confirm-modal',
			onOk() {
				
				HandleCancelSubmit();
			},
		});     
	} */
	/* const HandleCancelSubmit = async() =>{
		if(timer){
			 val = 0
			clearInterval(timer);
		}

		// mixpanel code//
		mixpanel.track('Customer - Cancel Job near job alive',{'JobId':job.id});
		 // mixpanel code//
		await updateJob(job.id,{status:"Declined",tag:"CustomerDeclined"})
		message.destroy()
		 window.location.href=  "/"
	} */

	if (isLoading) return <Loader height="100%" />;

	/**
 * Following function is used to searching technician.
 * @author : Mritunjay
 */

	const renderer = ({ hours, minutes, seconds }) => {
		return <span>{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}</span>;
	};

	const sendTime = (data) => {
		setCountAgain(true);
		setAutoCount(true);
		if (data === '30 minutes') {
			setUseTimer(1800000);
		} else if (data === "1 hour") {
			setUseTimer(3600000);
		} else {
			setUseTimer(10800000);
		};
	};



	const convertLiveJobToScheduleJob = () => {
		setCountAgain(false);
		setAutoCount(false);
		if (job.customer.user) {
			mixpanel.identify(job.customer.user.email);
			mixpanel.track('Customer - Click on Schedule for later on job alive page ');
		};
		setJobFlowStep(jobFlowsDescriptions['scheduleJob']);
	};

	const callSchedule = async () => {
		setCountAgain(false);
		setAutoCount(false);
		if (job && job.id) {
			await JobCycleApi.create(JobTags.SCHEDULE_AFTER_SEARCH, job.id);
		};
		setJobFlowStep(jobFlowsDescriptions['scheduleJob']);
	};

	return (
		<>
			<BodyContainer span={24} className="p-0 font-nova" style={{ backgroundColor: autoCount === false ? "#DCE6ED" : 'transparent' }}>
				<Helmet>
					<link
						rel="stylesheet"
						type="text/css"
						charset="UTF-8"
						href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
					/>
					<link
						rel="stylesheet"
						type="text/css"
						href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
					/>
				</Helmet>
				<Logo user={job.customer.user} />
				{/* <StepTitle className="job-heading-text">Your job is live!</StepTitle> */}
				{countAgain === true ? <div>
					<ItemLabel className='mt-3'>You can leave this page, but please don't close it!</ItemLabel>
					<h3 className="job_heading_text">We'Il search for an available Geek for
						<span className="hg-text ml-3">
							<Countdown
								date={Date.now() + useTimer}
								renderer={renderer}
								autoStart={autoCount}
								onComplete={handleRedirect}
							/>
						</span>
					</h3>

					<Box className="px-0">
						<div className="col-12 mb-5 px-4 schedule-btn">
							<Player
								autoplay
								keepLastFrame={true}
								src={jsonAnimation}
								className='animationPly'
								loop={true}
							>
							</Player>
							<div className='pt-5'>
								<Title>We will notify you when a techinician is available by
									<div className='pt-3'>
										<span><FontAwesomeIcon icon={faBell} />&nbsp;Notification</span>
										<span className='mx-4'><FontAwesomeIcon icon={faEnvelope} />&nbsp;Email</span>
										<span><ImPhone />&nbsp;Phone &nbsp;<span className="hg-text" id='infoCircleIcon'><BsInfoCircle />
											<div className='atHover_showPhoneNumber'>
												<div className='triangle-div'></div>
												<div className='rectangle-div content_inside_rectangle'>You will receive a phone call from {NotificationNumber}</div>
											</div>
										</span></span>
									</div>

								</Title>
							</div>
							{/* <Col lg='9'>
								<span>
									<p className='schedule-text float-left text-left'> It may take longer to find a Geek at this time.
										Please schedule and pick a time that suits you.  </p>
								</span>
								</Col>
								<Col lg='3'>
								<Button type="back"  onClick={convertLiveJobToScheduleJob} title="Schedule your job for a later date." className="btn app-btn-light-blue joinBtn float-right job-schedule-btn">
									Schedule for later
									{' '}
									<span />
									</Button>
								</Col> */}

						</div>

						{/* <Row className='d-flex'>
						<Col lg={6} className='description-section'> */}
						{/* <Description className="dark font-large">
							Please don't close or refresh this page—our software is locating a Geek for you!</Description>
						<Description className="dark font-small mt-4">
							You can still leave this page, just don't close it! A notification and email invitation will appear...
						</Description>
						<Description className="dark font-small mt-4">
							A notification and an email invitation will appear when your technician is found. If there's no response, we'll call your number instead.
						</Description>
						<Description className="dark font-small mt-4">
							The number you will receive a call from is <span className="card-label dark"><strong>{NotificationNumber}</strong></span>
						</Description>
						<ItemLabel className="card-label dark text-left my-4">Job Summary</ItemLabel>
						<Description className=" dark sans-font text-left"> <p className="dark  font-small" title={job ? job.issueDescription : ''}>{job ? job.issueDescription : ''} </p></Description>

						<ItemLabel className="card-label  dark text-left my-4">Estimated wait</ItemLabel>
						<EstimationItem className="dark">
							{estimatedWait}

						</EstimationItem> */}

						{/* {afterGeekerHours &&	
						(<Button type="back"  onClick={scheduleForLater} title="Schedule your job for a later date." className="btn app-btn-light-blue float-right btn-schedule-later ml-3">
						Schedule for later
						{' '}
						<span />
						</Button>)} */}
						{/* 
						</Col>
						<Col lg={6} className='loader-section lodr-sec'> */}
						{/* <div style={{ width: 400, height: 400, position: "relative" }} className="spinner-mobile"> */}
						{/* <div className="spinner-outer loader-spinner">
							<div className="spinner-job-finder"></div>
						</div> */}

						{/*< Oval height = {400} width = {400} color ={`#1bd4d5`} className={"loader-spinner"}  />*/}


						{/* <div className='corousel-container '>
							<div className="mt-100 text-center">
								<div className="loader-header arial">
									{percent != 100 ? 'Finding Technician' : 'Connecting to technician'}
								</div>
								<Slider ref={sliderRef} className="loader-desc arial mt-4">
									{suggestions.map((element, index) => {
										return <div className="loader-desc" key={element.substring(0, 4) + index}> {element}</div>
									})}
								</Slider>
							</div>
						</div> */}

						{/* <CircularProgressbarWithChildren value={percent!=100?percent:percentTwo} strokeWidth={3} styles={{
						  	path: {
						      // Path color
						      stroke: `#1bd4d5`,
						      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
						      strokeLinecap: 'butt',
						      // Customize transition animation
						      transition: 'stroke-dashoffset 0.5s ease 0s',

						    },
						    trail: {
						      // Trail color
						      stroke: '#c9f2f2',
						      // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
						      strokeLinecap: 'butt',
						    },
						     text: {
							      // Text color
							      fill: '#1bd4d5',
							      // Text size
							      fontSize: '5px',
							      fontWeight:'800'
							    },
							    // Customize background - only used when the `background` prop is true
							    background: {
							      fill: '#3e98c7',
							   },
													  }}
						  >
						  	<>
						    	<img style={{ width: 40, marginTop: -5 }} src={job.software.blob_image} alt="doge" />
						    	<div className="loader-text-area"> <div className="loader-header arial"
						    	> {percent !=100 ? 'Finding Technician' : 'Connecting to technician'} </div> <p className="loader-desc arial mt-4">{suggestions}</p> </div>
						    </>
						  </CircularProgressbarWithChildren> */}

						{/* </div> */}
						{/* </Col>
					</Row>

					<Antd.Space /> */}
						{/* { afterGeekerHours &&
				<>
					<Antd.Divider />
					
					<Row>
						<Col md="auto" lg="auto" className="ml-2">
						<Button type="back"  onClick={scheduleForLater} title="Schedule your job for a later date." className="btn app-btn-light-blue float-left btn-schedule-later">
						Schedule for later
						{' '}
						<span />
						</Button>
						</Col>

					</Row>
				</> */}
						{ /*percent !=100  && 
				<>
					<Antd.Divider />
						
					<Row>
						<Col md="auto" lg="auto" className="ml-2">
							<Button onClick={HandleCancel} className="btn app-btn-transparent float-right">Decline</Button>
						</Col>

					</Row>
				</>
			} */}
						{/*percentTwo > 0 &&{ afterGeekerHours &&
				<>
					<Antd.Divider />
					
					<Row>{ afterGeekerHours &&
				<>
					<Antd.Divider />
					
					<Row>
						<Col md="auto" lg="auto" className="ml-2">
						<Button type="back"  onClick={scheduleForLater} title="Schedule your job for a later date." className="btn app-btn-light-blue float-left btn-schedule-later">
						Schedule for later
						{' '}
						<span />
						</Button>
						</Col>

					</Row>
				</>
						<Col md="auto" lg="auto" className="ml-2">
						<Button type="back"  onClick={scheduleForLater} title="Schedule your job for a later date." className="btn app-btn-light-blue float-left btn-schedule-later">
						Schedule for later
						{' '}
						<span />
						</Button>
						</Col>

					</Row>
				</>
					<Row>
						<Col md={10}>
							<ItemLabel className="card-label dark text-left">Connecting to the technician</ItemLabel>
							<Progress percent={percentTwo} style={{ width: '100%', paddingRight:'30px' }} />
						</Col>
						<Col md={2}>
							<Button onClick={HandleCancel} className="btn app-btn float-right">Cancel Job<span></span></Button>
						</Col>
					</Row>
				*/}
					</Box>
				</div> :
					<div>
						<Box className="px-0 find-technician-screen" style={{ backgroundColor: "#DCE6ED" }}>
							{notFound && <Alert
								message="Not Found"
								description="We searched high and low for you but it looks like all our technicians are busy.What would you like to do next?"
								type="info"
								showIcon
							/>}

							{!showAllBtn &&
								<div>
									<span className='no-tech-located'>No technician located?</span>
									<p className='no_tech_subTitle'>Here's what you can do next:</p>&nbsp;&nbsp;&nbsp;
								</div>
							}
							{showAllBtn && <div>
								<p className='no_tech_subTitle'>How long would you like us to continue searching?</p>&nbsp;
							</div>
							}

							{/* {!afterGeekerHours &&
							<Description>
								{statusText}
							</Description>
						} */}
							<Box style={{ width: showAllBtn ? "80%" : "50%" }} className="keepSearchingBtn">
								<Button className="btn app-btn inside_btn" style={{ backgroundColor: showAllBtn ? "#92A9B8" : "#01D4D5" }} onClick={callSchedule} title="Schedule your job for a later date."><FontAwesomeIcon icon={faCalendarDay} className="cal-btn" /><>Schedule a call</><span></span>
								</Button >
								{!showAllBtn &&
									<Button className="btn app-btn inside_btn" onClick={() => setShowAllBtn(true)}>
										<>Keep Searching</><FontAwesomeIcon icon={faArrowRight} className='arr-size arrow-btn' /><span></span>
									</Button>
								}
								{showAllBtn && !isLoading &&
									<>
										<Button className="btn app-btn inside_btn" onClick={() => sendTime("30 minutes")}>
											<>30 Minutes</><FontAwesomeIcon icon={faArrowRight} className='arr-size arrow-btn' /><span></span>
										</Button>

										<Button className="btn app-btn inside_btn" onClick={() => sendTime("1 hour")}>
											<>1 Hour</><FontAwesomeIcon icon={faArrowRight} className='arr-size arrow-btn' /><span></span>
										</Button>

										<Button className="btn app-btn inside_btn" onClick={() => sendTime("3 hours")}>
											<>3 hours</><FontAwesomeIcon icon={faArrowRight} className='arr-size arrow-btn' /><span> </span>
										</Button>
									</>
								}

							</Box>
						</Box>
					</div>
				}
			</BodyContainer>
			{autoCount === true && <div>
				<Row className='technicianSearch px-0 font-nova'>
					<Box>
						<div>
							<span className='no-tech-located'>No technician located?</span>
							<p className='no_tech_subTitle'>Here's what you can do next:</p>
						</div>
						<Box className='search_tech_btn'>
							<div>
								<Button type="back" className="btn app-btn inside_btn" onClick={convertLiveJobToScheduleJob} title="Schedule your job for a later date."><FontAwesomeIcon icon={faCalendarDay} className="fontIcon cal-btn" />Schedule a call<span></span>
								</Button >
								<span className="text_near_Btn">( At any time )</span>
							</div>
							<div>
								<Button className="btn app-btn inside_btn" style={{ opacity: ".4" }} disabled={true}>
									<>Keep Searching</> <FontAwesomeIcon icon={faArrowRight} className='arr-size arrow-btn' /><span></span>
								</Button>
								<span className="text_near_Btn">(
									After <Countdown
										date={Date.now() + useTimer}
										renderer={renderer}
										autoStart={autoCount}
										onComplete={handleRedirect}
									/> )
								</span>
							</div>
						</Box>
					</Box>
				</Row>
			</div>}

		</>
	);
};

// const EstimationItem = styled.div`
// 	font-weight: 700;
// 	font-size: 30px;
// 	float:left;
// 	color:#293742 !important;
// `;

const Description = styled.div`
	font-size: 12px;
	color: black;
	// text-align: left;
	//  p{
	// 	color: black;
	// text-align: left;
	//  white-space: nowrap;
	// 	overflow: hidden;
	// 	text-overflow: ellipsis;
	// 	font-weight:bold;
	// 	cursor:pointer;
	// 	margin-bottom:unset;
	// }
`;

const ItemLabel = styled.h3`
font-weight: 400 !important;
font-size: 25px;
top: 50px;
font-style: normal;
font-weight: 400;
line-height: 19px;
text-align: center;
color: #2F3F4C;
`;



const Title = styled.h3`
font-weight: 400;
font-size: 18.93px;
color: #2F3F4C;;
line-height: 19px;
text-align: center;
`;



export default React.memo(JobAlive);
