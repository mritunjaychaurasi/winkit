import { CloseOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { Progress } from 'antd';
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
  const { jobTime, setJobTime, job } = useJob();
  const { jobId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    socket.emit('join', jobId);
    socket.on('job-completed', () => {
      setCurrentStep(6);
    });

    time = jobTime;

    intervalId = setInterval(() => {
      time += 1;
      setJobTime(time);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId, jobTime, setCurrentStep, setJobTime, socket]);

  return (
    <InfoSectionStyled>
      <div style={{ display: 'flex', maxWidth: '50%' }}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Your Tech</InfoSectionTitleStyled>
          {' '}
          <br />
          <InfoSectionContent>{(job && job.technician) && getFullName(job.technician.user)}</InfoSectionContent>
        </InfoSectionItemStyled>
        <InfoSectionIssueNameStyled>
          <InfoSectionTitleStyled>Issue</InfoSectionTitleStyled>
          {' '}
          <br />
          <InfoSectionContent style={{ fontWeight: 'normal' }}>
            {job && job.issueDescription}
          </InfoSectionContent>
        </InfoSectionIssueNameStyled>
      </div>
      <div>
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
          <StepButtonStyled>
            <CloseOutlined />
            End Session
          </StepButtonStyled>
        </div>
      </div>
    </InfoSectionStyled>
  );
};

const InfoSectionStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.theme.secondary};
  color: white;
  padding: 20px;
`;

const InfoSectionTitleStyled = styled.h4`
  /* text-transform: uppercase; */
  color: lightgray;
  font-weight: 500;
`;

const InfoSectionIssueNameStyled = styled.div`
  /* max-width: 60%; */
`;

const InfoSectionItemStyled = styled.div`
  margin: 0px 20px;
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
