import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// import { useLocation } from 'react-router';
// import * as JobApi from '../../../api/job.api';
// import Navbar from '../../../components/Navbar';
import { useJob } from '../../../context/jobContext';
import NotAccepted from './../JobCreate/steps/NotAccepted';
import JobDetailView from './../JobCreate/steps/JobDetailView';
import JobAlive from './../JobCreate/steps/JobAlive';
import Schedule from './../JobCreate/steps/Scehdule';
import { Modal } from 'antd';
import { useHistory } from 'react-router';
import { useSocket } from '../../../context/socketContext';
import { useParams } from 'react-router';
import mixpanel from 'mixpanel-browser';

const JobCreate = () => {
  const { socket } = useSocket();
  const history = useHistory();
  const { job, fetchJob,updateJob } = useJob();
  // const location = useLocation();
  const [currentStep, setCurrentStep] = useState(3);
  const [notFound, setNotFound] = useState(true); 
  const [loading,setLoading]  = useState(false);
  const { jobId } = useParams();

   useEffect(() => {
    socket.emit("join", jobId)
  }, [])

  const pushBack =() =>{
    // mixpanel code//
    mixpanel.identify(job.customer.user.email);
    mixpanel.track('Customer - Job Declined when no technician available',{'JobId':jobId});
    // mixpanel code//
    history.push("/")
  }

  const handleDecline = () =>{
    Modal.confirm({
      title: 'Are you sure you want to decline this job?',
      okText :"Yes",
      cancelText:"No",
      className:'app-confirm-modal',
      onOk :pushBack
    })
  }

  useEffect(() => {

    if (jobId) {
      console.log('first fetch job details');
      fetchJob(jobId);
    }
  }, [fetchJob, jobId]);


  useEffect(() => {
     socket.on('not-found-30min',function(){
        setNotFound(true);
        setLoading(false);      
        setCurrentStep(3);

      });
  }, []);

  return (
    <div className="w-85">
      <Container>
        {
          job && (
            <Content>
                {currentStep === 0 && <JobDetailView handleDecline={handleDecline}  job={job} setStep={setCurrentStep} />}
                {currentStep === 1 && <Schedule updateJob={updateJob} handleDecline={handleDecline} job={job} setStep={setCurrentStep} />}
                {currentStep === 2 && <JobAlive updateJob={updateJob} handleDecline={handleDecline} job={job} setStep={setCurrentStep} />}
                {currentStep === 3 && <NotAccepted handleDecline={handleDecline} job={job} setStep={setCurrentStep} notFound={notFound} loading={loading} setLoading={setLoading}/>}
            </Content>
          )
        }
      </Container>
    </div>
  );
};

const Container = styled.div`
  background-color: #f4f4f4;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  margin-top:100px;
  justify-content: center;
`;
const Content = styled.div`
  box-shadow: 0px 6px 15px 0px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  width: 85%;
  height: fit-content;
  background-color: #fff;
  padding: 40px;
  min-width: 800px;
`;

export default JobCreate;
