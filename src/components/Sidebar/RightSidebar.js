import React, { useState, useEffect } from 'react';
import {Row, Col, Image } from 'react-bootstrap';
// import * as DOM from 'react-router-dom';
// import style from 'styled-components';
// import { useAuth } from '../../context/authContext';
import profileImg from '../../assets/users/user.png';
// import { CountdownCircleTimer } from 'react-countdown-circle-timer'
// import tick from '../../assets/images/tick.jpg';
import {useServices} from '../../context/ServiceContext';
import * as JobService from "../../api/job.api"
// import mixpanel from 'mixpanel-browser';
import { useJob } from '../../context/jobContext';
import {useNotifications} from '../../context/notificationContext';
import ExcelImage from '../../assets/images/excel.png';
import GoogleSheetImage from '../../assets/images/google_sheet.png';
import QuickBookImage from '../../assets/images/quickbook.png';
import OtherSoftwareImage from '../../assets/images/other_software.png';
import Notifications from './Notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './rightbar.css';
import {APP_URL} from '../../constants';

// let intialRef = true
function RightSidebar({user,refetch = false,openNotification,setOpenNotification,sethideBadge,hideBadge,setcurrentStep,setjobId,setType,toggle}){
    
    const {techJobs} = useJob();


    const [displayList,setDisplayList] = useState(techJobs.length > 0 ?true:false);
    const {allNotifications,updateReadStatus} = useNotifications();
    const [userNotifications,setUserNotifications] = useState([]);

    const [showExperience,setShowExperience] = useState(false);
    const [firstImage,setFirstImage] = useState(false);
    const [secondImage,setSecondImage] = useState(false);
    const [firstSoftware,setFirstSoftware] = useState(false);
    const [secondSoftware,setSecondSoftware] = useState(false);
    const [notificationCount,setNotificationCount] = useState(0)
    // const [lenBeforeAfter,setlenBeforeAfter] = useState(0);
    // const [notificationSeen,setnotifcationSeen] = useState(false);
    const TechImages = {
          'Google Sheets': GoogleSheetImage,
          'Microsoft Office': ExcelImage,
          'IT Technical Support': OtherSoftwareImage,
          'QuickBooks': QuickBookImage,
    };

    // const { logout } = useAuth();
    const {
        // totalTime,
        totalTimeSeconds,
        totalEarnings,
        monthlyEarnings,
        // monthlyHours,
        monthlySeconds,
        overAllRatings,
        // FetchDetails
    } = useServices()
    const HandleHide = () => {
    toggle();
    console.log("ffffffffffffffffffffffffffffffff")
  };
    useEffect(()=>{      
      console.log("user: :::::::::::::",user)
        if(user && user.userType === "customer" && user.customer){
            let filter_dict =  {}
            filter_dict['customer'] = user.customer.id
            const res = JobService.findJobByParams(filter_dict)
            res.then((result)=>{   
                if(result.data.length > 2){
                    let software1 = (result && result.data[0] && result.data[0]['software'] ? result.data[0]['software']['name'] : '')
                    let software2 = (result && result.data[1] && result.data[1]['software'] ? result.data[1]['software']['name'] : '')
                    setFirstSoftware(software1)
                    setFirstImage(TechImages[software1])
                    if(software1 !== software2){
                        setSecondSoftware(software2)
                        setSecondImage(TechImages[software2])
                    }
                    setShowExperience(true)
                }else if(result.data.length === 0){
                    setShowExperience(false)
                }
            })
        }
    },[user])


    const notificationCountHandler = (userNotifyArr)=>{
         const onLyReadableItems = userNotifyArr.filter(item => item.read === false)
        
        if(onLyReadableItems.length > 0){
          // console.log("usertype in RightSidebar js ::",user.userType)
          // document.title = "("+onLyReadableItems.length.toString()+")" + " " + "Geeker"
          document.title = `(${onLyReadableItems.length.toString()}) Geeker`;
        } else{
           document.title = "Geeker"
        }
        setNotificationCount(onLyReadableItems.length)

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



            userNotifyArr.push(userNotifyArrTemp[k])
        }
        
        const onLyReadableItems = userNotifyArr.filter(item => item.read === false)
        console.log("userNotifyArr ::: 1",userNotifyArr)
        console.log("onLyReadableItems :::: ",onLyReadableItems.length)
        
        if(onLyReadableItems.length >0){
            // console.log("usertype in RightSidebar js ::",user.userType)
            document.title = "("+onLyReadableItems.length+")" + " " + "Geeker"
            }
        else{
             document.title = "Geeker"
        }

        setNotificationCount(onLyReadableItems.length)
        // console.log(userNotifyArr)
        // intialRef = false
        return userNotifyArr.reverse()
    }*/



    useEffect(()=>{
        if(allNotifications && user){
            // console.log("i am in 2222",allNotifications)

            const userNotifyArrTemp = allNotifications.filter(item => (item && user && item.user) && item.user.id === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            // let jobIds = userNotifyArrTemp.map(item => (item.job && item.job.id ? item.job.id : 0))
            // let otherNotifications = allNotifications.filter(item => item.type === "from_admin")
            /*const unique = (value, index, self) => {
              return self.indexOf(value) === index
            }*/
            // const jobs = jobIds.filter(unique)
            // let theVal = notificationCount + 1
            
            let userNotifyArr = userNotifyArrTemp

            notificationCountHandler(userNotifyArr)
            for(let i=0; i <= userNotifyArr.length-1;i++){

                let old_time = new Date(userNotifyArr[i]['updatedAt'])
                // console.log("old_time ::::::::::::",old_time)
                // console.log("new timer ::::::::::::",new Date(userNotifyArr[i]['createdAt']))
                let now_time = new Date();   
                var diffMs = (now_time - old_time); // milliseconds between now & Christmas
                var diffDays = Math.floor(diffMs / 86400000); // days
                var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

                if(diffDays !== 0){
                     userNotifyArr[i]['time'] = diffDays.toString() +' days ago'
                }else if(diffHrs !== 0){
                     userNotifyArr[i]['time'] = diffHrs.toString() +' hours ago'
                }else if(diffMins !== 0){
                     userNotifyArr[i]['time'] = diffMins.toString() +' minutes ago'
                }else{
                     userNotifyArr[i]['time'] = 'Few seconds ago'
                }                

            } 
            // if(userNotifyArr[0]['read'] == false){
            //     let body = `${userNotifyArr[0]['title']}`
            //     var options = {
            //       body: body
            //     }
            //      var  notification = new Notification("New Notification",options)
            //      console.log("REACT_APP_URL ::::: ",APP_URL)
            //      notification.onClick = function(event){
            //       event.preventDefault()
            //       window.open(APP_URL);
            //      }
            //   }
            // console.log("otherNotifications ::: ",userNotifyArr)
            setUserNotifications(userNotifyArr)
        }
    },[allNotifications])

    useEffect(()=>{
        cleanUp()
    },[techJobs])

    const cleanUp =()=>{
        setTimeout(()=>{
            let demoArr = [...techJobs]
            demoArr.shift()
            // console.log(demoArr)
        },3000)
    }
    /*const renderTime = ({ remainingTime }) => {
         if (remainingTime === 0) {
            // console.log("hy")
            // return <div className="timer">Too lale...</div>;
          }
    }*/


    /*const removeJob = (item)=>{
        let duplicateJobItem = techJobs.filter((job)=> job.jobId !== item.jobId)        
    }*/

   
    useEffect(()=>{
        if(openNotification){
            setDisplayList(!displayList)
            setNotificationCount(0)
            updateReadStatus({"user":user.id,"status":true})
            setOpenNotification(false)
        }
    },[openNotification])

    const handleDropDown = ()=>{
        setDisplayList(!displayList)
         document.title = "Geeker"
        updateReadStatus({"user":user.id,"status":true})
        setNotificationCount(0)
        sethideBadge(true)

    }

    
    const hms_convert = (t) => {
        if(t){
            let d = Number(t);
            let h = Math.floor(d / 3600);
            let m = Math.floor(d % 3600 / 60);
            let s = Math.floor(d % 3600 % 60);
            let hFormat = h <= 9 ? "0"+h : h
            let mFormat = m <= 9 ? "0"+m : m
            let sFormat = s <= 9 ? "0"+s : s
            let hDisplay = h > 0 ? hFormat+':' : "00:";
            let mDisplay = m > 0 ? mFormat+':' : "00:";
            let sDisplay = s > 0 ? sFormat : "00";
            return hDisplay + mDisplay + sDisplay; 
        }else{
            return '00:00:00';
        }
    }

  return (
    <Row>
      <Col md="12" className="pt-lg-5 pt-0 pb-3">
        <Notifications
          user={user}
          handleDropDown={handleDropDown}
          notificationCount={notificationCount}
          userNotifications={userNotifications}
          displayList={displayList}
          setDisplayList={setDisplayList}
          setcurrentStep={setcurrentStep}
          setjobId={setjobId}
          setType={setType}
        />
      </Col>
      <button
        className="profile-toggle-hide"
        onClick={HandleHide}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      {user && user.userType === 'technician' && (
        <Col md="12" className="pt-0 pb-2">
          <h1 className="large-heading text-center">My Dashboard</h1>
        </Col>
      )}

      {user && user.userType === 'technician' && (
        <Col md="12" className="pt-3">
          <Row>
            <Col md="4" className="pt-md-5 pt-2">
              <span className="label-name d-block pt-1">Rating</span>
              <span className="label-value d-block one-liner">
                {overAllRatings != null
                  && overAllRatings
                  && !isNaN(overAllRatings)
                  ? overAllRatings
                  : 0}
              </span>
            </Col>
            <Col md="4" className="p-0">
              <div className="profile-img-outer-1">
                <div className="profile-img-outer grid-center">
                  <Image
                    roundedCircle
                    className="img-fluid h-100p"
                    src={
                      user
                        && user?.technician
                        && user?.technician?.profile?.image
                        && user?.technician?.profile?.image !== ''
                        && user?.technician?.profile?.image !== 'false'
                        ? user?.technician?.profile?.image
                        : profileImg
                    }
                  />
                </div>
              </div>
            </Col>
            {user && user.userType === 'technician' && (
              <Col md="4" className="pt-md-5 pt-2 text-right">
                <span className="label-name d-block pt-1">Earned</span>
                <span className="label-value d-block one-liner">
                  {user?.technician?.tag !== 'employed' ? 
                    totalEarnings != null ? '$' + totalEarnings :'$' + 0.0 
                  : 'NA'}
                </span>
              </Col>
            )}
            {user && user.userType === 'customer' && (
              <Col md="4" className="pt-5 text-right">
                <span className="label-name d-block pt-1">Billed</span>
                <span className="label-value d-block one-liner">
                  $
                  {totalEarnings != null ? totalEarnings : 0.0}
                </span>
              </Col>
            )}
          </Row>
        </Col>
      )}

      {user && user.userType === 'technician' && (
        <Col md="12" className="pt-5 text-center">
          {user && user.userType === 'technician' && (
            <Row>
              <Col
                md="5"
                className="text-center total-block-outer py-5 mx-auto px-0 mb-5"
              >
                <Row>
                  <Col md="12" className="">
                    {/* totalTime > 1 ?
                                              <>
                                                  <span className="d-block label-total-name">Total Hours Worked</span>
                                                  <span className="d-block label-total-value">{totalTime}</span>
                                              </>
                                             :
                                              <>
                                                  <span className="d-block label-total-name">Total Minutes Worked</span>
                                                  <span className="d-block label-total-value">{(totalTime * 60).toFixed(0)}</span>
                                              </>
                                          */}
                    <span className="d-block label-total-name">
                      Total Hours Worked
                    </span>
                    <span className="d-block label-total-value">
                      {hms_convert(totalTimeSeconds)}
                    </span>
                  </Col>
                  <Col md="12" className="pt-4">
                    <span className="d-block label-total-name">
                      Hours This Month
                    </span>
                    <span className="d-block label-total-value">
                      {hms_convert(monthlySeconds)}
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col
                md="5"
                className="text-center total-block-outer py-5 mx-auto px-0 mb-5"
              >
                <Row>
                  <Col md="12" className="">
                    <span className="d-block label-total-name">
                      Total Earnings
                    </span>
                    <span className="d-block label-total-value">
                      {user?.technician?.tag !== 'employed'? 
                        totalEarnings != null ? '$ '+totalEarnings : '$ '+ 0.0  
                      : 'NA'}
                      {/* {totalEarnings != null ? user?.technician?.tag !== 'employed' ? '$ '+totalEarnings : 'NA' : '$ '+ 0.0} */}
                    </span>
                  </Col>
                  <Col md="12" className="pt-4">
                    <span className="d-block label-total-name">
                      Earnings This Month
                    </span>
                    <span className="d-block label-total-value">
                      {user?.technician?.tag !== 'employed'? 
                        monthlyEarnings != null ? '$' + monthlyEarnings : '$' + 0.0 
                      : 'NA'}
                    </span>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}

          {user && user.userType === 'customer' && (
            <Row>
              <Col
                md="5"
                className="text-center total-block-outer py-5 mx-auto px-0"
              >
                <Row>
                  <Col md="12" className="">
                    {/* totalTime >1 ?
                                              <>
                                              <span className="d-block label-total-name">Total Hours Provided</span>
                                             <span className="d-block label-total-value">  {totalTimeSeconds}
                                             </span>
                                              </>
                                             :
                                             <>
                                             <span className="d-block label-total-name">Total Minutes Provided</span>
                                             <span className="d-block label-total-value">  {(totalTime * 60).toFixed(2)}
                                             </span>
                                              </>
                                          */}
                    <span className="d-block label-total-name">
                      Total Hours Provided
                    </span>
                    <span className="d-block label-total-value">
                      {' '}
                      {hms_convert(totalTimeSeconds)}
                    </span>
                  </Col>

                  <Col md="12" className="pt-4">
                    {/*  monthlyHours!=null && monthlyHours >1 ?
                                               <>
                                                  <span className="d-block label-total-name">Hours This Month</span>
                                                  <span className="d-block label-total-value">{monthlyHours}</span>
                                               </>
                                               :
                                                <>
                                                  <span className="d-block label-total-name">Minutes This Month</span>
                                                  <span className="d-block label-total-value">{(monthlyHours * 60).toFixed(2) }</span>
                                               </>
                                          */}
                    <>
                      <span className="d-block label-total-name">
                        Hours This Month
                      </span>
                      <span className="d-block label-total-value">
                        {hms_convert(monthlySeconds)}
                      </span>
                    </>
                  </Col>
                </Row>
              </Col>
              <Col
                md="5"
                className="text-center total-block-outer py-5 m-auto px-0"
              >
                <Row>
                  <Col md="12" className="">
                    <span className="d-block label-total-name">
                      Total Money Spent
                    </span>
                    <span className="d-block label-total-value">
                      $
                      {' '}
                      {totalEarnings != null && totalEarnings
                        ? totalEarnings
                        : 0}
                    </span>
                  </Col>
                  <Col md="12" className="pt-4">
                    <span className="d-block label-total-name">
                      Spent This Month
                    </span>
                    <span className="d-block label-total-value">
                      $
                      {' '}
                      {monthlyEarnings != null ? monthlyEarnings : 0}
                    </span>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </Col>
      )}

      {user
          && user.userType === 'customer'
          && showExperience === true
          && firstImage && (
        <>
            <Col md="12" className="pt-5">
            <Row>
                <Col xs="12">
                <h4 className="medium-heading">Expertise wanted</h4>
              </Col>
              </Row>
          </Col>
            <Col md="12" className="pt-4 text-center mb-5">
            <Row>
                {firstImage && (
                <Col
                  md="5"
                  className="text-center radius-4 payment-outer py-4 px-0 bg-level-3 m-auto"
                >
                  <span className="d-block label-payment-value">
                    <Image src={firstImage} className="software-img" />
                  </span>
                  <span className="d-block label-software-name">
                    {firstSoftware}
                  </span>
                </Col>
              )}

                {secondImage && (
                <Col
                  md="5"
                  className="text-center radius-4 payment-outer py-4 px-0 bg-level-2 m-auto"
                >
                  <span className="d-block label-payment-value">
                    <Image src={secondImage} className="software-img" />
                  </span>
                  <span className="d-block label-software-name">
                    {secondSoftware}
                  </span>
                </Col>
              )}
              </Row>
          </Col>
          </>
      )}
    </Row>
  );
}

/*const Link = style(DOM.Link)`
      cursor:pointer;
  `;*/

export default React.memo(RightSidebar);
