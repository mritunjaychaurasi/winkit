import React,{useState,useEffect,useRef,useCallback} from 'react';
import { useHistory } from 'react-router';
import {Row, Col} from 'react-bootstrap';
// import * as DOM from 'react-router-dom';
// import style from 'styled-components';
import CustomerTopBar from '../../TopBar/CustomerTopBar';
import TopBar from '../../../pages/Dashboard/components/TopBar';
// import logo from '../../../assets/images/logo.png';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {faHome, faDollarSign, faCog} from "@fortawesome/free-solid-svg-icons";
// import {faChartBar, faQuestionCircle} from '@fortawesome/free-regular-svg-icons';
import {Button} from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import {useAuth} from '../../../context/authContext';
import Dashboard from '../../../pages/Dashboard/steps/dashboard';
import { useJob } from '../../../context/jobContext';
import {useUser} from '../../../context/useContext' 
import EarningsTech from '../../../pages/Dashboard/steps/earnings';
import BillingReportTech from '../../../pages/Dashboard/steps/billingReports';
import TechnicianTransactons from '../../../pages/Dashboard/steps/transactions'
import JobReports from '../../../pages/Dashboard/steps/jobReports';
import TechnicianProfile from '../../../pages/Technician/Profile';
import CustomerProfile from '../../../pages/Customer/Profile';
import JobDetail from '../../../pages/JobDetail';
import HelpCenter from '../../../pages/Support/HelpCenter';
import ActiveTechnicianTable from '../../../pages/Dashboard/steps/activeTechnicians';
import ReferalRewardsTable from '../../../pages/Dashboard/steps/referalRewards';
import TechnicianRewardsTable from '../../../pages/Dashboard/steps/technicianRewards'
import Invite from '../../../pages/Invites';
import Notifications from '../../Sidebar/Notifications';
import {useNotifications} from '../../../context/notificationContext';
import ReferPeople from '../../../pages/Dashboard/steps/referPeople';
import Subscription from '../../../pages/Customer/Subscription';
import * as StripeApi from '../../../api/stripeAccount.api';
import Instructions from '../../../pages/Technician/Register/steps/instructions';
import moment from 'moment';
import { INACTIVE_ACCOUNT_MESSAGE } from '../../../constants';
import { openNotificationWithIcon } from '../../../utils';
import { useServices } from '../../../context/ServiceContext'
function DashboardData({user,scheduledBadge,sethideBadge,currentStep,setcurrentStep,fromEmail,allNotifications,softwareList,setActiveMenu,initialLoad,scheduledJob,handleScheduledJob,showNotificationBadge,notifyCount,setOpenNotification,hideBadge,setjobId,openNotification,estimatedWaitTime,setEstimatedWaitTime,jobId,type,setType,setShowNotificationBadge}){
	const history = useHistory()
	const detailRef = useRef()
	const {fetchJob} = useJob()
	const { refetch } = useUser();
	const {verificationEmailHandler} = useAuth();
	const [verificationSent,setVerificationSent] = useState(false)   
 	const [hideEmailmsg,sethideEmailmsg] = useState(false)
 	const [displayList,setDisplayList] = useState(false);
 	const {updateReadStatus} = useNotifications();
 	// const [notificationCount,setNotificationCount] = useState(0)
 	const [notifyList,setNotifyList] = useState([])
    const [subscriptionName,setSubscriptionName] = useState(false)   
    const [subscriptionPendingTime,setSubscriptionPendingTime] = useState(false) 
	const [latestJobIndex, setLatestJobIndex] = useState(0) 
	// const [detailSubmission, setDetailSubmission] = useState();
	// const [disable, setDisable] = useState(false);	
	//const [latestJobIndex, setLatestJobIndex] = useState(0);		
	const { getStripeAccountStatus,generateAccountLink,createStripeAccount,detailSubmission,disable } = useServices()
	useEffect(()=>{
		console.log(">>>>>>>>>> currentStep >>>>>>>>>>> ",currentStep)
	},[currentStep])
 	// console.log("showNotificationBadge :::::::: ",showNotificationBadge)
 	//CONSOLES OF BADGE FOR Notifications
 	// if(allNotifications && user.userType == "technician"){
 	// 	console.log("badge condition 1 ::: ",!initialLoad)
	 // 	console.log("badge condition 2 ::: ",allNotifications)
	 // 	console.log("badge condition 3 ::: ",allNotifications[allNotifications.length -1].job != undefined)
	 // 	console.log("badge condition 4 ::: ",allNotifications[allNotifications.length -1].job.status != "Declined")
	 // 	console.log("badge condition 5 ::: ",allNotifications[allNotifications.length -1].job)
	 // 	console.log("badge condition 6 ::: ",allNotifications[allNotifications.length -1].job.technician)
	 // 	console.log("badge condition 7 ::: ",allNotifications[allNotifications.length -1].actionable)
	 // 	console.log("badge condition 8 ::: ",allNotifications[allNotifications.length -1].read == false ,allNotifications[allNotifications.length -1])
	 // 	console.log("badge condition 9 ::: ",showNotificationBadge)
 	// }
 	
 	// const [userNotifications,setUserNotifications] = useState([]);
 	// console.log("allNotifications :::: components/Dashboard/Content",allNotifications)
	 useEffect(()=>{
		(async () => {
			if(user && user.technician && user.technician.accountId !== undefined){
				await getStripeAccountStatus(user.technician.accountId)
			}	
		})();
		
    },[user,detailSubmission])


	const removePlusFromNumber = (phoneNumber) => {
		const newPhoneNumber = JSON.stringify(phoneNumber.replace('+', ''))
		return newPhoneNumber
	}
    useEffect(()=>{
       console.log('empty useEffect in CustomerTopBar>>>>>>>',user.customer)
       if(user.customer){
            if(user.customer.subscription != undefined){
                setSubscriptionName(user.customer.subscription.plan_name)
                let time_used_in_seconds = user.customer.subscription.time_used
                let remaining_seconds  = user.customer.subscription.total_seconds - time_used_in_seconds
                let remaining_minutes = (remaining_seconds/60).toFixed(2);
                // console.log('remaining_minutes>>>>>>>',remaining_minutes)
                let string_in_min = remaining_minutes + ' min'
                // console.log('string_in_min>>>>>',string_in_min)
                let converted_format = convertTime(remaining_seconds)
                // console.log('converted_format>>>>>>',converted_format)
                setSubscriptionPendingTime(converted_format)
            }
       }
    },[user])

    function convertTime(sec) {
	    var hours = Math.floor(sec/3600);
	    (hours >= 1) ? sec = sec - (hours*3600) : hours = '00';
	    var min = Math.floor(sec/60);
	    (min >= 1) ? sec = sec - (min*60) : min = '00';
	    (sec < 1) ? sec='00' : void 0;

	    (min.toString().length == 1) ? min = '0'+min : void 0;    
	    (sec.toString().length == 1) ? sec = '0'+sec : void 0;    

	    if(hours >= 1 && hours <= 9){
	    	hours = '0'+hours
	    }

	    return hours+':'+min+':'+sec;
	}



 	useEffect(()=>{
 		if(allNotifications && user.userType === "customer"){
 			setNotifyList(allNotifications)
 		}
 	},[allNotifications])

	 useEffect(()=>{
	   if(allNotifications && user.userType === "technician"){
		   const isAvailable = (element) => element?.job?.tech_declined_ids.includes(user.technician.id) === false && element?.job?.declinedByCustomer.includes(user.technician.id) === false && (element?.job.status === "Pending" || element?.job.status === "Waiting" || element?.job.status === "Scheduled" && element?.job?.schedule_accepted === false);
		   const index = allNotifications.findIndex(isAvailable)
		   setLatestJobIndex(index)
	   }
	},[allNotifications,initialLoad,showNotificationBadge])

 	const HandleDetailsDashboard = async (e)=>{
        // console.log(e.currentTarget.id,"handle dashboard item")
        // console.log("inside HandleDetailsDashboard ::: ",showNotificationBadge)
        sethideBadge(true)
        setShowNotificationBadge(false)
        updateReadStatus({"user":user.id,"status":true,"job":e.currentTarget.id})
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician- Click to see job details from dashboard notification',{'JobId':e.currentTarget.id});
		// mixpanel code//
     	history.push(`/technician/new-job/${e.currentTarget.id}`, { userIds: [user.id],appendedJob:e.currentTarget.id });
    }

    const handleJobDetails=(e)=>{
    	// console.log("events ::: ",e.currentTarget.name)
		// mixpanel code//
		mixpanel.identify(user.email);
		mixpanel.track('Technician- Click to see Schedule job details from dashboard notification',{'JobId':jobId});
		// mixpanel code//
    	setjobId(e.currentTarget.name)
		setType("apply")
    	console.log("setType ::: schedule job :::: ", type);
		fetchJob(e.currentTarget.name)
    	// setShowNotificationBadge(false)
    	setcurrentStep(6)
    	console.log(":::")
    }

    const ButtonHandler = ({allNotifications})=>{
    	if(allNotifications[latestJobIndex].type === "Scheduled Job" ){
    		return <Button name={allNotifications[[latestJobIndex]].job.id}  onClick={(e)=>{handleJobDetails(e)}} className="btn app-btn app-btn-light-blue joinBtn float-right job-issue-btn"><span></span> Details</Button>
    	}

    	return <Button id={allNotifications[[latestJobIndex]].job.id} ref={detailRef}  onClick={(e)=>{HandleDetailsDashboard(e)}} className="btn app-btn app-btn-light-blue joinBtn float-right job-issue-btn"><span></span> Details </Button> 
    }

 	const sendVerificationMail = ()=>{
        verificationEmailHandler({"email":user.email})
        setVerificationSent(true)
        setTimeout(()=>{sethideEmailmsg(true)},3000)
    }

    const handleDropDown = ()=>{
        setDisplayList(!displayList)
        updateReadStatus({"user":user.id,"status":true})
        // setNotificationCount(0)
    }



    

	return (
			<Row>
                <Col xs="12">
                	{user && user.userType === 'technician' &&
                		<Row>
	                		<Col xs="12">
					    		<TopBar softwareList={softwareList}/>
	                		</Col>
	                	</Row>
					}
					{user && user.userType === 'customer' &&
						<Row>
							<Col lg="4" md="5" className="float-left">
						    	{<CustomerTopBar setcurrentStep={setcurrentStep} setActiveMenu={setActiveMenu}/>	}				    		 
						   	</Col>

						   	<Col lg="5" md="3" className="float-left pt-4 pr-0 mt-2">
						    	  	{user?.userType === "customer" && subscriptionName && 
						    	  		<>
							            	<span className="show-subscription"> Subscription -  </span> <span className="value-subscription"> {subscriptionName} </span>
							            	<span className="show-subscription"> Remaining time -  </span> <span className="value-subscription"> {subscriptionPendingTime} </span>
							            </>
							       	}   			    		 
						   	</Col>


						   
							<Col lg="3" md="4" className="pt-5 float-right">
				               	{/*<Notifications user={user} handleDropDown={handleDropDown} notificationCount={false} userNotifications={false} displayList={false} setDisplayList={false}/>*/}
				               	<Notifications user={user} handleDropDown={handleDropDown} notificationCount={notifyCount} userNotifications={notifyList} displayList={displayList} setDisplayList={setDisplayList} setcurrentStep={setcurrentStep}  setjobId={setjobId} setType={setType}/>
				            </Col>
			            </Row>
		            }
					{scheduledBadge && 
						<Row>
							<Col md="12" className="mb-3 px-3 mt-4 notification-badge jobBadge">
					          	<p>
					          		Time now to start the scheduled meeting and solve the issue
						        	<Button onClick={handleScheduledJob}  className="btn app-btn app-btn-light-blue joinBtn float-right" >Details</Button>
						        </p>
					          	<p></p>
						    </Col>
						</Row>
				 	}
					{user 
						&& user.userType==="technician" 
						&& allNotifications 
						&& !initialLoad 
						&& allNotifications.length > 0  
						&& allNotifications[0].actionable === false 
						&& allNotifications[0].read === false  
						&& showNotificationBadge 
						? 
							<Row>
						    	<Col xs="12">
						            {notifyCount >1 
						            	? 
						            		<div className="col-12 mb-3 mt-4 notification-badge text-center"> 
						            			You've got {notifyCount} notifications. <a onClick={()=>{setOpenNotification(true)}} className="app-link text-primary"> Click here </a> to show 
						        			</div> 
						             	:<> 
						                	{notifyCount ===1 &&
						                     	<div  className="col-12 mb-3 px-3 mt-4 notification-badge ">
						                    		<p> { allNotifications[0].title} </p>
						                     	</div>
						                		}
						              		</>
									}
						       	</Col> 
						    </Row>
						: <>
							{user 
								&& user.userType==="technician"
								&& user.technician
								&& user.technician.id
								&& allNotifications 
								&& !initialLoad
								&& allNotifications.length > 0 
								&& allNotifications[[latestJobIndex]]
								&& allNotifications[[latestJobIndex]].job
								&& allNotifications[[latestJobIndex]].job.status
								&& allNotifications[[latestJobIndex]].job.status !== "Declined"
								&& (!allNotifications[[latestJobIndex]].job.technician || allNotifications[[latestJobIndex]].type == 'assinged_by_admin')    
								&& allNotifications[[latestJobIndex]].actionable
								&& allNotifications[[latestJobIndex]].job.tech_declined_ids
								&& allNotifications[[latestJobIndex]].job.tech_declined_ids.includes(user.technician.id) === false
								&& allNotifications[[latestJobIndex]].job.declinedByCustomer.includes(user.technician.id) === false
								&& showNotificationBadge 
								? 
									<Row>
								    	<Col xs="12">
								            {notifyCount >1 && allNotifications[[0]].read === false
								            	? 
								            		<div className="col-12 mb-3 mt-4 notification-badge text-center"> 
								            			You've got {notifyCount} notifications. <a onClick={()=>{setOpenNotification(true)}} className="app-link text-primary"> Click here </a> to show 
								        			</div> 
								             	:<> 
								                	{(allNotifications[[latestJobIndex]].job.status === "Pending" || allNotifications[[latestJobIndex]].job.status === "Waiting" || allNotifications[[latestJobIndex]].job.status === "Scheduled" && allNotifications[[latestJobIndex]].job.schedule_accepted === false) &&
								                     	<div  className="col-12 mb-3 px-3 mt-4 notification-badge  jobBadge ">
								                    		<p> New {allNotifications[latestJobIndex].job.software.name} {allNotifications[latestJobIndex].job.subOption} Job Posted by : {allNotifications[latestJobIndex].job.customer.user.firstName} </p>
								                    		<p> Issue Description :{allNotifications[latestJobIndex].job.issueDescription.length >90 ? allNotifications[latestJobIndex].job.issueDescription.substring(0,90)+" ..." : allNotifications[latestJobIndex].job.issueDescription} </p>
															<ButtonHandler  allNotifications={allNotifications} />
								                     	</div>
								                		}
								              		</>
											}
								       	</Col> 
								    </Row>
								:<></>
							}
						</>
					}



					{user && user.technician && user.technician.expertise.length < 1 && 
						<Row>
							<Col xs="12">
					      		<div className="col-12 mb-3 mt-4 notification-badge text-center"> Your profile is incomplete.<a onClick={()=>{setcurrentStep(4)}} className="app-link text-primary"> Click here </a>to complete your profile </div>
							</Col>
						</Row>
						
					}
					{user && !user.verified && !verificationSent  && 
						<Row>
						   	<Col xs="12">
						     	<div className="col-12 notification-badge mt-4 text-center"> Please verify your account. <a onClick={sendVerificationMail} className="app-link text-primary"> Click here </a> to resend Verification Email </div>
							</Col>
						</Row>
					}	
					{user && user.technician && !user.technician.accountId  && currentStep !== 14 &&
						<Row>
						   	<Col xs="12">
						     	<div className="col-12 notification-badge mt-4 text-center"> Please create your stripe account. <a onClick={()=> createStripeAccount(user)} className="app-link text-primary"  disabled={disable} > Click here </a> to create </div>
							</Col>
						</Row>
					}				

					{detailSubmission === false && currentStep !== 14 && 
						<Row>
						   	<Col xs="12">
						     	<div className="col-12 notification-badge mt-4 text-center"> Please Complete your stripe account profile. <a onClick={()=> generateAccountLink(user)} className="app-link text-primary"  disabled={disable} > Click here </a> to complete profile </div>
							</Col>
						</Row>

					}	

					{verificationSent && !hideEmailmsg && 
						<Row>
							<Col xs="12">
					     		<button className="col-12 notification-badge mt-4 btn-success text-center"> An email is sent with the link. Please Check </button>
                    		</Col>
                   		</Row>
                	}

                	{user && user.userType === 'customer' && user.activeStatus == false &&
                		<Row>
							<Col xs="12">
					     		<button className="col-12 notification-badge mt-4 text-center inactive-account">{INACTIVE_ACCOUNT_MESSAGE}</button>
                    		</Col>
                   		</Row>
                	}
                </Col>
			        { currentStep === 0  &&  <Dashboard currentStep={currentStep} hideBadge={hideBadge} fromEmail={fromEmail} setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} setOpenNotification={setOpenNotification} ShowBadge={openNotification} />}
			        { currentStep === 1  &&  <EarningsTech setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType} /> }
			        { currentStep === 2  &&  <JobReports setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType}/>}
			        { currentStep === 3  &&  <BillingReportTech setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType}/>}
			        { currentStep === 4  &&  <TechnicianProfile estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} />}
			        { currentStep === 5  &&  <CustomerProfile/>}
			        { currentStep === 6  &&  <JobDetail jobId={jobId} setCurrentStep={setcurrentStep} type={type}/>}
			        { currentStep === 111  &&  <Instructions currentStep={currentStep} />}
			        { currentStep === 8  &&  <ReferPeople/>}
					{ currentStep === 9  &&  <Invite setcurrentStep={setcurrentStep} setjobId={setjobId} setType={setType}/>}
					{ currentStep === 10 &&  <Subscription user={user}  />}
					{currentStep === 11 &&   <ActiveTechnicianTable user={user} />}
					{currentStep === 14 && <TechnicianTransactons user={user}  />}
					{currentStep === 12 &&   <ReferalRewardsTable user={user} />}
					{currentStep === 25 && <TechnicianRewardsTable user={user}/>}



		    </Row>
	);
}

export default DashboardData;
