import React, { useEffect, useState } from 'react';
import {
  Card, Typography,Select,Spin,Modal
} from 'antd';
import styled from 'styled-components';
import {Container, Row, Col, Button} from  'react-bootstrap';
import { StepActionContainer, StepTitle } from './style';
// import TechImages from '../../../../components/TechImages';
// import RightImage from '../../../../assets/images/select_expertise.png';
import CheckboxImage from '../../../../assets/images/checkbox.png';
// import StepButton from '../../../../components/StepButton';
import * as SoftwareApi from '../../../../api/software.api';
import { WarningText } from '../../../Customer/ProfileSetup/steps/style';
import * as TechnicianApi from '../../../../api/technician.api';
import * as AuthApi from '../../../../api/auth.api';
import { openNotificationWithIcon } from '../../../../utils';
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";
import {useTools} from '../../../../context/toolContext';
import mixpanel from 'mixpanel-browser';
const { Text } = Typography;
let allSoftwares = [];
let allOtherSoftwares = [];
var temp = []



/*const SoftwareCard = ({ software, isActive, onClick}) => {

  const gridStyle = active => ({
    width: '9vw',
    height: '9vw',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '15px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px #000 solid',
    justifyContent: 'space-between',
    padding: '20px 10px',
    borderRadius: '10px',
    color: active ? '#fff' : '#000',
    cursor: 'pointer',
    opacity: active ? 1 : 0.4,
  });
  return (
    <Col span={6} onClick={onClick}>
      <CardContainer>
        <Card.Grid style={gridStyle(isActive)}>
          <TechImage src={TechImages[software.name]} />
          <CardText>{software.name}</CardText>
        </Card.Grid>
        {isActive && <CheckboxIcon src={CheckboxImage} />}
      </CardContainer>
    </Col>
  );
};*/


