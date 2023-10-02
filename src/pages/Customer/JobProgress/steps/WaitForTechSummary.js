import { Progress, Typography } from 'antd';
import PropTypes from 'prop-types';
import React, { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useJob } from '../../../../context/jobContext';
import { useSocket } from '../../../../context/socketContext';

const { Title, Text } = Typography;

const WaitForTechSummary = ({ setCurrentStep, setSolutions }) => {
  const { jobId } = useParams();
  const { jobTime } = useJob();
  const { socket } = useSocket();

  useEffect(() => {
    socket.emit('join', jobId);
    socket.on('summarize-solution', data => {
      setSolutions(data);
      setCurrentStep(7);
    });
  }, [jobId, setCurrentStep, setSolutions, socket]);

  return (
    <div>
      <Title level={3}>Job completed!</Title>
      <Text>
        Your tech is creating a summary of the steps taken to resolve your
        issue...
      </Text>
      <ProgressStyled percent={80} showInfo={false} />
      <TimeCostWrapper>
        <div>
          Time Spent
          <br />
          <Title level={3}>
            {Math.round(jobTime / 60)}
            {' '}
            mins
          </Title>
        </div>
        <div>
          Cost
          <br />
          <Title level={3}>
            $
            {((Math.round(jobTime / 60) * 100) / 60).toFixed(0)}
          </Title>
        </div>
      </TimeCostWrapper>
    </div>
  );
};

const ProgressStyled = styled(Progress)`
  margin: 20px 0;
  .ant-progress-success-bg,
  .ant-progress-bg {
    background-color: #464646;
  }
  .ant-progress-text {
    color: white !important;
  }
`;
const TimeCostWrapper = styled.div`
  background-color: ${props => props.theme.light};
  display: flex;
  justify-content: space-between;
  padding: 15px;
`;

WaitForTechSummary.propTypes = {
  setCurrentStep: PropTypes.func,
  setSolutions: PropTypes.func,
};

export default memo(WaitForTechSummary);
