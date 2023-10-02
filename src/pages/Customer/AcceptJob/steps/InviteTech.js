import React, { useEffect, useState } from 'react';
import { Row, Col, Typography,Modal,Spin,Rate } from 'antd';
import styled from 'styled-components';
import moment from 'moment';
import { useHistory, useParams } from 'react-router';
// import { getFullName } from '../../../../utils';
// import StepButton from '../../../../components/StepButton';
import {Button} from 'react-bootstrap';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';
import * as CustomerApi from '../../../../api/customers.api';
// import * as SoftwareApi from '../../../../api/software.api';
// import RadioButton from '../../../../components/common/RadioButton';
import PhoneInput from 'react-phone-input-2';
import {Switch} from 'antd';
import Input from 'components/AuthLayout/Input';
import {
	isPossiblePhoneNumber,
	isValidPhoneNumber,
} from 'react-phone-number-input';
// import FormItem from 'components/FormItem';
import {useJob} from '../../../../context/jobContext';
import {get_or_set_cookie} from '../../../../utils';
import {useNotifications} from '../../../../context/notificationContext';
import { openNotificationWithIcon } from '../../../../utils';
import $ from 'jquery';
import mixpanel from 'mixpanel-browser';
import Loader from '../../../../components/Loader';
import { getTechnicianRating } from '../../../../api/technician.api';
import * as WebSocket from '../../../../api/webSocket.api';
import * as JobApi from '../../../../api/job.api';
import * as JobCycleApi from '../../../../api/jobCycle.api';
import { JobTags } from '../../../../constants/index.js';
const { Text } = Typography;

