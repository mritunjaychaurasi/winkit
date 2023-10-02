import { Typography } from 'antd';
import React, { memo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import { useSocket } from '../../../../context/socketContext';

const { Title, Text } = Typography;

const ConfirmJobCompleted = () => {
  const { jobId } = useParams();
  const history = useHistory();
  const { socket } = useSocket();

  const handleConfirm = () => {
    socket.emit('confirm-solution', { id: jobId, confirmed: true });
    history.replace('/dashboard');
  };

  const handleCancel = () => {
    socket.emit('confirm-solution', { id: jobId, confirmed: false });
    history.replace('/dashboard');
  };

  return (
    <div>
      <Title level={3}>Job completed!</Title>
      <Text>
        Your tech has indicated that they have successfully resolved your issue.
        Please confirm if accurate
      </Text>
      <StepButtonStyled onClick={handleConfirm}>Confirm</StepButtonStyled>
      <StepButtonStyled type="back" onClick={handleCancel}>
        Need more work
      </StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

ConfirmJobCompleted.propTypes = {};

export default memo(ConfirmJobCompleted);
