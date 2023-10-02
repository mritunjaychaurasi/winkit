import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const CheckInCircle = ({ bgColor, style }) => {
  return (
    <>
      <div
        style={{ ...style }}
        className={
          "checkbox-circle d-flex justify-content-center align-items-center " +
          (bgColor === "grey"
                              ? "bk-color-grey"
                              : bgColor === "turcose"
                                                      ? "bk-color-turcose"
                                                      : "")
           }
      >
        <FontAwesomeIcon icon={faCheck} className="check-size" />
      </div>
    </>
  );
};

export default CheckInCircle;