function SelectExpertise({
  onPrev,
  onNext,
  softwares,
  setSoftwares,
  setExperiences,
  setmainSoftware,
  setexpertise,
  expertiseArrselected,
  setExpertiseArrselected,
  timezone,
  register,
  certifiedIn,
  setCertifiedIn
}) {
  const [softwareList, setSoftwareList] = useState([]);
  const [otherSoftwareList, setOtherSoftwareList] = useState([]);
  const [showError, setShowError] = useState(false);
  const {setOpenModal} = useTools()
  const [isActive, setIsActive] = useState(false);
  const [isOtherActive, setOtherActive] = useState(false);
  const [otherSoftwares, setOtherSoftwares] = React.useState([])
  const { Option } = Select;
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false);
  
  

  useEffect(() => {
    (async () => {
      const res = await SoftwareApi.getSoftwareList();
      if (res && res.data) {
        setSoftwareList(res.data);
      }
    })();
  }, []);


  const handleCardClick = (value) => {
    // console.log(value,">>this is the mainSoftware")

    setmainSoftware(value)
    let isExist = !!allSoftwares.find(item => item.id === value.id);
    // console.log('isExist',isExist)
    if(isExist){
      let idx = allSoftwares.map(item => item.id).indexOf(value.id);
      allSoftwares.splice(idx,1)
      let certifiedSoftwares = [...certifiedIn]
      certifiedSoftwares = certifiedSoftwares.filter(item => item.id != value.id)
      setCertifiedIn(certifiedSoftwares)

    }else{
      let needConfirmation = false
      if(value.askForCertificate){
        needConfirmation = true
        Modal.confirm({
          content : `Are your certifited in ${value.name} .?`,
          okText:"Yes",
          cancelText:"No",
          className:"app-confirm-modal",
          onOk : () =>{
              let certifiedSoftwares = [...certifiedIn]
              certifiedSoftwares.push(value)
              setCertifiedIn(certifiedSoftwares)
          }
        })
      }
      allSoftwares.push(value)
    }

    
    setExperiences(allSoftwares)
    setIsActive(!isActive)

    /*setTimeout(function(){
      console.log('All softwares :::',allSoftwares)
    },500)*/
  };

  
  const handleNext = async(value) => {
    let expertiseArr = []
    for(var k in allSoftwares){
      var main = {}

      main['software'] = allSoftwares[k].id
      temp.push(main)
    }
    let main_ids = []
    let softwareMap = temp.map(item => item.software)

    for(var h in softwareMap ) 
    {
      for(var l in softwareList)
        {
          let tempDict = {}         
          if(softwareList[l]['parent'] === softwareMap[h])
          {
            if(!main_ids.includes(softwareList[l].i)){
               main_ids.push(softwareList[l].id)
              tempDict['software_id'] = softwareList[l].id
              tempDict['parent'] = softwareMap[h]
              expertiseArr.push(tempDict)
            }
           
          } 
          else{
            if(!main_ids.includes(softwareMap[h]) ){
               main_ids.push(softwareMap[h])
                tempDict['software_id'] = softwareMap[h] 
                expertiseArr.push(tempDict)
            }
           
          }
           
        }
       
      }
      setExpertiseArrselected(expertiseArr)
      console.log("sedfsdfsdf", expertiseArrselected);
      
      // console.log("sedfsdfsdf", setExpertiseArrselected);
      // return false;
      // console.log("expertiseArr ::: ",expertiseArr)
      //setSubmitUser(true)

    setSoftwares(allSoftwares);
    if (!allSoftwares.length) {
      setShowError(true);
      // console.log("i am inside if function  in selectexpertise ::")
      return;
    }

    let timezoneValue = (timezone ? timezone : Intl.DateTimeFormat().resolvedOptions().timeZone)
    let certifiedSoftwares = certifiedIn.map(item => item.id)
    if(register){
      await TechnicianApi.updateTechnician(register.technician.id,{
        expertise:expertiseArr,
        registrationStatus : "otherSoftwares",
        certifiedIn:certifiedSoftwares
      });
      // mixpanel code//
			mixpanel.identify(value.email);
			mixpanel.track('Technician - Selects softwares');
			// mixpanel code//
      openNotificationWithIcon(
        'success',
        'Success',
        'You have added expertise successfully',
      );
      setOpenModal(true)
      onNext()
    } 
}

  const gridStyle = active => ({
    position:'relative',
    width: '250px',
    height: '250px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '15px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '2px #97abb6 solid',
    justifyContent: 'space-between',
    padding: '55px 10px',
    borderRadius: '10px',
    color: active ? '#fff' : '#000',
    cursor: 'pointer',
    
  });

  return (
    <div>
      <Row>
        <Container fluid className="select-job-container">
          <StepTitle > <p>Please select all software you are proficient in.</p>
         </StepTitle>
          {/* <p><h4>Select all that apply</h4></p> */}
          <Row className="justify-content-center">
            {
              softwareList.map((item) => {
                if(item.parent === "0"){
                  return(
                    <Col key={item.id} xs={12} sm={6}  md={2} onClick={() => handleCardClick(item)} className={'mt-4 '+(isActive !== -1 ? 'active text-align-center' : 'inactive text-align-center')}>
                      <CardContainer>
                        <Card.Grid style={gridStyle(!!allSoftwares.find(i => i.id === item.id))}>
                          <SoftwareImage
                                src={item.blob_image}
                            />
                          <CardText>{item.name}</CardText>
                        {!!allSoftwares.find(i => i.id === item.id) && <CheckboxIcon src={CheckboxImage} />}
                        </Card.Grid>
                      </CardContainer>
                    </Col>
                  )
                }else{
                  return null; 
                }
              })
            }
          </Row>

          {
            showError && <WarningText>Please select your software</WarningText>
          }

          <StepActionContainer className="steps-action">
 
            <Button type="primary" className="app-btn mt-5" onClick={handleNext} disabled={nextBtnDisabled}>
            {(nextBtnDisabled 
                ?
                  <Spin/>
                :
                  <>Next</>
              )}
            </Button>
          </StepActionContainer>
        </Container>
      </Row>
    </div>
  );
}

const CardText = styled(Text)`
  font-size: 20px;
  margin: 0;
  margin-top:30px;
  font-weight:bold;
  letter-spacing: 0px;
  line-height: 16px;
  color: #8398A6 !important;
`;

const CheckboxIcon = styled.img`
  width: 15px;
  position: absolute;
  left: 10px;
  top: 10px;
`;
const CardContainer = styled.div`
  position: relative;
  width:40px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const SoftwareImage = styled.img`
  width: 45%;
  min-height:100px;
  height: auto;
`;
export default SelectExpertise;