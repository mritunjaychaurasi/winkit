import React, { useState, useEffect } from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import NewSquareBtn from "components/NewSquareBtn"
import Instructions from "./instructions"
import { openNotificationWithIcon } from '../../../../utils';
import * as TechnicianApi from '../../../../api/technician.api';
import { Spin } from 'antd';

const AllYouNeedToKnow = ({onPrev, onNext, setShowProgress, setProgressBarPercentage, register}) => {

    const[disableCompleteBtn, setDisableCompleteBtn] =useState(false)
    const [isChecked, setIsChecked] = useState(false);

    useEffect(()=>{
        setShowProgress(true)
        setProgressBarPercentage(60)
    },[])
    
    useEffect(()=>{
    },[isChecked])

    const handleComplete = async ()=>{
        if(!isChecked){
            openNotificationWithIcon('error', 'Error', 'Please read the instructions first.') ;
            return
        }
        setDisableCompleteBtn(true)
        await TechnicianApi.updateTechnician(register.technician.id, {registrationStatus:"exam"})
        onNext()
    }

    return<div className="d-flex justify-content-center align-items-center flex-column">
        <HeadingAndSubHeading heading={"All you need to know"} subHeading={"Please read the information below"} />

        <div className="details-div justify-content-start instructions-text">
            <div className="instructions-heading-div">
                <span className="">Onboarding for Techs - How it Works</span>
            </div>
            <hr />
            <Instructions 
            isChecked={isChecked}
            setIsChecked={setIsChecked}
            />
        </div>

        <div className="btn-footer d-flex justify-content-between align-items-center">
            <NewSquareBtn type={"previous"} onPrev={onPrev} />

            
            <button 
                className={"green-btn"}
                style={{opacity: disableCompleteBtn ? "0.3" : "1"}}
                disabled={disableCompleteBtn}
                onClick={handleComplete}
            >
                <spam className="green-btn-span">
                {(disableCompleteBtn 
                    ?
                    <Spin className="spinner"/>
                    :
                    <>Complete</>
                )}
                </spam>
            </button>
        </div>
    </div>
}

export default AllYouNeedToKnow