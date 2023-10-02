import React, { useState, useMemo, useEffect } from 'react';
import {
  Row, Col, Select, Modal
} from 'antd';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
// import { ConsoleSqlOutlined } from '@ant-design/icons';
import mixpanel from 'mixpanel-browser';
import {
  // StepActionContainer,
  StepTitle,
  IssueSelect,
  BodyContainer,
  // SectionTitle,
  WarningText,
  TitleContainer,
  infoText
} from './style';
// import StepButton from '../../../../components/StepButton';
import ItemLabel from '../../../../components/ItemLabel';
import TextEditor from '../../../../components/TextEditor';
import Box from '../../../../components/common/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowRight,faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {JOB_CHARACTERS_ALLOWED,JobTags} from '../../../../constants'
import RoundSelectors from '../../../../components/Selectors';
import { useUser } from '../../../../context/useContext';
// import * as JobApi from '../../../../api/job.api';
// import * as CustomerApi from '../../../../api/customers.api';
import { useJob } from '../../../../context/jobContext';
import JobDetailView from '../../JobCreate/steps/JobDetailView';
import {useNotifications} from '../../../../context/notificationContext';
import { useSocket } from '../../../../context/socketContext';
import * as JobService from "../../../../api/job.api";
import * as JobCycleApi from "../../../../api/jobCycle.api";
import * as TechnicianApi from '../../../../api/technician.api';
import { useLocation } from 'react-router';
import { EditorState,ContentState,convertFromRaw } from 'draft-js';
import Logo from 'components/common/Logo';
import {GAevent} from '../../../../utils';

// const { Text } = Typography;
const { Option } = Select;

