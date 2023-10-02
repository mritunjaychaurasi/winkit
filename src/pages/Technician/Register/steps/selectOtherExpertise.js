import React, { useEffect, useState } from 'react';
import {
  Card, Typography,Select,Spin
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


function SelectOtherExpertise({
  onPrev,
  onNext,
  otherSoftwareSelected,
  setOtherSoftwareSelected,
  timezone,
  register
}) {
  const [otherSoftwareList, setOtherSoftwareList] = useState([]);
  const [showError, setShowError] = useState(false);
  const {setOpenModal} = useTools()
  const [isActive, setIsActive] = useState(false);
  const [isOtherActive, setOtherActive] = useState(false);
  const [otherSoftwares, setOtherSoftwares] = React.useState([])
  const { Option } = Select;
  //const [otherSoftwareSelected, setOtherSoftwareSelected] = React.useState([])
  //const [ExpertiseArrselected, setExpertiseArrselected]= React.useState([])
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false);
  
  

  useEffect(() => {
    (async () => {
      const other_res = await SoftwareApi.getOtherSoftwareList();
      console.log('other_res>>>>>>>>>>',other_res)
      if (other_res && other_res.data) {
        setOtherSoftwareList(other_res.data)      
      }
    })();
  }, []);



 


   const handleOtherSoftwareCardClick = (value) => {
    console.log('handleOtherSoftwareCardClick>>>>>>',value)

    // setmainSoftware(value)
    let isExist = !!allOtherSoftwares.find(item => item === value.id);
    // console.log('isExist',isExist)
    if(isExist){
      let idx = allOtherSoftwares.indexOf(value.id);
      allOtherSoftwares.splice(idx,1)

    }else{
      allOtherSoftwares.push(value.id)
    }

    console.log('allOtherSoftwares>>>>>',allOtherSoftwares)
    setOtherSoftwareSelected(allOtherSoftwares)

    setOtherActive(!isOtherActive)

  
  };



  const handleNext = async(value) => {
    console.log('handleOtherSoftwareCardClick>>>>>>',otherSoftwareSelected)
    let timezoneValue = (timezone ? timezone : Intl.DateTimeFormat().resolvedOptions().timeZone)
    await TechnicianApi.updateTechnician(register.technician.id,{
      otherSoftwares : otherSoftwareSelected,
      registrationStatus : "confirm_schedule",
    });

    // mixpanel code//
    mixpanel.identify(value.email);
    mixpanel.track('Technician - Selects Other Softwares');
    // mixpanel code//
    onNext()
  }

  const otherSoftChange =(value)=>{
    setOtherSoftwareSelected(value)
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
          
          <p><h4>Other Softwares you may know!</h4></p>
          <Row className="justify-content-center">
            {
              otherSoftwareList.map((item) => {                
                  return(

                    <Col key={item.id} xs={12} sm={6}  md={2}  onClick={() => handleOtherSoftwareCardClick(item)} className={'mt-4 '+(isOtherActive !== -1 ? 'active text-align-center' : 'inactive text-align-center')}>
                      <CardContainer>
                        <Card.Grid style={gridStyle(!!allSoftwares.find(i => i.id === item.id))}>
                          <SoftwareImage
                                src={item.blob_image}
                            />
                          <CardText>{item.name}</CardText>
                        {!!allOtherSoftwares.find(i => i === item.id) && <CheckboxIcon src={CheckboxImage} />}
                        </Card.Grid>
                      </CardContainer>
                    </Col>
                  )               
              })
            }
          </Row>

         {/* <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Please select other categories you are interested in"
              onChange={otherSoftChange}
              className="form-control bottom-border-only filter-element job-report-selection"
            >
              {
                  otherSoftwareList.map(item => {                    
                        return (<Option key={item.id} value={item.id}>{item.name}</Option>);                     
                    })
              }
            </Select>*/}
         {/* <Row className="justify-content-left">
            <Col md="12" className="mt-5">
              <label className="label-name float-left">Any other software?</label>
              <ReactTagInput 
                tags={otherSoftwares} 
                onChange={(newSoftwares) => setOtherSoftwares(newSoftwares)}
                editable={true}
                readOnly={false}
                removeOnBackspace={true}
                placeholder="Type software name and press enter"
              />
            </Col>
          </Row>*/}
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
export default SelectOtherExpertise;