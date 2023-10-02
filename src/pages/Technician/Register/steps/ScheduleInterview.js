import React, { useState, useEffect } from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import NewSquareBtn from "components/NewSquareBtn"
import {CALENDLY_EVENT_URL} from '../../../../constants/index';
import { useCalendlyEventListener,InlineWidget } from "react-calendly";
import mixpanel from 'mixpanel-browser';
import { useUser } from '../../../../context/useContext';
import * as TechnicianApi from '../../../../api/technician.api';
import { Spin } from 'antd';

const ScheduleInterview = ({onPrev, onNext, setShowProgress, setProgressBarPercentage,register}) => {
    const {user} = useUser()

    const[disableCompleteBtn, setDisableCompleteBtn] =useState(true)
    const[showSpinner, setShowspinner] =useState(false)
    useEffect(()=>{
        setShowProgress(true)
        setProgressBarPercentage(100)
    },[])

    useCalendlyEventListener({
        onEventScheduled: (e) =>{
            setDisableCompleteBtn(false)
        },
      });
    const handleComplete = async()=>{
        setShowspinner(true)
        if(user){
        mixpanel.identify(user.email);
        mixpanel.track('Technician- Click Next button from Schedule interview page',{ 'Email': user.email });
        }
        await TechnicianApi.updateTechnicianWithParams(register.technician.id,{registrationStatus:'interview_result'})
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - scheduled interview');
        // mixpanel code//
        window.location.href = "/"
        // onNext()
    }
    return<div className="d-flex justify-content-center align-items-center flex-column">
        <HeadingAndSubHeading heading={"Schedule Interview"} subHeading={"Set up your meeting with HR at Geeker! We’ll discuss you, your goals, and how you’re going to succeed at Geeker! We’re very excited to meet you and greet you."} />

        {/* <div className="details-div justify-content-center instructions-text d-flex align-items-center">
            <div className="instructions-heading-div d-flex justify-content-center"> */}
            <InlineWidget
                url= {CALENDLY_EVENT_URL} 
                rootElement={document.getElementById("root")}
                text="Schedule"
                // style={{paddingLeft:'5px',height:"1000px"}}
            />
            {/* </div>
        </div> */}

        <div className="btn-footer d-flex justify-content-between align-items-center">
            <NewSquareBtn type={"previous"} onPrev={onPrev} />

            
            <button 
                className={"green-btn"}
                style={{opacity: disableCompleteBtn ? "0.3" : "1"}}
                disabled={disableCompleteBtn}
                onClick={handleComplete}
            >
                <span></span>
                {(showSpinner 
                    ?
                    <Spin className="spinner"/>
                    :
                    <spam className="green-btn-span">Complete</spam>
                )}
            </button>
        </div>
    </div>
}

export default ScheduleInterview