import React ,{useState} from 'react';
import styled from 'styled-components';
import {
  Row, Typography, Switch, Col, Select,
} from 'antd';
import ReactTags from 'react-tag-autocomplete'
import { languages } from '../../../../constants';
import {
  RateTabContainer,
  RateStepsTab,
  RateStep,
  TechSelect,
  StepActionContainer,
  StepTitle,
} from './style';
import CreatableSelect from 'react-select/creatable';
import {Button} from  'react-bootstrap';
import StepButton from '../../../../components/StepButton';
import ItemLabel from '../../../../components/ItemLabel';
import AuthInput from '../../../../components/AuthLayout/Input';
import CheckBox from '../../../../components/common/CheckBox';

const { Option } = Select;
const { Text } = Typography;

const englishLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Fluent',
  'Native',
];

function PreviousExpertise({
  onPrev,
  onNext,
  generalInfo,
  setGeneralInfo,
  otherLangCheck,
  setOtherLangCheck,
  showFreelancer,
  setShowFreelancer,
  showEmployee,
  setShowEmployee,
}) {
 const [options,setOptions] = useState([])

  console.log("generalInfo",generalInfo)
  const {
    freelancerProfiles,
    employmentProfiles,
    certifications,
    englishLevel,
    otherLangList,
  } = generalInfo;

  const mutateFields = (name, value) => {
    setGeneralInfo({
      ...generalInfo,
      [name]: value,
    });
  };

  const languagesOptions = languages.map(d => (
    <Option key={`others-${d[0]}`} style={{ textAlign: 'left' }} value={d[0]}>
      {d[0]}
    </Option>
  ));

  return (
    <Container>
      <StepTitle width="49%" margin="Auto"  font_size="30px">
        <p>Tell us little more about your expertise with the software you selected</p>
      </StepTitle>
      <BodyContainer className="select-job-body">
        <SectionTitle>
          In what capacity did you gain your experience?
        </SectionTitle>
        <CapacityContainer>
          <CheckBox
            id="employment"
            checked={showEmployee}
            onChange={(e) => {
              setShowEmployee(e.target.checked);
              if (e.target.checked) {
                mutateFields('employmentProfiles', [...employmentProfiles, '']);
              } else {
                mutateFields('employmentProfiles', []);
              }
            }}
          >
            Employment
          </CheckBox>
          {
            showEmployee && (
              <CapacityBody span={24}>
                <ItemLabel style={{ margin: 0,padding:0}}>COMPANY NAME</ItemLabel>
                {
                  employmentProfiles.map((employmentProfile, index) => (
                    <AuthInput
                      name="company_name"
                      size="large"
                      key={`employmentProfile-${index}`}
                      style={{ marginTop: 15 }}
                      placeholder="Company Name"
                      value={employmentProfile}
                      border="none"
                      borderbottom = "1px inset black"
                      border_radius="0px"
                      onChange={e => mutateFields('employmentProfiles', employmentProfiles.map(
                        (val, ind) => ind === index ? e.target.value : val,
                      ))}
                    />
                  ))
                }
                <AddProfile onClick={() => mutateFields('employmentProfiles', [...employmentProfiles, ''])}>
                  +Add Another
                </AddProfile>
              </CapacityBody>
            )
          }
        </CapacityContainer>
        <CapacityContainer>
          <CheckBox
            id="freelancer"
            checked={showFreelancer}
            onChange={(e) => {
              setShowFreelancer(e.target.checked);
              if (e.target.checked) {
                mutateFields('freelancerProfiles', [...freelancerProfiles, '']);
              } else {
                mutateFields('freelancerProfiles', []);
              }
            }}
          >
            Freelancer
          </CheckBox>
          {
            showFreelancer && (
              <CapacityBody span={24}>
                <ItemLabel className="Tech-label" style={{ margin: 0 }}>
                  Enter freelancer profiles
                </ItemLabel>
               {freelancerProfiles.map((freelancer, index) => (
                  <AuthInput
                    key={index}
                    name={`profile-${index}`}
                    size="large"
                    placeholder="Profile"
                    value={freelancer}
                    style={{ marginTop: 15 }}
                    border="none"
                    borderbottom = "1px inset black"
                    border_radius="0px"
                    onChange={e => mutateFields('freelancerProfiles', freelancerProfiles.map(
                      (val, ind) => ind === index ? e.target.value : val,
                    ))}
                  />
                ))}

                <AddProfile onClick={() => mutateFields('freelancerProfiles', [...freelancerProfiles, ''])}>
                  +Add Another
                </AddProfile>
              </CapacityBody>
            )
          }
        </CapacityContainer>
        <SectionTitle style={{ marginTop: 50 }}>
          Enter any certifications or credentials
        </SectionTitle>
        {
          certifications.map((certification, index) => (
            <AuthInput
              key={index}
              name={`certification-${index}`}
              size="large"
              value={certification}
              border="none"
              borderbottom = "1px inset black"
              border_radius="0px"
              onChange={e => mutateFields('certifications', certifications.map(
                (val, ind) => ind === index ? e.target.value : val,
              ))}
              style={{ marginTop: 15 }}
            />
          ))
        }
        <AddProfile onClick={() => mutateFields('certifications', [...certifications, ''])}>+Add Another</AddProfile>
        <SectionTitle style={{ marginTop: 50 }}>
          English speaking level
        </SectionTitle>
        <EnLabel>Please rate your level of experience</EnLabel>
        <RateTabContainer>
          <RateStepsTab
            current={englishLevel}
            onChange={(value) => mutateFields('englishLevel', value)}
            progressDot
          >

            {
              englishLevels.map((item) => (
                <RateStep key={`${item}`} description={item} className={(englishLevel == item ? 'ant-steps-item-process ant-steps-item-active' : '')} />
              ))
            }
          </RateStepsTab>
        </RateTabContainer>
        <SectionTitle style={{ marginTop: 50, marginBottom: 30 }}>
          Any other languages?
        </SectionTitle>
        <OtherLangCheckContainer>
          <Text>No</Text>
          <LangSwitch
            checked={otherLangCheck}
            onChange={(checked) => {
              setOtherLangCheck(checked);
              if (checked) {
                mutateFields('otherLangList', [{
                  name: '',
                  level: 0,
                }]);
              } else {
                mutateFields('otherLangList', []);
              }
            }}
          />
          <Text>Yes</Text>
        </OtherLangCheckContainer>
        {
          otherLangCheck && otherLangList.map((otherLang, index) => (
            <OtherLangSection key={`${otherLang.name}-${index}`}>
              <Col span={24}>
                <ItemLabel className="Tech-label" >Language</ItemLabel>
                <LangSelectContainer>
                  <TechSelect
                    showSearch
                    value={otherLang.name}
                    placeholder="Search for language"
                    showArrow
                    style={{ width: '50%' }}
                    optionFilterProp="children"
                    filterOption={(input, option) => option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0}
                    onChange={e => {
                      mutateFields('otherLangList', otherLangList.map(
                        (val, ind) => ind === index ? ({ ...val, name: e }) : val,
                      ));
                    }}
                  >
                    {languagesOptions}
                  </TechSelect>
                  {otherLang.name && (
                    <AddProfile
                      style={{ padding: 0, paddingLeft: 20 }}
                      onClick={() => {
                        mutateFields('otherLangList', otherLangList.map(
                          (val, ind) => ind === index ? ({ ...val, name: '' }) : val,
                        ));
                      }}
                    >
                      Remove
                    </AddProfile>
                  )}
                </LangSelectContainer>
              </Col>
              <EnLabel>Please rate your level of experience</EnLabel>
              <RateTabContainer>
                <RateStepsTab
                  current={otherLang.level}
                  onChange={current => {
                    mutateFields('otherLangList', otherLangList.map(
                      (val, ind) => ind === index ? ({ ...val, level: current }) : val,
                    ));
                  }}
                  progressDot
                >
                  {englishLevels.map((item, levelIndex) => levelIndex === englishLevel ? (
                    <RateStep key={`${item.title}`} description={item} />
                  ) : (
                    <RateStep
                      key={`${item.title}`}
                      description={item}
                    />
                  ))}
                </RateStepsTab>
              </RateTabContainer>
            </OtherLangSection>
          ))
        }
        {
          otherLangCheck && (
            <AddProfile
              onClick={() => mutateFields('otherLangList', [...otherLangList, { name: '', level: 0 }])}
            >
              +Add Another
            </AddProfile>
          )
        }
      </BodyContainer>
      <StepActionContainer className="steps-action">
        <Button className="app-btn mr-15"  onClick={onPrev}>Previous<span></span></Button>
        <Button className="app-btn mr-15"  onClick={onNext}>Next<span></span></Button>
      </StepActionContainer>
    </Container>
  );
}

