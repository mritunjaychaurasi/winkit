import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Radio } from 'antd';
import { useHistory, useLocation } from 'react-router';
// import DashboardSteps from '../../components/DashboardSteps';
import { Container, Row, Col } from 'react-bootstrap';
import style from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../context/useContext';
import RightSidebar from '../../components/Sidebar/RightSidebar';
import LeftSidebar from '../../components/Sidebar/LeftSidebar';
import DashboardData from '../../components/Dashboard/Content';
import { useServices } from '../../context/ServiceContext';
// import  {addNewTalkChatUser,getTalkChatUser} from '../../api/chat.api'
// import { useJob } from '../../context/jobContext';
import { useNotifications } from '../../context/notificationContext';
import * as SoftwareApi from '../../api/software.api';
// import {Button} from 'react-bootstrap';
import { useSocket } from '../../context/socketContext';
// import {useAuth} from '../../context/authContext';
import { useTools } from '../../context/toolContext';
import logo from '../../assets/images/logo.png';
import { APP_URL,VERSION } from '../../constants';
import { retrieveJob } from 'api/job.api';
import {clearAllTimeOuts, handleRefModal, openNotificationWithIcon} from '../../utils';
import { Button } from 'react-bootstrap';
import * as customerSourceApi from '../../api/customerSource.api';
import './index.css';
import UserReviewModal from '../../components/UserReviewModal/index';
// import * as CustomerApi from '../../api/customers.api';
import Loader from "../../components/Loader";

