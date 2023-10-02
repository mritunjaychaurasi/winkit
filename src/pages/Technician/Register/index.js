import React, { useState, useEffect } from 'react';

import { useLocation } from 'react-router';
import TechSignup from './steps/techSignup';
import { LayoutMax } from '../../../components/Layout';
import Header from '../../../components/NewHeader';
import WelcomeToGeekerTwo from './steps/WelcomeToGeekerTwo';
import ScreenSteps from '../../../components/ScreenSteps';
import SelectExpertise from './steps/selectExpertise';
import SelectOtherExpertise from './steps/selectOtherExpertise';
import ConfirmYourSchedule from './steps/ConfirmYourSchedule';
import { useUser } from '../../../context/useContext';
import UploadResume from './steps/UploadResume';
// import RateExpertise from './steps/rateExpertise';
// import ApplicationSubmitted from './steps/applicationSubmitted';
// import PreviousExpertise from './steps/previousExpertise';
// import * as TechnicianApi from '../../../api/technician.api';
// import * as AuthApi from '../../../api/auth.api';
// import { openNotificationWithIcon } from '../../../utils';
import { useAuth } from '../../../context/authContext';
import { LANDING_PAGE_URL } from '../../../constants';
import TechRegister from './steps/techRegister';
import WhatIsYourSpeciality from './steps/WhatIsYourSpeciality';
import WhatIsYourSpeciality2 from './steps/WhatIsYourSpeciality2';
import ProgressBarTechOnboarding from 'components/ProgressBarTechOnboarding';
import DaysAvailable from './steps/DaysAvailable';
import DemoVideo from './steps/DemoVideo';
import AllYouNeedToKnow from './steps/AllYouNeedToKnow';
import ScheduleInterview from './steps/ScheduleInterview';
import Exam from './steps/Exam';
import FinaliseYourProfile from './steps/FinaliseYourProfile';
import { weekDataObj } from 'constants/other';
// import { useHistory } from 'react-router';
const TechnicianRegister = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    language:'',
    additionalLanguage:''
  });
  const [userLangInfo,setUserLangInfo] = useState({
    language: null,
    additionalLanguage: []
  })

  // --------START----------Days Availability Variables and states----------START---------
  let allWeekObj = {
    value: "allDays",
    available: true,
    startTime: "",
    endTime: "",
    timeStartValue: "--:--",
    timeEndValue: "--:--",
    otherTimes: [],
  };
  
  let daysArr = [
    { day: "Monday", selected: false },
    { day: "Tuesday", selected: false },
    { day: "Wednesday", selected: false },
    { day: "Thursday", selected: false },
    { day: "Friday", selected: false },
    { day: "Saturday", selected: false },
    { day: "Sunday", selected: false },
  ];
  
  const [customization, setCustomization] = useState(false);
  const [allWeek, setAllWeek] = useState(allWeekObj);
  const [weekDays, setWeekDays] = useState(weekDataObj);
  const [weekDaysArr, setWeekDaysArr] = useState([]);
  const [days, setDays] = useState(daysArr);
  // --------END----------Days Availability Variables and states----------END---------
  
  
  const [experiences, setExperiences] = useState([]);
  const [expertise, setexpertise] = useState([]);
  const [register, setRegister] = useState([]);
  const [certifiedIn,setCertifiedIn] = useState([])
  const [reff_by,setReff_by] = useState("other");
  const [submitUser, setSubmitUser] = useState(false);
  // const [generalInfo, setGeneralInfo] = useState({
  //   freelancerProfiles: [],
  //   employmentProfiles: [],
  //   otherLangList: [],
  //   englishLevel: 'Beginner',
  //   certifications: [],
  // });
  const { user, refetch } = useUser();
  const [language, setLanguage] = useState('');
  const [additionalLanguage, setAdditionalLanguage] = useState([]);
  const [languageDropdownValue, setLanguageDropdownValue] = useState(["English"]);
  const [technicianRate, setTechnicianRate] = useState(null);
  // const [otherLangCheck, setOtherLangCheck] = useState(false);
  // const [showFreelancer, setShowFreelancer] = useState(false);
  // const [showEmployee, setShowEmployee] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [softwares, setSoftwares] = useState([]);
  // const history = useHistory();
  const [registerRes, setRegisterRes] = useState(null);
  const [mainSoftware, setmainSoftware] = useState();
  const { setUserToken, verificationEmailHandler } = useAuth();
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [otherSoftwareSelected, setOtherSoftwareSelected] = useState([]);
  const [expertiseArrselected, setExpertiseArrselected]= useState([]);
  const location = useLocation();
  const [showProgress, setShowProgress] = useState(false)
  const [progressBarPercentage, setProgressBarPercentage ] = useState(0)
  const [expertiseLevel, setExpertiseLevel] = useState([]);

  useEffect(() => {
    if(user){
      // console.log("My console from user", user)
      setRegister(user);
    }
    let urlParams = new URLSearchParams(location.search)
    console.log("urlParams :::::::::", urlParams.get("t"));

    if (urlParams.get("t") && urlParams.get("t") == "update_technician") {
      setCurrentStep(1);
    }
    if (urlParams.get("t") && urlParams.get("t") == "select_softwares") {

      setCurrentStep(2);
    }
    if (urlParams.get("t") && urlParams.get("t") == "level_of_expertise") {

      setCurrentStep(3);
    }
    if (urlParams.get("t") && urlParams.get("t") == "availability") {

      setCurrentStep(4);
    }
    if (urlParams.get("t") && urlParams.get("t") == "demo_video") {

      setCurrentStep(5);
    }
    // if (urlParams.get("t") && urlParams.get("t") == "instructions") {

    //   setCurrentStep();
    // }
    if (urlParams.get("t") && urlParams.get("t") == "exam") {

      setCurrentStep(6);
    }
    if (urlParams.get("t") && urlParams.get("t") == "exam_fail") {

      setCurrentStep(6);
    }
    if (urlParams.get("t") && urlParams.get("t") == "finalize_profile") {
      setCurrentStep(7);
    }
    if (urlParams.get("t") && urlParams.get("t") == "schedule_interview") {
      setCurrentStep(8);
    }
  },[]);
  useEffect(() => {
    if (registerRes != null) {
      console.log(registerRes);
      setUserToken(registerRes);
      window.location.href = '/?newTech=true';
      // history.push("/")
    }
  }, [registerRes, setUserToken]);
  
  const onNext = async () => {
    //if (currentStep === 0) {
      window.history.replaceState({},"title","/");
      
      if(currentStep >= 9){
        setCurrentStep(0);
      }else{
        setCurrentStep(currentStep + 1);
      }
   // }
     console.log("currentStep inside the onNext function ::",currentStep)
  };

  const setTimezoneValue = (e) => {
    setTimezone(e.value);
  };
  
  const onPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const steps = [
    

    // First component for new tech-onboarding-design by Milan
    {
      title: 'Signup',
      content: (
        <TechRegister
        onNext={onNext}
        setShowProgress={setShowProgress}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        setProgressBarPercentage={setProgressBarPercentage}
        setRegister={setRegister}
        user={user}
        />
      ),
     },
     
    // Second component for new tech-onboarding-design by Kartar 
    {
      title: 'WelcomeToGeekerTwo',
      content: (<WelcomeToGeekerTwo 
        onNext={onNext}
        onPrev={onPrev}
        setShowProgress={setShowProgress}
        showProgress={showProgress}
        timezone={timezone}
        setTimezone={setTimezone}
        setTimezoneValue={setTimezoneValue}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        language={language}
        additionalLanguage={additionalLanguage}
        setLanguage={setLanguage}
        setAdditionalLanguage={setAdditionalLanguage}
        setProgressBarPercentage={setProgressBarPercentage}
        reff_by={reff_by}
        setReff_by={setReff_by}
        setLanguageDropdownValue={setLanguageDropdownValue}
        languageDropdownValue={languageDropdownValue}
        user={user}
        refetch={refetch}
        />
      ),
    },
    
    // Third component for new tech-onboarding-design
    {
      title: 'Speciality',
      content: (<WhatIsYourSpeciality 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage} 
        setOtherSoftwareSelected={setOtherSoftwareSelected}
        setExpertiseArrselected={setExpertiseArrselected}
        otherSoftwareSelected={otherSoftwareSelected}
        register={register}
        expertiseArrselected={expertiseArrselected}
        user={user}
        refetch={refetch}
        />
      ),
    },
     
    // Fourth component for new tech-onboarding-design
    {
      title: 'Speciality 2',
      content: (<WhatIsYourSpeciality2 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage}
        setExpertiseArrselected={setExpertiseArrselected}
        expertiseArrselected={expertiseArrselected}
        register={register}
        expertiseLevel={expertiseLevel}
        setExpertiseLevel={setExpertiseLevel}
        user={user}
        refetch={refetch}
        />
      ),
    },
    // Fifth component for new tech-onboarding-design
    {
      title: 'Days Available',
      content: (<DaysAvailable 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        customization = {customization}
        setCustomization = {setCustomization}
        allWeek = {allWeek}
        setAllWeek = {setAllWeek}
        weekDays = {weekDays}
        setWeekDays = {setWeekDays}
        weekDaysArr = {weekDaysArr}
        setWeekDaysArr = {setWeekDaysArr}
        days = {days}
        setDays = {setDays}
        user={user}
        refetch={refetch}
        />
      ),
    },
     // Sixth component for new tech-onboarding-design
     {
      title: 'Demo Video',
        content: (<DemoVideo 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        user={user}
        setCurrentStep={setCurrentStep}
        />
      ),
    },
   
    // Seventh component for new tech-onboarding-design
    // {
    //   title: 'All you need to know',
    //   content: (<AllYouNeedToKnow 
    //     onNext={onNext} 
    //     onPrev={onPrev} 
    //     setShowProgress={setShowProgress} 
    //     showProgress={showProgress} 
    //     setProgressBarPercentage={setProgressBarPercentage}
    //     register={register}
    //     />
    //   ),
    // }, 
    // Eighth component for new tech-onboarding-design
    {
      title: 'Exam',
      content: (<Exam 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        />
      ),
    },
   
     // Ninth component for new tech-onboarding-design
     {
      title: 'Finalise your profile',
      content: (<FinaliseYourProfile 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage}
        expertiseArrselected={expertiseArrselected}
        setCurrentStep={setCurrentStep}
        user={user}
        refetch={refetch}
        />
      ),
    },
   
    // Tenth component for new tech-onboarding-design
    {
      title: 'Schedule Interview',
      content: (<ScheduleInterview 
        onNext={onNext} 
        onPrev={onPrev} 
        setShowProgress={setShowProgress} 
        showProgress={showProgress} 
        setProgressBarPercentage={setProgressBarPercentage}
        register={register}
        user={user}
        refetch={refetch}
        />
      ),
    },
   
    // {
    //   title: 'Signup',
    //   content: (
    //     <TechSignup
    //       onNext={onNext}
    //       userInfo={userInfo}
    //       setUserInfo={setUserInfo}
    //       setTechnicianRate={setTechnicianRate}
    //       setLanguage={setLanguage}
    //       language={language}
    //       technicianRate={technicianRate}
    //       setAdditionalLanguage={setAdditionalLanguage}
    //       additionalLanguage={additionalLanguage}
    //       timezone={timezone}
    //       setTimezoneValue={setTimezoneValue}
    //       verificationEmailHandler={verificationEmailHandler}
    //       setSubmitUser={setSubmitUser}
    //       setRegisterRes={setRegisterRes}
    //       register={register}
    //       setRegister={setRegister}
    //       certifiedIn={certifiedIn}
    //       setCertifiedIn = {setCertifiedIn}
    //     />
    //   ),
    // },
    // {
    //   title: 'Select Software',
    //   content: (
    //     <SelectExpertise
    //       onPrev={onPrev}
    //       onNext={onNext}
    //       softwares={softwares}
    //       setSoftwares={setSoftwares}
    //       setExperiences={setExperiences}
    //       setmainSoftware={setmainSoftware}
    //       setexpertise={setexpertise}
    //       expertiseArrselected={expertiseArrselected}
    //       setExpertiseArrselected={setExpertiseArrselected}
    //       timezone={timezone}
    //       register={register}
    //       certifiedIn={certifiedIn}
    //       setCertifiedIn = {setCertifiedIn}
    //     />),
    // },
    // {
    //   title: 'Select Other Software',
    //   content: (
    //     <SelectOtherExpertise
    //       onPrev={onPrev}
    //       onNext={onNext}
    //       otherSoftwareSelected={otherSoftwareSelected}
    //       setOtherSoftwareSelected={setOtherSoftwareSelected}
    //       timezone={timezone}
    //       register={register}
    //     />),
    // },
    // {
    //   title: 'Confirm Your Schedule',
    //   content: (
    //     <ConfirmYourSchedule
    //       onPrev={onPrev}
    //       onNext={onNext}
    //       timezone={timezone}
    //       register={register}
    //     />),
    // },
    // {
    //   title: 'Upload Resume',
    //   content: (
    //     <UploadResume
    //       onPrev={onPrev}
    //       onNext={onNext}
    //       timezone={timezone}
    //       register={register}
    //     />),
    // },

  ];
  // console.log(steps);
  return (
    <div className="w-85 mb-3" id="LightTheme">
      <LayoutMax className="background-transparent box-shadow-none font-nova" bg="transparent">
        <Header link={LANDING_PAGE_URL} />
        <div className='new_tech_onboarding_container font-nova'>
          {showProgress && <ProgressBarTechOnboarding progressBarPercentage={progressBarPercentage} currentStep={currentStep} />}
          <ScreenSteps
            stepsContent={steps[currentStep].content}
            current={currentStep}
            steps={steps}
            />
        </div>
      </LayoutMax>
    </div>
  );
};
export default TechnicianRegister;
