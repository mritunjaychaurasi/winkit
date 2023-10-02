import { StepTitle } from "pages/Customer/ProfileSetup/steps/style"
import React, {useState} from "react"
import {Button} from 'react-bootstrap';
import { Spin } from 'antd';

const ScheduleModal = (selectedSchedule, handleCancel, handleConfirm) => {

    console.log("My console", new Date(selectedSchedule.primary).getHours())


    /**
     * Converts 24 hrs format time to 12 hrs format time
     * @params : 24 hrs format time
     * @return : 12 hrs format time
     * @author : Vinit (From internet)
     **/
    function convert24hrsTo12hrsformat (time) {
        // Check correct time format and split into components
        time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    
        if (time.length > 1) { // If time format correct
          time = time.slice (1);  // Remove full string match value
          time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
          time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join (''); // return adjusted time or original string
    }
    
    const [confirmButtonDisabled, setconfirmButtonDisabled] = useState(false);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC']

    /**
     * when confirm click then create and update job
     * @author : Vinit (From internet)
     **/
    const handleConfirmClick = async () =>{
        setconfirmButtonDisabled(true)
        await handleConfirm()
        handleCancel()
        setTimeout(()=>{setconfirmButtonDisabled(false)},2000)
    }

    return (<div className="font-nova">
            <StepTitle className="job-heading-text margin-bottom">Your selected times are:</StepTitle>
            <div className="d-flex justify-content-around margin-bottom">

                <div className="d-flex flex-column justify-content-center align-items-center">
                    <div className="outerMostDiv green-bg-color border-radius-50 d-flex justify-content-center align-items-center mb-3">
                        <div className="centerDiv green-bg-color border-radius-50 d-flex justify-content-center align-items-center">
                            <div className="innerMostDiv green-bg-color border-radius-50 d-flex justify-content-center align-items-center">
                                <span className="bold-26">1</span>
                            </div>
                        </div>
                    </div>
                    <span className="pri-sec-time-heading">PRIMARY TIME</span>
                    <span className="medium-font">
                        {
                            new Date(selectedSchedule.primary).getDate()+ ", " +
                            monthNames[new Date(selectedSchedule.primary).getMonth()]+ " " +
                            new Date(selectedSchedule.primary).getFullYear()
                        }
                    </span>
                    <span className="medium-font">
                        {
                            convert24hrsTo12hrsformat (String(new Date(selectedSchedule.primary).getHours()) + ':00')
                            +" - "+
                            convert24hrsTo12hrsformat (String(new Date(selectedSchedule.primary).getHours()) + ':30')
                        }
                    </span>
                </div>

                <div className="d-flex flex-column justify-content-center align-items-center">
                    <div className="outerMostDiv green-bg-color border-radius-50 d-flex justify-content-center align-items-center mb-3">
                        <div className="centerDiv green-bg-color border-radius-50 d-flex justify-content-center align-items-center">
                            <div className="innerMostDiv green-bg-color border-radius-50 d-flex justify-content-center align-items-center">
                                <span className="bold-26">2</span>
                            </div>
                        </div>
                    </div>
                    <span className="pri-sec-time-heading">SECONDARY TIME</span>
                    <span className="medium-font">
                        {
                            new Date(selectedSchedule.secondry).getDate()+ ", " +
                            monthNames[new Date(selectedSchedule.secondry).getMonth()]+ " " +
                            new Date(selectedSchedule.secondry).getFullYear()
                        }
                    </span>
                    <span className="medium-font">
                        {
                            convert24hrsTo12hrsformat (String(new Date(selectedSchedule.secondry).getHours()) + ':00')
                            +" - "+
                            convert24hrsTo12hrsformat (String(new Date(selectedSchedule.secondry).getHours()) + ':30')
                        }
                    </span>
                </div>
                
            </div>
            
            <div className="d-flex justify-content-around">
                
                    <Button className ={"grey-btn-color decline-btn app-btn sm-btn-back"} title="Confirm schedule time" onClick={handleCancel} disabled={confirmButtonDisabled} >
                    Decline
                    </Button>
                
                    <Button className ={"app-btn job-accept-btn min-width-0 create-acc-btn decline-btn"} title="Confirm schedule time" onClick={handleConfirmClick} disabled={confirmButtonDisabled}>
                        <span></span>
                        {(confirmButtonDisabled 
                            ?
                            <Spin className="spinner"/>
                            :
                            <>Confirm</>
                        )}
                        
                    </Button>
                
            </div>

        </div>)
}

export default ScheduleModal