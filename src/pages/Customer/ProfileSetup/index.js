import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory, useLocation } from 'react-router';
import * as SoftwareApi from '../../../api/software.api';
import { convertToRaw } from 'draft-js';
import { isMobile } from 'react-device-detect';
import { LayoutMax } from '../../../components/Layout';
import { Helmet } from 'react-helmet';
import Header from '../../../components/NewHeader';
import ScreenSteps from '../../../components/ScreenSteps';
import SelectSupport from './steps/SelectSupport';
import IssueDescription from './steps/IssueDescription';
import RoleSelection from './steps/RoleSelection';
// import BillingInfo from './steps/BillingInfo';
import * as CustomerApi from '../../../api/customers.api';
import { useUser } from '../../../context/useContext';
import { useJob } from '../../../context/jobContext';
import { useTools } from '../../../context/toolContext';
import { LANDING_PAGE_URL, platform } from '../../../constants/index.js';
import JobCreate from '../JobCreate'
const CustomerProfileSetup = () => {
  console.log("?>>>>>>>>>>>>>>>>>>>>>>>>>> Customer profile setup rendered  >>>>>>>>>>>>>>?>>>>>>>>>>>>>>")
  const { jobId } = useParams();
  const location = useLocation();
  let searchParams = useMemo(() => { return new URLSearchParams(window.location.search) }, [location])
  const repostJob = searchParams.get('repost') ? searchParams.get('repost') : false;
  const [showDirectly, setShowDirectly] = useState(false)
  const [softwareId, setSoftwareId] = useState(searchParams.get('softwareId'))
  // console.log("jobId",jobId)
  const [currentStep, setCurrentStep] = useState((jobId ? 1 : 0));
  const [software, setSoftware] = useState();
  const [subSoftware, setSubSoftware] = useState();
  const [jobData, setJobData] = useState(null);
  const [expertise, setExpertise] = useState();
  const [subOption, setSubOption] = useState();
  const [selectedVal, setSelectedVal] = useState();
  const [issueDescription, setIssueDescription] = useState('');
  const [audio, setAudio] = useState(true);
  const { jobFlowStep, setJobFlowStep, jobFlowsDescriptions, jobType, useTimer} = useTools()
  const [estimatedPrice, setEstimatedPrice] = useState('NA');
  const [intialPrice, setInitialPrice] = useState('NA');
  const [finalPrice, setFinalPrice] = useState('NA');
  const [estimatedTime, setEstimatedTime] = useState('NA');
  const [estimatedDuration, setDurationTime] = useState('NA');
  const [estimatedWait, setEstimatedWait] = useState('NA');
  const [accountUsers, setAccountUsers] = useState([
    {
      name: '',
      email: '',
      role: '',
    },
  ]);

  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> searchParams", searchParams) }, [searchParams])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> location", location) }, [location])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> showDirectly", showDirectly) }, [showDirectly])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> currentStep", currentStep) }, [currentStep])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> software", software) }, [software])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> subSoftware", subSoftware) }, [subSoftware])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> jobData", jobData) }, [jobData])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> expertise", expertise) }, [expertise])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> subOption", subOption) }, [subOption])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> selectedVal", selectedVal) }, [selectedVal])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> issueDescription", issueDescription) }, [issueDescription])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> jobFlowStep", jobFlowStep) }, [jobFlowStep])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> estimatedPrice", estimatedPrice) }, [estimatedPrice])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> estimatedDuration", estimatedDuration) }, [estimatedDuration])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> estimatedWait", estimatedWait) }, [estimatedWait])
  useEffect(() => { console.log(" rerendering  >>>>>>>>>>>>>>>>>>>>>>>>>>> accountUsers", accountUsers) }, [accountUsers])



  const [themeColor, setThemeColor] = useState("#fff")
  const [phoneNumber, setPhoneNumber] = useState('');
  const [extension, setExtension] = useState('');
  // const [cardNumber, setCardNumber] = useState('');
  // const [expiryDate, setExpiryDate] = useState('');
  // const [nameOnCard, setNameOnCard] = useState('');
  // const [address, setAddress] = useState('');
  // const [cvv, setCvv] = useState('');
  const cardNumber = '';
  const expiryDate = '';
  const nameOnCard = '';
  const address = '';
  const cvv = '';
  const { user, refetch } = useUser();
  const { job, fetchJob } = useJob();

  const issueDescriptionValue = useMemo(() => {

    let value = '';
    if (issueDescription && typeof (issueDescription) != 'string') {
      const { blocks } = convertToRaw(issueDescription.getCurrentContent());
      value = (blocks && blocks.length) && blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
      value = value === '\n' ? '' : value;
    }
    if (typeof (issueDescription) == 'string') {
      value = issueDescription;
    }
    return value
  }, [issueDescription]);

  const history = useHistory();

  // console.log("Selected duration "+selectedValdur);

  // useEffect(()=>{
  //     if(job)
  // },[jobFlowStep])

  // useEffect(()=>{
  //   if(currentStep === 0  || currentStep === 1){
  //     if(document.getElementById("ThemeDark")){
  //       document.getElementById("ThemeDark").style.backgroundColor  = "#2F3F4C"
  //       setThemeColor("#2F3F4C")
  //     }

  //     if(document.getElementById("ThemeLight")){
  //       document.getElementById("ThemeLight").style.backgroundColor  = "#EDF4FA"
  //       setThemeColor("#EDF4FA")
  //     }
  //   }
  // },[currentStep]);

  useEffect(() => {
    if (showDirectly) {
      setJobFlowStep(jobFlowsDescriptions['issueDescription'])
    }
  }, [showDirectly])
  useEffect(() => {
    (async () => {
      if (softwareId) {
        let software_response = await SoftwareApi.retrievesoftware(softwareId)
        setSoftware(software_response)
        setShowDirectly(true)
      }
    })()
  }, [softwareId])

  useEffect(() => {
    (async () => {
      if (jobId) {
        console.log("jobIdParam in profile setup ::", jobId)
        fetchJob(jobId);
      }
    })();
  }, [])
  useEffect(() => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  }, [currentStep])

  useEffect(() => {
    searchParams.get('jobId') !== null ? setJobFlowStep(jobFlowsDescriptions['jobDetailView']) : console.log("")
  }, [])


  useEffect(() => {
    if (repostJob && job) {
      setSubSoftware((job.subSoftware ? job.subSoftware : undefined));
      setIssueDescription(job.issueDescription);
    }
    if (job && job.status === 'Pending') {
      setSoftware(job.software);
      setSubSoftware((job.subSoftware ? job.subSoftware : undefined));
      setExpertise(job.expertise);
      setSubOption(job.subOption);
      setIssueDescription(job.issueDescription);

    }
  }, [job])

  useEffect(() => {
    console.log("jobFlowStep >>>>>>>>>>>>> profile setup", jobFlowStep)
  }, [jobFlowStep])
  const onBack = async () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  const onNext = async () => {
    // console.log(currentStep,">>>>>>>>>>>>>>")
    /*if(currentStep === 0 ){
      
      console.log(document.getElementById("ThemeDark"),">>>>>>>@@#@#@")
    }*/
    if (currentStep < 2) {
      if (document.getElementById("ThemeDark")) {
        document.getElementById("ThemeDark").style.backgroundColor = "#fff"
        setThemeColor("#fff")
      }
      console.log(document.getElementById("ThemeDark"), ">>>>>>>@@#@#@1")
      setCurrentStep(currentStep + 1);
      return;
    }

    await CustomerApi.updateCustomer(user.customer.id, {
      audio,
      alternatives: accountUsers,
      phoneNumber,
      extension,
      billing: {
        cardNumber,
        expiryDate,
        nameOnCard,
        address,
        cvv,
      },
      status: 'completed',
    });

    await refetch();
    history.push('/customer/create-job', { jobId: job?.id });
  };

  const steps = [

    {
      title: 'Supports Need',
      content: (
        <SelectSupport
          jobFlowsDescriptions={jobFlowsDescriptions}
          software={software}
          onChange={setSoftware}
          user={user}
          setJobFlowStep={setJobFlowStep}
        />
      ),
    },
    {
      title: 'Issue',
      content: (
        <IssueDescription
          intialPrice={intialPrice}
          setInitialPrice={setInitialPrice}
          jobData={jobData}
          setJobData={setJobData}
          finalPrice={finalPrice}
          setFinalPrice={setFinalPrice}
          estimatedPrice={estimatedPrice}
          setEstimatedPrice={setEstimatedPrice}
          estimatedTime={estimatedTime}
          setEstimatedTime={setEstimatedTime}
          estimatedDuration={estimatedDuration}
          setDurationTime={setDurationTime}
          estimatedWait={estimatedWait}
          setEstimatedWait={setEstimatedWait}
          jobFlowsDescriptions={jobFlowsDescriptions}
          software={software}
          softwareId={softwareId}
          subSoftware={subSoftware}
          expertise={expertise}
          setExpertise={setExpertise}
          subOption={subOption}
          setSubOption={setSubOption}
          audio={audio}
          setAudio={setAudio}
          issueDescription={issueDescription}
          issueDescriptionValue={issueDescriptionValue}
          setIssueDescription={setIssueDescription}
          selectedVal={selectedVal}
          setSelectedVal={setSelectedVal}
          setStep={setCurrentStep}
          jobId={jobId}
          onBack={onBack}
          setJobFlowStep={setJobFlowStep}
          setSoftware={setSoftware}
          setSubSoftware={setSubSoftware}
          onNext={onNext}
        />
      ),
    },
    {
      title: 'Job create component',
      content: (
        <JobCreate jobData={jobData} />
      ),
    },

  ];

  return (
    <div className="w-85">
      {
        platform == 'production' && <Helmet
          script={[{
            innerHTML: "gtag('event', 'conversion', {'send_to': 'AW-10817392225/m6wHCM37gM4DEOGckaYo'});"
          }]}>
        </Helmet>
      }
      <div className="box-container mx-auto" style={{ boxShadow: '2px 2px 10px #cfcccc', background: useTimer === 0 ? "#DCE6ED" : "" }}>
        <ScreenSteps
          stepsContent={jobFlowStep <= 2 ? steps[jobFlowStep].content : steps[2].content}
          current={jobFlowStep}
          steps={steps}
        />


      </div>
    </div>
  );
};

export default React.memo(CustomerProfileSetup);
