import React, { memo, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Progress } from 'antd';
import styled from 'styled-components';
import { useJob } from '../../../../context/jobContext';
import { useSocket } from '../../../../context/socketContext';

const WaitForTimeEstimateApprove = ({ setCurrentStep }) => {
  const history = useHistory();
  const { jobId } = useParams();
  const { fetchJob } = useJob();
  const { socket } = useSocket();

  useEffect(() => {
    socket.emit('join', jobId);
    socket.on('time-estimate-approve', async approved => {
      if (approved) {
        await fetchJob(jobId);
        setCurrentStep(2);
      } else {
        history.replace('/dashboard');
      }
    });
  }, [fetchJob, history, jobId, setCurrentStep, socket]);

  return (
    <div>
      <h2>Wait for customer to confirm the time</h2>
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
WaitForTimeEstimateApprove.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(WaitForTimeEstimateApprove);
