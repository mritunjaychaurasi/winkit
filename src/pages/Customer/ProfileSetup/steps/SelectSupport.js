import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Typography,Table
} from 'antd';


import { Button } from 'react-bootstrap';

import {Switch} from 'antd';
import styled from 'styled-components';
import {
  StepTitle,
  BodyContainer,
  SectionTitle, WarningText,TitleContainer,IssueSelect
} from './style';
// import TechImages from '../../../../components/TechImages';
// import StepButton from '../../../../components/StepButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowRight,faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import * as SoftwareApi from '../../../../api/software.api';
import CheckboxImage from '../../../../assets/images/checkbox.png';
import Loader from '../../../../components/Loader';
import {queryDecider,openNotificationWithIcon} from '../../../../utils';
import Box from '../../../../components/common/Box';
import { useJob } from '../../../../context/jobContext';
import RoundSelectors from '../../../../components/Selectors';
// import $ from 'jquery';
import mixpanel from 'mixpanel-browser';
import Logo from 'components/common/Logo';

const { Text } = Typography;
const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' ,hour: '2-digit', minute:'2-digit'};
// const SoftwareCard = ({ software, isActive, onClick}) => {
//     const gridStyle = active => ({
//         'width': '156px',
//          'maxHeight': '47px',
//         /* UI Properties */
//         'border': '2px solid #DCE6ED',
//         'border-radius': '23px',
//         'opacity': 1,
//         'padding':'10px',
//         'margin-right':'20px',


//     });
//     // console.log("software",software)
//     return (
        
//         <Col onClick={onClick}>
//             <div position="relative" className="border-box font-nova"  >
//                 <Card.Grid style={gridStyle(isActive)} className={"software-card " + (isActive ? "active" : "not-active")}>
//                     <div className="card-text-css"><span>{software.name}</span></div>
//                 </Card.Grid>
//             </div>
//         </Col>
//     );

// };

const SelectSupport = ({ software, onChange,user ,jobFlowsDescriptions,setJobFlowStep}) => {
    const [softwareList, setSoftwareList] = useState([]);
    const [tableData,setTableData] = useState([])
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const {fetchJobByParams} = useJob()
    const moment = require('moment');
    const [columns,setColumns] = useState([{
        title:"Date",
        dataIndex: 'createdAt',
        render: text => (
            <span>
                {' '}
                { moment(text).format('YYYY-MM-DD')}
            </span>)

    },{
        title:"Tech",
        render: (text, record) => (
        <>
            { record && record.technician
                ? `${record.technician.user?.firstName} ${record.technician.user?.lastName}` : 'NA'}
        </>
    ),
        
    },{
        title:"Issue",
        dataIndex: 'issueDescription',
        width: '30%',
        render: text => (
            <p padding="10px 5px" title={text} className="issue-description">
                {(text.length > 100 ? `${text.substring(0, 100)}...` : text)}
            </p>
        ),
    },{
        title :"Cost",
        dataIndex:"total_cost"
    }])

    const handleBack = ()=>{
        window.location.href = '/'
    }
    useEffect(()=>{
        if(showError){
            openNotificationWithIcon("error","Error","Please select one software")
        }
    },[showError])
    useEffect(() => {
        (async () => {
            try {
                // setIsLoading(true);
                const res = await SoftwareApi.getSoftwareList();
                if (res && res.data) {
                    setSoftwareList(res.data);
                }
                setTimeout(function(){
                    setIsLoading(false);
                },200)
            } catch (e) {
                setIsLoading(false);
            }
        })();
    },[]);
    
    const call_fetch_jobs = async (filter,pagination={ page: 1,pageSize:10 }) => {
        const res = await fetchJobByParams(filter,pagination)
        setTimeout(function(){
            setIsLoading(false)
        },1500)

        console.log("call_fetch_jobs response :::::: ",res)
        if(res){
            setTableData(res.jobs.data)
            return res.jobs
        }
        else{
            return []
        }
    }

    useEffect(() => {
        if(user){
            let query = queryDecider("Completed Jobs",user)
            call_fetch_jobs(query)
            mixpanel.track('Customer - On Select Program Page', { 'Email': user.email });
        }
    },[user]);

    const handleCardClick = (value) => {
        setShowError(false);
        onChange(value);
    };

    const handleNext = () => {
        if (!software) {
            setShowError(true);
            return;
        }
        if(user){
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Customer - Main software selected');
            mixpanel.people.set({
                $first_name: user.firstName,
                $last_name: user.lastName,
            });
            // mixpanel code//
        }
        setJobFlowStep(jobFlowsDescriptions['issueDescription'])
        // onNext();
    };

    if (isLoading) return <Loader height="100%" />;

    return (<>
      
        <Row>
            <Container span={24} className="select-job-container font-nova">
                <Logo user={user}/>
                <StepTitle className="job-heading-text reg-heading-text font-nova">Tell us about your support needs</StepTitle>
                <BodyContainer span={24} className="">
                    <TitleContainer className="ant-row">
                        <SectionTitle className=" software-question font-nova color--lightThemeFontColor">
                            Which software do you currently need help with?

                        </SectionTitle>
                    </TitleContainer>
                    <Box position="relative">
                            {
                                softwareList.map(item => {
                                    if(item.parent === "0" || item.parent === 0){
                                        return (
                                            <RoundSelectors
                                                key={item.id}
                                                software={item}
                                                onClick={() => handleCardClick(item)}
                                                isActive={software && software.id === item.id}
                                            />
                                        )
                                    }
                                    return null;
                                })
                            }
                    </Box>
                </BodyContainer>
                <BodyContainer className="d-flex flex-row">
                    <Box display="flex" justifyContent="left" width="50%">
                        {/* <Button onClick={handleBack} className="btn sm-btn-back hw-60"><span> </span><FontAwesomeIcon className='arr-size' icon={faArrowLeft} /></Button> */}
                    </Box>
                    <Box display="flex" justifyContent="right" width="50%">
                        <Button onClick={handleNext} className="btn sm-btn-color hw-60"><span> </span><FontAwesomeIcon className='arr-size' icon={faArrowRight} /></Button>
                    </Box>
                 </BodyContainer>
            </Container>
        </Row>
    </>
    );
};

const Container = styled(Col)`
  display: flex !important;
  width: 100%;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;


`;

const CardText = styled(Text)`
    width:36px;
    text-align: center;
    font: normal normal 600 15px/19px Proxima Nova;
    letter-spacing: 0.07px;
    color: #01D4D5;
    font-size:15px;
    opacity: 1;
`;

const TechImage = styled.img`
  width: 40%;
`;

const CheckboxIcon = styled.img`
  width: 15px;
  position: absolute;
  left: 10px;
  top: 10px;
  z-index:1;
`;


export default SelectSupport;
