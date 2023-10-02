import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import { useSocket } from '../../../../context/socketContext';

const ConfirmMatch = ({ setCurrentStep }) => {
  const { jobId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    socket.emit('join', jobId);
  }, [jobId, socket]);

  const handleMatchConfirm = () => {
    socket.emit('match-confirmed', { id: jobId, isMatched: true });
    setCurrentStep(1);
  };
  const handleNotConfirm = () => {
    socket.emit('match-confirmed', { id: jobId, isMatched: false });
    setCurrentStep(3);
  };

  return (
    <div>
      <h2>Is this job a match for your skills?</h2>
      <div>
        Please ask the customer to demonstrate the issue they are trying to
        resolve and then confirm whether this job is a match for you
      </div>
      <StepButtonStyled onClick={handleMatchConfirm}>Yes</StepButtonStyled>
      <StepButtonStyled onClick={handleNotConfirm} type="back">
        No
      </StepButtonStyled>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

ConfirmMatch.propTypes = {
  setCurrentStep: PropTypes.func,
};

export default memo(ConfirmMatch);
