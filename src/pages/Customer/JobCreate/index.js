import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLocation, useParams } from 'react-router';
// import * as SettingsApi from '../../../api/settings.api';
// import Navbar from '../../../components/Navbar';
import JobDetailView from './steps/JobDetailView';
import Schedule from './steps/Scehdule';
import JobAlive from './steps/JobAlive';
import { useJob } from '../../../context/jobContext';
import NotAccepted from './steps/NotAccepted';
import { Modal } from 'antd';
import { useHistory } from 'react-router';
import { useSocket } from '../../../context/socketContext';
import { useTools } from '../../../context/toolContext';
import * as JobService from "../../../api/job.api";
import * as CommonFunctions from '../../../utils'
import { Helmet } from 'react-helmet';
import Header from '../../../components/NewHeader';
import queryString from 'query-string';
import { useUser } from '../../../context/useContext';
import HelpIsOnItsWay from '../Onboarding/Registration/HelpIsOnItsWay'
import { STRIPE_KEY, STRIPE_TEST_KEY } from '../../../constants';
// import mixpanel from 'mixpanel-browser';
import { useNotifications } from '../../../context/notificationContext'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import * as TechnicianApi from '../../../api/technician.api';
import * as JobCycleApi from '../../../api/jobCycle.api';
import { JobTags, platform } from '../../../constants/index.js';
import Payment from './steps/Payment';
let callFetchJobCalled = false;
const JobCreate = (props) => {
    console.log('job create rendered>>>>>>>>>>>>', props)
    const { socket } = useSocket();
    const history = useHistory();
    const { user, refetch } = useUser();
    const { job, fetchJob, updateJob, createJob } = useJob();
    const location = useLocation();
    const fromPage = location.state ? location.state.fromPage : null
    const [currentStep, setCurrentStep] = useState(0);
    const { jobFlowStep, setJobFlowStep, jobFlowsDescriptions } = useTools()
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [priceLoaded, setPriceLoaded] = useState(false);
    let state_jobId = useMemo(() => location.state ? location.state.jobId : '', [location.state]);
    const [estimatedTime, setEstimatedTime] = useState('NA');
    const [estimatedDuration, setDurationTime] = useState('NA');
    const [estimatedPrice, setEstimatedPrice] = useState('NA');
    const [estimatedWait, setEstimatedWait] = useState('NA');
    const [mainEstimatedWait, setMainEstimatedWait] = useState('15')
    const [intialPrice, setInitialPrice] = useState('NA');
    const [finalPrice, setFinalPrice] = useState('NA');
    // const [buttonName,setButtonName] = useState("Get help ASAP");
    // const [repostJob,setRepostJob] = useState(false)
    const { fetchNotifications } = useNotifications()
    const [registeredUser, setRegisteredUser] = useState(null)
    const [runOnce, setRunOnce] = useState(false)

    const [guestJobId, setGuestJobId] = useState()
    //const [btnclicked, setBtnclicked] = useState('')
    const btnclickedObj = {
        'getHelpNow': 0,
        'scheduleJobLater': 1
    }

    const [isTechNotFoundInSearch, setIsTechNotFoundInSearch] = useState(false);
    const queryParams = new URLSearchParams(location.search);
    const repostJob = queryParams.get('repost') ? queryParams.get('repost') : false;
    const [afterGeekerHours, setAfterGeekerHours] = useState(false)
    const [showGoBackBtn, setShowGoBackBtn] = useState(true)
    const [showGoBackBtnRedirection, setshowGoBackBtnRedirection] = useState(false)

    // const [jobIdParam, setJobIdParam] = useState('');
    let params = new URLSearchParams(location.search)
    let query_params = queryString.parse(location.search)
    console.log("query_params >>>>>>>>> ", query_params)
    let newPostJob = query_params["newpost"]
    let { jobId } = useParams();
    let { schedule } = query_params;
    let liveUser = true
    let stripePromise = loadStripe(STRIPE_KEY)
    console.log("params >>>>>>>>>>>>>>>>>>>>>", params)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>schedule", schedule)
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>jobId", jobId)
    console.log(">>>>>>>>>>>>>>>>>>>>>>search_jobId >>>>", search_jobId)
    console.log(">>>>>>>>>>>>>>>>>>>>> ", newPostJob)

    useEffect(() => {
        console.log("the user >>>>>>>>>> ", user)
        liveUser = CommonFunctions.isLiveUser(user)
        let stripePromise = liveUser ? loadStripe(STRIPE_KEY) : loadStripe(STRIPE_TEST_KEY)
    }, [user])

    const find_id_from_url = () => {
        let params = new URLSearchParams(location.search)
        return params.get('jobId')
    }

    useEffect(() => {
        console.log("updating job inside the index >>>>>>>> ", job)
    }, [job])


    let search_jobId = location.search ? find_id_from_url() : jobId
    jobId = (search_jobId && search_jobId !== '' ? search_jobId : jobId)
    if (params.get("postedJobId")) {
        jobId = query_params.get("postedJobId")
        setTimeout(function () {
            call_fetch_job(jobId)
        }, 100)
    }
    // if(params.get("schedule")){
    //     setCurrentStep(1)
    // }
    if (jobId) {
        if (!callFetchJobCalled) {
            callFetchJobCalled = true;
            setTimeout(function () {
                call_fetch_job(jobId)
            }, 100)
        }
    }
    // console.log("search_jobId::",search_jobId)
    const handleDecline = () => {
        Modal.confirm({
            title: 'Are you sure you want to decline this job?',
            okText: "Yes",
            cancelText: "No",
            className: 'app-confirm-modal',
            onOk: () => {
                window.location.href = "/"
            }
        })
    }

    useEffect(() => {
        console.log("jobFlowStep >>>>>>>>> job create page", jobFlowStep)
    }, [jobFlowStep])
    useEffect(() => {
        console.log("jobFlowStep >>>>>>>>> job create page", jobFlowStep)
        if ((!job || job['success'] == false) && queryParams.get("jobId") && queryParams.get("newpost") && queryParams.get("isMobilePost")) {
            setGuestJobId(queryParams.get("jobId"))
            
            // setJobFlowStep(jobFlowsDescriptions['customerRegisterPage'])
        }
        console.log(">>>>> jobs setGuestJobId >>>>>> ", job, "jobFlowStep :: ",jobFlowStep)
    }, [job])
    useEffect(() => {
        console.log(">>>guestJobId >>>>>>>> ", guestJobId)
        if (guestJobId) {
            call_fetch_job(guestJobId)
        }
    }, [guestJobId])

    useEffect(() => {
        console.log(">>>>>>>>>>>>>>>>>currentStep ", currentStep)
    }, [currentStep])

    useEffect(() => {
        // console.log("query_params",query_params)
        if (query_params.repost || query_params.repost !== null) {
            state_jobId = false
            search_jobId = false
            // setButtonName("Find Technician")
            fetchJob(query_params.jobId)
            // setJobIdParam(search_jobId)
        }
        // console.log('search_jobId',search_jobId)
    }, [])

    useEffect(() => {
        if (props.jobData) {
            let softwareData = (props.jobData.subSoftware && props.jobData.subSoftware.id ? props.jobData.subSoftware : props.jobData.software)
            // console.log("query_params :::::: ",query_params)

            let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
            let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)

            setEstimatedTime((softwareData ? softwareData.estimatedTime : 'NA'))
            setDurationTime((softwareData ? softwareData.estimatedTime : 'NA'))
            setEstimatedPrice((softwareData ? softwareData.estimatedPrice : 'NA'))
            setEstimatedWait((softwareData ? softwareData.estimatedWait + ' minutes' : 'NA'))
            if (!runOnce) {
                fetchEstimatedWaitAccordingToLiveUser()
            }
            let price_per_six_min = softwareData.rate
            let price1 = (softwareData && String(softwareData.estimatedPrice).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedPrice).split("-")[0]) : 0)
            let price2 = (softwareData && String(softwareData.estimatedPrice).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedPrice).split("-")[1]) : 0)
            // console.log("price_per_six_min customer/jobcreate :: ",price_per_six_min)            
            // if(price_per_six_min > 0){
            price1 = (price1 ? price1 : price_per_six_min)
            price2 = (price2 ? price2 : price_per_six_min)
            let initPriceToShow = (time1 / 6) * parseInt(price1)
            initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 'NA')
            let finalPriceToShow = (time2 / 6) * parseInt(price2)
            finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 'NA')
            setInitialPrice(initPriceToShow)
            setFinalPrice(finalPriceToShow)
            // }
            setPriceLoaded(true)
        }
    }, [props.jobData])

    useEffect(() => {
        // console.log("the second use Efeeft 2::: ")
        if (job && job.id) {
            console.log('updated job is :::', job)

            let query_params = queryString.parse(location.search)
            let softwareData = (job.subSoftware && job.subSoftware.id ? job.subSoftware : job.software) || (props.jobData.subSoftware && props.jobData.subSoftware.id ? props.jobData.subSoftware : props.jobData.software)
            // console.log("query_params :::::: ",query_params)

            let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
            let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)

            setEstimatedTime((softwareData ? softwareData.estimatedTime : 'NA'))
            setDurationTime((softwareData ? softwareData.estimatedTime : 'NA'))
            setEstimatedPrice((softwareData ? softwareData.estimatedPrice : 'NA'))
            setEstimatedWait((softwareData ? softwareData.estimatedWait + ' minutes' : 'NA'))
            if (!runOnce) {
                fetchEstimatedWaitAccordingToLiveUser()
            }
            let price_per_six_min = softwareData.rate
            let price1 = (softwareData && String(softwareData.estimatedPrice).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedPrice).split("-")[0]) : 0)
            let price2 = (softwareData && String(softwareData.estimatedPrice).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedPrice).split("-")[1]) : 0)
            // console.log("price_per_six_min customer/jobcreate :: ",price_per_six_min)            
            // if(price_per_six_min > 0){
            price1 = (price1 ? price1 : price_per_six_min)
            price2 = (price2 ? price2 : price_per_six_min)
            let initPriceToShow = (time1 / 6) * parseInt(price1)
            initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 'NA')
            let finalPriceToShow = (time2 / 6) * parseInt(price2)
            finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 'NA')
            setInitialPrice(initPriceToShow)
            setFinalPrice(finalPriceToShow)
            // }
            setPriceLoaded(true)

            if (fromPage === "meeting") {
                console.log("inside this step")
                setCurrentStep(2)
                return
            }
        }

    }, [job])

    useEffect(() => {
        // console.log("state_jobId in useEffect ::",search_jobId)
        if (state_jobId || fromPage === "meeting") {
            call_fetch_job(state_jobId)
        }
        if (search_jobId) {
            call_fetch_job(search_jobId)
        }
    }, [state_jobId, search_jobId, fromPage]);

    /*useEffect(() => {
        console.log("currentStep useEffect ::",currentStep)        
    }, [currentStep]);*/


    useEffect(() => {
        socket.on('not-found-30min', function () {
            setNotFound(true);
            setLoading(false);
            setCurrentStep(3);
            setCurrentStep(1)
        });
    }, []);


    const fetchEstimatedWaitAccordingToLiveUser = async () => {
        let get_all_status = []
        const data = await JobService.getAllLiveTechnicians()

        if (data.length > 0 && job && job.software) {
            for (let i = 0; i <= data.length - 1; i++) {
                if (data[i]['experiences'].includes(job.software.id)) {
                    get_all_status.push(data[i].user.technician.status)
                }
            }
            let unique_status = [...new Set(get_all_status)]

            if (unique_status.includes('Available')) {
                setEstimatedWait('10-15 minutes')
                setMainEstimatedWait("5")
            }
            else if (unique_status.includes('Busy')) {
                setEstimatedWait('10-15 minutes')
                setMainEstimatedWait("15")
            }
            else {
                findAllSoftRelatedTech()
            }

            setRunOnce(true)
        }
        else {
            findAllSoftRelatedTech()
            setRunOnce(true)
        }
    }

    const findAllSoftRelatedTech = () => {
        let retrieve_tech = TechnicianApi.getTechnicians({})
        let got_match = false
        if ((job && job.software) || (props.jobData && props.jobData.software)) {
            retrieve_tech.then(function (result) {
                // console.log('result>>>>>>>>>>>>',result)
                let all_tech = result.data
                for (let i = 0; i <= all_tech.length - 1; i++) {
                    let experiences = all_tech[i]['expertise']
                    for (let i = 0; i <= experiences.length - 1; i++) {
                        if (job && job.software ? experiences[i]['software_id'] === job.software.id : experiences[i]['software_id'] === props.jobData.software.id) {
                            got_match = true
                            break
                        }
                    }
                }

                if (got_match) {
                    let softwareData = ""
                    if ((job && job.software)) {
                        softwareData = (job.subSoftware && job.subSoftware.id ? job.subSoftware : job.software)
                    }
                    if ((props.jobData && props.jobData.software)) {
                        softwareData = (props.jobData.subSoftware && props.jobData.subSoftware.id ? props.jobData.subSoftware : props.jobData.software)
                    }

                    console.log('got_match>>>>>', softwareData)
                    setEstimatedWait((softwareData ? softwareData.estimatedWait + ' minutes' : 'NA'))
                } else {
                    setEstimatedWait('No tech found')
                }
            })
        }
    }
    /*const pushBack =() =>{
        let jobId = ''
        if (state_jobId !== '') {
            jobId = state_jobId
        }
        else{
            jobId = search_jobId
        }

        JobService.updateJob(jobId,{"status":"Declined"})
        // mixpanel code//
        mixpanel.identify(job.customer.user.email);
        mixpanel.track('Customer - Job declined',{'JobId':job.id});
        // mixpanel code//

        history.push('/')
    }*/


    const call_fetch_job = async (jobId) => {
        // console.log('jobId (call_fetch_job)::',jobId)
        console.log("this methid is called")
        await fetchJob(jobId)
    }

    return (
        // <div className="" style={{width:"90%", margin:"0 auto"}}>
        <div className="" style={{ width: jobFlowStep === 6 || jobFlowStep === 3 ? "100%" : "90%", margin: "0 auto", '@media(max-width)': { width: jobFlowStep === 6 || jobFlowStep === 3 ? "100%" : "90%" } }}>
            <Helmet>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
            </Helmet>
            {
                platform == 'production' && <Helmet
                    script={[{
                        innerHTML: "gtag('event', 'conversion', {'send_to': 'AW-10817392225/m6wHCM37gM4DEOGckaYo'});"
                    }]}>
                </Helmet>
            }
            <div className="box-container mx-auto" style={{ boxShadow: jobFlowStep === 6 ? "1px -34px 1px #ffff" : "" }}>
                {job && (
                    <>
                        {jobFlowStep === 2 &&
                            <JobDetailView
                                estimatedPrice={estimatedPrice}
                                intialPrice={intialPrice}
                                finalPrice={finalPrice}
                                estimatedTime={estimatedTime}
                                estimatedWait={estimatedWait}
                                estimatedDuration={estimatedDuration}
                                handleDecline={handleDecline}
                                jobId={jobId}
                                setJobFlowStep={setJobFlowStep}
                                job={job && job?.id ? job : props.jobData}
                                // job={job && Object.keys(job).length > 0 && job?.success != false? job : props.jobData} 
                                setStep={setCurrentStep}
                                priceLoaded={priceLoaded}
                                fetchJob={fetchJob}
                                mainEstimatedWait={mainEstimatedWait}
                                repost={repostJob}
                                setGuestJobId={setGuestJobId}
                                guestJobId={guestJobId}
                                jobFlowsDescriptions={jobFlowsDescriptions}
                                setLoading={setLoading}
                                isScheduleJob={schedule}
                                newPost={newPostJob}
                                setInitialPrice={setInitialPrice}
                                setFinalPrice={setFinalPrice}
                                // setBtnclicked={setBtnclicked}
                                btnclickedObj={btnclickedObj}
                                setAfterGeekerHours={setAfterGeekerHours}
                            />
                        }
                        {jobFlowStep === 6 && <Schedule showGoBackBtn={showGoBackBtn} setJobFlowStep={setJobFlowStep} jobFlowsDescriptions={jobFlowsDescriptions} createJob={createJob} isTechNotFoundInSearch={isTechNotFoundInSearch} updateJob={updateJob} job={job && job?.id ? job : props.jobData }  handleDecline={handleDecline} setStep={setCurrentStep} repostJob={repostJob} showGoBackBtnRedirection={showGoBackBtnRedirection} />}
                        {jobFlowStep === 3 && <JobAlive notFound={notFound} isTechNotFoundInSearch={isTechNotFoundInSearch} setIsTechNotFoundInSearch={setIsTechNotFoundInSearch} setJobFlowStep={setJobFlowStep} jobFlowsDescriptions = {jobFlowsDescriptions}  updateJob={updateJob} job={job && job?.id ? job : props.jobData}  setComponentToRender={setCurrentStep} estimatedWait={estimatedWait} mainEstimatedWait={mainEstimatedWait} afterGeekerHours = {afterGeekerHours} setShowGoBackBtn={setShowGoBackBtn} setshowGoBackBtnRedirection={setshowGoBackBtnRedirection} />}
                        {jobFlowStep === 7 && <NotAccepted handleDecline={handleDecline} job={props.jobData ? props.jobData : job}setJobFlowStep={setJobFlowStep} jobFlowsDescriptions = {jobFlowsDescriptions}  setStep={setCurrentStep} notFound={notFound} loading={loading} setLoading={setLoading} afterGeekerHours = {afterGeekerHours}/>}
                        {jobFlowStep === 4 && <HelpIsOnItsWay guestJobId={guestJobId}  jobFlowsDescriptions = {jobFlowsDescriptions} setJobFlowStep={setJobFlowStep} registeredUser={registeredUser} setRegisteredUser={setRegisteredUser} />}
                        {jobFlowStep === 5 && <Elements stripe={stripePromise} >
                             <Payment job={props.jobData ? props.jobData : job} guestJobId={guestJobId} btnclickedObj={btnclickedObj} jobFlowsDescriptions={jobFlowsDescriptions} user={registeredUser !== null ? registeredUser : user} setJobFlowStep={setJobFlowStep} />
                        </Elements>}
                    </>
                )}
            </div>
        </div>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    margin-top:20px;
`;

export default React.memo(JobCreate);