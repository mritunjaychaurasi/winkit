import React, { useState, useMemo } from 'react';
// import Loader from '../components/Loader';
// import { openNotificationWithIcon } from '../utils';
import ct from 'countries-and-timezones';

const ToolsContext = React.createContext({});

function ToolsContextProvider(props) {
	const initialStep = window.localStorage.getItem('CurrentStep')
	const [jobId, setJobId] = useState('');
	const [typeForDetails, setTypeForDetails] = useState('');
	const [activeMenu, setActiveMenu] = useState("");
	const [stepDeciderForDashboard, setStepDeciderDashboard] = useState(initialStep);
	const [hideBadge, sethideBadge] = useState(false)
	const [openTechModal, setOpenModal] = useState(false);
	const [totalCost, setTotalCost] = useState(false);
	const [openMobileDialogBox, setOpenMobileDialogBox] = useState(false);
	const [hearAboutUsModal, setHearAboutUsModal] = useState(false);
	const [jobFlowStep, setJobFlowStep] = useState(0);
	const [useTimer, setUseTimer] = useState(900000);
	const jobFlowsDescriptions = {
		"selectSoftware": 0,
		"issueDescription": 1,
		"jobDetailView": 2,
		"jobAlivePage": 3,
		"customerRegisterPage": 4,
		"creditCardInformation": 5,
		"scheduleJob": 6,
		"notAccepted": 7,
	}
	const [ifScheduleJob, setIfScheduleJob] = useState(false)
	let browserNotificationShown = []

	/**
	 * this function gets the country name according to the timezone of technician
	 * @param : timezone(Type:String)
	 * @author : Sahil
	**/
	const getCountryCategory = (timezone) => {
		let category = 'NON-US'
		try {
			let timezoneObj = ct.getTimezone(timezone)
			let country = timezoneObj.countries[0]
			if (country == "DO" || country == "PH" || country == 'US') {
				category = country
			}
		}
		catch (err) {
			console.log("Error in getCountryCategory ::: ", {
				"error": err,
				"timezone": timezone
			})
		}
		return category
	}



	/**
	 * this function gets commission according to the use timezone
	 * @param : category (Type:String)
	 * @param : softwareObj (Type:Object)
	 * @param : isHourlyLongJob (Type:Boolean)
	 * @response : JSON object
	 * @author : Sahil
	 **/
	const getCountryCodeCommissions = (technicianCategory, softwareObj, isHourlyLongJob) => {
		try {
			let commission_list = JSON.parse(JSON.stringify(softwareObj.comissions))
			let commission_obj = commission_list.find(item => item.category === technicianCategory)
			if (isHourlyLongJob) {
				return commission_obj.commisionPerHour
			}
			return commission_obj.commissionPerMinute
		}
		catch (err) {
			console.log("error in getCountryCodeCommissions ::::::: ", {
				"error": err,
				"softwareObj": softwareObj,
				"isHourlyLongJob": isHourlyLongJob
			})
		}
	}

	const memoValue = useMemo(() => ({
		jobId,
		typeForDetails,
		setJobId,
		setTypeForDetails,
		stepDeciderForDashboard,
		setStepDeciderDashboard,
		sethideBadge,
		openTechModal,
		setOpenModal,
		hideBadge,
		browserNotificationShown,
		openMobileDialogBox,
		activeMenu,
		setActiveMenu,
		setOpenMobileDialogBox,
		hearAboutUsModal,
		setHearAboutUsModal,
		getCountryCategory,
		getCountryCodeCommissions,
		jobFlowStep,
		setJobFlowStep,
		jobFlowsDescriptions,
		ifScheduleJob,
		useTimer,
		setUseTimer,
		setIfScheduleJob
	}), [jobId, jobFlowStep, ifScheduleJob, activeMenu, hearAboutUsModal, hideBadge, openTechModal, openMobileDialogBox,useTimer,setUseTimer,stepDeciderForDashboard])
	return (
		<ToolsContext.Provider value={memoValue} {...props} />
	)
}

function useTools() {
	const context = React.useContext(ToolsContext);
	if (context === undefined) {
		throw new Error("toolsContext must be with in Tools context provider")
	}

	return context;
}

export { ToolsContextProvider, useTools }