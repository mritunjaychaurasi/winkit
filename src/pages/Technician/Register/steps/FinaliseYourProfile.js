import React, {useState,useEffect} from "react"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import FooterBtns from "components/FooterBtns"
import CheckInCircle from "components/CheckInCircle"
import EditIcon from "components/EditIcon"
import { FaUserCircle } from "react-icons/fa"
import * as SoftwareApi from '../../../../api/software.api';
import { Upload, message , Space, notification,} from 'antd';
import { SERVER_URL } from '../../../../constants';
import * as TechnicianService from '../../../../api/technician.api';
import { FaCloudUploadAlt } from "react-icons/fa";
import * as Techapi from '../../../../api/technician.api';
import mixpanel from 'mixpanel-browser';

let r = (Math.random() + 1).toString(36).substring(7);
const FinaliseYourProfile = ({onPrev, onNext, setShowProgress, setProgressBarPercentage, expertiseArrselected, setCurrentStep, user, refetch
}) => {
    const [fileList, setFileList] = useState([]);
    const [fileListImage, setFileListImage] = useState([]);
    const [selectedsoftwareList, setSelectedSoftwareList] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false)
    const [geekImage,setGeekImage] = useState("");
    const [disable,setDisable] = useState(false);
    useEffect(()=>{
      (async () => { 
        const softwareListResponse = await SoftwareApi.getSoftwareList()
        if(softwareListResponse && softwareListResponse.data){
            for (var x in user.technician.expertise){
                for (var y in softwareListResponse.data){
                    let temp = {}
                    if(softwareListResponse.data[y].id === user.technician.expertise[x].software_id){
                        temp = softwareListResponse.data[y]
                        selectedSoftware.push(temp)
                    }
                }
            }
            console.log("My console to see", selectedSoftware)
            setSelectedSoftwareList(selectedSoftware)
        }
    })();
        setShowProgress(true)
        setProgressBarPercentage(95)
        refetch()
    },[])

    useEffect(()=>{
      console.log("My console for user days available", user)
    },[user])

    const handleNext = async()=>{
        setShowSpinner(true)
        // await TechnicianService.updateTechnician(user.technician.id,{registrationStatus:'schedule_interview'})
        let techUpdate = await Techapi.updateTechnicianWithParams( user.technician.id ,{registrationStatus:'schedule_interview'})
        onNext()
    }

      const openNotificationWithIcon = (nType, header, nMessage) => {
        notification[nType]({
          message: header,
          description: nMessage,
          });
      };
  
      const fileTypes = '.png, .jpg, .jpeg, .pdf, .doc';  
      const { Dragger } = Upload;
      const  fileTypesImage = '.png, .jpg, .jpeg';
     
      let  fileNameImage = `${user.id}_userProfile-${r}`;

      const propsForImage = {
        name: 'file',
        accept:fileTypesImage,
        multiple: false,
        fileList: fileListImage,
        action: `${SERVER_URL}/api/uploads`,
        data:{"user":`${fileNameImage}` },
        maxCount :1,
        beforeUpload: file => {
          console.log("file :::::",file)
          if(fileListImage.length > 0){
            openNotificationWithIcon('error', 'Warning', 'Only one file is allowed. Please delete remove the previous one first');
            return false;
          }
          if (
            !(
                file.type === 'image/jpeg'
                || file.type === 'image/png'
                || file.type === 'image/jpg'
            )
          ) {
            openNotificationWithIcon('error', 'Warning', 'File Type Not Supported');
            return false
          }
          if (file.size / 1048576 > 10) {
            openNotificationWithIcon('error', 'Warning', 'File should be smaller than 5mb');
            return false;
          }
        },
        async onChange(info) {
          const { status } = info.file;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'uploading') {
            setFileListImage([info.file]);
          }
          if (status === 'done') {       
              message.success(`${info.file.name} file uploaded successfully.`);
              let finalImage = `${fileNameImage}-.${info.file.type.split('/').pop()}`;
              let techUpdate = await Techapi.updateTechnicianWithParams( user.technician.id ,{"profile.image":`${SERVER_URL}/images/${finalImage}`})
                setFileListImage([info.file]);
                setGeekImage(`${SERVER_URL}/images/${finalImage}`);
                if(user){
                // mixpanel code//
                mixpanel.identify(user.email);
                mixpanel.track('Technician - uploaded profile image');
                // mixpanel code//
                }
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
        onRemove (){
          setGeekImage("")
          setFileListImage([])
          r = (Math.random() + 1).toString(36).substring(7);
             
        }
      };

      let fileName = `${user.id}_resume`
      const props = {
        name: 'file',
        accept:fileTypes,
        multiple: false,
        fileList,
        action: `${SERVER_URL}/api/uploads`,
        data:{"user":`${fileName}` },
        maxCount :0,
        beforeUpload: file => {
          console.log("file :::::",fileList)
          if(fileList.length > 0){
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
            // if(user){
            //   mixpanel.identify(user.email);
            //   mixpanel.track('Technician- Resume Uploaded',{ 'Email': user.email });
            // }
            
              message.success(`${info.file.name} file uploaded successfully.`);
              let techUpdateForpdf = await Techapi.updateTechnicianWithParams( user.technician.id ,{resume:`${fileName}-.${info.file.name.split('.').pop()}`})
              setFileList([info.file]);
              // mixpanel code//
              if(user){
              mixpanel.identify(user.email);
              mixpanel.track('Technician - uploaded resume');
              }
              // mixpanel code//
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
        onRemove (){
          setFileList([])
        }
      };

    let selectedSoftware = []

    const handleSkills = () =>{
      setCurrentStep(2)
    }

    const handleInfo = () =>{
       setCurrentStep(1)
    }

    const handlePreviousBtn= ()=>{
      setCurrentStep(5)
      // onPrev()
    }

    return<div className="d-flex justify-content-center align-items-center flex-column">
        <HeadingAndSubHeading heading={"Finalize your profile"} subHeading={"Please finish completing your profile. This is optional, but wouldn’t it be cool to have your own picture or avatar now?"} />
        
        <div className="w-90p">
            <div className="finalise-upload-div d-flex justify-content-center" >
                <div className="upload-div d-flex justify-content-center align-items-start flex-column"  >
                    <div className="d-flex justify-content-start align-items-center">
                        <CheckInCircle bgColor={"grey"}/>
                        <span className="finalise-upload-text">Upload Profile Image</span>
                    </div>
                    <Dragger {...propsForImage} >
                    <div className="uploadProfileImage">  
                      { geekImage ? 
                        <img src={geekImage}  className="geekImage"></img>
                        :
                        <FaUserCircle className="uploadProfileImage" />
                      }
                    </div>
                    </Dragger>
                </div>
                <div className=" upload-div d-flex justify-content-center align-items-center flex-column">
                    <div className="d-flex justify-content-start align-items-start w-100p">
                        <CheckInCircle bgColor={"grey"}/>
                        <span className="finalise-upload-text">Upload Resume</span>
                    </div>
                    <Dragger {...props} >
                    {
                      fileList.length > 0 && fileList[0].name ? 
                      (<div className="uploadResume d-flex justify-content-center align-items-center flex-column  "> 
                        <span>Resume uploaded successfully</span>
                      </div>) 
                    :
                    <div className="uploadResume d-flex justify-content-center align-items-center flex-column  ">  
                      <div className="cloud-upload">
                          <FaCloudUploadAlt className="cloud-icon" />
                      </div>
                      {/* <div className="drag-drop"> */}
                          <span className=" drag-drop drag-drop-text">
                            Drag & Drop or 	&nbsp;
                            <span className="drag-drop-upload">Upload</span>
                            </span> 
                      {/* </div> */}
                    </div>
                    }
                    </Dragger>
                </div>
            </div>
            <div className="finalise-summary-div d-flex justify-content-around align-items-start  w-100p">
                <div className="d-flex justify-content-start align-items-start flex-column" style={{width:"260px"}}>
                    <div className="d-flex justify-content-start align-items-center">
                        <CheckInCircle bgColor={"turcose"}/>
                        <span className="finalise-upload-text">Profile Details</span>
                    </div>
                    <div className="finalise-profile-details">
                        <p className="finalise-profile-p">{user.firstName+" "+user.lastName}</p>
                        <p className="finalise-profile-p">{user.email}</p>
                        <p className="finalise-profile-p">{user.technician.profile.confirmId.phoneNumber}</p>
                    </div>
                    {/* <div className="w-100p edit-icon-div">
                        <div className="edit-icon-inner-div">
                          <button 
                          style={{border:"none"}}
                          onClick={handleInfo}
                          >

                            <EditIcon />
                          </button>
                        </div>
                    </div> */}
                </div>
                <div className="d-flex justify-content-center align-items-center flex-column" style={{width:"260px"}}>
                    <div className="d-flex justify-content-start align-items-center w-100p">
                        <CheckInCircle bgColor={"turcose"}/>
                        <span className="finalise-upload-text mb-10">Skills</span>
                    </div>
                    {selectedsoftwareList.map((software, index)=>{
                        return (<div key={index} className="finalise-profile-skills">
                          <img src={software.blob_image} className="sw-img" />
                          <span className="finalise-profile-skills-span">{software.name}</span>
                        </div>)
                    })}
                    {/* <div className="w-100p edit-icon-div">
                        <div className="edit-icon-inner-div">
                        <button
                         style={{border:"none"}}
                         onClick={handleSkills}
                         >
                            <EditIcon />
                          </button>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>


        <FooterBtns onPrev={handlePreviousBtn} onNext={handleNext} hideSaveForLater={true} showSpinner={showSpinner} />
    </div>
}

export default FinaliseYourProfile