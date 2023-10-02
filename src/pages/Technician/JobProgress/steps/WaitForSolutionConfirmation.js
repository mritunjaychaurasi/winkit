import React, { memo, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Progress } from 'antd';
import styled from 'styled-components';
import { openNotificationWithIcon } from '../../../../utils';
import { useSocket } from '../../../../context/socketContext';

const WaitForSolutionConfirmation = () => {
  const history = useHistory();
  const { jobId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    socket.emit('join', jobId);
    socket.on('confirm-solution', confirmed => {
      if (confirmed) {
        openNotificationWithIcon(
          'success',
          'Success',
          'Customer confirmed your solution',
        );
      } else {
        history.replace('/dashboard');
      }
    });
  }, [history, jobId, socket]);

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
WaitForSolutionConfirmation.propTypes = {};

export default memo(WaitForSolutionConfirmation);