const IssueDescription = ({
  onNext,
  onBack,
  software,
  subSoftware,
  expertise,
  setExpertise,
  subOption,
  setSubOption,
  issueDescription,
  issueDescriptionValue,
  setIssueDescription,
  setStep,
  audio,
  selectedVal,
  setSelectedVal,
  setAudio,
  jobId,
  setJobFlowStep,
  setComponentToRenderIssue,
  guestJobValue,
  jobFlowsDescriptions,
  intialPrice,
  finalPrice,
  estimatedPrice,
  setInitialPrice,
  estimatedDuration,
  setEstimatedPrice,
  estimatedTime,
  setFinalPrice,
  setDurationTime,
  setEstimatedWait,
  setEstimatedTime,
  jobData,
  softwareId,
  setJobData,
  setSoftware,
  setSubSoftware
}) => {
    const [errors, setErrors] = useState({});
    // const showSubSoftwareList = useMemo(() => (software && software.subSoftware && software.subSoftware.length && !software.sub_option.length), [software]);
    const { socket } = useSocket();
    const { user } = useUser();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const repostJob = queryParams.get('repost') ? queryParams.get('repost') : false;
    const [showSubSoftwareList, setShowSubSoftwareList] = useState(false);
    const [check, setCheck] = useState(subSoftware)
    const { job, fetchJob,updateJob,setJob } = useJob();
    let newPostJob = queryParams.get("newpost")
    const [changeStep,setChangeStep] = useState(false);
    const [newIssueDescription,setNewIssueDescription] = useState()
    // const [showSelect, setShowselect] = useState(false);
    const [componentToRender, setComponentToRender] = useState((jobId ? '' : 'issueDescription'));
    const {fetchNotifications} = useNotifications()
    // const [mainEstimatedWait,setMainEstimatedWait] = useState('15');
    const [jobCharacter,setJobCharacter] = useState(JOB_CHARACTERS_ALLOWED)
    const [currentStep, setCurrentStep] = useState(0);
    const [priceLoaded,setPriceLoaded]  = useState(false);
    const [disableArea,setDisabledArea] = useState(false)
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [subSoftwareSelected, setSubSoftwareSelected] = useState(false)
    // const [runOnce, setRunOnce] = useState(false)
    //Utkarsh dixit
  //state to value of duration
  const [selectedValdur,setSelectedValdur]= useState(jobData && jobData.selectedValdur !== "None" ? jobData.selectedValdur : "less than 2 hours");
    const expertiseList = useMemo(() => {
        if(software && ((software.subSoftware === undefined) || (software?.subSoftware.length === 0))){
            setSubSoftware(undefined)
        }
        if (subSoftware && software?.subSoftware) {
            let subSoftId = (subSoftware.id ? subSoftware.id : subSoftware)
            return software.subSoftware.find(item => item.id === subSoftId) ?
                                                                            software.subSoftware.find(item => item.id === subSoftId).sub_option 
                                                                            : "";
        }
        return (software ? software.sub_option : []);
        // return [];
    }, [software, showSubSoftwareList, subSoftware]);
 
    useEffect(()=>{  
        // setSubOption('')
        // setSubSoftware('')
        // let tempData = JSON.parse(JSON.stringify(jobData))
        // tempData.subOption = ''
        // setJobData(tempData)
        GAevent('Job Initiate','job_initiated','job_initiated',user ? (user?.customer ? user.customer?.id : user.id) : 'guest_user')
        if(issueDescriptionValue){
            setIssueDescription(issueDescriptionValue)
            setEditorState(EditorState.createWithContent(ContentState.createFromText(issueDescriptionValue)))
        }
    },[])
 

    useEffect(()=>{
        if(changeStep && jobData){
            console.log("step changed >>>>>>>>>>>>>>>>>>",changeStep)
            console.log("jobData changed >>>>>>>>>>>>>>>>> ",jobData)
            setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
        }
    },[changeStep,jobData])

    useEffect(() => {
         setJobCharacter(JOB_CHARACTERS_ALLOWED - issueDescriptionValue.length)
         if(issueDescriptionValue.length === 0){
            setJobCharacter(JOB_CHARACTERS_ALLOWED)
         }
         if(issueDescriptionValue.length  > JOB_CHARACTERS_ALLOWED){
            setJobCharacter(0)
         }
        setErrors({
            issueDescription: '',
        });
    }, [issueDescriptionValue]);

    const onChangeIssue = (newState )=> {
        setNewIssueDescription(newState.getCurrentContent().getPlainText('')) 
        setEditorState(newState);
        setIssueDescription(newState)
    }

    useEffect(() => {
        console.log("software >>>>>>>> ",software)
        if(software?.name == "MS Office"){
            setDisabledArea(true)
        }
        if (software && software?.subSoftware && software?.subSoftware.length > 0 ) {
            setShowSubSoftwareList(true);
            setDisabledArea(true)
        }
        if(check){
            setDisabledArea(false)
        }
    }, [software]);

    useEffect(()=>{
        if(!job && jobId){
            fetchJob(jobId)     
        }
    },[])

    useEffect(()=>{
        if(user){
            mixpanel.track('Customer - On IssueDescription Page', { 'Email': user.email });
        }
    },[user])
    useEffect(()=>{
       if( repostJob && job){
        setSubSoftware(job.subSoftware)
        setSoftware(job.software)
       }
        if(job && job.status === 'Pending'  ){
            
            // console.log("job in issueDescription ::",job);
            setJobData(job)
            
            // let customerId = (user && user.customer ? user.customer.id : '');
            let softwareData = (job.subSoftware && job.subSoftware.id ? job.subSoftware : job.software);
            updateStateForJob(softwareData)  

            // setComponentToRender('jobDetailView');        
        }
    },[job])

    const HandleSubSoftwareChange = (value) => {
        setSubSoftwareSelected(true)
        // setSubSoftware(value);
        console.log("hyyy1",value)
        setDisabledArea(false)
        let software_li = software.subSoftware;
        for (const l in software.subSoftware) {
            // console.log(software.subSoftware[l].id,">>my id")
            if (software.subSoftware[l].id === value) {
                software_li = software.subSoftware[l].sub_option;
            }
        }
        let id_to_set = '';
        for (const k in software_li) {
            // console.log("condtion >>>>>>>>>>>>>>",sub_li[b].name === 'I am not sure')
            if (software_li[k].name === 'I am not sure') {
                id_to_set = software_li[k].id;
            }
        }
        if(value && software.subSoftware){
            let selectedSubSoftware = software.subSoftware.find(item => item.id === value);
            // console.log("selectedSubSoftware",selectedSubSoftware)
            // console.log("selectedSubSoftware.id",selectedSubSoftware.id)
            if(selectedSubSoftware){
                console.log('heree>>>>>>>>>>>>>>>>>>>>>>',selectedSubSoftware)
                setSubSoftware(selectedSubSoftware);
            }
        }
        
        setSelectedVal(id_to_set);
        // setShowselect(true);
    };

    // const handlePastedText = (text)=>{
    //     let currentContentLength = text.length
    //     let lengthOfJob = editorState.getCurrentContent().getPlainText('').length
    //     if(currentContentLength >JOB_CHARACTERS_ALLOWED){
    //         let orignalContent = text.substring(0,JOB_CHARACTERS_ALLOWED)
            
    //         setJobCharacter(0)
    //         setErrors({
    //             issueDescription: `Only ${JOB_CHARACTERS_ALLOWED} characters are allowed`,
    //         });
    //         setEditorState(EditorState.createWithContent(ContentState.createFromText(orignalContent)))
    //         return 'handled'
    //     }
    //     if (lengthOfJob > JOB_CHARACTERS_ALLOWED){
    //         return 'handled'
    //     }
    // }
    
    /**
 * 
 * @params : 
 * @return : 
 * @author : kartar
 **/

    const handlePastedText = (text)=>{
       
        let prev_issueDescriptionValue = issueDescriptionValue.length
        let currentContentLength = text.length
        let combinedlength = prev_issueDescriptionValue + currentContentLength
        let value = issueDescriptionValue + text
        let lengthOfJob = editorState.getCurrentContent().getPlainText('').length
        
        
        if(combinedlength > JOB_CHARACTERS_ALLOWED){
            let orignalContent = value.substring(0,JOB_CHARACTERS_ALLOWED)   
            setJobCharacter(0)
            setErrors({
                issueDescription: `Only ${JOB_CHARACTERS_ALLOWED} characters are allowed`,
            });
            setEditorState(EditorState.createWithContent(ContentState.createFromText(orignalContent)))
            return 'handled'
        }
        if (lengthOfJob > JOB_CHARACTERS_ALLOWED){
            return 'handled'
        }
       
    }

    const handleNext = async () => {
        if (!issueDescriptionValue) {
            setErrors({
                issueDescription: 'You should fill out the description field!',
            });
            return;
        }
        if(issueDescriptionValue.length > JOB_CHARACTERS_ALLOWED){
            setErrors({
                issueDescription: `Only ${JOB_CHARACTERS_ALLOWED} characters are allowed`,
            });
            return;
        }
        // if(!selectedValdur){
        //     setErrors({
        //         issueDuration: 'Select a value for duration',
        //     });
        //     return;
        // }
        /*;
        let customer = user?.customer;
        if (user && !user.customer) {
            customer = await CustomerApi.createCustomer({
                user: user.id,
            });
            customerId = customer.id;
            await refetch();
        }
        
        console.log("softwareData ::",softwareData)*/
        /*const job = await createJob({
          software: software.id,
          subSoftware,
          expertise,
          subOption,
          customer: customerId,
          issueDescription: issueDescriptionValue,
          level: 'advanced',
          estimatedTime: (softwareData ? softwareData.estimatedTime : '0-0'),
          estimatedPrice: (softwareData ? softwareData.estimatedPrice : '0-0'),
        });*/
        // console.log("job ::",job)
        // console.log("customer",customer)
        // console.log("customer?.status",customer?.status)
        // if (customer?.status === 'completed') {
        //   console.log("Inside if part....")
          // mixpanel code//
          if(user){
            
              mixpanel.identify(user?.email);
              mixpanel.track('Customer - Job description added');
              mixpanel.people.set({
                  $first_name: user?.firstName,
                  $last_name: user?.lastName,
              });
          }
          // mixpanel code//

          //history.push('/customer/create-job', { jobId: job.id });
        // } else {
          // onNext();
        // }

        let customerId = (user && user.customer ? user.customer.id : '');
        let softwareData = (subSoftware && subSoftware.id ? subSoftware : software);
        console.log("job after next >>>>>>>>>>>>>>>>>>>> ",newIssueDescription)
        if(repostJob && job && job.issueDescription !== newIssueDescription){
            await updateJob(job.id,{issueDescription:newIssueDescription})
        }
        if(  softwareData ){
            updateStateForJob(softwareData)
            let software_object = software ? software : softwareData
            console.log("software_object >>>>>>>>>",software_object)
            let jobDataTemp = {
              software: (software ? software : softwareData),
              subSoftware:subSoftware,
              expertise,
              subOption,
              customer: customerId,
              issueDescription: issueDescriptionValue,
              selectedValdur:software_object.askForDuration ?selectedValdur:"None",
              level: 'advanced',
              estimatedTime: (softwareData ? softwareData.estimatedTime : '0-0'),
              estimatedPrice: (softwareData ? softwareData.estimatedPrice : '0-0'),
            }
            if (job === undefined || job.id === undefined){
                setJobData(jobDataTemp)
            }
            else{
                setJobData(job)
            }
            // console.log(">>>>>>> job >>>>>>>> ",job)
            // let newUrlIS =  window.location.origin + `/${job.id}`;
            // window.history.pushState({}, null, newUrlIS);
            // onNext();
            // setChangeStep(true)
            setJobFlowStep(jobFlowsDescriptions['jobDetailView'])
            // setComponentToRender('jobDetailView')


            

        }else{
            setErrors({
                issueDescription: 'Unable to get software info. Please reload your page and try again!',
            });
            return;
        }

    };


    // const handleNext = async () => {
    //     if (!issueDescriptionValue) {
    //         setErrors({
    //             issueDescription: 'You should fill out the description field!',
    //         });
    //         return;
    //     }
    //     if(issueDescriptionValue.length > JOB_CHARACTERS_ALLOWED){
    //         setErrors({
    //             issueDescription: `Only ${JOB_CHARACTERS_ALLOWED} characters are allowed`,
    //         });
    //         return;
    //     }
    //     // if(!selectedValdur){
    //     //     setErrors({
    //     //         issueDuration: 'Select a value for duration',
    //     //     });
    //     //     return;
    //     // }
    //     /*;

    //     let customer = user?.customer;

    //     if (user && !user.customer) {
    //         customer = await CustomerApi.createCustomer({
    //             user: user.id,
    //         });
    //         customerId = customer.id;
    //         await refetch();
    //     }

        
    //     console.log("softwareData ::",softwareData)*/
    //     const job = await createJob({
    //       software: software.id,
    //       subSoftware,
    //       expertise,
    //       subOption,
    //       customer: customerId,
    //       issueDescription: issueDescriptionValue,
    //       level: 'advanced',
    //       estimatedTime: (softwareData ? softwareData.estimatedTime : '0-0'),
    //       estimatedPrice: (softwareData ? softwareData.estimatedPrice : '0-0'),
    //     });
    //     console.log("job ::",job)
    //     console.log("customer",customer)
    //     console.log("customer?.status",customer?.status)
    //     if (customer?.status === 'completed') {
    //       console.log("Inside if part....")
    //       // mixpanel code//
    //       if(user){
            
    //           mixpanel.identify(user.customer.user.email);
    //           mixpanel.track('Customer - Job description added');
    //           mixpanel.people.set({
    //               $first_name: user.customer.user.firstName,
    //               $last_name: user.customer.user.lastName,
    //           });
    //       }
    //       // mixpanel code//

    //       history.push('/customer/create-job', { jobId: job.id });
    //     } else {
    //       onNext();
    //     }

    //     let customerId = (user && user.customer ? user.customer.id : '');
    //     let softwareData = (subSoftware && subSoftware.id ? subSoftware : software);
    //     if(  softwareData ){
    //         updateStateForJob(softwareData)
    //         let software_object = software ? software : softwareData
    //         console.log("software_object >>>>>>>>>",software_object)
    //         let jobDataTemp = {
    //           software: (software ? software : softwareData),
    //           subSoftware:subSoftware,
    //           expertise,
    //           subOption,
    //           customer: customerId,
    //           issueDescription: issueDescriptionValue,
    //           selectedValdur:software_object.askForDuration ?selectedValdur:"None",
    //           level: 'advanced',
    //           estimatedTime: (softwareData ? softwareData.estimatedTime : '0-0'),
    //           estimatedPrice: (softwareData ? softwareData.estimatedPrice : '0-0'),
    //         }
    //         if (job === undefined || job.id === undefined){
    //             setJobData(jobDataTemp)
    //         }
    //         else{
    //             setJobData(job)
    //         }
    //         setComponentToRender('jobDetailView')
    //     }else{
    //         setErrors({
    //             issueDescription: 'Unable to get software info. Please reload your page and try again!',
    //         });
    //         return;
    //     }

    // };
    
    
    function handleDecline(updateJobVar=false,userId=false,jobId=false,tag=false){
        // updateJobVar variable value comes as target event when this function is called without arguments.
        // The actual value this variable should receive is job.
        // Thats why the following of condition is there
        Modal.confirm({
            title: 'Are you sure you want to decline this job?',
            okText :"Yes",
            cancelText:"No",
            className:'app-confirm-modal',
            onOk :async (data)=>{
                let lifeCycleTag = ''
                if(job!==false){
                await JobCycleApi.create(JobTags.DECLINED_AFTER_SEARCH, jobId);
                }
                if(userId!= false){
                    if(job && job.is_transferred && job.is_transferred == true ){
                        lifeCycleTag = JobTags.DECLINED_AFTER_TRANSFER;
                    }else{
                        lifeCycleTag = JobTags.DECLINED;
                    }
                    await JobCycleApi.create(lifeCycleTag, false, userId);
                }   				  
                if(updateJobVar.customer != undefined){
                    updateJob(updateJobVar.id,{"status":"Declined"})
                    fetchNotifications({"user":updateJobVar.customer.user.id})
                    socket.emit("job-declined-by-customer")
                    window.location.href =  "/"
                }else{
                    window.location.href =  "/"
                }
                
            }
        })
    }

    const handleAreaChange = async (value)=>{
        try{
            console.log("value >>>>>>>>>>>>>>>>>>>>>>> ",value)
            setErrors({ ...errors, expertise: '' });
            setExpertise(value);
            setSubOption(value);
            setSelectedVal(value);
        }
        catch(err){
            console.log("error in handleAreaChange ::: ",)
        }
    }

    const fetchEstimatedWaitAccordingToLiveUser = async ()=>{
        let get_all_status = []
        const data = await JobService.getAllLiveTechnicians()

        if(data.length > 0){
            for(let i=0; i <= data.length -1 ; i++){
                if(data[i]['experiences'].includes(software.id)){
                    if(data[i]&&data[i].user&&data[i].user.technician){
                        get_all_status.push(data[i].user.technician.status)
                    }
                }
            }
            let unique_status = [...new Set(get_all_status)]

            if(unique_status.includes('Available')){
                setEstimatedWait('10-15 mins')
                // setMainEstimatedWait("5")
            }
            else if(unique_status.includes('Busy')){
                setEstimatedWait('10-15 mins')
                 // setMainEstimatedWait("15")
            }
            else{
                findAllSoftRelatedTech()                
            }

            // setRunOnce(true)
        }       
        else{
            findAllSoftRelatedTech()
            // setRunOnce(true)
        }      
    }


    const findAllSoftRelatedTech =()=>{
        let retrieve_tech = TechnicianApi.getTechnicians({})
        let got_match = false
        retrieve_tech.then(function(result) {
             // console.log('result>>>>>>>>>>>>',result)
             let all_tech = result.data
             for(let i=0; i <= all_tech.length -1 ; i++){
                let experiences = all_tech[i]['expertise']

                for(let i=0; i <= experiences.length -1 ; i++){
                    // console.log('job>>>>>>>>>>>>>',job)
                     if(experiences[i]['software_id'] === software.id){
                         // console.log('founddddddddddd>>>>>',got_match)
                        got_match = true
                        break
                    }
                }
            }
            // console.log('got_match>>>>>',got_match)
            if(got_match){
                let softwareData = (software.subSoftware && software.subSoftware.id ? software.subSoftware : software)
                setEstimatedWait((softwareData ? softwareData.estimatedWait +' mins': 'NA'))
                
            }else{
                setEstimatedWait('No tech found')
            }
        })
    }
    

    const handleBack = ()=>{
        console.log(">>>>>>>>>>>>>>>>>>CCCCCC",)
        try{
            if(softwareId){
                window.history.back()
            }
            setJobFlowStep(0)

        }
        catch(err){
            console.log("error in handleBack >>>>",err)
            setCurrentStep(0)
        }
    }

    const updateStateForJob = (softwareData) => {
        

        setEstimatedTime((softwareData ? softwareData.estimatedTime : 'NA'))
        setDurationTime((softwareData ? softwareData.estimatedTime : 'NA'))
        setEstimatedPrice((softwareData ? softwareData.estimatedPrice : 'NA'))
        fetchEstimatedWaitAccordingToLiveUser()
        set_price_value(softwareData)
        setEstimatedWait((softwareData ? softwareData.estimatedWait +' mins': 'NA'));     
    }


    const set_price_value = (softwareData,hire_expert=false) =>{
        console.log('set_price_value>>>>>>>>>>>>>>>>>>>>>>',hire_expert)
        let price_per_six_min = softwareData.rate
        let time1 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1 ? parseInt(String(softwareData.estimatedTime).split("-")[0]) : 0)
        let time2 = (softwareData && String(softwareData.estimatedTime).indexOf('-') !== -1  ? parseInt(String(softwareData.estimatedTime).split("-")[1]) : 0)
        let main_price = ''
        if(hire_expert){
            main_price = softwareData.twoTierEstimatePrice
        }else{
            main_price = softwareData.estimatedPrice
        }
        let price1 = (softwareData && String(main_price).indexOf('-') !== -1 ? parseInt(String(main_price).split("-")[0]) : 0)
        let price2 = (softwareData && String(main_price).indexOf('-') !== -1  ? parseInt(String(main_price).split("-")[1]) : 0)

        price1 = (price1 ? price1 : price_per_six_min )
        price2 = (price2 ? price2 : price_per_six_min )
        let initPriceToShow = (time1/6)*parseInt(price1)
        initPriceToShow = (initPriceToShow && initPriceToShow > 0 ? initPriceToShow.toFixed(0) : 'NA')
        let finalPriceToShow = (time2/6)*parseInt(price2)
        finalPriceToShow = (finalPriceToShow && finalPriceToShow > 0 ? finalPriceToShow.toFixed(0) : 'NA')
        setInitialPrice(initPriceToShow)
        setFinalPrice(finalPriceToShow)
        setPriceLoaded(true)
    }

    return (
        <>
            <Row>
                <Container span={24} className="">
                    <Logo user={user} />
                    <StepTitle className="font-nova mb-2 mt-30">You need technical support</StepTitle>
                    <div className="select-box-labels font-nova mx-auto text-centre">
                        <span className='font-size-17'></span>
                    </div>
                    <BodyContainer span={24}>
                        {/*          
                            <TitleContainer className="ant-row">
                            <SectionTitle>
                                Is your issue limited to any of these areas?
                            </SectionTitle>
                            </TitleContainer> 
                        */}
                        <Row>
                            <ItemLabel className="text-left text-label">
                                Software: <span className=" text-value"> { job && job.software ? job.software.name : software?.name}</span>
                             </ItemLabel>
                        </Row>  
                        
                        { (showSubSoftwareList) ? (
                                <Row className="display-flex flex-column" >
                                    <Col>
                                        <ItemLabel className="text-label text-left">
                                               Select Sub Software
                                        </ItemLabel>
                                    </Col>
                                    <Col>
                                        {   software?.subSoftware != undefined &&
                                             <>                                      
                                                {
                                                    software?.subSoftware.map(item => {
                                                    return <RoundSelectors key={item.id} software={item} isActive={subSoftware && subSoftware.id === item.id}  onClick={()=>HandleSubSoftwareChange(item.id)} />
                                                    })
                                                }
                                            </>
                                        }
                                    </Col>
                                        {
                                            errors.subSoftware && (
                                                <WarningText>
                                                    {errors.subSoftware}
                                                </WarningText>
                                            )
                                        }

                                </Row>
                            ) : <></>
                        }
                         <Row className="display-flex flex-column mb-2">
                            {expertiseList && expertiseList.length > 0 && (((software.subSoftware) && (software?.subSoftware.length > 0) ) ? subSoftwareSelected || ( jobData && jobData.subOption && jobData?.subOption.length)>0 : true) && <>
                                <Col>
                                    <ItemLabel className="text-left text-label">
                                    Select area 
                                    </ItemLabel>
                                </Col>
                                {/* <Col className="max-height-100 overflow-hidden"> */}
                                <Col className="d-flex flex-wrap">
                                {                                                
                                    expertiseList.map((item, index) => {
                                        let obj = {"name":item}
                                      return <RoundSelectors key={index}  software={obj} isActive={subOption && subOption === item}  onClick={()=>handleAreaChange(item)} />
                                    //   <div>test</div>
                                    })
                                }
                                </Col>
                                </>   
                            }
                        </Row>                    
                        { software?.askForDuration &&
                            <TitleContainer >
                                <Box display="flex" direction="column" alignItems="flex-start"  position="relative">

                                    <ItemLabel className="text-left text-label">Please select the amount of time you think it might take </ItemLabel>
                                       <div className="shadow-select-box-wrapper w-full">
                                            <IssueSelect className="shadow-select-box w-full"
                                                value={selectedValdur}
                                                onChange={(value) => {
                                                    setErrors({ ...errors, issueDuration: '' });
                                                    setSelectedValdur(value);
                                                }}
                                            >
                                                <Option key="dura_1" value="less than 2 hours" className="font-nova" selected> I'm looking for a fast and quick service</Option>
                                                <Option key="dura_2" value="more than 2 hours" className="font-nova">I need more time for a complex Project</Option>
                                            </IssueSelect>
                                        </div>
                    
                                </Box>
                            </TitleContainer>}

                        <Row className="mt-3">
                            <Col className='col-8 mx-0 px-0'>
                                <ItemLabel className="text-left text-label">
                                    Describe your issue 
                                    <span className="colorred">*</span>
                                </ItemLabel>
                            </Col>

                            {/* <Col className=''>
                                <infoText className="infoText">
                                    {jobCharacter} characters allowed 
                                </infoText> 
                            </Col> */}

                            <IssueDescriptionSection>
                                <TextEditor value={repostJob && job && job?.issueDescription ? job.issueDescription : issueDescription}   editorState={editorState} handlePastedText={handlePastedText}  onChange={onChangeIssue} className="issue-description font-nova" />
                                {
                                    errors.issueDescription && (
                                        <WarningText>
                                            {errors.issueDescription}
                                        </WarningText>
                                    )
                                }
                            </IssueDescriptionSection>

                            
                                <div className='charsAllowed'>
                                    {jobCharacter} characters remaining 
                                </div> 
                            
                         </Row>
                        
                    </BodyContainer>
                    <BodyContainer>
                        <Row>
                            <Col className="col-6 ">
                                {!repostJob && <Button onClick={handleBack} className="btn sm-btn-back hw-60 float-left"><span> </span><FontAwesomeIcon className='arr-size' icon={faArrowLeft} /></Button>}
                            </Col>

                            <Col className="col-6">
                                <Button onClick={handleNext} className="btn sm-btn-color hw-60 float-right"><span> </span><FontAwesomeIcon className='arr-size' icon={faArrowRight} /></Button>
                            </Col>
                        </Row>
                    </BodyContainer>


                </Container>
            </Row>
        </>
    
  );
};

const Container = styled(Col)`
  display: flex !important;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;

`;
const IssueDescriptionSection = styled(Col)`
  justify-content: revert;
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin-bottom: 5px;
  width: 100%;
  span {
    text-align: left;
  }
  position: relative;
`;

export default IssueDescription;
