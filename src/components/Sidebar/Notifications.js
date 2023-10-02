import React, { useCallback, useEffect,useRef } from 'react';
import { useAuth } from '../../context/authContext';
import { useJob } from '../../context/jobContext';
import {Row, Col, Card} from 'react-bootstrap';
import { Modal } from 'antd';
import mixpanel from 'mixpanel-browser';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import {faBell, faUser, faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {handleStartCall, sendCustomerToMeeting} from '../../utils';
import { useSocket } from '../../context/socketContext';
const notificationStrLength = 50;
function Notifications({user,handleDropDown,notificationCount,userNotifications,displayList,setDisplayList,setcurrentStep,setjobId,setType}){

    const { logout } = useAuth();
    const history = useHistory();
    const componentRef = useRef();
    const {fetchJob} = useJob()
    const { socket } = useSocket();
    useEffect(() => {
        // console.log("userNotifications ::: ",userNotifications)
        
        // const handLeNotCLose = ()=>{
        //     if(displayList){
        //         setDisplayList(!displayList)
        //     }
        // }
        // document.addEventListener("click", handLeNotCLose);
        //  return function cleanup() {
        //     window.removeEventListener('click', handLeNotCLose );
        // } 
        // document.onClick
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
        function handleClick(e) {
            if(componentRef && componentRef.current){
                const ref = componentRef.current
                if(!ref.contains(e.target)){
                    // put your action here
                    // console.log('e.target.classList>>>>>>>>>>',e.target.classList)
                    if(e.target.classList.contains('fa-bell') ||  e.target.classList.contains('total-notification') || e.target.classList.contains('bell-icon') ||  e.target.classList.length === 0){
                        //bell clicked no hide of notification list
                    }else{
                        setDisplayList(false)                                       
                    }
                }
            }
        }

    }, []);


    const closeDropdown = () =>{
        setDisplayList(false)
    }


    const Logout = useCallback(() => {
        Modal.confirm({
            title: 'Logout Now?',
            okText: 'Logout',
            cancelText: 'Cancel',
            className: "logout-modal",
            onOk() {
            //   if(user.userType === 'technician'){
            //         // mixpanel code//
            //         mixpanel.identify(user.email);
            //         mixpanel.track('Technician - Logout');
            //         // mixpanel code//
            //     }else{
            //         // mixpanel code//
            //         mixpanel.identify(user.email);
            //         mixpanel.track('Customer - Logout');
            //         // mixpanel code//
            //     }
                logout();
            },
        });
    }, [logout]);

    const handleAccept = (item)=>{
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - clicked on new job notification',{'JobId':item.id});
        // mixpanel code//
        history.push(`/technician/new-job/${item.id}`, { userIds: [user.id],appendedJob:item.id });
    }
    const handleTechnicianAccept = (item)=>{
        setjobId(item.id)
        history.push(`/customer/accept-job/${item.id}`);
    }

    const handleProfilePageRedirect = () => {
        if(user){
            mixpanel.identify(user.email);
            if(user.userType === 'technician'){
                mixpanel.track('Technician - Profile settings');
                setcurrentStep(4)
            }else{
                mixpanel.track('Customer - Profile settings');
                setcurrentStep(5)
            }
        }
    }
    const push_to_job_detail = (item,type="details") => {
        const jobid = item.id;
        fetchJob(jobid)
        setjobId(jobid)
        console.log("type:::",type)
        if(type === "Scheduled Job" && (item.technician === undefined || item.technician === "") ){
            setType("apply")
        }
        else{
            setType("details")
        }
        
        if(user.userType === 'technician'){
            mixpanel.identify(user.email);
            mixpanel.track('Technician  - Click Job details',{'JobId':jobid});
        }else{
            mixpanel.identify(user.email);
            mixpanel.track('Customer -Click Job details',{'JobId':jobid});
        }
        setcurrentStep(6)
        // history.push(`/technician/new-job/${item.id}`, { userIds: [user.id],appendedJob:item.id });
    };

    /*const getEstEarning = (softwareData) => {

        const time1 = (softwareData != undefined && String(softwareData.estimatedTime).indexOf('-') != -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
        const time2 = (softwareData != undefined && String(softwareData.estimatedTime).indexOf('-') != -1  ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)

        let price_Arr = softwareData.rate? softwareData.rate : 0
        if(price_Arr > 0){
            let initPriceToShow = (time1/6)*parseInt(price_Arr)
            initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 'NA')
            let finalPriceToShow = (time2/6)*parseInt(price_Arr)
            finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 'NA')
            return '$'+initPriceToShow+'-'+finalPriceToShow
        }else{
            return '';
        }
    }*/

  return (
    <Row>
        <Col md="8" xs="7" className="">
            <a href="#" onClick={handleDropDown} className="icons-outer pr-3 bell-icon" title="Notifications">
                {userNotifications!=null && userNotifications.length > 0  && notificationCount > 0  ? <span className="total-notification">{notificationCount}</span>:<></>}
                <FontAwesomeIcon  icon={faBell}/>               
            </a>
            
            <a href="#" onClick={handleProfilePageRedirect} className="icons-outer pl-4" title="Profile Settings">
                <FontAwesomeIcon icon={faUser}/>
            </a>             
        </Col>

        <Col md="4" xs="5" className="text-right">
            <a href="#" onClick={Logout} className="logout-btn">
                Logout
            </a>
        </Col>
        {/*<li className="d-flex flex-column" key={item.id}>
            <Col md="12" className=" p-0 m-0">
               <p className="font-weight-bold p-0 m-0"> {item.job.issueDescription.substring(0, 17)}</p>
            </Col>
            <Col md="12" className=" p-0 d-flex justify-content-between">
               <p className="m-0 font-small p-0 pt-3"> <span className="LabelVal" >Posted by</span> :{item.job.customer.user.firstName}</p>
               { user.userType === "technician" && 
                    <ToggleMsg job={item.job} handleAccept={handleAccept} user={user} />
                }

                 { user.userType === "customer" && 
                    <CustomerList job={item.job} user={user} />
                }

            </Col>
        </li>*/}
        {displayList && 
            <Col md="12"  className="notification-container" ref={componentRef}>
                <div className="arrow-up"></div>
                <div className="notification-list ">
                    <Card>
                        <Card.Header className="font-weight-bold cardHeader">
                            <span className="d-block float-left pt-1">Notifications </span>
                            <span className="float-right cross-btn-notification" onClick={closeDropdown}>
                                <FontAwesomeIcon icon={faTimesCircle}/>
                            </span>  

                        </Card.Header> 

                        <Card.Body>                        
                            <ul>
                                {userNotifications!=null && userNotifications.length > 0 
                                    ? 
                                    userNotifications.map((item,idx)=>{

                                        return (
                                           
                                            <li key={idx}>
                                                <Col xs="12" className="notification-title">
                                                    {(item.title ? item.title : "")} 
                                                    { item && item.job && item.job.subOption &&
                                                        <>
                                                        { " "+item.job.subOption}
                                                        </>
                                                    }
                                                </Col>
                                                <Col xs="12" className="notification-description pt-2">
                                                    { item.job && item.job !== '' ?<p className="" title={item.job.issueDescription}> 
                                                        {(item.job.issueDescription.length > notificationStrLength ? item.job.issueDescription.substring(0,notificationStrLength)+'...' : item.job.issueDescription)}
                                                        </p>
                                                        :
                                                        <></>
                                                    }
                                                </Col>
                                                <Col xs="12" className="notification-bottom pt-0">
                                                    <Row>
                                                        
                                                        <Col md="8" className="notification-other-info">
                                                            { item && item.job && item.job.customer && item.job.customer.user &&
                                                                <span className="" ><b>Posted by: </b>{item.job.customer.user.firstName +' '}{item.job.customer.user.lastName}</span>
                                                            }

                                                            { item && item.job && item.job.customer_approved_long_job  === 'yes' && item.type === 'long_job_notifcation' && (item.job.long_job_with_minutes === 'undefined' || item.job.long_job_with_minutes === 'no') && 
                                                                <>
                                                                    {( user?.userType === "customer" ) && <span className="" ><b>Job Cost: </b>${item.job.long_job_cost}</span>}
                                                                    <span className="" ><b>Job Hours: </b> {item.job.long_job_hours}</span>
                                                                </>

                                                            }
                                                            { item && item.job && item.job.customer_approved_long_job  === 'yes' && item.job.long_job_with_minutes !== undefined && item.job.long_job_with_minutes === 'yes' &&  item.type === 'long_job_notifcation' &&
                                                                <>
                                                                    <span className="" >This Job has been converted to long job. Charges will be applied on per 6 minutes basis.</span>
                                                                </>

                                                            }

                                                            {/* {item.estimate_earning && user?.technician?.tag !== 'employed' &&
                                                                <span className="" ><b>Earnings: </b>{item.estimate_earning}</span>
                                                            } */}
                                                            <p className="notify-time"> {item.time}</p>
                                                        </Col>
                                                        <Col md="4" className="text-right notification-bottom-right">
                                                            {user.userType === "technician" && item.job && 
                                                                <ToggleMsg job={item.job} handleAccept={handleAccept} user={user} push_to_job_detail={push_to_job_detail} item={item} socket={socket} />
                                                            }

                                                            {user.userType === "customer" && item.job && 
                                                                <CustomerList key={item.job.jobId} push_to_job_detail={push_to_job_detail} handleTechnicianAccept={handleTechnicianAccept} sendCustomerToMeeting={sendCustomerToMeeting} job={item.job} user={user} item={item} />
                                                            }

                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </li>
                                        )
                                    }) 
                                    : 
                                    <li>  
                                        <Col md="12" className=" p-0 m-0">
                                            <p className="font-weight-bold text-center p-0 m-0"> No Notifications</p>
                                        </Col> 
                                    </li>
                                }
                            </ul>
                           
                        </Card.Body>
                    </Card>
                </div>
            </Col> 
        }
    </Row>


    );
}

 const ToggleMsg = (props)=>{

    if( props.user.technician &&  props.job.declinedByCustomer.includes(props.user.technician.id) ){
        return  <span className="LabelVal text-danger" >Declined by customer</span>
    }

    if( props.job.status === "Declined" ){
        return  <span className="LabelVal text-info"> Job removed </span>
    }
     if( props.job.status === "Expired" ){
        return  <span className="LabelVal text-danger">Job expired </span>
    }

    if(props.job.status === "Accepted" && props.job.technician ===  props.user.technician.id  ){
         return  <button onClick={()=>{handleStartCall(props.job.id,props.socket,props.user)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Start Call
            </button>
    }
    if( props.user.technician &&  props.job.tech_declined_ids.includes(props.user.technician.id)  ){
        return  <span className="LabelVal text-danger" >Declined</span>
    }

    if((props.job.status === "Pending" || props.job.status === "Waiting") && !props.job.tech_declined_ids.includes(props.user.technician.id)){
        return (
            <button onClick={()=>{props.handleAccept(props.job)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Details
            </button>
        )
    }
    if(props.job.status === "Completed"){
        return  <span className="LabelVal text-success" >Completed</span>
    }
    if(props.job.status === "Accepted"){
        return  <span className="LabelVal text-info" >Not available</span>
    }

    if(props.item.type === "Scheduled Job" && props.job.technician && props.user.technician  && props.job.technician !== props.user.technician.id ){
        return  <span className="LabelVal text-danger">Job Taken </span>
    }

    if(props.item.type === "Scheduled Job"){
        return <button onClick={()=>{props.push_to_job_detail(props.job,props.item.type)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Details
            </button>
    }

    if(props.job.status === "Scheduled" && props.job.technician && props.user.technician  && props.job.technician === props.user.technician.id ){
        return (
            <button onClick={()=>{props.push_to_job_detail(props.job)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Details
            </button>
        )
    }
    
    return <></>
}


const CustomerList = (props)=>{

    if(props.item.type === "Scheduled Job Accepted"){
        return <button onClick={()=>{props.push_to_job_detail(props.job)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Click here
            </button>
    }


    /*if(props.job.status === "Scheduled" && props.job.customer && props.job.customer.id === props.user.customer.id && props.job.technician && props.item.type !== "status"){
        return <span className="LabelVal text-info">Meeting in 5 Minutes </span>
    }*/
    if(props.job.status === "Accepted" && props.job.customer && props.user.customer && props.job.customer.id === props.user.customer.id ){
        return <button onClick={()=>{props.handleTechnicianAccept(props.job)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Click here
            </button>
    }

    if(props.job.status === "Inprogress" && props.job.customer && props.user.customer && props.job.customer.id === props.user.customer.id ){
        return <button onClick={()=>{props.sendCustomerToMeeting(props.job, props.user, 'Customer - Join meeting from notification button')}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Join
            </button>
    }

    if(props.job.status === "Completed"){
        return <span className="LabelVal text-success" >Completed</span>
    }

    if(props.job.status === "Scheduled"){
        return (
            <button onClick={()=>{props.push_to_job_detail(props.job)}} className="btn notification-btn app-btn app-btn-super-small">
                <span></span>Details
            </button>
        )
    }

    if(props.job.status === "ScheduledExpired"){
        return <span className="LabelVal text-danger" >Expired</span>
    }

    return <span></span>
}



export default Notifications;