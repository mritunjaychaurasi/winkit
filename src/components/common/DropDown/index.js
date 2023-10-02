import React from "react";
import '../../../style.css'
import { Select } from 'antd';
import Form from 'react-bootstrap/Form';

const DropDown = (props) => {

    return (<>         
        <Select
            showSearch
            defaultValue={props.name === 'language'? 
                                                    "English" 
                                                   :  
                                                    props.name === 'hearAboutUs' ?
                                                                                  "LinkedIn"
                                                                                 :
                                                                                  "Select"}
            name={props.name}  onChange={props.onChange} className="dropDownMenu" aria-label="Default select example">
                {props.dropDownOptions.map((ele, index)=>{
                    return <Select.Option value={ele} key={index}>{props.name==='languages'?ele[0]:ele}</Select.Option>    
                })}
                
        </Select>

    </>)
}

export default DropDown