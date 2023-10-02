import React from "react"
import logo from "../../../assets/images/newLogoSmaller.png"
import { useTools } from "../../../context/toolContext";
import { LANDING_PAGE_URL, APP_URL } from '../../../constants';

const Logo = ({ user }) => {
    const { useTimer, jobFlowStep } = useTools();
    return (<div style={{ backgroundColor: useTimer === 0 && jobFlowStep == 3 ? "#DCE6ED" : "transparent" }}>
        <a href={user ? APP_URL : LANDING_PAGE_URL}>
            <img src={logo} className="logo-class" />
        </a>
    </div>);
};

export default Logo;