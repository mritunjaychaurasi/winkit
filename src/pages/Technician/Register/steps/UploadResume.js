import { Upload, message , Space, notification,} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';

import { useUser } from '../../../../context/useContext';
import { SERVER_URL } from '../../../../constants';
import * as TechnicianService from '../../../../api/technician.api';
import { useAuth } from '../../../../context/authContext';
import { Button } from 'react-bootstrap';
import mixpanel from 'mixpanel-browser';
const UploadResume = ()=>{
  const {user} = useUser()
  const {refetch} = useAuth();
  const [fileList, setFileList] = useState([]);
  const handleNext = async()=>{
    if(user){
      mixpanel.identify(user.email);
      mixpanel.track('Technician- Click Next button from Upload Resume Page',{ 'Email': user.email });
    }
    await TechnicianService.updateTechnician(user.technician.id,{registrationStatus:'interview_result'})
    window.location.href = "/"
  }

  const openNotificationWithIcon = (nType, header, nMessage) => {
    notification[nType]({
      message: header,
      description: nMessage,
    });
  };
  const fileTypes = '.png, .jpg, .jpeg, .pdf, .doc';
  const { Dragger } = Upload;
  let fileName = `${user.id}_resume`
  const props = {
    name: 'file',
    accept:fileTypes,
    multiple: false,
    fileList,
    action: `${SERVER_URL}/api/uploads`,
    data:{"user":`${fileName}` },
    maxCount :1,
    beforeUpload: file => {
      console.log("file :::::",file)
      if(fileList.length >= 1){
        openNotificationWithIcon('error', 'Warning', 'Only one file is allowed. Please delete remove the previous one first');
        return false;
      }
      if (
        !(
          file.type === 'image/jpeg'
          || file.type === 'application/pdf'
          || file.type === 'image/png'
          || file.type === 'image/jpg'
          || file.type === 'application/msword'
        )
      ) {
        openNotificationWithIcon('error', 'Warning', 'File Type Not Supported');
        return false
      }
      if (file.size / 1048576 > 10) {
        openNotificationWithIcon('error', 'Warning', 'File should be smaller than 10mb');
        return false;
      }
    },
    async onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'uploading') {
        setFileList([info.file]);
      }
      if (status === 'done') {
        if(user){
          mixpanel.identify(user.email);
          mixpanel.track('Technician- Resume Uploaded',{ 'Email': user.email });
        }
          message.success(`${info.file.name} file uploaded successfully.`);
          await TechnicianService.updateTechnician(user.technician.id,{resume:`${fileName}-.${info.file.name.split('.').pop()}`,registrationStatus:'interview_result'})
          refetch()
          window.location.href = "/"
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove (){
      setFileList([])
    }
  };

  return (
      <>
        <div className="col-8 mx-auto">
            <h1>You're almost done!</h1>
            <h5>Please upload your work resume or CV below. </h5>
             <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click  this area to upload your resume</p>
            </Dragger>
        </div>
        <Button className="btn app-btn mt-3" onClick={handleNext}>
          <span />
            Next
        </Button>
      </>
    )

}
export default UploadResume;