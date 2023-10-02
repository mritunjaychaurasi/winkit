import React, { useState ,useEffect} from 'react';
// import {useSocket} from '../../../context/socketContext';
import {useAuth} from '../../../context/authContext';
// import * as settingsApi from '../../../api/settings.api';
import mixpanel from 'mixpanel-browser';
export default function TopBar({estimatedWaitTime}) {
    
    // const [twoTierJobs, setTwoTierJobs] = useState(false);
    // const {socket} = useSocket()
    const {user,updateUserInfo} = useAuth()
    const [status, setStatus] = useState(user.availableForJob)
    // const [estimatedTime, setEstimatedTime] = useState((estimatedWaitTime ? estimatedWaitTime : 'NA'));

    useEffect(() => {
        let main_software = [];
        if (user.technician) {
            const { expertise } = user.technician;
            // console.log('expertise>>>>>>',expertise)
            for (let i = 0; i <= expertise.length - 1; i++) {
                if (expertise[i].software_id) {
                    if (!expertise[i].parent || expertise[i].parent === "") {
                        if (!main_software.includes(expertise[i].software_id)) {
                            main_software.push(expertise[i].software_id);
                        }
                    } else {
                        if (!main_software.includes(expertise[i].parent)) {
                            main_software.push(expertise[i].parent);
                        }
                    }
                }

            }
        }
    },[])

    // useEffect(() => {
        // console.log('softwareList here...',softwareList)        
    // },[softwareList])

    /*useEffect(()=>{
        if(estimatedWaitTime){
            setEstimatedTime(estimatedWaitTime)
        }
    },[estimatedWaitTime])*/

    const updateTechnicianStatus = () => {
        if(status){
            // console.log("Going to set user as INACTIVE")
        //mixpanel code //
			mixpanel.identify(user.email);
			mixpanel.track('Technician - Inactive',{user:user.email});
        //mixpanel code //
            updateUserInfo({
                userId: user.id,
                availableForJob:false,
            });
        }else{
        //mixpanel code
            mixpanel.identify(user.email);
			mixpanel.track('Technician - Active',{user:user.email});
        //mixpanel code
            updateUserInfo({
                userId: user.id,
                availableForJob:true,
            });
            // console.log("Going to set user as ACTIVE")
        }
        setStatus(!status)
    }

    return (
        <div style={{
            height: "120px", display: "flex", paddingTop: "20px", paddingBottom: "10px", marginTop: "30px", borderRadius: "11px",
            boxShadow: "9px 9px 15px 1px rgb(170 170 170 / 75%)", backgroundColor:'#F6FBFF'
        }}>
            <CardItem onSwitchClick={updateTechnicianStatus} title="STATUS" switchText={status ? "Active" : "Inactive"} isSwitchActive={status} />
            
        </div>
    )
}


const CardItem = ({ switchText, title, style, showSwitch = true, isSwitchActive, onSwitchClick }) => {
    return (
        <div style={{ flex: 1, marginLeft: "30px", ...style }}>

            <h5 style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "20px", color: "#475258" }}>{title}</h5>
            <Switch onSwitchClick={onSwitchClick} text={switchText} showSwitch={showSwitch} isSwitchActive={isSwitchActive} />
        </div>
    )
}


const Switch = ({ text, showSwitch, isSwitchActive, onSwitchClick }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", }}>
            {showSwitch && <div
                onClick={onSwitchClick}
                style={{
                    cursor: "pointer",
                    background: isSwitchActive ? "#1bd4d5" : "#dce7ed",
                    justifyContent: isSwitchActive ? "flex-end" : "flex-start",
                    display: "flex",
                    height: "30px", borderRadius: "24px", width: "60px", padding: "0.2rem"
                }}>
                <div style={{
                    width: "45%", background: isSwitchActive ? "#ffffff" : "#dce7ed", borderRadius: "50%", height: "100%",
                    boxShadow: !isSwitchActive && "0px 0px 1px 2px rgb(170 170 170 / 75%)"
                }}></div>
            </div>
            }
            <h5 style={{
                fontSize: "15px", color: isSwitchActive ? "#1fc7c8" : "#72838d", fontWeight: "bold", marginLeft: showSwitch ? "20px" : 0, marginBottom: 0,

                marginTop: showSwitch ? 0 : "0.5rem"
            }}>{text}</h5>
        </div>
    )
}
