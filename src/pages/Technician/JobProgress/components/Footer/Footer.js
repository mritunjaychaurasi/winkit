import React, { memo } from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { getFullName } from '../../../../../utils';
import {useJob} from '../../../../../context/jobContext';

const TechInfoSection = () => {
  const { job } = useJob();

  return (
    <InfoSectionStyled>
      <Col xs={24} sm={12} lg={4}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Customer</InfoSectionTitleStyled> <br />
          <InfoSectionContent>
            {(job && job.customer) && getFullName(job.customer.user)}
          </InfoSectionContent>
        </InfoSectionItemStyled>
      </Col>
      <Col xs={24} sm={12} lg={12}>
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
      <Col xs={24} sm={12} lg={4}>
        <InfoSectionItemStyled>
          <InfoSectionTitleStyled>Estimated Earnings</InfoSectionTitleStyled>
          <br />
          <InfoSectionContent>
            $
            {job && job.price
              ? `${job.price.from.toFixed(0)}-${job.price.to.toFixed(0)}`
              : 0}
          </InfoSectionContent>
        </InfoSectionItemStyled>
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
  text-transform: uppercase;
  color: lightgray;
  font-weight: 500;
`;

const InfoSectionItemStyled = styled.div`
  margin: 0px 20px 15px;
  min-width: fit-content;
`;

const InfoSectionContent = styled.span`
  font-weight: 600;
`;

TechInfoSection.propTypes = {};
export default memo(TechInfoSection);
