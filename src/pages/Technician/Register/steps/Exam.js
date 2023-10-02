import React, { useState, useEffect, useCallback } from "react"
import { Modal } from 'antd';
import { Container, Row } from 'react-bootstrap';
import FooterBtns from "components/FooterBtns"
import MCQ from "components/MCQ"
import PreInterviewScreen from "components/PreInterviewScreen"
import ExamLoader from "./ExamLoader"
import * as InterviewQuestionApi from '../../../../api/interview.api';
import * as SoftwareApi from '../../../../api/software.api';
import * as TechnicianApi from '../../../../api/technician.api';
import { useUser } from '../../../../context/useContext';
import { useAuth } from '../../../../context/authContext';
import { Player } from '@lottiefiles/react-lottie-player';
import Loader from "../../../../components/Loader";
import {EmailOutlook} from "../../../../constants"

const Exam = ({ register, onPrev, onNext, setShowProgress, setProgressBarPercentage}) => {
    const [showPreInterview, setShowPreInterview] = useState(true);
    const [previousTestSubmit, setPreviousTestSubmit] = useState(0);
    const [showResultPage, setShowResultPage] = useState(false);
    const [testComplete, setTestComplete] = useState(false);
    const [result, setResult] = useState('loader');
    const [question, setQuestion] = useState();
    const [selectedSoftwares, setSelectedSoftwares] = useState();
    const [test, setTest] = useState(0);
    // const [isLoading, setIsLoading] = useState(true);
    const [fail, setFail] = useState(false);
    const { user } = useUser();
    const { logout, refetch } = useAuth();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        setShowProgress(true)
        setProgressBarPercentage(75)
    }, [])

    useEffect(() => {
        (async () => {
            let technician = await TechnicianApi.retrieveTechnician(register.technician.id)
            let softwares = technician.expertise.filter(item => item.software_id !== EmailOutlook);
            let checkFail = softwares.every(el => el.result === "Fail");
            if (checkFail) {
                setFail(true)
            }
            if (softwares.some(el => el.result)) {
                setShowPreInterview(false)
            }
            let resp = [];
            let ques = [];
            let soft = [];
            for (let i = 0; i < softwares.length; i++) {
                if (softwares[i].result === null || softwares[i].result === undefined) {
                    const software = await SoftwareApi.retrievesoftware(softwares[i].software_id);
                    soft.push(software)
                    if (resp.includes(software.test)) {
                        continue
                    }
                    else {
                        resp.push(software.test)
                    }
                }
            }
            resp=resp.filter(item => item !== "")
            for (let n = 0; n < resp.length; n++) {
                const quest = await InterviewQuestionApi.getQuestionList(resp[n]);
                ques.push(quest)
            }
            // if (ques.length > 0 === soft.length > 0) {
            //     setTimeout(function () {
            //         setIsLoading(false)
            //     }, 2000)
            // }
            // console.log("Question Array//////////", ques, soft)
            setQuestion(ques)
            setSelectedSoftwares(soft)
            setShowLoader(false)
            // console.log("showResultPage>>>>>>>>", showResultPage)
        })();
    }, []);


    // useEffect(() => {
    //   setTimeout(function () {
    //     setIsLoading(false)
    //   }, 4000)
    // }, [isLoading])

    useEffect(() => {
        if (question && question !== undefined) {
            // console.log("Here is ques length", question.length - 1, test)
        }
        if (showResultPage === true && question && question !== undefined && (question.length - 1) === test) {
            setTestComplete(true);
        }
    }, [question, test, showResultPage])

    useEffect(() => {
        if (previousTestSubmit > test) {
            setTest(test + 1);
        }
    }, [previousTestSubmit])

    /**
    * Function that handles the next button after completion of all tests & updates the registration status of the technician accordingly
    * @author : Kartik
    **/
    const handleNext = async (value) => {
        console.log("Interview Complete>>>>>>>>>")
        let technician = await TechnicianApi.retrieveTechnician(register.technician.id)
        let softwares = technician.expertise.filter(item => item.software_id !== EmailOutlook);
        let checkFail = softwares.every(el => el.result === "Fail");
        if (checkFail) {
            setFail(true)
            await TechnicianApi.updateTechnician(register.technician.id, {
                registrationStatus: "exam_fail",
            });
            await refetch()
            window.location.reload(true)
        }
        else {
            await TechnicianApi.updateTechnician(register.technician.id, {
                registrationStatus: "finalize_profile",
            });
            await refetch()
            onNext()
        }
    }

    /**
    * Function that handles the logout button to logout the user
    * @author : Kartik
    **/
    const Logout = useCallback(() => {
        Modal.confirm({
            title: 'Logout Now?',
            okText: 'Logout',
            cancelText: 'Cancel',
            className: "logout-modal",
            onOk() {
                logout();
            },
        });
    }, [logout]);

    if(showLoader) return (<Loader />) 
    return <div className="d-flex justify-content-center align-items-center flex-column">
        <div>
            {
                fail
                    ? <>
                    {setShowProgress(false)}
                        <Row className="d-flex justify-content-end">
                            <a href="#" onClick={Logout} className="logout-btn">
                                Logout
                            </a>
                        </Row>
                        <Container className="w-50 m-auto p-4">
                            <Row className="d-flex justify-content-center">
                                <Player
                                    autoplay
                                    keepLastFrame={true}
                                    src="https://assets9.lottiefiles.com/packages/lf20_ckcn4hvm.json"
                                    style={{ height: '400px', width: '400px' }}
                                >
                                </Player>
                            </Row>
                            <Row className="d-flex justify-content-center fail-caution">
                                <h1 className="mt-0 mb-2 ">Thanks for taking the time to join Geeker!!</h1>
                                <h5>Unfortunately, you can't proceed further as you didn't cleared our first round of interview.</h5>
                            </Row>
                        </Container>
                    </>
                    : showPreInterview
                        ? <PreInterviewScreen onPrev={onPrev} setShowPreInterview={setShowPreInterview} user={user} setShowLoader={setShowLoader} />
                        : <>
                            {showResultPage === false && question && question !== undefined && selectedSoftwares !== undefined &&
                                <MCQ question={question[test]} testId={question[test].testId} selectedSoftwares={selectedSoftwares} previousTestSubmit={previousTestSubmit} setShowResultPage={setShowResultPage} setResult={setResult} register={register} setShowProgress={setShowProgress} setProgressBarPercentage={setProgressBarPercentage} setShowLoader={setShowLoader} />
                            }
                            {showResultPage === true &&
                                <ExamLoader setShowProgress={setShowProgress} previousTestSubmit={previousTestSubmit} setPreviousTestSubmit={setPreviousTestSubmit} setShowResultPage={setShowResultPage} result={result} setResult={setResult} testComplete={testComplete} register={register}/>
                            }
                            {
                                testComplete && result !== "loader"
                                    ? <FooterBtns hidePrevBtn="yes" hideSaveForLater={true} onNext={handleNext} />
                                    : <></>
                            }
                        </>
            }
        </div>
    </div>
}

export default Exam

