import React from 'react';
import { Row, Col, Typography } from 'antd';
import styled from 'styled-components';
import { StepActionContainer } from './style';
import RightImage from '../../../../assets/images/submit.png';
import H2 from '../../../../components/common/H2';
import H4 from '../../../../components/common/H4';
import StepButton from '../../../../components/StepButton';
// import { useAuth } from '../../../../context/authContext';
// const { Text } = Typography;


function ApplicationSubmitted({ onNext }) {
  
  // const history = useHistory();


  return (
    <Row>
      <Container span={15}>
        <StepTitle>Your application has been submitted!</StepTitle>
        <StepActionContainer
          style={{ justifyContent: 'flex-start' }}
          className="steps-action"
        >
          <StepButton type="primary">Go to dashboard</StepButton>
        </StepActionContainer>
      </Container>
      <Col span={9}>
        <Image src={RightImage} alt="on-boarding" />
      </Col>
    </Row>
  );
}

const Container = styled(Col)`
  display: flex;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;
`;
const Image = styled.img`
  margin-left: 30px;
`;

const StepTitle = styled(H2)`
  padding-bottom: 50px;
`;
// const StepSubTile = styled(H4)`
//   padding-bottom: 50px;
// `;
ApplicationSubmitted.propTypes = {};

ApplicationSubmitted.defaultProps = {};

export default ApplicationSubmitted;
