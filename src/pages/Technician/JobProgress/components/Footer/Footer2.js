import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Progress, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import React, { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import StepButton from '../../../../../components/StepButton';
import { getFullName, getFormattedTime } from '../../../../../utils';
import { useJob } from '../../../../../context/jobContext';
import { useSocket } from '../../../../../context/socketContext';

let time = 0;
let intervalId;

const CustomerInfoSection = ({ setCurrentStep }) => {
  const { job, jobTime, setJobTime } = useJob();
  const { jobId } = useParams();
  const { socket } = useSocket();

  const handleCompleteJob = () => {
    socket.emit('job-completed', { id: jobId });
    setCurrentStep(10);
  };

  useEffect(() => {
    time = jobTime;

    intervalId = setInterval(() => {
      time += 1;
      setJobTime(time);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobTime, setJobTime]);

  return (
    <InfoSectionStyled>
      <Col xs={24} sm={12} md={12} lg={4}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Customer</InfoSectionTitleStyled>
          {' '}
          <br />
          <InfoSectionContent>
            {(job && job.customer) && getFullName(job.customer.user)}
          </InfoSectionContent>
        </InfoSectionItemStyled>
      </Col>
      <Col xs={24} sm={12} md={12} lg={8}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Issue</InfoSectionTitleStyled>
          {' '}
          <br />
          <InfoSectionContent style={{ fontWeight: 'normal' }}>
            {job && job.issueDescription}
          </InfoSectionContent>
        </InfoSectionItemStyled>
      </Col>
      <Col xs={24} sm={24} md={24} lg={12}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TimerStatusStyled>Timer</TimerStatusStyled>
          <CircularProgress
            type="circle"
            width="80px"
            percent={80}
            format={() => getFormattedTime(jobTime)}
            strokeColor="#fff"
            strokeLinecap="#908d8d"
          />
          <StepButtonSecondary>
            <CloseOutlined />
            Cancel Session
          </StepButtonSecondary>
          <StepButtonStyled onClick={handleCompleteJob}>
            <CheckOutlined />
            Complete Job
          </StepButtonStyled>
        </div>
      </Col>
    </InfoSectionStyled>
  );
};

const InfoSectionStyled = styled(Row)`
  background-color: ${props => props.theme.secondary};
  color: white;
  padding: 20px;
`;

const InfoSectionTitleStyled = styled.h4`
  /* text-transform: uppercase; */
  color: lightgray;
  font-weight: 500;
`;

const StepButtonSecondary = styled(StepButton)`
  background-color: ${props => props.theme.secondary};
  border: none;
`;

const InfoSectionItemStyled = styled.div`
  margin: 0px 20px 15px;
  min-width: fit-content;
`;

const TimerStatusStyled = styled.h3`
  color: white;
  min-width: fit-content;
  margin: 20px;
  font-weight: 600;
`;

const CircularProgress = styled(Progress)`
  .ant-progress-inner:not(.ant-progress-circle-gradient)
    .ant-progress-circle-path {
    stroke: white;
  }

  .ant-progress-text {
    color: white !important;
  }
`;

const InfoSectionContent = styled.span`
  font-weight: 600;
`;

const StepButtonStyled = styled(StepButton)`
  &:hover {
    background: ${props => props.theme.primary};
    color: '#fff';
    border-color: ${props => props.theme.primary};
  }
  &:active {
    background: ${props => props.theme.primary};
    color: '#fff';
    border-color: ${props => props.theme.primary};
  }
  &:focus {
    background: ${props => props.theme.primary};
    color: '#fff';
    border-color: ${props => props.theme.primary};
  }
`;

CustomerInfoSection.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(CustomerInfoSection);
