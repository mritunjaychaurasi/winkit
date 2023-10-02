import { Col, Row, Space, TimePicker, Typography, Modal, Radio } from "antd";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import { PlayCircleFilled } from "@ant-design/icons";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import moment from "moment";
import TimezoneSelect, { allTimezones } from "react-timezone-select";
import AvailableDatePicker from "react-datepicker";
import { StepActionContainer, StepTitle } from "./style";
import Select from "../../../../components/common/Select";
import ItemLabel from "../../../../components/ItemLabel";
// import StepButton from '../../../../components/StepButton';
import CheckBox from "../../../../components/common/CheckBox";
import * as AuthApi from "../../../../api/auth.api";
import mixpanel from "mixpanel-browser";
// import { timezoneList } from '../../../../constants';
import { WarningText } from "../../../Customer/ProfileSetup/steps/style";
import { openNotificationWithIcon } from "../../../../utils";
import Box from "../../../../components/common/Box";
import * as TechnicianApi from "../../../../api/technician.api";
import { useUser } from "../../../../context/useContext";
import VideoPopup from "./videoPopup";
import { getVideos } from "../../../../api/video.api";
import CompleteIcon from "../../../../assets/images/complete_icon.png";
import NotCompleteIcon from "../../../../assets/images/not_complete_icon.png";
// import onBoardingTechn from "./onBoardingTech";
// import styles from "./modal.module.css";
import Instructions from "./instructions";
const { Option } = Select;

const { Text } = Typography;
const initSelectedTimes = ["startTime", "endTime"];
const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const initAvailableTimes = {
	Sunday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
	Monday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
	Tuesday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
	Wednesday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
	Thursday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
	Friday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
	Saturday: {
		available: false,
		startTime: "",
		endTime: "",
		timeZone: "",
	},
};

