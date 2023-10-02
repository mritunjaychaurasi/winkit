import React, { useEffect, useState, memo } from 'react';
import styled from 'styled-components';
import {
  Typography, Row, Select, Col,
} from 'antd';
// import StepButton from '../../../../components/StepButton';
import { Button } from 'react-bootstrap';
import ItemLabel from '../../../../components/ItemLabel';
import CheckBox from '../../../../components/common/CheckBox';
import 'react-phone-number-input/style.css';

import {
  TechSelect,
  RateTabContainer,
  RateStepsTab,
  RateStep,
  StepActionContainer,
  StepTitle,
} from './style';
import TechImages from '../../../../components/TechImages';
// import { openNotificationWithIcon } from '../../../../utils';

const { Text } = Typography;
const { Option } = Select;
const experienceYearsList = ['5 - 10', '10 - 15', '15 - 20', '20 - 25'];
const ratingScale = [
  'Beginner',
  'Basic knowledge but never used professionally',
  'Pretty fluent & limited use professionally',
  'Very fluent and a lot of use professionally',
  'Complete mastery with extensive professional use',
];

const SoftwareDetailSection = ({
  software,
  title,
  experience,
  setExperience,
}) => {
  const [experienceYearArea, setExperienceYearArea] = useState('');
  const [expertises, setExpertises] = useState([]);

  const experiencesYearAreas = experienceYearsList.map(d => (
    <Option key={`others-${d}`} style={{ textAlign: 'left' }} value={d}>
      {d}
    </Option>
  ));
  console.log(software, title, experience, 'resss');
  useEffect(() => {
    if (experience) {
      setExperienceYearArea(experience.experienceYearArea);
      setExpertises(experience.expertises);
    }
  }, [experience]);

  const isExist = (expertise) => {
    if (expertises) {
      return !!expertises.find(item => item.expertise === expertise.id);
    }

    return false;
  };

  const findExpertise = (expertise) => expertises.find(item => item.expertise === expertise.id);

  const handleChangeLevel = (expertise, rate) => {
    const newExpertises = isExist(expertise)
      ? expertises.map(item => item.expertise === expertise.id ? { ...item, rate } : item)
      : [...expertises, { expertise: expertise.id, rate }];

    setExpertises(newExpertises);
    setExperience({
      software: software.id,
      experienceYearArea,
      expertises: newExpertises,
    });
  };

  const handleCheckBoxStatus = (expertise, e) => {
    const newExpertises = isExist(expertise) && expertises
      ? expertises.filter(item => item.expertise !== expertise.id)
      : expertises === undefined ? [{ expertise: expertise.id, rate: 0 }] : [...expertises, { expertise: expertise.id, rate: 0 }];

    setExperience({
      software: software.id,
      experienceYearArea,
      expertises: newExpertises,
    });
  };

  return (
    <SoftwareContainer>
      <SectionImage src={TechImages[software.name]} />
      <SectionTitle>{`How many years of experience you have with ${(software.parent === undefined ? title : `${software.name} (${title})`)}?`}</SectionTitle>
      <SelectYearContainer span={12}>
        <ItemLabel className="Tech-label">Select the years</ItemLabel>
        <TechSelect
          id="select_year"
          showSearch
          className="select-boxes-tech"
          placeholder="Select the years"
          showArrow
          style={{ width: '100%' }}
          optionFilterProp="children"
          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          value={experienceYearArea}
          onChange={value => {
            setExperienceYearArea(value);
            setExperience({
              software: software.id,
              experienceYearArea: value,
              expertises,
            });
          }}
        >
          {experiencesYearAreas}
        </TechSelect>
      </SelectYearContainer>
      {software.expertise.map(item => (
        <AreaContainer key={`areaCheck-${item.id}`}>
          <CheckBox
            id={item.id}
            checked={expertises ? !!expertises.find(e => e.expertise === item.id) : null}
            onChange={(e) => handleCheckBoxStatus(item, e)}
          >
            {item.name}
          </CheckBox>
          {
            isExist(item) && (
              <RateSelectBody span={24}>
                <ItemLabel>Please rate your level of experience</ItemLabel>
                <RateTabContainer>
                  <RateStepsTab
                    progressDot
                    current={findExpertise(item).rate}
                    onChange={current => handleChangeLevel(item, current)}
                  >
                    {
                      ratingScale.map((rItem) => (
                        <RateStep
                          key={`${software.name}-${rItem.title}`}
                          description={rItem}
                        />
                      ))
                    }
                  </RateStepsTab>
                </RateTabContainer>
              </RateSelectBody>
            )
          }
        </AreaContainer>
      ))}
    </SoftwareContainer>
  );
};

function RateExpertise({
  onNext,
  onPrev,
  softwares,
  experiences,
  setExperiences,
}) {
  const onChangeExperience = (data) => {
    const isExist = !!experiences.find(item => item.software === data.software);
    const newExperiences = isExist ? experiences.map(item => item.software === data.software ? data : item) : [...experiences, data];
    setExperiences(newExperiences);
  };

  const handleNext = () => {
    // for(var k in softwares){
    //   console.log("pushing main")
    //     setExperiences(prevState=>[...prevState,{"software":softwares[k].id}]);
    //     }
    // if (softwares.some(item => !experiences.find(i => i.software === item.id || item.subSoftware.map(j => j.id).indexOf(i.software) !== -1))
    //   || experiences.some(item => !item.experienceYearArea)
    // ) {
    //   openNotificationWithIcon('error', 'Warning', 'Please select the experience correctly');
    //   return;
    // }
    onNext();
  };

  return (
    <Container>
      <StepTitle width="49%" margin="Auto" font_size="30px">
        <p>Tell us little more about your expertise with the software you selected</p>
      </StepTitle>
      {
        softwares.map(software => {
          if (software.subSoftware && software.subSoftware.length) {
            return software.subSoftware.map(item => (
              <SoftwareDetailSection
                key={`software-${item.name}`}
                software={item}
                title={software.name}
                experience={experiences.find(exp => exp.software === item.id)}
                setExperience={onChangeExperience}
              />
            ));
          }
          return (
            <SoftwareDetailSection
              key={`software-${software.name}`}
              software={software}
              title={software.name}
              experience={experiences.find(item => item.software === software.id)}
              setExperience={onChangeExperience}
            />
          );
        })
      }
      <StepActionContainer className="steps-action">
        <Button className="app-btn mr-15" type="primary" onClick={onPrev}>
          Previous
          <span />
        </Button>
        <Button className="app-btn mr-15" type="primary" onClick={handleNext}>
          Next
          <span />
        </Button>
      </StepActionContainer>
    </Container>
  );
}

const Container = styled.div`

`;

const SoftwareContainer = styled.div`
  background: #F6FBFF;
  margin-bottom: 50px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px;
`;

const SelectYearContainer = styled(Row)`
  padding-top: 25px;
`;
const SectionTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
`;
const SectionImage = styled.img`
  width: 60px;
  margin-bottom: 25px;
`;
const AreaContainer = styled(Col)`
  background: white;
  padding: 20px;
  width: 100%;
  justify-content: flex-start;
  display: flex;
  border-radius: 10px;
  margin-top: 20px;
  flex-direction: column;
  align-items: flex-start;
  font-family :initial;
  
`;

const RateSelectBody = styled(Row)`
  padding: 30px;
`;

export default memo(RateExpertise);
