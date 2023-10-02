import React, { useEffect } from "react"

const SoftwareCardTechOnboarding = ({active, softwareName, imgSrc}) => {
    return(<div className={"sw-card-outer-div " + (active ? "sw-card-outer-div-active" : "")}>
        <img src={imgSrc} className="sw-card-img" />
        <span>{softwareName}</span>
    </div>)
}

export default SoftwareCardTechOnboarding;