function ConfirmYourSchedule({
  onPrev,
  onNext,
  register,
  timezone
}) {
  // const [timezone, setTimezone] = useState('');
  const [availableTimes, setAvailableTimes] = useState({ ...initAvailableTimes });
  const [selectedTimes, setSelectedTimes] = useState({ ...initSelectedTimes });
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [showError, setShowError] = useState(false);
  const [checkAll, setCheckAll] = React.useState(false);
  const [timezoneError, setTimezonError] = useState(null);
  const [selectedDaysError, setSelectedDaysError] = useState(null);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false);
  const [alertMessageVideoWatched, setAlertMessageVideoWatched] = useState('');
  
  	// @author : Utkarsh Dixit
	const [modal1Visible, setModal1Visible] = useState(false);
	const [scrollBottom, setScrollBottom] = useState(false);
  const [techFeedWhereToCome, setTechFeedWhereToCome] = useState('');
  // const [whereHeComeFrom, setWhereHeComeFrom] = useState('');
  const [otherComeFeedBack, setOtherComeFeedBack] = useState('');
  const [showWhereToFieldError, setShowWhereToFieldError] = useState(false);
  const { user } = useUser();
  const [techProfile, setTechProfile] = useState({
    profileImage: {
      complete: false,
    },
    confirmId: {
      complete: false,
    },
    bankAccount: {
      complete: false,
    },
    schedule: {
      complete: false,
    },
    systemRequirement: {
      complete: false,
    },
    alertPreference: {
      complete: false,
    },
    reviewGuide: {
      complete: false,
    },
    technicianSource:"",
  });

  const [guideLines, setGuideLines] = useState({
    'Protecting Customer Data1': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
    'Protecting Customer Data2': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
    'Protecting Customer Data3': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
    'Protecting Customer Data4': {
      play: false,
      url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      isComplete: false,
    },
  });

  useEffect(() => {
    const links = getVideos();

    links.then((res) => {
      const temp = {};
      for (const k in res.data) {
        temp[res.data[k].title] = { play: false, url: res.data[k].videoUrl, isComplete: false };
      }
      // console.log("temp :: ",temp)
      setGuideLines(temp);
    });
  }, []);

  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');

  const handleClickVideo = (video, title) => {
    console.log('Handle video click called....');
    const payload = {
      ...video,
      play: true,
      isComplete: false,
      title,
    };
    setSelectedTitle(title);
    setSelectedVideo(payload);
    setGuideLines(prev => ({
      ...prev,
      [title]: payload,
    }));
  };
  const handleWatchAgainClickVideo = (video, title) => {
    console.log('Handle video click called....');
    const payload = {
      ...video,
      play: true,
      isComplete: true,
      title,
    };
    setSelectedTitle(title);
    setSelectedVideo(payload);
    setGuideLines(prev => ({
      ...prev,
      [title]: payload,
    }));
  };

  useEffect(() => {
    console.log('<>>>>>>>selectedVideo ', selectedVideo);
    if (selectedVideo.isComplete) {
      setGuideLines(prev => ({
        ...prev,
        [selectedTitle]: {
          ...selectedVideo,
          isComplete: true,
        },
      }));
      // setSelectedTitle('');
      // setSelectedVideo('');
    }
  }, [selectedTitle, selectedVideo]);

  // [setTechProfile, techProfile, register]); commented by manibha 6:07pm

  const onCheckChange = e => {
    const { checked, id } = e.target;
    let checkedCount = checked ? 1 : -1;
    Object.keys(availableTimes).forEach(item => {
      if (availableTimes[item].available) checkedCount += 1;
    });
    setIndeterminate(!!(checkedCount > 0 && checkedCount < 7));
    setCheckAll(checkedCount === 7);

    const tempAvailabletimes = { ...availableTimes };
    tempAvailabletimes[id].available = checked;
    if (!checked) {
      tempAvailabletimes[id].startTime = '';
      tempAvailabletimes[id].endTime = '';
      tempAvailabletimes[id].timeZone = '';
    }
    setAvailableTimes(tempAvailabletimes);
    // setAvailableTimes(prev => ({
    //   ...prev,
    //   [id]: {
    //     ...prev[id],
    //     available: checked,
    //   },
    // }));
    setSelectedDaysError('');
  };
  const onCheckAllChange = e => {
    let updateAvailableTimes = { ...availableTimes };
    Object.keys(availableTimes).forEach(item => {
      updateAvailableTimes = {
        ...updateAvailableTimes,
        [item]: {
          ...updateAvailableTimes[item],
          available: e.target.checked,
        },
      };
    });
    setAvailableTimes(updateAvailableTimes);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const ifSelectedDays = () => {
    const selectedDays = Object.keys(availableTimes).filter(
      item => availableTimes[item].available,
    );
    return selectedDays.length;
  };

  const validateTime = () => {
    const selectedDays = Object.keys(availableTimes).filter(item => {
      if (availableTimes[item].available) {
        if (
          availableTimes[item].startTime === ''
          || availableTimes[item].endTime === ''
        ) {
          return item;
        }
      }
      return undefined;
    });
    return selectedDays.length;
  };

  const handleComplete = async (value) => {
    /* if (!setTimezone || setTimezone === "") {
      // setTimezonError('No Timezone Selected.');
      // setShowError(true)
      openNotificationWithIcon(
        'error',
        'Timezone empty',
        'No Timezone Selected.',
      );
      return false;
    } else */
    
		if (!ifSelectedDays()) {
			// setSelectedDaysError('No days Selected.');
			// setShowError(true)
			openNotificationWithIcon(
				"error",
				"No days Selected",
				"Please select any day before proceed."
			);
			return false;
		}
		if (validateTime()) {
			openNotificationWithIcon(
				"error",
				"Time is missing",
				"Please add time correctly"
			);
			// setShowError(true)
			return false;
		}
		if (validateStartEndTime()) {
			openNotificationWithIcon(
				"error",
				"Invalid time",
				"Start and End Date is invalid"
			);
			// setShowError(true)
			return false;
		}
		/* console.log(">>>>>>> timezone",timezone.value)
    if(!timezone.value || timezone.value === ''){
      openNotificationWithIcon(
        'error',
        'Timezone',
        'Please Select a Timezone',
      );
      setShowError(true)
      return false;
    } */

    if(!selectedVideo || selectedVideo === ''){
      openNotificationWithIcon(
        'error',
        'Watch Video',
        'Please Watch Video First',
      );
      // setShowError(true)
      return false;
     }
     
     	//@ author : Utkarsh Dixit
		if (!scrollBottom) {
			// setSelectedDaysError('No days Selected.');
			// setShowError(true)
			openNotificationWithIcon(
				"error",
				"Read Document",
				"Please read the document before proceeding."
			);
			return false;
		}

    let whereto = await handleWhereToCome();
    let whereHeComeFrom;
    if(whereto.userReference && whereto.userReference!=''){
      whereHeComeFrom = whereto.userReference;
    }
    if(!whereto.success){
         return false;
    }        
    if (register) {
      setTechProfile(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          complete: true,
          timezone,
          availableTimes,
        },
        reviewGuide: {
          ...prev.reviewGuide,
          complete: true,
        },
        technicianSource:whereHeComeFrom,
      }));
      await TechnicianApi.updateTechnician(register.technician.id, {
        profileImage: false,
        schedule: { timezone: timezone, availableTimes: { ...availableTimes } },
        reviewGuide: { complete: true },
        technicianSource:whereHeComeFrom,
        registrationStatus: 'upload_resume',
      });

      // mixpanel code//
      mixpanel.identify(value.email);
      mixpanel.track('Technician - Saved time of availability');
      // mixpanel code

      onNext();
      // window.location.href="/dashboard";
      openNotificationWithIcon(
        'success',
        'Success',
        'Time updated Successfully',
      );
      // setOpenModal(true)
    }
  };

  /* const zoneList = Object.keys(timezoneList).map(d => (
    <Option key={`zone-${d}`} style={{ textAlign: 'left' }} value={d}>
      {d}
    </Option>
  )); */

  // const handleChangeTimeZone = value => {
  //   setTimezone(value);
  //   setTimezonError('');
  // };

  const deselectAll = () => {
    let updateAvailableTimes = { ...availableTimes };
    Object.keys(availableTimes).forEach(item => {
      updateAvailableTimes = {
        ...updateAvailableTimes,
        [item]: {
          ...updateAvailableTimes[item],
          available: false,
        },
      };
    });
    setAvailableTimes(updateAvailableTimes);
    setIndeterminate(false);
    setCheckAll(false);
  };

  const validateStartEndTime = () => {
    let isFailed = false;
    Object.keys(availableTimes).filter(key => {
      if (availableTimes[key].available) {
        if (

          moment(availableTimes[key].endTime).isBefore(moment(availableTimes[key].startTime))
        ) {
          isFailed = true;
          return key;
        }
      }
      return undefined;
    });
    return isFailed;
  };

  const onTimeSelect = (type, typeDay, time) => {
    if (typeDay === 'checkAll') {
      setSelectedTimes(prev => ({
        ...prev,
        [type]: time,
      }));
      Object.keys(availableTimes).map(key => {
        setAvailableTimes(prev => ({
          ...prev,
          [key]: { ...availableTimes[key], [type]: time },
        }));
        return key;
      });
    } else {
      setAvailableTimes(prev => ({
        ...prev,
        [typeDay]: { ...availableTimes[typeDay], [type]: time },
      }));
    }
  };
  
  	const handleAnchor = (e) => {
		setModal1Visible(true);
		// setDocVisible(true);
		// console.log("visibility set " + docVisible);
	};

  // @autor Utkarsh
  //This fuction set value for radio buttons
	const handleTechFeed = e => {
		setTechFeedWhereToCome(e.target.value);
	};

  // @autor Utkarsh
  //this function hadle validation for technician source after submition
  const handleWhereToCome = async () => {
    let whereHeComeFrom;
		if (techFeedWhereToCome == '') {
			openNotificationWithIcon('error', 'Error', 'Please select an option');
			return false;
		}
		else if (techFeedWhereToCome == 'Others' && otherComeFeedBack == '') {
			setShowWhereToFieldError(true);
			// setWhereHeComeFrom('');
			return false;
		}else {
      if(techFeedWhereToCome == 'Others'){
        whereHeComeFrom = otherComeFeedBack;
        // setWhereHeComeFrom(otherComeFeedBack);
      }else{
        whereHeComeFrom = techFeedWhereToCome;
        // setWhereHeComeFrom(techFeedWhereToCome);
      }
		}
    return ({success :true,userReference:whereHeComeFrom});	
		
	};

  return (
    <Container className="w-50 m-auto p-4 tech-register-step-3">
      {/* <StepTitle >
        {`The Licensee may permit its employees to use the Asset for the
        purposes described in Item 8, provided that the Licensee takes all
        necessary steps and imposes the necessary conditions to ensure that
        all employees using the Asset do not commercialize or disclose the
        contents of it to any third person, or use it other than in accordance
        with the terms of this Agreement. The Licensee acknowledges and agrees
        that neither Licensor nor its board members, officers, employees or
        agents, will be liable for any loss or damage arising out of or
        resulting from Licensor’s provision of the Asset under this Agreement,
        or any use of the Asset by the Licensee or its employees; and Licensee
        hereby releases Licensor to the fullest extent from any such
        liability, loss, damage or claim.`}
      </StepTitle> */}
			<p>
				<h4>
					<b>What days are you available?</b>
				</h4>
			</p>
			<Row gutter={[40, 40]} className="justify-content-center">
				<Col span={24}>
					<CheckBox
						indeterminate={indeterminate}
						onChange={onCheckAllChange}
						checked={checkAll}
					>
						All days of the week
					</CheckBox>
					{/* <AlertError>{selectedDaysError}</AlertError> */}
				</Col>
				{checkAll ? (
					<Row gutter={[20, 0]} className="text-center availableDatePicker">
						<Col span={24}>
							<ItemLabel style={{ marginBottom: 0 }}>
								Select hours available
							</ItemLabel>
						</Col>

						<Col xs={24} md={11}>
							<AvailableDatePicker
								selected={
									selectedTimes.startTime !== "" ? selectedTimes.startTime : ""
								}
								onChange={(date) => onTimeSelect("startTime", "checkAll", date)}
								showTimeSelect
								showTimeSelectOnly
								timeIntervals={60}
								timeCaption="Start Time"
								placeholderText="Start"
								dateFormat="h aa"
							/>
							{/* <AvailableTimePicker
                use12Hours
                allowClear={false}
                format="h A"
                placeholder="Start"
                onSelect={time => onTimeSelect('startTime', 'checkAll', time)}
              /> */}
						</Col>
						<Col xs={24} md={11}>
							<AvailableDatePicker
								selected={
									selectedTimes.endTime !== "" ? selectedTimes.endTime : ""
								}
								onChange={(date) => onTimeSelect("endTime", "checkAll", date)}
								showTimeSelect
								showTimeSelectOnly
								timeIntervals={60}
								timeCaption="End Time"
								placeholderText="End"
								dateFormat="h aa"
							/>
							{/* <AvailableTimePicker
                use12Hours
                allowClear={false}
                format="h A"
                placeholder="End"
                onSelect={time => onTimeSelect('endTime', 'checkAll', time)}
                // value={availableTimes['Monday']['endTime']}
              /> */}
						</Col>
					</Row>
				) : (
					days.map((item) => (
						<DaySection
							key={item}
							name={item}
							onCheckChange={onCheckChange}
							values={{ ...availableTimes }}
							onTimeSelect={onTimeSelect}
						/>
					))
				)}
				<Col col={6}>
					<DeSelectText onClick={deselectAll}>Deselect ALL</DeSelectText>
				</Col>
			</Row>
			{/* <Row gutter={[30, 30]}>
      <Col span={8} className="mt-4">
        <label className="pt-2"><b>SELECT TIMEZONE *</b></label>
      </Col>

      <Col span={8} className="text-left mt-4">
      <TimezoneSelect
          value={timezone}
          onChange={setTimezone}
          timezones={{
              ...allTimezones
          }}
          className = "mb-2 "
          id="tech-timezone"
          style={{ width: '50%' }}
      /></Col>
      </Row> */}

			{/* <Label >
        {`
        When you receive an invitation to peer review, you should be sent a copy
        of the paper's abstract to help you decide whether you wish to do the
        review. Try to respond to invitations promptly - it will prevent delays.
        It is also important at this stage to declare any potential Conflict of
        Interest.`}
      </Label> */}

			<p style={{ borderTop: "solid 1px #CCC", paddingTop: "30px" }}>
				<h4>
					<b>Get started by the video below!</b>
				</h4>
			</p>
			<ListContainer>
				<VideoPopup
					selectedVideo={selectedVideo}
					setSelectedVideo={setSelectedVideo}
				/>
				{Object.keys(guideLines).map((item) => (
					<Row align="middle" gutter={[30, 30]} key={item}>
						<Col span={8}>
							<GuideTitle>
								{/* <b>{item}</b> */}
							</GuideTitle>
						</Col>
						<MidSection
							span={11}
							onClick={() =>
								guideLines[item].isComplete
									? handleWatchAgainClickVideo(guideLines[item], item)
									: handleClickVideo(guideLines[item], item)
							}
						>
							<PlayCircleFilled style={{ fontSize: 20, float: "left" }} />
							<GuideVideoTitle>
								{guideLines[item].isComplete
									? "Watch Video again"
									: "Watch Video"}
							</GuideVideoTitle>
						</MidSection>
						<Col spn={4}>
							<RightIcon
								src={
									guideLines[item].isComplete ? CompleteIcon : NotCompleteIcon
								}
								className="float-left"
							/>
							<Text className="float-left">
								{guideLines[item].isComplete ? "Completed" : "Not Completed"}
							</Text>
						</Col>
					</Row>
				))}
			</ListContainer>

			<em style={{textAlign: "center", fontWeight:"bold", fontSize:"25px", color:"black"}}> Read how it works.{" "}	
        <span style={{ color: "blue" }} onClick={handleAnchor}>Click</span>
        <span style={{ color: "red" }}>*</span>
      </em>

			{/* // @author Utkarsh dixit */}
			<Modal
				title="Onboarding for Techs - How it Works"
				style={{
					top: 20,
				}}
        width={1000}
				visible={modal1Visible}
				onOk={() => setModal1Visible(false)}
				onCancel={() => setModal1Visible(false)}
				footer={false}
        closable={false}
			>
				<Instructions setScrollBottom={setScrollBottom} setModal1Visible={setModal1Visible} />
			</Modal>

      <p style={{ borderTop: "solid 1px #CCC", paddingTop: "30px", marginTop:"20px" }}>
				<h4>
					<b>How did you hear about us ? </b>
          <span style={{ color: "red" }}>*</span>
				</h4>
			</p>
      <Row>
        <Col>
        <Radio.Group onChange={handleTechFeed} className="radioBoxes" value={techFeedWhereToCome} style={{textAlign:"left",paddingLeft:"1rem"}}>
              <Radio value="Facebook">
              Facebook
              </Radio>
                        <br />
              <Radio value="Twitter">
              Twitter
              </Radio>
                        <br />
              <Radio value="LinkedIn">
              LinkedIns
              </Radio>
                        <br />
              <Radio value="friend">
              Friend
              </Radio>
                        <br />
              <Radio value="Others">
              Others please specify
              </Radio>
			</Radio.Group>
      { techFeedWhereToCome == 'Others' && (
									<div className="section_five">
										<div className="section_sub_five col-12 ml-0 p-0 mt-4 form-group">
											<input spellCheck rows={4} className="form-control" onChange={(e) => { setShowWhereToFieldError(false); setOtherComeFeedBack(e.target.value); }} id="textarea" />
											{showWhereToFieldError && <p className="m-0 p-0" style={{ color: 'red' }}> Required Field</p> }
										</div>
									</div>
								)}
        </Col>
      </Row>
      

			<AlertError>{timezoneError}</AlertError>
			{showError && <WarningText>All fields are required.</WarningText>}
			<StepActionContainer className="steps-action">
				<Box display="flex" justifyContent="flex-end" marginTop={30}>
					<Button className="btn app-btn" onClick={handleComplete}>
						<span />
						Save
					</Button>
				</Box>
			</StepActionContainer>
			<Row />
		</Container>
	);
}