let modal = null
let initialLoad = true;
const MainPage = () => {
  const {
    setJobId, jobId, typeForDetails, setOpenModal, openTechModal, setTypeForDetails, stepDeciderForDashboard, setStepDeciderDashboard, hideBadge, sethideBadge, hearAboutUsModal, setHearAboutUsModal,activeMenu, setActiveMenu
  } = useTools();
  // const [type,setType] = useState(typeForDetails)
  const { socket } = useSocket();
  // const [fromEmail,setFromEmail] = useState(false)
  const fromEmail = false;
  // const location = useLocation()
  // const {fetchJob} = useJob()
  
 
  const { FetchDetails,getStripeAccountStatus} = useServices();
  const { user } = useUser();
  // const [currentStep,setcurrentStep] = useState(0)
  const { fetchNotifications, allNotifications,updateReadStatus } = useNotifications();
  const [openNotification, setOpenNotification] = useState(false);
  const [notifyCount, setNotifyCount] = useState(0);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [softwareList, setSoftwareList] = useState([]);
  	const [estimatedWaitTime, setEstimatedWaitTime] = useState('NA');
  	// const [userVerified, setUserVerified] = useState(true);
  	const [scheduledBadge, setScheduledBadge] = useState(false);
  	const [scheduledJob, setScheduledJob] = useState({});
  // const {refetch,verificationEmailHandler} = useAuth();
  const [notificationsArr, setNotificationsArr] = useState([]);
  const history = useHistory();
  const [menuSidebar, setmenuSidebar] = useState(false);
  const [profileSidebar, setprofileSidebar] = useState(false);
  const [readNotificationId,setReadNotificationId] = useState(false);
  const [customerFeedWhereToCome, setCustomerFeedWhereToCome] = useState(false);
  const [showWhereToFieldError, setShowWhereToFieldError] = useState(false);
  const [otherComeFeedBack, setOtherComeFeedBack] = useState('');
  const [whereHeComeFrom, setWhereHeComeFrom] = useState(false);
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  const urlParams = new URLSearchParams(location.search)
  console.log("url parms >>>>>>> :::::::::::: ",urlParams.get("jobId"), urlParams.get("schedule"));
  
  const menuSidebarHandle = () => {
	  setmenuSidebar(!menuSidebar);
	};
	const profileSidebarHandle = () => {
		setprofileSidebar(!profileSidebar);
	};
  let getStripeNotification = true
  let checkStripeAccountStatus = localStorage.getItem('checkStripeAccountStatus')
  useEffect(()=>{
    (async()=>{
      if(urlParams.get("checkStripeAccountStatus")|| checkStripeAccountStatus && getStripeNotification && user.userType === 'technician'){
        let response = await getStripeAccountStatus(user.technician.accountId)
        setStepDeciderDashboard(14)
        setActiveMenu("technician_transactions")
        if(response){
          getStripeNotification = false
          openNotificationWithIcon('success', 'Success', 'Your stripe account detail submitted. Please check by Stripe Login');
          localStorage.removeItem('checkStripeAccountStatus')
        }else{
          getStripeNotification = false
          openNotificationWithIcon('info', 'Info', 'Your stripe account profile is incomplete.Please complete your profile');
          localStorage.removeItem('checkStripeAccountStatus')
        }
        
        let nextState = { additionalInformation: 'Updated the URL with JS' }
        const nextTitle = document.title;
        let nextURL = "/dashboard"
        window.history.pushState(nextState, nextTitle, nextURL);
      }
    })()
  },[user])
  const handleLinkTransfer = async()=>{
      try{
        let updatedJob = await retrieveJob(urlParams.get("scheduleJobId"))
        if (updatedJob.customer.user.id === user.id){
          setJobId(urlParams.get("scheduleJobId"))
          setTypeForDetails("apply")
          setStepDeciderDashboard(6)
        }
      }
      catch(err){
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" ,urlParams.get("scheduleJobId"))
        console.log("error in handleLinkTransfer ::: ",err)
      }
  }
  useEffect(()=>{
    
    clearAllTimeOuts()
    if(urlParams.get("mobileJobId") || urlParams.get("invaildUser")){
      if(urlParams.get("invaildUser")){
        openNotificationWithIcon('error', 'Error', "You are not authorized to access this Job.");
      }

      if(urlParams.get("mobileJobId")){
        setJobId(urlParams.get("mobileJobId"))
        setTypeForDetails("details")
        setStepDeciderDashboard(6)
      }

      let nextState = { additionalInformation: 'Updated the URL with JS' }
      const nextTitle = document.title;
      let nextURL = "/dashboard"
      window.history.pushState(nextState, nextTitle, nextURL);
    }
    if(urlParams.get("scheduleJobId")){
      handleLinkTransfer()
      console.log("before url parms >>>>>>> :::::::::::: ",urlParams.get("scheduleJobId"));
      
      
      let nextState = { additionalInformation: 'Updated the URL with JS' }
      const nextTitle = document.title;
      let nextURL = "/dashboard"
      window.history.pushState(nextState, nextTitle, nextURL);
    }


    if(urlParams.get("checkJobId")){
      console.log("before url parms >>>>>>> :::::::::::: ",urlParams.get("checkJobId"));
      setJobId(urlParams.get("checkJobId"))
      setTypeForDetails("apply")
      setStepDeciderDashboard(6)
      setActiveMenu("job-reports")

//      if(urlParams.get("mobileJobId")){
//      console.log("before url parms >>>>>>> :::::::::::: ",urlParams.get("mobileJobId"));
//      setJobId(urlParams.get("mobileJobId"))
//      setStepDeciderDashboard(6)
      

      let nextState = { additionalInformation: 'Updated the URL with JS' }
      const nextTitle = document.title;
      let nextURL = "/dashboard"
      window.history.pushState(nextState, nextTitle, nextURL);
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "update_technician"){
      window.location.href= "/technician/register_steps?t=update_technician";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "select_softwares"){
      window.location.href= "/technician/register_steps?t=select_softwares";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "level_of_expertise"){
      window.location.href= "/technician/register_steps?t=level_of_expertise";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "availability"){
      window.location.href= "/technician/register_steps?t=availability";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "demo_video"){
      window.location.href= "/technician/register_steps?t=demo_video";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "instructions"){
      window.location.href= "/technician/register_steps?t=instructions";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "exam"){
      window.location.href= "/technician/register_steps?t=exam";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "exam_fail"){
      window.location.href= "/technician/register_steps?t=exam_fail";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "finalize_profile"){
      window.location.href= "/technician/register_steps?t=finalize_profile";
    }
    if(user && user.userType === 'technician' && user.technician && user.technician.registrationStatus === "schedule_interview"){
      window.location.href= "/technician/register_steps?t=schedule_interview";
    }
    if(user && user.userType === 'technician' && user.technician && (user.technician.registrationStatus === "incomplete_profile" || user.technician.registrationStatus === 'interview_result')){
      setShowLoader(false)
    }
    if(user && user.userType === 'customer'){
      setShowLoader(false)
    }
  },[])

  const handleRegisterModal = (id)=>{
    setOpenModal(false)
    console.log("readNotificationId ::::::",readNotificationId)
    if(id){
      updateReadStatus({"status":true,"_id":id})
    }
    
  }
  //Set LocalStorage Current Step 

  useEffect(() => {
   window.localStorage.setItem('CurrentStep',stepDeciderForDashboard)
   // console.log(">>>>>>>>",createChatUser)
  },[stepDeciderForDashboard])


	useEffect(()=>{
		console.log("openTechModal1 :::: ",openTechModal)
	},[openTechModal])
	const firstRegisterModal = (title,id)=> { 
		console.log("the open tech Modal ::: ",openTechModal)
    if(modal == null){
     
      modal = Modal.info({
        title: title,
        className :"app-confirm-modal",
        onOk() {handleRegisterModal(id)},

      });
    }
     
			
  };
  const handleScheduledJob = () => {
    	if (scheduledJob !== {}) {
    		setJobId(scheduledJob.id);
    		// setType("")
    		setStepDeciderDashboard(6);
    	}
   };
    const findReadable = (userNotifyArr)=>{
    	const onLyReadableItems = userNotifyArr.filter(item => item.read === false)
    	// console.log("onLyReadableItems ::::::::::::::::",onLyReadableItems)
    	// console.log("userNotifyArr :::: ",userNotifyArr)
    	//  console.log("readable notifications in pages/Dashboard :::: ",onLyReadableItems.length)
        setNotifyCount(onLyReadableItems.length)
    }
   	/*const uniqueList = (userNotifyArrTemp,jobs)=>{

        // console.log("this code is running evertime")
        let userNotifyArr =  []
        for(var k in userNotifyArrTemp ){
            if(userNotifyArrTemp[k].job){
                if(jobs.includes(userNotifyArrTemp[k].job.id)){
                    userNotifyArr.push(userNotifyArrTemp[k])
                    const index = jobs.indexOf(userNotifyArrTemp[k].job.id);
                    if (index > -1) {
                          jobs.splice(index, 1);
                        }
                }
            }
        }
        const onLyReadableItems = userNotifyArr.filter(item => item.read === false)

        setNotifyCount(onLyReadableItems.length)
        console.log(notifyCount ,"the notify count :::::::::::::")
        return userNotifyArr
    } */

 	useEffect(() => {
    // console.log("i am inside this function0-00-------000")
    // initalLoad = false
    if (openNotification) {
         	setNotifyCount(0);
      setShowNotificationBadge(false);
      // console.log(notifyCount)
      sethideBadge(true);
    }
  }, [openNotification]);

	  useEffect(() => {
    if (hideBadge) {
      setNotifyCount(0);
      setShowNotificationBadge(false);
    }
  }, [hideBadge]);

	  useEffect(() => {

	  	socket.on('scheduled-call-alert', (data) => {
	  		if (user && user.customer && data.receiver === user.customer.id) {
	  			setScheduledBadge(true);
	  			setScheduledJob(data.job);
	  		}
	  	});
	  }, [socket, user]);

  	useEffect(() => {
  		console.log('Notifications changed');
    if (allNotifications && user) {
        	const userNotifyArrTemp = allNotifications.filter(item => (item && user && item.user) && item.user.id === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        	// let jobIds = userNotifyArrTemp.map(item => (item.job && item.job.id ? item.job.id : 0))
        	// let otherNotifications = allNotifications.filter(item => item.job === '')
        	/* const unique = (value, index, self) => {
	              return self.indexOf(value) === index
	            } */
        	// const jobs = jobIds.filter(unique)


    	  	const userNotifyArr = allNotifications
    	  	findReadable(userNotifyArrTemp)
    	  	for(let i=0; i <= userNotifyArr.length-1;i++){

                let old_time = new Date(userNotifyArr[i]['createdAt'])
                let now_time = new Date();   
                var diffMs = (now_time - old_time); // milliseconds between now & Christmas
                var diffDays = Math.floor(diffMs / 86400000); // days
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

                if(diffDays > 0){
                     userNotifyArr[i]['time'] = diffDays.toString() +' days ago'
                }else if(diffHrs > 0){
                     userNotifyArr[i]['time'] = diffHrs.toString() +' hours ago'
                }else if(diffMins > 0){
                     userNotifyArr[i]['time'] = diffMins.toString() +' minutes ago'
                }else{
                     userNotifyArr[i]['time'] = 'Few seconds ago'
                }                
       		} 
       		// if(userNotifyArr.length === 1 && (userNotifyArr[0].user.userType === "technician" || userNotifyArr[0].user.userType === "customer")  &&userNotifyArr[0].type === "from_admin" && userNotifyArr[0].read===false ){
          //   console.log("the notify id :::::",userNotifyArr[0].id)
          //   // setReadNotificationId(userNotifyArr[0].id)
       		// 	 firstRegisterModal(userNotifyArr[0].title,userNotifyArr[0].id)
       		// }
       		
        	setNotificationsArr(userNotifyArr)
            initialLoad = false
            setShowNotificationBadge(true)
      
    } else {
      setNotifyCount(0);
    }

  }, [allNotifications]);

  useEffect(()=>{
    console.log("stepDeciderForDashboard ::::::: ",stepDeciderForDashboard)
  },[stepDeciderForDashboard])
  useEffect(() => {
	    (async () => {
	    	if (user) {
	        	const res = await SoftwareApi.getSoftwareList();
	        	if (res && res.data) {
	          		setSoftwareList(res.data);

	          		if (res.data && res.data.length > 0) {
			            const sidArr = (user.technician && user.technician.expertise ? user.technician.expertise.map(a => a.software_id) : []);
			            let wTime = '';

			            if (sidArr.length === 1) {
			                const waitResult = res.data.filter(obj => obj.id === sidArr[0]);
			                if (waitResult.length > 0 && waitResult[0].estimatedWait) {
			                    wTime = waitResult[0].estimatedWait.split('-')[0];
			                    setEstimatedWaitTime(wTime);
			                }
			            } else if (sidArr.length > 1) {
			                let softwareWithMaxTime;
			                softwareWithMaxTime = res.data.reduce((max, x) => {
			                    if (sidArr.indexOf(x.id) !== -1) {
			                        // console.log(">>>estimatedWait>>>>>",x)
			                        const waitValX = (x && x.estimatedWait ? String(x.estimatedWait).split('-')[0] : 0);
			                        const waitValM = (max && max.estimatedWait ? String(max.estimatedWait).split('-')[0] : 0);
			                        return waitValX > waitValM ? x : max;
			                    }
			                    	return false;
			                });

			                if (softwareWithMaxTime && softwareWithMaxTime.estimatedWait) {
			                    wTime = String(softwareWithMaxTime.estimatedWait).split('-')[0];
			                    setEstimatedWaitTime(wTime);
			                }
			            }
			        }
	        	}
	        } else {
	        	history.push('/login');
	        }
    	})();
  	}, [history, user]);

  useEffect(() => {
    if (user) {
      // console.log("initialLoad ::: ",initialLoad)
      if (initialLoad) {
        console.log('Notifications working  refetch ::::');
        fetchNotifications({ user: user.id });
      }
      /* if(!user.verified){
				setUserVerified(false);
			} */

      // CustomerApi.createCustomer({
		 //        user:"usr_ftkfxv4RrcepDsKcf",
		 //        phoneNumber:"+19172020848",
		 //        extension:"",
		 //        billing: {
		 //            cardNumber:"",
		 //            expiryDate:"",
		 //            nameOnCard:"",
		 //            address:"",
		 //            cvv:"",
		 //        },
		 //        language:"English",
		 //        additionalLanguage:"",
		 //        status:"completed"
		 //    });
    }

  }, [fetchNotifications, user]);


  useEffect(() => {
    const ele = document.querySelector('.fb_reset .fb_iframe_widget .fb_customer_chat_bounce_out_v2');
    const openCss = 'width: 399px; padding: 0px; position: fixed; z-index: 2147483646; border-radius: 16px; top: auto; background: none; bottom: 84px; max-height: calc(100% - 84px); right: 4px; margin-right: 12px; visibility: visible; min-height: 300px; height: 438px;';
    // let closeCss = `width: 399px; padding: 0px; position: fixed; z-index: 2147483646; border-radius: 16px; top: auto; background: none; bottom: 84px; max-height: 0px; right: 4px; margin-right: 12px; visibility: visible; min-height: 0px; height: 438px;`
    if (user) {
      // setFromEmail(true)

      // if(user.customer  === undefined){
      // 	refetch()
      // }
      // if(user.technician === undefined){
      // 	refetch()
      // }
      if (user.userType === 'technician') {
        FetchDetails({ to: user.id });
      } else {
        FetchDetails({ user: user.id });
      }
    }

    if (stepDeciderForDashboard === 4 || stepDeciderForDashboard === 5) {
      setActiveMenu('settings');
    }
    if (stepDeciderForDashboard === 2) {
      setActiveMenu('job-reports');
    }
   
    if (stepDeciderForDashboard === 7) {
      // console.log(ele)
      if (ele != null) {
        ele.style = '';
        // console.log("inside if ::: ",ele)
        ele.style = openCss;
      }
    }
  }, [stepDeciderForDashboard, user]);

  /* const handleLogoClick = (e) => {
		e.preventDefault();
		setcurrentStep(0);
		setActiveMenu('home');
	} */

  useEffect(()=>{
		  setHearAboutUsModal(false);
      handleNewCustomer();
  },[]);

  /**
	 * This function handles the response of customer from modal of Hear About Us after new signup & saves it to database
	 * @author : Kartik
	 **/
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

		setHearAboutUsModal(false);
		handleRefModal()
	};

  const handleCustomerFeed = e => {
		setOtherComeFeedBack('');
		setShowWhereToFieldError(false);
		setCustomerFeedWhereToCome(e.target.value);
	};

  const handleNewCustomer = async () => {
		if (user && user.userType == 'customer') {
      const response = await customerSourceApi.isCustomerExist({ user_id: user.id });
			console.log('response :::::', response);
			if (!response.sourceAlreadyGiven) {
        setTimeout(setHearAboutUsModal(false),3000);
			}
		}
	};

if(showLoader) return (<Loader />) 
return (

    <Container fluid>
      <Row className="newJs">

        <Col md="12" className="mobile-header-outer">
          <Link to="/" >
            <Image src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
          </Link>
          <button
            className="menu-toggle-bar"
            onClick={() => {
              menuSidebarHandle();
            }}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          { user && user.userType === 'technician' && (
            <button
              className="profile-toggle-bar"
              onClick={() => {
			 profileSidebarHandle();
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
		  )}
        </Col>
      {(sessionStorage.getItem("hideHearAboutUsModal"))
        ? <></>
        : <Modal title="How did you hear about us ?" visible={hearAboutUsModal} closable={false} destroyOnClose={false} className="change-feedback-modal title-bold" footer={<Button className="btn app-btn" key="submit" onClick={handleWhereToCome}>Submit</Button>}>
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
            {customerFeedWhereToCome == 'Others' && (
              <div className="section_five">
                <div className="section_sub_five col-12 ml-0 p-0 mt-4 form-group">
                  <input spellCheck rows={4} className="form-control" onChange={(e) => { setShowWhereToFieldError(false); setOtherComeFeedBack(e.target.value); }} id="textarea" />
                  {showWhereToFieldError && <p className="m-0 p-0" style={{ color: 'red' }}> Required Field</p>}
                </div>
              </div>
            )}
          </div>
        </Modal>
      }
      {/*<UserReviewModal user={user} />*/}
        <Col
          xl="2"
          className={
            menuSidebar ? 'sidebar-left-outer active' : 'sidebar-left-outer'
          }
        >
          <LeftSidebar
            user={user}
            toggle={menuSidebarHandle}
            setcurrentStep={setStepDeciderDashboard}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
          <p className='my-app-version'> V{VERSION}</p>

        </Col>

        {user && user.userType === 'technician' && (
          <Col xl="7">
            <DashboardData user={user} sethideBadge={sethideBadge} fromEmail={fromEmail} scheduledBadge={scheduledBadge} currentStep={stepDeciderForDashboard} setcurrentStep={setStepDeciderDashboard} allNotifications={allNotifications} softwareList={softwareList} setActiveMenu={setActiveMenu} initialLoad={initialLoad} scheduledJob={scheduledJob} handleScheduledJob={handleScheduledJob} showNotificationBadge={showNotificationBadge} setShowNotificationBadge={setShowNotificationBadge} notifyCount={notifyCount} setOpenNotification={setOpenNotification} hideBadge={hideBadge} setjobId={setJobId} openNotification={openNotification} estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} jobId={jobId} type={typeForDetails} setType={setTypeForDetails} />
          </Col>
        )}
        {user && user.userType === 'customer' && (
          <Col xl="10">
            <DashboardData user={user} sethideBadge={sethideBadge} scheduledBadge={scheduledBadge} currentStep={stepDeciderForDashboard} setcurrentStep={setStepDeciderDashboard} allNotifications={notificationsArr} softwareList={softwareList} setActiveMenu={setActiveMenu} initialLoad={initialLoad} scheduledJob={scheduledJob} handleScheduledJob={handleScheduledJob} showNotificationBadge={showNotificationBadge} setShowNotificationBadge={setShowNotificationBadge} notifyCount={notifyCount} setOpenNotification={setOpenNotification} hideBadge={hideBadge} setjobId={setJobId} openNotification={openNotification} estimatedWaitTime={estimatedWaitTime} setEstimatedWaitTime={setEstimatedWaitTime} jobId={jobId} type={typeForDetails} setType={setTypeForDetails} />
          </Col>
        )}

        { user && user.userType === 'technician' && (
          <Col
            xl="3"
            className={
              profileSidebar
                ? 'sidebar-right-outer pt-4 px-4 px-md-5 active'
                : 'sidebar-right-outer pt-4 px-4 px-md-5'
            }
          >
            <RightSidebar
              user={user}
              toggle={profileSidebarHandle}
              sethideBadge={sethideBadge}
              openNotification={openNotification}
              setOpenNotification={setOpenNotification}
              setcurrentStep={setStepDeciderDashboard}
              setjobId={setJobId}
              setType={setTypeForDetails}
            />
          </Col>
        )}

      </Row>

    </Container>
  );
};
const Image = style.img`
  	display: block;
  	width: 120px;
	margin:auto;
`;
export default MainPage;
