import { Progress, Row, Col } from 'antd';
import React, { memo } from 'react';
import styled from 'styled-components';
import { getFormattedTime, getFullName } from '../../../../../utils';
import { useJob } from '../../../../../context/jobContext';

const CustomerInfoSection = () => {
  const { job, jobTime } = useJob();

  return (
    <InfoSectionStyled>
      <Col xs={24} sm={12} lg={4}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Your tech</InfoSectionTitleStyled> <br />
          <InfoSectionContent>{job && job.technician && getFullName(job.technician.user)}</InfoSectionContent>
        </InfoSectionItemStyled>
      </Col>
      <Col xs={24} sm={12} lg={10}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Issue</InfoSectionTitleStyled> <br />
          <InfoSectionContent style={{ fontWeight: 'normal' }}>
            {job && job.issueDescription}
          </InfoSectionContent>
        </InfoSectionItemStyled>
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Estimated Time</InfoSectionTitleStyled> <br />
          <InfoSectionContent>
            {job && job.duration
              ? `${job.duration.from}-${job.duration.to}`
              : 0}{' '}
            mins
          </InfoSectionContent>
        </InfoSectionItemStyled>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TimerStatusStyled>Paused</TimerStatusStyled>
          <CircularProgress
            type="circle"
            width="80px"
            percent={80}
            format={() => getFormattedTime(jobTime)}
            strokeColor="#fff"
            strokeLinecap="#908d8d"
          />
        </div>
      </Col>
    </InfoSectionStyled>
  );
};

const InfoSectionStyled = styled(Row)`
  background-color: #464646;
  color: white;
  padding: 20px;
`;

const InfoSectionTitleStyled = styled.h4`
  /* text-transform: uppercase; */
  color: lightgray;
  font-weight: 500;
`;

const InfoSectionItemStyled = styled.div`
  margin: 0px 20px 15px;
  // min-width: fit-content;
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

const InfoSectionContent = styled.div`
  font-weight: 600;
`;

CustomerInfoSection.propTypes = {};

export default memo(CustomerInfoSection);
