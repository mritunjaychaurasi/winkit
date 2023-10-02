import Dropdown from "components/Dropdown"
import FooterBtns from "components/FooterBtns"
import HeadingAndSubHeading from "components/HeadingAndSubHeading"
import React, { useState, useEffect } from "react"
import SoftwareCardTechOnboarding from "../../../../components/SoftwareCardTechOnboarding"
import * as SoftwareApi from '../../../../api/software.api';
import * as TechnicianApi from '../../../../api/technician.api';
import { openNotificationWithIcon } from "utils"
import Loader from "../../../../components/Loader";
import mixpanel from 'mixpanel-browser';
import {EmailOutlook, ITSupport} from "../../../../constants"

const WhatIsYourSpeciality = ({onNext, onPrev, setShowProgress, setProgressBarPercentage, setExpertiseArrselected, setOtherSoftwareSelected, otherSoftwareSelected, register, expertiseArrselected, user, refetch}) =>{

    const [softwareList, setSoftwareList] = useState([]);
    const [additionalSoftwareList, setAdditionalSoftwareList] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false)
    const [showLoader, setShowLoader] = useState(true);
 
    useEffect(()=>{
        (async () => {
            const softwareListResponse = await SoftwareApi.getSoftwareList()
            console.log("Software List : ", softwareListResponse)
            if(softwareListResponse && softwareListResponse.data){
                setSoftwareList(softwareListResponse.data)
            }
            setShowLoader(false)
        })();
        (async () => {
            const additionalSoftwareListResponse = await SoftwareApi.getOtherSoftwareList();
            console.log('Addtional Software List : ',additionalSoftwareListResponse)
            if (additionalSoftwareListResponse && additionalSoftwareListResponse.data) {
                setAdditionalSoftwareList(additionalSoftwareListResponse.data)   
            }
          })();
        setProgressBarPercentage(30)
        setShowProgress(true)
        refetch()   
    },[])

    useEffect(()=>{
        if(user.technician.otherSoftwares.length > 0) {
            let otherSoftwares = user.technician.otherSoftwares
            setOtherSoftwareSelected(otherSoftwares)
        }
        if(user.technician.expertise.length > 0){
            let temp = user.technician.expertise
            for (var x in temp){
                temp[x].id = temp[x].software_id
            }
            setExpertiseArrselected(temp)
        }
    },[user])
    
    const handleSwCardClick = (software) =>{
        if(!expertiseArrselected.find(item => item.id === software.id)){
            let temp = [...expertiseArrselected]
            software["software_id"]=software.id
            temp.push(software)
            if(software.id === ITSupport) // checking if IT support is selected by tech.
            {
                let emailOutlookSoftwareData = softwareList.find((item)=> item.id === EmailOutlook) //Fetching software data for Email / Outlook
                emailOutlookSoftwareData["software_id"] = EmailOutlook
                temp.push(emailOutlookSoftwareData)
            }
            setExpertiseArrselected(temp)
        } else {
            let temp = [...expertiseArrselected]
            if(software.id === ITSupport)// checking if IT support is selected by tech.
            {
                temp = temp.filter(item => item.id !== EmailOutlook) // Removing Email / Outlook
            }
            temp = temp.filter(item => item.id !== software.id)
            setExpertiseArrselected(temp)
        }        
    }
    
    const saveForLater = async ()=>{
        if(register){
            const techUpdateRes = await TechnicianApi.updateTechnician(register.technician.id, {
                expertise:expertiseArrselected,
                otherSoftwares:otherSoftwareSelected,
            })
            if(techUpdateRes){
                openNotificationWithIcon('success', 'Success', 'Software(s) saved for later.') ;  
                // mixpanel code//
                mixpanel.identify(user.email);
                mixpanel.track('Technician - saved selected softwares (if any) for later');
                // mixpanel code//
            }
        }
    }

    const handleNextBtn = async () => {
        if( expertiseArrselected.length > 0 ){
            setShowSpinner(true)
            if(register){
                const updateTechWithSoftwareResponse = await TechnicianApi.updateTechnician(register.technician.id, {
                    expertise:expertiseArrselected,
                    otherSoftwares:otherSoftwareSelected,
                    registrationStatus : "level_of_expertise",
                })
                if(updateTechWithSoftwareResponse){
                    openNotificationWithIcon('success', 'Success', 'Software(s) saved.') ;  
                    // mixpanel code//
                    mixpanel.identify(user.email);
                    mixpanel.track('Technician - submitted selected softwares and proceeded to next form');
                    // mixpanel code//
                }
            }
            onNext()
        }else{
            openNotificationWithIcon('error', 'Error', "Please select atleast one software to continue!")
        }
    }

    if(showLoader) return (<Loader />) 
    return(<div className="d-flex justify-content-center align-items-center flex-column">
        <HeadingAndSubHeading heading={"What’s your speciality?"} subHeading={"YES. We really care! Why? Because we’re passionate about helping you do the jobs you love. Your customers win, and YOU win! So don’t be shy :)"} />

        {softwareList.map((software, index)=>{
            if(software.subSoftware.length===0 && software.id !== EmailOutlook){ //if software is not a parent software && Software !== Email / Outlook
                return (<div key={index} className={"d-flex align-items-center justify-content-center software-outer-div flex-wrap" } >
                <div onClick={()=>handleSwCardClick(software)} className="inside-div-input-container">
                    <SoftwareCardTechOnboarding softwareName={software.name} imgSrc={software.blob_image} active={expertiseArrselected.find(item => item.id === software.id)} />
                </div>
                {/* <div className="inside-div-input-container">
                    {selectedSoftware.includes(software.id) && <Dropdown name={'sub_option'} opts={software.sub_option} placeholder={"Please select further skills"} />}
                </div> */}
            </div>)
            }
        })}

        {/* For additional softwares */}
        <div className="software-outer-div d-flex align-items-center justify-content-center">
            <Dropdown
              placeholder={"Additional Softwares"}
              opts={additionalSoftwareList}
              name={'additional_softwares'}
              style={{width: "100%", maxWidth: "428px"}}
              setOtherSoftwareSelected={setOtherSoftwareSelected}
              value={otherSoftwareSelected}
            />
        </div>

        {/* Buttons */}
        <FooterBtns onPrev={onPrev} onNext={handleNextBtn} saveForLater={saveForLater} showSpinner={showSpinner} />
    </div>)
}

export default WhatIsYourSpeciality

