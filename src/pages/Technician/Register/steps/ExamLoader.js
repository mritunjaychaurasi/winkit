import React, { useEffect } from "react"
import { Player } from '@lottiefiles/react-lottie-player';
import loader from "../../../../assets/animations/Checking Exam.json"
import pass from "../../../../assets/animations/Pass.json"
import fail from "../../../../assets/animations/Fail.json"
import FooterBtns from "../../../../components/FooterBtns"
import * as TechnicianApi from '../../../../api/technician.api';
import {EmailOutlook} from "../../../../constants"

const ExamLoader = ({ setShowProgress, previousTestSubmit, setPreviousTestSubmit, setShowResultPage, result, setResult, testComplete, register }) => {

    useEffect(() => {
        (async ()=>{
            let technician = await TechnicianApi.retrieveTechnician(register.technician.id)
            let softwares = technician.expertise.filter(item => item.software_id !== EmailOutlook);
            let temp = []
            for(let x in softwares){
                console.log("My console here", softwares[x]["result"])
                temp.push(softwares[x]["result"])
            }
            if(!temp.includes(undefined)){
                if(temp.includes("Pass")){
                    await TechnicianApi.updateTechnician(register.technician.id, {
                        registrationStatus: "finalize_profile",
                    });
                }else{
                    await TechnicianApi.updateTechnician(register.technician.id, {
                        registrationStatus: "exam_fail",
                    });
                }
            }

        })()
        setShowProgress(false)
    }, [])

    /**
    * Function that handles the next button to proceed to the next test and hide the result page
    * @author : Kartik
    **/
    const handleNext = (e) => {
        setPreviousTestSubmit(previousTestSubmit + 1);
        setShowResultPage(false)
        setResult('loader')
        // setIsLoading(true)
    }

    const loaderHeading = `Hang on we are checking your Exam`
    const passHeading = "Congrats! You passed"
    const failHeading = "You failed. Thank you for trying"

    return <div className="text-center">
        <span className="tech-on-boarding-heading">
            {result === "loader" ? loaderHeading
                : result === "pass" ? passHeading
                    : result === "fail" ? failHeading
                        : ""
            }
        </span>
        <Player
            autoplay
            keepLastFrame={true}
            src={result === "loader" ? loader
                : result === "pass" ? pass
                    : result === "fail" ? fail
                        : ""
            }
            style={result === "fail" ? { height: '60%', width: '60%' } : { height: '80%', width: '80%' }}
        >
        </Player>
        {
            result === "loader" || testComplete
                ? <></>
                : <FooterBtns onNext={handleNext} hideSaveForLater={true} hidePrevBtn="yes" />
        }
    </div>
}

export default ExamLoader