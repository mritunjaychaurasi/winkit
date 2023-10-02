import React, { memo, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Progress } from 'antd';
import styled from 'styled-components';
import { useSocket } from '../../../../context/socketContext';
import { useJob } from '../../../../context/jobContext';

const WaitForIssueSummaryConfirmation = ({ setCurrentStep }) => {
  const history = useHistory();
  const { jobId } = useParams();
  const { socket } = useSocket();
  const { fetchJob } = useJob();

  useEffect(() => {
    socket.emit('join', jobId);
    socket.on('confirm-issue-summary', async (confirmed) => {
      if (confirmed) {
        await fetchJob(jobId);
        setCurrentStep(11);
      } else {
        history.replace('/dashboard');
      }
    });
  }, [fetchJob, history, jobId, setCurrentStep, socket]);

  return (
    <div>
      <h2>Wait for customer to confirm the solution</h2>
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
WaitForIssueSummaryConfirmation.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(WaitForIssueSummaryConfirmation);