const InviteTech = ({ user,refetch, job, updateUserInfo }) => {
	console.log('job>>>>>>>>>>>',job)
	const [error, setError] = useState({});
	const [isModalVisible, setIsModalVisible] = useState(false);
	const {setMethod,fetchJob,updateJob} = useJob()
	const [extension, setExtension] = useState(0);
	const { jobId } = useParams();
	const [userExtension,setUserExtension] = useState('')
	const {updateReadStatus} = useNotifications()
	const { socket } = useSocket();
	const history = useHistory();
	const [phoneNum, setPhoneNum] = useState(0);
	const [EditPhoneNum, setEditPhone] = useState(0);
	const [showLine,setShowLine] = useState(true);
	const [showeditor, setShowEditor] = useState();
	// const [ShowMsg,setShowMsg] = useState();
	const [customerId, setCustomerId] = useState();
	const pattern = new RegExp(/^\+\d[0-9\b]+$/);
	const DATE_OPTIONS = {hour: '2-digit', minute:'2-digit',timeZone: user.timezone };
	const [isLoading, setIsLoading] = useState(true);
	const [startCallDisable, setStartCallDisable] = useState(false);
	const [techRating, setTechRating] = useState(0.00);
	const [showLoader,setShowLoader] = useState(false)
	const [jobMethodType,setJobMethodType] = useState('Phone')
	const [callAlreadyStarted,setCallAlreadyStarted] = useState(false)
  	const showModal = () => {
	    setIsModalVisible(true);
		//mixpanel code //
		mixpanel.identify(user.email);
		mixpanel.track('Customer - Click on start call',{'JobId':job.id});
		//mixpanel code //
  	};
	useEffect(()=>{
		if(user){
    		mixpanel.track('Customer - On Start Call Page ', { 'Email': user.email });
		}
  	},[user])
  	const handleOk = () => {
	    setIsModalVisible(false);
	    onSubmit();
  	};

  	const handleCancel = () => {
	    setIsModalVisible(false);
  	};
	
  	const handleExtension = e => {
		setExtension(e.target.value);
	};
	const BackToDashBoard = ()=>{
		
		Modal.confirm({
	      title: 'Are you sure you want to decline this technician?',
	      okText: 'Yes',
	      cancelText: 'No',
	      className:'app-confirm-modal',
	      onOk() {
	        BackToDashBoardSubmit();
	      },
	    });
	}

	/**
	 * This function takes the user to dashboard.
	 * @params = no params
	 * @response : It redirects to dashboard page. 
	 * @author : Manibha
  	*/
	const switchToDashBoard = ()=>{
		window.location.href = '/'
	}
	
	useEffect(()=>{
        if(job && job.status === 'Inprogress'){
            setCallAlreadyStarted(true)
        }
    },[job])

	useEffect(()=>{
		setMethod('Phone')
		socket.emit("join",jobId)
	},[])

	useEffect(()=>{
		socket.on("call:started-customer",()=>{
			setCallAlreadyStarted(true)
		})
	},[socket])
	const BackToDashBoardSubmit = async()=>{
		
		var dec_arr = job.tech_declined_ids
		dec_arr.push(job.technician.id)
		// console.log(">>>>>>>job.tech_declined_ids>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",job.tech_declined_ids)
		// console.log(">>>>>>>>>>>>>>>>>>>>>>>job.technician.id>>>>>>>>>>>>>>>>>>>>>>>",job.technician.id)
		let tempdecOb = [...job.declinedByCustomer]
		tempdecOb.push(job.technician.id)
		updateJob(jobId,{"status":"Waiting","technician":"","declinedByCustomer":tempdecOb})
		updateReadStatus({"job":jobId,"user":job.technician.user.id,status:false})


		try {
		  	const webdata  = await WebSocket.create({
			        user: user.id,
			        job : job.id,
			        socketType:'technician-declined',
			        userType:user.userType,
			        hitFromCustomerSide:true,
			});
	
		  job['web_socket_id'] = webdata['websocket_details']['id']
		  await WebSocket.technicianDeclined({jobId:jobId,tech:job.technician,job:job})
		}
		catch(err) {
		  console.log('onSubmit error in InviteTech page>>>',err)
		  await WebSocket.technicianDeclined({jobId:jobId,tech:job.technician,job:job})
		}


		
   		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Customer - Decline technician',{'JobId':job.id});
		// mixpanel code//
		await JobCycleApi.create(JobTags.CUSTOMER_DECLINED_CALL, job.id, false);
		history.push("/")
	
	}
	const HandleInputDisplay = () => {
		setShowEditor(true);
		// setShowMsg(false)
	};


	/**
   	* Handling on submit of start call button by customer
   	* @params = no params
   	* @response : it redirects the customer to meeting page according to the phone/computer audio selection.
   	* @author : Manibha
	**/
  	const onSubmit = async () => {
		const res = await JobApi.retrieveJob(jobId);
		if(res.status == 'Inprogress'){
			let lifeCycleTag = ''
    		if(job.is_transferred && job.is_transferred == true){
      			lifeCycleTag = JobTags.CUSTOMER_START_CALL_AFTER_TRANSFER;
    		}else{
      			lifeCycleTag = JobTags.CUSTOMER_START_CALL;
    		}
    		await JobCycleApi.create(lifeCycleTag, job.id);
			openNotificationWithIcon('error', 'Error', 'Job is already in progress.')
			setTimeout(() => {
				window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${jobId}`
			}, 2000);
			console.log("inprogress")
		}else if(res.status == 'Accepted'){
			switchToMeetingPage()
		}else if(res.status == 'Completed'){
			openNotificationWithIcon('error', 'Error', 'Job is already completed.')
			setTimeout(() => {
				window.location.href = `/dashboard`
			}, 2000);
		}
  	};
	  

	/**
   	* If the job is accepted then it makes changes in database and send both C and T to meeting page on submit of start call button.
   	* @params = no params
   	* @response : It redirects the customer to meeting page.
   	* @author : Manibha
	**/
	const switchToMeetingPage =  async()=>{
		setStartCallDisable(true)
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Customer - Start call with technician',{'JobId':job.id});
		// mixpanel code//
		console.log("extension ::::: ",extension)
		console.log("userExtension :::::: ",userExtension)
		await updateJob(jobId,{'callStartType':jobMethodType })
		if (jobMethodType === "Phone"){
			if(EditPhoneNum !== 0){
				if (isPossiblePhoneNumber(EditPhoneNum) === false || isValidPhoneNumber(EditPhoneNum) === false){
					setShowLoader(false)
					setStartCallDisable(true)
					return (openNotificationWithIcon('error', 'Error', 'Phone Number Not Valid'))
				}
		
				if (!EditPhoneNum) {
					setShowLoader(false)
					setStartCallDisable(true)
					setError({ ...error, EditPhoneNum: 'Please add your phone number.' });
					return;
				}
			
				if (!pattern.test(EditPhoneNum)) {
					setShowLoader(false)
					setStartCallDisable(true)
					setError({ ...error, EditPhoneNum: 'Please provide valid phone number.' });
					return;
				}
			}

			if (!pattern.test(EditPhoneNum)) {
				setError({
					...error,
					EditPhoneNum: 'Please provide valid phone number.',
				});
				console.log("need error ",EditPhoneNum)
				setShowLoader(false)
				setStartCallDisable(true)
				return;
			}

			await CustomerApi.updateCustomer(customerId, {
				phoneNumber: EditPhoneNum,
				extension:extension,
				}).then(() => {
					setPhoneNum(EditPhoneNum);
					setUserExtension(extension)
					// setShowEditor(false);
					// setShowMsg(true)
					fetchJob(jobId)
					// setShowLoader(false)
				})
				.catch(()=>{
					console.log("Error in handle Phone save")
				})
		}
		
		
		fetchJob(jobId)
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
			console.log('onSubmit error in InviteTech page>>>',err)
			
			await WebSocket.customer_start_call(job)
		}

		get_or_set_cookie(user)
		let lifeCycleTag = ''
		if(job && job.is_transferred && job.is_transferred == true){
			lifeCycleTag = JobTags.CUSTOMER_START_CALL_AFTER_SEARCH;
		}else{
			lifeCycleTag = JobTags.CUSTOMER_START_CALL;
		}
		await JobCycleApi.create(lifeCycleTag, jobId);
		window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${jobId}`
		
	} 


  	/**
   * Starts a call on technician side
   * @params = 
   * @response : it redirects the customer to meeting page, if meeting is already started by the customer.
   * @author : Sahil
  */

  	const sendCustomerToMeeting = ()=>{
		setStartCallDisable(true)
  		get_or_set_cookie(user)
		// mixpanel code//
	 	mixpanel.identify(user.email);
	 	mixpanel.track('Customer - Join Meeting',{'JobId':job.id});
	 	// mixpanel code//
  		window.location.href = process.env.REACT_APP_MEETING_PAGE+`/meeting/customer/${jobId}`
  	}

  	const SwitchHandler = (checked) =>{
  		console.log('checked>>>>>>>>>>',checked)
		if(checked){
			setMethod("ComputerAudio")
			setShowLine(false) 
			setShowEditor(false)
			$('.switchClassComp').addClass('computer')
			$('.switchClassPhone').removeClass('phone')
			setJobMethodType("ComputerAudio")
			socket.emit("set-method",{'method':"ComputerAudio"})
			//mixpanel code //
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Choose computer audio',{'JobId':job.id});
			//mixpanel code //
		}
		else{
			setMethod("Phone")
			setShowLine(true) 
			$('.switchClassPhone').addClass('phone')
			$('.switchClassComp').removeClass('computer')
			setJobMethodType("Phone")
			socket.emit("set-method",{'method':"Phone"})
			//mixpanel code //
			mixpanel.identify(user.email);
			mixpanel.track('Customer - Choose choose with phone ',{'JobId':job.id});
			//mixpanel code //
		}	
  	}
	const HandleSave = async()=>{
		console.log('HandleSave>>>>>>>>>>>>>')
		setShowLoader(true)
		if(EditPhoneNum !== 0){
		  if (isPossiblePhoneNumber(EditPhoneNum) === false || isValidPhoneNumber(EditPhoneNum) === false){
		  		setShowLoader(false)
				return (openNotificationWithIcon('error', 'Error', 'Phone Number Not Valid'))
		  }
	  
		  if (!EditPhoneNum) {
		  	setShowLoader(false)
			setError({ ...error, EditPhoneNum: 'Please add your phone number.' });
			return;
		  }
	  
		  if (!pattern.test(EditPhoneNum)) {
		  	setShowLoader(false)
			setError({ ...error, EditPhoneNum: 'Please provide valid phone number.' });
			return;
		  }
		}

		if (!pattern.test(EditPhoneNum)) {
			setError({
				...error,
				EditPhoneNum: 'Please provide valid phone number.',
			});
			console.log("need error ",EditPhoneNum)
			setShowLoader(false)
			return;
		}
		console.log("extension ::::: ",extension)
		await CustomerApi.updateCustomer(customerId, {
			phoneNumber: EditPhoneNum,
			extension:extension,
		}).then(() => {
			openNotificationWithIcon('success', 'Success', 'Phone Number has been updated.')
			setPhoneNum(EditPhoneNum);
			setUserExtension(extension)
			setShowEditor(false);
			// setShowMsg(true)
			fetchJob(jobId)
			setShowLoader(false)
		})
		.catch(()=>{
			console.log("Error in handle Phone save")
		})
	}

	useEffect(()=>{
		if(job && job.id === jobId){
			if(job.technician){
				let p = {'technician':job.technician.user.id}
				getTechnicianRating(p).then((resTech)=>{
	                console.log("resTech ::",parseFloat(resTech.data).toFixed(1))
	                if(resTech && resTech.data){
	                	if (resTech.data >= 4 ){
	                		setTechRating(parseFloat(resTech.data).toFixed(1))
	                		
	                	}
	                	else{
	                		setTechRating(parseFloat(4.0).toFixed(1))
	                	}
	                	setIsLoading(false)  
	                }
	            })
			}

			setCustomerId(job.customer.id);
			setEditPhone(job.customer.phoneNumber)
			setPhoneNum(job.customer.phoneNumber); // "Some User token"
			console.log("customer extension ",job.customer.extension)
			setUserExtension(job.customer.extension?job.customer.extension:'')
			setExtension(job.customer.extension?job.customer.extension:'')

		}

		if(job.status === 'Completed'){
			openNotificationWithIcon('info', 'Info', 'This job has already been completed. Please go to dashboard.')
		}
	},[job])


	if (isLoading) return <Col md="12" className="px-4 py-5"> 
		<Row>
			<Loader height="100%" className={"mt-5 "+(isLoading ? "loader-outer" : "d-none")} />
		</Row>   

	</Col>
	;
	// updateCustomer
	return (
		<Container span={15}>
			<StepContainer>
				<NewJobContainer>
					<Box width="100%">
						<Box
							display="flex"
							direction="column"
							alignItems="center"
							marginVertical={40}
						>
						{/* {(()=>{
							if(job && job.status !== "Completed"){
								return<>
								<SubTitle>Great news! {job.technician?.user.firstName} is ready to help. </SubTitle>
								<SubTitle>Press the { callAlreadyStarted && job.status !== "Completed" ? "Join" : "Start Call" } button down below to join your technician now.</SubTitle>
			
								</>
							}
							return<SubTitle>Looking like meeting is over. Please click on Back to dashboard button to view your jobs</SubTitle>

						})()} */}
						
						<SubTitle>{job && job.status !== "Completed" 
							? `Great news! ${job.technician?.user.firstName} is ready to help.` 
							: `Looking like meeting is over. Please click on Back to dashboard button to view your jobs`}
						</SubTitle>
						<SubTitle>
							{job && job.status !== "Completed" && `Press the ${callAlreadyStarted && job.status !== "Completed" ? "Join" : "Start Call" } button down below to join your technician now.`}
						</SubTitle>	
								
						</Box>
						<hr />
						<Box marginVertical={20}>
							<Row>
								<Col xs={24} className="table-responsive">
									<table className="table job-info-table">
										<thead>
											<tr>
												<th><TextHeader className="label-name" >Tech</TextHeader></th>
												<th><TextHeader className="label-name" >Tech Rating</TextHeader></th>
												<th><TextHeader className="label-name" >Rate per 6 min</TextHeader></th>
												<th><TextHeader className="label-name" >ISSUE</TextHeader></th>
												<th><TextHeader className="label-name" >DATE</TextHeader></th>
												<th><TextHeader className="label-name " >Time</TextHeader></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td><Title className="label-value small-title">{job.technician?.user.firstName} {job.technician?.user.lastName}</Title></td>
												<td><Title className="label-value small-title"> <Rate  disabled={true} allowHalf={true} defaultValue={ parseFloat(techRating)} /><span className="small-title-rating">{techRating}</span></Title></td>
												<td><Title className="label-value small-title">${job.software?.rate || ''}</Title></td>
												<td><Title className="halftext label-value small-title" title={job && job.issueDescription}>{job && job.issueDescription}</Title></td>
												<td><Title className="label-value small-title">{moment().format('DD/MM/YYYY')}</Title></td>
												<td><Title className="label-value small-title">{new Date().toLocaleTimeString('en-US', DATE_OPTIONS)}</Title></td>
											</tr>
										</tbody>
									</table>
								</Col>
								{/*<Col xs={24} md={12} lg={3}>
									<Box marginVertical={15}>
										<TextHeader className="label-name" >Tech</TextHeader>
									</Box>
									<Box>
										<Title className="label-value small-title">{job.technician?.user.firstName} {job.technician?.user.lastName}</Title>
									</Box>
								</Col>
								<Col xs={24} md={12} lg={3}>
									<Box marginVertical={15}>
										<TextHeader className="label-name" >Tech Rating</TextHeader>
									</Box>
									<Box>
										<Title className="label-value small-title">{techRating}</Title>
									</Box>
								</Col>
								
								<Col xs={24} md={12} lg={4}>
									<Box marginVertical={15}>
										<TextHeader className="label-name" >Rate per 6 min</TextHeader>
									</Box>
									<Box>
										<Title className="label-value small-title">${job.software?.rate || ''}</Title>
									</Box>
								</Col>
								<Col xs={24} md={12} lg={8}>
									<Box marginVertical={15}>
										<TextHeader className="label-name" >ISSUE</TextHeader>
									</Box>
									<Box>
										<Title className="halftext label-value small-title" title={job && job.issueDescription}>{job && job.issueDescription}</Title>
									</Box>
								</Col>
								<Col xs={24} md={12} lg={3}>
									<Box marginVertical={15}>
										<TextHeader className="label-name" >DATE</TextHeader>
									</Box>
									<Box>
										<Title className="label-value small-title">{moment().format('DD/MM/YYYY')}</Title>
									</Box>
								</Col>
								<Col xs={24} md={12} lg={3}>
									<Box marginVertical={15}>
										<TextHeader className="label-name " >Time</TextHeader>
									</Box>
									<Box>
										<Title className="label-value small-title">{new Date().toLocaleTimeString('en-US', DATE_OPTIONS)}</Title>
									</Box>
								</Col>*/}
							</Row>
						</Box>
						<hr />
						<Box display="flex" justifyContent="right" marginTop={30} className="float-right invite-tech-btn">

								{!callAlreadyStarted && job.status !== "Completed" &&
									<>							
										<button className="app-btn app-btn-light-blue mr-md-3" onClick={BackToDashBoard} disabled={isLoading}><span></span> Decline Call</button>
										<button className="app-btn job-accept-btn" onClick={showModal} disabled={startCallDisable}>
											<span></span> {startCallDisable ? <Spin /> : "Start Call"}
										</button>
									</>
								}		

								{ callAlreadyStarted && job.status !== "Completed" &&
									<button className="app-btn" onClick={sendCustomerToMeeting} disabled={startCallDisable}>
										<span></span> {startCallDisable ? <Spin /> : "Join"}
									</button>
								}

								{	job.status === "Completed" &&
									<button className="app-btn" onClick={switchToDashBoard}>
										<span></span> Back to Dashboard
									</button>
								}

						</Box>

						<Modal title="Choose call type" visible={isModalVisible} onOk={handleOk} cancelButtonProps={{ style: { display: 'none' } }} onCancel={handleCancel} className="selectCallTypeModal" okText="Start">
							<ItemDescription><span className="switchClassPhone phone ">Phone</span><Switch className="PhoneSwitch"  style={{marginLeft:"10px",marginRight:"10px"}} onChange={SwitchHandler} /> <span className="switchClassComp">Computer Audio </span></ItemDescription>


							{	showLine?<div><ItemDescription>
												You will receive a call on number {phoneNum}.{' '}
											</ItemDescription>{' '}
											<SmallButton onClick={HandleInputDisplay}>
																	Edit Number
											</SmallButton></div>:<div></div>
							}
						
							
								{ showeditor?<EditDiv className="acceptJobTelInput">
									<div className="d-flex flex-column">
										<div className="d-flex">
											<span>
												<PhoneInput
													country="us"
													countryCodeEditable={false}
													onlyCountries={['gr', 'fr', 'us', 'in', 'ca']}
													value={phoneNum}
													onChange={(e) => {
														setEditPhone('+' + e);
													}}
												/>
											</span>
											<RegInput
												name="extension"
												size="small"
												type = "number"
												placeholder="Extension(optional)"
												className="extension-input mt-1 ml-2 "
												defaultValue = {userExtension}
												onChange={handleExtension}
											/>
										</div>
										
									</div>
								</EditDiv>:<div></div>}							
				 		</Modal>


					
								<Container>
						</Container>
					</Box>
				</NewJobContainer>
			</StepContainer>
		</Container>
	);
};

/*const NumberButton = styled(Button)`
	background:  #1bd4d5 !important;
	font-size: 15px !important;
	align-items: center !important;
	display: flex !important;
	font-weight: bold !important;
	border-radius: 10px !important;
	height: 40px !important;
	width: 100px !important;
	justify-content: center;
	margin-left: 10px !important;
	margin-top: 10px;
	border-color: ${(props) => props.theme.primary} !important;
	color: ${(props) =>
		props.type === 'back' ? props.theme.primary : '#fff'} !important;
	&:hover {
		background: ${(props) =>
			props.type === 'back' ? '#fff' : '#908d8d'} !important;
		color: ${(props) =>
			props.type === 'back' ? '#464646' : '#fff'} !important;
		border-color: ${(props) => props.theme.primary} !important;
	}
	&:active {
		background: ${(props) =>
			props.type === 'back' ? '#fff' : '#908d8d'} !important;
		color: ${(props) =>
			props.type === 'back' ? '#464646' : '#fff'} !important;
		border-color: ${(props) => props.theme.primary} >!important;
	}
	&:focus {
		background: ${(props) =>
			props.type === 'back' ? '#fff' : '#908d8d'} !important;
		color: ${(props) =>
			props.type === 'back' ? '#464646' : '#fff'} !important;
		border-color: ${(props) => props.theme.primary} !important;
	}
`;*/
const EditDiv = styled.div`
	display: flex;
	flex-direction: row;
	& .react-tel-input {
		margin-top: 5px;
	}
	& .react-tel-input .form-control {
		height: 50px;
		border-radius: 5px;
		border: 1px solid #cacaca !important;
		margin-left: 10px;
	}
	& .react-tel-input .flag-dropdown {
	    position: absolute;
	    top: 0;
	    bottom: 0;
	    padding: 0;
	    background-color: #f5f5f5;
	    border: 1px solid #cacaca;
	    border-radius: 3px 0 0 3px;
	    left: 11px;
	}

`;
const SmallButton = styled(Text)`
	text-decoration: underline;
	color: rgb(18, 67, 215) !important;
	font-weight: bold;
	cursor: pointer;
`;
const ItemDescription = styled(Text)`
	opacity: 0.8;
	font-weight: 700;
	font-style: italic;


	& .phone{
		font-size: 19px;
	font-family: ui-rounded;
	color: #2e5aa9;
	}
	& .successText{
		color:green !important;
	}
	& .computer{
		font-size: 19px;
	font-family: ui-rounded;
	color: #2e5aa9;
	}
	& .PhoneSwitch{
		background-color:#577AC2;
	}
`;

/*const RegForm = styled(FormItem)`
	&.ant-form-item-has-error {
		margin-bottom: 6px;
	}

`;*/
const RegInput = styled(Input)`
	border-radius: 10px;
	padding: 15px 20px;
	font-family: 'Open-Sans', sans-serif;
	& input {
		width:100px !important;
	}
`;


const Title = styled.p`
	margin-bottom: 0.5em;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
	font-size: 20px;
	line-height: 1.4;
	padding: 0 10px;
`;
const SubTitle = styled.p`
	margin-bottom: 0.5em;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 600;
	font-size: 20px;
	line-height: 1.4;
`;

/*const TextHeader2 = styled(Text)`
	font-size: 18px;
	font-weight: 400;
	margin-bottom: 30px;
	padding: 0 10px;
`;*/

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

const NewJobContainer = styled.div`
	background: #fff;
	margin-bottom: 50px;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	margin-top: 20px;
	align-items: flex-start;
	padding: 60px;
	box-shadow: 0px 15px 50px 0px #d5d5d566;
	flex: 1;
	@media screen and (max-width: 763px) {
		padding: 40px 20px;
	}
`;

const TextHeader = styled(Text)`
	font-size: 20px;
	font-weight: 600;
	color: #c9c9c9;
	display:inline-block;
    white-space: break-spaces !important;
	min-height:50px;
	padding: 0 10px;
	text-transform: uppercase;
`;

const StepContainer = styled.div`
	width: 80%;
	height: 100%;
	margin: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	@media screen and (max-width: 991px) {
		width: 100%;
	}
`;

export default InviteTech;
