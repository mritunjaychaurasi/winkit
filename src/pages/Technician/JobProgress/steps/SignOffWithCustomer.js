import { FileOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import StepButton from '../../../../components/StepButton';
import { useSocket } from '../../../../context/socketContext';

const { Title, Text } = Typography;

const SignOffWithCustomer = ({ setCurrentStep, solutions }) => {
  const { jobId } = useParams();
  const { socket } = useSocket();

  const handleConfirm = () => {
    socket.emit('summarize-solution', { id: jobId, solutions });
    setCurrentStep(12);
  };

  const handleCancel = () => {};

  return (
    <div>
      <Title level={3}>Sign off with customer</Title>
      <ListWrapper>
        <ListItem>
          <Text>Confirm resolution is ok</Text>
        </ListItem>
        <ListItem>
          <Text>Remember to save your work!</Text>
        </ListItem>
      </ListWrapper>
      <StepButtonStyled onClick={handleCancel}>
        Resolve another issue
      </StepButtonStyled>
      <StepButtonStyled type="back" onClick={handleConfirm}>
        Sign Off
      </StepButtonStyled>

      <Title level={3} onClick={handleConfirm}>
        Sign off with customer
      </Title>
      <FilesUploadWrapper>
        <FileUploadItem>
          <FileOutlined style={{ fontSize: '30px' }} />
          <Text strong style={{ marginLeft: '5px' }}>
            final-documents.zip
            <br />
            <span>01/01/2021, 10:25AM</span>
          </Text>
        </FileUploadItem>
        <FileUploadItem>
          <FileOutlined style={{ fontSize: '30px' }} />
          <Text strong style={{ marginLeft: '5px' }}>
            final-documents.zip
            <br />
            <span>01/01/2021, 10:25AM</span>
          </Text>
        </FileUploadItem>
        <FileUploadItem>
          <FileOutlined style={{ fontSize: '30px' }} />
          <Text strong style={{ marginLeft: '5px' }}>
            final-documents.zip
            <br />
            <span>01/01/2021, 10:25AM</span>
          </Text>
        </FileUploadItem>
        <FileUploadItem>
          <FileOutlined style={{ fontSize: '30px' }} />
          <Text strong style={{ marginLeft: '5px' }}>
            final-documents.zip
            <br />
            <span>01/01/2021, 10:25AM</span>
          </Text>
        </FileUploadItem>
        <FileUploadItem>
          <FileOutlined style={{ fontSize: '30px' }} />
          <Text strong style={{ marginLeft: '5px' }}>
            final-documents.zip
            <br />
            <span>01/01/2021, 10:25AM</span>
          </Text>
        </FileUploadItem>
      </FilesUploadWrapper>
    </div>
  );
};

const StepButtonStyled = styled(StepButton)`
  width: -webkit-fill-available;
  margin-left: 0px !important;
  margin-top: 30px !important;
`;

const ListWrapper = styled.ol`
  padding-left: 15px;
  margin: 30px 0;
`;

const ListItem = styled.li`
  margin: 10px 0;
  font-size: initial;
`;

const FilesUploadWrapper = styled.div`
  border: 1px solid black;
  height: 300px;
  padding: 10px;
  overflow: auto;
`;

const FileUploadItem = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

SignOffWithCustomer.propTypes = {
  setCurrentStep: PropTypes.func,
  solutions: PropTypes.array,
};

export default memo(SignOffWithCustomer);
