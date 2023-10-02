import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Progress } from 'antd';
import { useSocket } from '../../../../context/socketContext';

const TechMatchConfirmed = ({
  setCurrentStep,
  onUpdateEstimateTime,
  onUpdateIssue,
}) => {
  const { jobId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    socket.emit('join', jobId);
    
    socket.on('confirm-with-customer', time => {
      onUpdateEstimateTime(time);
      setCurrentStep(2);
    });
    socket.on('issue-breakdown', issue => {
      onUpdateIssue(issue);
      setCurrentStep(3);
    });
  }, [jobId, onUpdateEstimateTime, onUpdateIssue, setCurrentStep, socket]);

  return (
    <div>
      <h2>It&apos;s a match!</h2>
      <div>
        Your tech will break down your issue and create written confirmation to
        ensure your job is completed successfully.
      </div>
      <br />
      <h2>Waiting for tech Input....</h2>
      <ProgressStyled percent={80} showInfo={false} />
    </div>
  );
};

const ProgressStyled = styled(Progress)`
  .ant-progress-success-bg,
  .ant-progress-bg {
    background-color: #464646;
  }
  .ant-progress-text {
    color: white !important;
  }
`;

TechMatchConfirmed.propTypes = {
  setCurrentStep: PropTypes.func,
  onUpdateEstimateTime: PropTypes.func,
  onUpdateIssue: PropTypes.func,
};

export default memo(TechMatchConfirmed);
