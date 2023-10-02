import React, { useEffect } from "react";
import google from "../../assets/images/google.png";
import { Select } from "antd";
const { Option } = Select;


const Dropdown = ({ placeholder ,style, name, opts, value, setOtherSoftwareSelected ,selectedLanguage, selectedAdditionalLanguage, setLanguageDropdownValue }) => {
  const handleChange = (value) => {
    console.log(`Selected: ${value}`);
    if(name === "languages"){
      if(value.length > 0){
        setLanguageDropdownValue(value)
      }
    }else if(name === "additional_softwares"){
      setOtherSoftwareSelected(value)
    }
  };

  return (
    <div className="dropdown-div" style={{...style}}>
      <Select
        mode="multiple"
        size="large"
        placeholder={placeholder}
        // defaultValue={(selectedLanguage && selectedLanguage.length > 0) ? [selectedLanguage, ...selectedAdditionalLanguage] : selectedLanguage ? [] : []}
        // defaultValue={['English']}
        onChange={handleChange}
        className="newDropdown"
        value={value}
      >

        {name === "languages" && opts.map((opt, i) => (
          <Option style={{lineHeight: 2}} value={opt[0]} key={i}>
            {opt[0]}
          </Option>
        ))}

        {name === "sub_option" && opts.map((opt, i) => (
          <Option style={{lineHeight: 2}} value={opt} key={i}>
            {opt}
          </Option>
        ))}

        {name === "additional_softwares" && opts.map((opt, i)=>{
         return (<Option style={{lineHeight: 2}} value={opt.id} key={i}>
            {opt.name}
            <img
              style={{ height: "25px", marginLeft: "10px" }}
              alt={opt.name}
              src={opt.blob_image}
            />
          </Option>)
        })

        }
      </Select>
    </div>
  );
};

export default Dropdown;