const DaySection = (props) => {
	const { name, onCheckChange, values, onTimeSelect } = props;
	// const [name.'Start', setStartDate] = useState(new Date());
	// const [name.'End', setEndDate] = useState(null);
	// const startDate = Array.from(
	//   { length: 4 },
	//   setStartDate
	// );
	// const endDate = Array.from(
	//   { length: 4 },
	//   setStartDate
	// );

	return (
		<Col xs={24} md={6}>
			<Space direction="vertical" size={15}>
				<CheckBox
					id={name}
					checked={values[name].available}
					onChange={onCheckChange}
				>
					{name}
				</CheckBox>
				{values[name].available && (
					<Row>
						<ItemLabel style={{ marginBottom: 0 }}>
							Select hours available
						</ItemLabel>
						<Row gutter={[20, 0]} className="availableDatePicker">
							<Col xs={24} md={11}>
								<AvailableDatePicker
									value={
										values[name].startTime !== "" ? values[name].startTime : ""
									}
									selected={
										values[name].startTime !== "" ? values[name].startTime : ""
									}
									onChange={(date) => onTimeSelect("startTime", name, date)}
									showTimeSelect
									showTimeSelectOnly
									timeIntervals={60}
									timeCaption="Start Time"
									placeholderText="Start"
									dateFormat="h aa"
								/>
								{/* <AvailableTimePicker
                use12Hours
                allowClear={false}
                format="h A"
                placeholder="Start"
                defaultValue={values[name].startTime !== '' ? moment(values[name].startTime) : ''}
                onSelect={time => onTimeSelect('startTime', name, time)}
              /> */}
							</Col>
							<Col span={11}>
								<AvailableDatePicker
									value={
										values[name].endTime !== "" ? values[name].endTime : ""
									}
									selected={
										values[name].endTime !== "" ? values[name].endTime : ""
									}
									onChange={(time) => onTimeSelect("endTime", name, time)}
									showTimeSelect
									showTimeSelectOnly
									timeIntervals={60}
									timeCaption="End Time"
									placeholderText="End"
									dateFormat="h aa"
								/>
								{/* <AvailableTimePicker
                use12Hours
                allowClear={false}
                format="h A"
                placeholder="End"
                defaultValue={values[name].endTime !== '' ? moment(values[name].endTime) : ''}
                onSelect={time => onTimeSelect('endTime', name, time)}
              /> */}
							</Col>
						</Row>
					</Row>
				)}
			</Space>
		</Col>
    
	);
};

