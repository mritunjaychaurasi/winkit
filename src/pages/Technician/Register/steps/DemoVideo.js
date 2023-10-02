import React, {useEffect ,useState} from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import ReactPlayer from 'react-player/lazy';
import { FaPlay } from "react-icons/fa";
import { openNotificationWithIcon } from "../../../../utils"
import * as TechnicianApi from '../../../../api/technician.api';
import mixpanel from 'mixpanel-browser';
import {EmailOutlook, ITSupport} from "../../../../constants"

const DemoVideo = ({onPrev, onNext, setShowProgress, setProgressBarPercentage, register, user, setCurrentStep}) => {

    const[playBtn,setPlayBtn] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false)

    useEffect(()=>{
        setShowProgress(true)
        setProgressBarPercentage(70)
    },[])

    const handleOnNext = async () => {

        // console.log("My console from demo video", user.technician.expertise)
        let temp =[]
        for (let x in user.technician.expertise){
            // console.log("My console from demo video", user.technician.expertise[x].software_id)
            if(user.technician.expertise[x].software_id !== EmailOutlook){
                temp.push(user.technician.expertise[x].result)
            }
            // user.technician.expertise[x].find(item)
        }
        // console.log("My console from demo video", temp, temp.includes(undefined))
        if(temp.includes(undefined)){
            // console.log("My console in else")
            setShowSpinner(true)
            await TechnicianApi.updateTechnician(register.technician.id, {registrationStatus:"exam"})
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Technician - watched video and proceeded to next form');
            // mixpanel code//
            onNext()
        }else{   
            // console.log("My console in if")
            setShowSpinner(true)
            await TechnicianApi.updateTechnician(register.technician.id, {registrationStatus:"finalize_profile"})
            setCurrentStep(7)
        }
    }

    return<div className="d-flex justify-content-center align-items-center flex-column">
        <HeadingAndSubHeading heading={"Please watch the video below. 🔑"} subHeading={"This video shows you how the system works, it’s very important."} />

        <div className="d-flex justify-content-center align-items-center flex-column">
            <div className="demo-video mb-50 mt-20">
               <div className={!playBtn ? "demoDivContainer" : "demoDivContainer2"}>
                    <div className="react-demoDiv">
                    { !playBtn &&
                         <button onClick={()=>{setPlayBtn(true) }} className="play-button">
                          <FaPlay className="play-btn" />
                        </button>
                    } 
                    </div>
                </div>
                    <ReactPlayer  
                         url='https://www.youtube.com/watch?v=nSk2WXxrpiI' 
                         className="react-player"
                         playing={playBtn}
                         controls
                    />
                    
            </div>
            <span className="video-span">Do you want to know on how it looks on the user's end? <a href="https://www.youtube.com/watch?v=nSk2WXxrpiI" target="_blank">Watch this</a></span>
        </div>

        <FooterBtns onPrev={onPrev} showSpinner={showSpinner} hideSaveForLater={true} onNext={playBtn ? handleOnNext : ()=>{ openNotificationWithIcon('error', 'Error', 'Please Play Video') ; } } />

    </div>
}

export default DemoVideo