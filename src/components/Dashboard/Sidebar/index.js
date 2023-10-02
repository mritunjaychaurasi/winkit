import React, { useCallback } from 'react';
import { Modal, Progress } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import CustomImage from '../CustomImage';

import { useAuth } from '../../../context/authContext';
import StyledText from '../StyledText';
import StyledTitle from '../StyledTitle';
import Box from '../../common/Box';

function Sidebar() {
  const { logout } = useAuth();

  const Logout = useCallback(() => {
    Modal.confirm({
      title: 'Logout Now?',
      okText: 'Logout',
      cancelText: 'Cancel',
      onOk() {
        logout();
      },
    });
  }, [logout]);


  return (
    <>
      <Box
        display="flex"
        borderBottom="2px solid #efefef"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        paddingBottom={20}
      >
        <Box display="flex" alignItems="center">
          <BellOutlined style={{ fontSize: '25px' }} />
          <UserOutlined style={{ fontSize: '25px', marginLeft: '30px' }} />
        </Box>
        <StyledTitle
          margin="0"
          level={4}
          size="15px"
          strong
          onClick={Logout}
          style={{ cursor: 'pointer' }}
        >
          Logout
        </StyledTitle>
      </Box>
      <StyledTitle
        margin="30px 0 0 0"
        width="100%"
        align="center"
        level={3}
        weight="600"
      >
        Profile summary will go here ...
      </StyledTitle>
{/*       <StyledTitle
        margin="30px 0 0 0"
        width="100%"
        align="center"
        level={3}
        weight="600"
      >
        Work Summary
      </StyledTitle>
      <Box display="flex" marginTop={30}>
        <Box justifyContent="center" display="flex" direction="column" width="25%">
          <StyledText
            strong
            type="secondary"
            opacity="0.7"
            spacing="2px"
            level={4}
          >
            RATING
          </StyledText>
          <StyledTitle margin="10px 0 0 0" level={4}>
            4.75
          </StyledTitle>
        </Box>
        <Box
          width="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <Progress
            strokeLinecap="square"
            type="circle"
            showInfo={false}
            percent={75}
            strokeWidth={3.5}
            width={160}
            strokeColor="#c9c9c9"
          />
          <CustomImage
            position="absolute"
            radius="100%"
            width="120px"
            src="https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_960_720.png"
          />
        </Box>
        <Box
          justifyContent="center"
          alignItems="flex-end"
          display="flex"
          direction="column"
          width="25%"
        >
          <StyledText
            strong
            type="secondary"
            opacity="0.7"
            spacing="2px"
            level={4}
          >
            LEVEL
          </StyledText>
          <StyledTitle margin="10px 0 0 0" level={4}>
            Tier 2
          </StyledTitle>
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        marginVertical={40}
        borderBottom="2px solid #efefef"
        paddingBottom={8}
      >
        <Box
          justifyContent="center"
          alignItems="flex-start"
          display="flex"
          direction="column"
          flex={1}
        >
          <StyledText type="secondary" size="12px">
            Total Hours Worked
          </StyledText>
          <StyledTitle size="16px" margin="8px 0 0 0" level={4}>
            100
          </StyledTitle>
        </Box>
        <Box
          justifyContent="center"
          alignItems="flex-end"
          display="flex"
          direction="column"
          flex={1}
        >
          <StyledText type="secondary" size="12px">
            Hours This Month
          </StyledText>
          <StyledTitle size="16px" width="52%" margin="8px 0 0 0" level={4}>
            20
          </StyledTitle>
        </Box>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        marginVertical={40}
        borderBottom="2px solid #efefef"
        paddingBottom={13}
      >
        <Box
          justifyContent="center"
          alignItems="flex-start"
          display="flex"
          direction="column"
          flex={1}
        >
          <StyledText type="secondary" size="12px">
            Total Earning
          </StyledText>
          <StyledTitle size="16px" margin="8px 0 0 0" level={4}>
            $ 1,000.00
          </StyledTitle>
        </Box>
        <Box
          justifyContent="center"
          alignItems="flex-end"
          display="flex"
          direction="column"
          flex={1}
        >
          <StyledText type="secondary" size="12px">
            Earning This Month
          </StyledText>
          <StyledTitle width="56%" size="16px" margin="8px 0 0 0" level={4}>
            $ 1,000.00
          </StyledTitle>
        </Box>
      </Box>
      <Box
        display="flex"
        marginTop={10}
        alignItems="center"
        justifyContent="space-between"
      >
        <StyledTitle weight="600" size="16px" margin="0 0 0 0" level={4}>
          Upcoming Payment
        </StyledTitle>
        <StyledText type="secondary" weight="600" decoration="underline">
          View All
        </StyledText>
      </Box>
      <Box display="flex" marginTop={30} alignItems="center">
        <Box
          display="flex"
          justifyContent="center"
          direction="column"
          alignItems="center"
          background="#efefef"
          paddingHorizontal={40}
          paddingVertical={25}
          radius={20}
        >
          <StyledText weight="700">$60.00</StyledText>
          <StyledText type="secondary" margin="10px 0 0 0 ">
            02/20/2011
          </StyledText>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          direction="column"
          alignItems="center"
          background="#efefef"
          paddingHorizontal={40}
          paddingVertical={25}
          radius={20}
          marginLeft={20}
        >
          <StyledText weight="700">$60.00</StyledText>
          <StyledText type="secondary" margin="10px 0 0 0 ">
            02/20/2011
          </StyledText>
        </Box>
      </Box> */}
    </>
  );
}

export default Sidebar;
