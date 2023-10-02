import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Typography,Table
} from 'antd'


const RoundSelectors = ({ software, isActive, onClick, isBtn=true}) => {
    const gridStyle = active => ({
        // 'minWidth': '156px',
         'height': '47px',
        /* UI Properties */
        'border': '2px solid #DCE6ED',
        'borderRadius': '23px',
        'opacity': 1,
        'padding':'14px 40px',
        'marginRight':'20px',
        'marginBottom':'10px',
        'width':'auto !important',
        // 'boxShadow': '1px 0 0 0 #f0f0f0, 0 1px 0 0 #f0f0f0, 1px 1px 0 0 #f0f0f0, 1px 0 0 0 #f0f0f0 inset, 0 1px 0 0 #f0f0f0 inset',
        'transition': 'all 0.3s',
        'float':'left',
        'overflow':'hidden'
    });

    return (        
        <Col onClick={onClick}>
            {/* <div position="relative" className="border-box font-nova pe-auto"  > */}
            <div position="relative" className="font-nova" >
                <div style={gridStyle(isActive)} className={"max-width-406-round-selector software-card " + (isActive ? "active" : "not-active") + (isBtn ? " onBtnHover cursor-pointer" : "cursor-alias")}>
                    <div className="card-text-css"><span>{software?.name ? software?.name : software}</span></div>
                </div>
                {/* <Card.Grid style={gridStyle(isActive)} className={"software-card " + (isActive ? "active" : "not-active")}>
                    <div className="card-text-css"><span>{software?.name}</span></div>
                </Card.Grid> */}

            </div>
        </Col>
    );

};
export default RoundSelectors;