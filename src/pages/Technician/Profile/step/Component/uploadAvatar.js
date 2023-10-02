import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Avatar } from 'antd';
import { Button } from 'react-bootstrap';
// import axios from 'axios';
import avatarOne from '../../../../../assets/images/avatarOne.png';
import avatarTwo from '../../../../../assets/images/avatarTwo.png';
import avatarThree from '../../../../../assets/images/avatarThree.png';
import avatarFour from '../../../../../assets/images/avatarFour.png';
import avatarFive from '../../../../../assets/images/avatarFive.png';
import Box from '../../../../../components/common/Box';
import { useUser } from '../../../../../context/useContext';
// import { SERVER_URL } from '../../../../../constants';
import * as TechnicianService from '../../../../../api/technician.api';
import { useAuth } from '../../../../../context/authContext';
// import alert from '../../../../../assets/images/alert.png';

const UploadAvatar = props => {
  const { setTechProfile, sectionName } = props;

  const { user } = useUser();
  const { refetch } = useAuth();
  // console.log('user context auth context :::', user);
  useEffect(() => {
    if (user) {
      console.log(user.technician.profile.image);
      // setFileList([user.technician.profile.image])
    }
  }, [user]);

  const [selectedAvatar, setSelectedAvatar] = useState(user?.technician?.profile.image);
  // const fileName = `${user.id}-${Date.now()}`;
  const onHandleSelect = (e) => {
    setSelectedAvatar(e.target.src);
  };

  const handleUploadAvatar = async () => {

    await TechnicianService.updateTechnicianAvatar(user.technician.id, { profileImage:selectedAvatar});
    console.log("Avatar Uploaded")
    setTechProfile(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        imageUrl: selectedAvatar,
        complete: true,
      },
    }));
    refetch();
  };

  return (
    <AvatarContainer>
      <UploadedAvatar src={avatarOne} onClick={onHandleSelect} size={70}  className={selectedAvatar === avatarOne && 'selected'}>  </UploadedAvatar>
      <UploadedAvatar src={avatarTwo} onClick={onHandleSelect} size={70}  className={selectedAvatar === avatarTwo && 'selected'}>  </UploadedAvatar>
      <UploadedAvatar src={avatarThree} onClick={onHandleSelect} size={70}  className={selectedAvatar === avatarThree && 'selected'}>  </UploadedAvatar>
      <UploadedAvatar src={avatarFour} onClick={onHandleSelect} size={70}  className={selectedAvatar === avatarFour && 'selected'}>  </UploadedAvatar>
      <UploadedAvatar src={avatarFive} onClick={onHandleSelect} size={70}  className={selectedAvatar === avatarFive && 'selected'}>  </UploadedAvatar>
      <Box display="flex" justifyContent="flex-end" width="100%" marginTop={30}>
        <Button
          type="submit"
          onClick={handleUploadAvatar}
          className="btn app-btn"
        >
          <span />
          Accept
        </Button>
      </Box>
    </AvatarContainer>
  );
};

const AvatarContainer = styled.div`
    text-align : center
`;

const UploadedAvatar = styled(Avatar)`
        padding : 10px !important;
        margin-right: 20px !important;
        transition: all 0.2s linear;
        cursor: pointer
        img{
            border-radius: 50%;
            border: 3px solid transparent;
        }
        &.selected{ 
            img{
                border: 3px solid #1bd4d591;
            }
        }
`;

UploadAvatar.defaultProps = {
  type: 'profile',
  setTechProfile: () => {},
  techProfile: {},
  sectionName: 'profileImage',
};

export default UploadAvatar;