DaySection.propTypes = {
	name: PropTypes.string,
	values: PropTypes.object,
	onCheckChange: PropTypes.func,
	onTimeSelect: PropTypes.func,
};

DaySection.defaultProps = {
	name: "Monday",
};
ConfirmYourSchedule.propTypes = {
	setTechProfile: PropTypes.func,
};

ConfirmYourSchedule.defaultProps = {
	setTechProfile: () => {},
};

const GuideTitle = styled(Text)`
	font-size: 18px;
`;
const GuideVideoTitle = styled(Text)`
	font-size: 16px;
	font-weight: bold;
	padding-left: 10px;
	float: left;
`;
const MidSection = styled(Col)`
	display: flex;
	align-items: center;
	cursor: pointer;
`;
const ListContainer = styled.div`
	padding-top: 30px;
`;

const RightIcon = styled.img`
	width: 20px;
	margin-right: 10px;
`;

const AlertError = styled.div`
	color: red;
`;
const Container = styled.div`
	display: flex;
	flex-direction: column;
	background-color: #fff;
`;
const AvailableTimePicker = styled(TimePicker)`
	height: 50px;
	border-radius: 10px;
`;
const Label = styled(ItemLabel)`
	font-weight: bold;
	color: #868383;
	padding-top: 30px;
	padding-bottom: 20px;
	border-bottom: 0px;
`;
const DeSelectText = styled(Text)`
	font-size: 15px;
	font-weight: bold;
	color: #8c8989;
	text-decoration: underline;
	padding-top: 20px;
	cursor: pointer;
`;
export default ConfirmYourSchedule;
