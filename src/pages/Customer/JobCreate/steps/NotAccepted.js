import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, Spin, Col } from 'antd';
import styled from 'styled-components';
import * as Antd from 'antd';
// import StepButton from '../../../../components/StepButton';
// import H2 from '../../../../components/common/H2';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';
import { useAuth } from '../../../../context/authContext';
import { Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
import { useLocation } from 'react-router';
import {
  BodyContainer
} from '../../ProfileSetup/steps/style';
import * as JobCycleApi from '../../../../api/jobCycle.api'
import { JobTags } from '../../../../constants/index.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import JobAlive from './JobAlive';
let timer;
const val = 0;

const NotAccepted = ({ handleDecline, job, setJobFlowStep, jobFlowsDescriptions, notFound, loading, setLoading, afterGeekerHours, setUseTimer }) => {
  const { user } = useAuth();
  const [percent, setPercent] = useState(0);
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search)
  const technicianId = queryParams.get("technicianId") ? queryParams.get("technicianId") : false
  const { socket } = useSocket();
  const [sch, setsch] = useState(false);

  const [buttonName, setButtonName] = useState('Keep Searching');
  const [statusText, setStatusText] = useState("Hmm... We searched everywhere, but it looks like all our technicians are busy helping others right now. But don't worry! You can always schedule a call for later.")
  useEffect(() => {
    if (technicianId) {
      setStatusText('Same technician is not available at this time.You can choose to keep searching with other technicians or schedule job with same technician at some other time.')
      setButtonName("Search for another technicians")
    }
  }, [])
  useEffect(() => {
    (
      async () => {
        if (sch) {
          if (job && job.id) {
            await JobCycleApi.create(JobTags.SCHEDULE_AFTER_SEARCH, job.id);
          }
          setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
        }
      }
    )()
  }, [sch]);

  const SendMail = async () => {
    // mixpanel code//
    mixpanel.identify(user.email);
    mixpanel.track('Customer -Looking for 30 min', { 'JobId': job.id });
    // mixpanel code//
    socket.emit('KeepSearching', {
      jobData: job,
      posted: true,
      accepted: false,
      postedTime: new Date(),
      user,
      custPhoneNumber: job.customer.phoneNumber,
    });
    let lifeCycleTag = ''
    if (job.is_transferred && job.is_transferred == true) {
      lifeCycleTag = JobTags.KEEP_SEARCH_AFTER_TRANSFER;
    } else {
      lifeCycleTag = JobTags.KEEP_SEARCHING;
    }
    await JobCycleApi.create(lifeCycleTag, job.id);
    setLoading(true)
  };

  const sendTime = (time) => {


  };

  const callSchedule = async () => {
    if (job && job.id) {
      await JobCycleApi.create(JobTags.SCHEDULE_AFTER_SEARCH, job.id);
    }
    setJobFlowStep(jobFlowsDescriptions['scheduleJob'])
  };

  const callDecline = () => {
    let tag = JobTags.DECLINED_AFTER_SEARCH
    let jobId = job.id
    handleDecline(false, false, jobId, tag)
  }
  return (
    <Container span={24} className="select-job-container find-tecnhician-container">
      <BodyContainer span={24}>
        <Box>
          {notFound && <Alert
            message="Not Found"
            description="We searched high and low for you but it looks like all our technicians are busy.What would you like to do next?"
            type="info"
            showIcon
          />}
          <ItemLabel className="card-label dark">Job Status</ItemLabel>
      
          {loading &&
            <Message>
              <div className="30-mins-wait" style={{ 'color': 'black' }}>We are looking for technician...</div>
            </Message>
          }
          {afterGeekerHours &&
            <Description className="text-left"> We searched high and low for you but it looks like no technician is available at this time ("Scheduling help for later is a great way to guarantee your issue will be fixed.")</Description>
          }
          {afterGeekerHours &&
            <Description className="text-left"> Tip: You can schedule one time slot outside business hours and within business hours however please be aware that there are less technicians available after official hours.</Description>
          }

          {!afterGeekerHours &&
            <Description>
              {statusText}
            </Description>
          }
          {/* <Antd.Divider /> */}

          <Box width="100%" className="d-flex justify-content-around">
            <Button className="btn app-btn app-btn app-btn-transparent float-left" onClick={callDecline}>Decline<span></span></Button >
            <Button className="btn app-btn app-btn  mr-15 float-left" onClick={callSchedule} title="Schedule your job for a later date.">Schedule for Later<span></span></Button >
            {!loading && <Button className="btn app-btn app-btn float-right mr-15" onClick={SendMail}>{buttonName}<span></span></Button >}
            {loading && <Button className="btn app-btn app-btn float-right mr-15 app-btn-transparent" disabled> <Spin /><span></span></Button>}
     
          </Box>
        </Box>
      </BodyContainer>
    </Container>
  );
};

const Container = styled(Col)`
  display: flex !important;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;
  background-color:#DCE6ED;
  `;
// background-color:#2F3F4C;


const StepHeader = styled.h2`
color:#708390;
font-size: 35.6364px;
font-weight: 900;
line-height: 43px;
text-align: center;
margin-bottom: 0; 
`

/*const EstimationItem = styled(H2)`
  font-weight: 700;
  font-size: 18px;
`;*/

const Description = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #8c8c8c;
`;

const Message = styled.div`
  font-size: 18px;
  background: rgba(27,179,1,0.1);
  padding: 12px;
  text-align: center;
  border: green solid 1px;
  margin-bottom: 10px;
`;


const ItemLabel = styled.div`
  color: #8c8c8c;
  font-weight: 700;
  opacity: 0.4;
  text-transform: uppercase;
  margin-bottom: 30px;
  margin-top: 30px;
`;
const Title = styled.div`
font-weight:400;
font-size:18.93px;
text-align:center;
color:#708390;
top:43px;
left:217.15px;
`;

// const Button = styled.button`
//   background:#a09e9e !important;
//   font-size: 15px !important;
//   align-items: center !important;
//   display: flex !important;
//   font-weight: bold !important;
//   border-radius: 10px !important;
//   height: 60px !important;
//   width: 250px !important;
//   justify-content: center;
//   margin-left: 20px !important;
//   border-color: #a09e9e !important;
//   border-bottom: #a09e9e !important;
//   border-right: #a09e9e !important;
//   color: ${props => (props.type === 'back' ? props.theme.primary : '#fff')} !important;
//   &:hover {
//     background: ${props => (props.type === 'back' ? '#fff' : '#908d8d')} !important;
//     color: ${props => (props.type === 'back' ? '#464646' : '#fff')} !important;
//     border-color: #a09e9e !important;
//   }
//   &:active {
//     background: ${props => (props.type === 'back' ? '#fff' : '#908d8d')} !important;
//     color: ${props => (props.type === 'back' ? '#464646' : '#fff')} !important;
//     border-color: #a09e9e !important;
//   }
//   &:focus {
//     background: ${props => (props.type === 'back' ? '#fff' : '#908d8d')} !important;
//     color: ${props => (props.type === 'back' ? '#464646' : '#fff')} !important;
//     border-color: #a09e9e !important;
//   }

//   & .ant-spin .ant-spin-dot  .ant-spin-dot-item{
//     background-color:#fff !important;
//   }
// `;

export default NotAccepted;