const Container = styled.div`
`;

const BodyContainer = styled.div`
  background: #f4f4f4;
  margin-top : 60px;
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px;
`;

const CapacityBody = styled(Row)`
  padding-top: 30px !important;
  & .css-2b097c-container{
    width:100% !important;
  }
  & .css-2b097c-container .css-yk16xz-control{
    margin-top:20px;
    padding:5px;
    border :0px none;
    border-bottom:1px solid black;
    border-radius:0;
    width:100% !important;
  }
`;
const CapacityContainer = styled(Row)`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 25px;
  width: 100%;
  display: flex;
  flex-direction: column !important;
  align-items: flex-start;
`;

const SectionTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
`;

const AddProfile = styled(Text)`
  font-size: 15px;
  font-weight: bold;
  color: #8c8989;
  text-decoration: underline;
  padding-top: 20px;
  cursor: pointer;
`;

const EnLabel = styled(ItemLabel)`
  padding-top: 20px;
  padding-bottom: 20px;
`;

const OtherLangCheckContainer = styled(Col)`
  display: flex;
  align-items: center;
`;

const OtherLangSection = styled(Row)`
  width: 100%;
  padding-top: 20px;
  text-align: left;
`;
const LangSwitch = styled(Switch)`
  margin: 0 15px !important;
`;

const LangSelectContainer = styled.div`
  display: flex;
  align-items: center;
`;

export default PreviousExpertise;
