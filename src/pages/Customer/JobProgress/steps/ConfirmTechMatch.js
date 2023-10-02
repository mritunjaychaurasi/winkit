import React, { memo, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Typography } from 'antd';
import styled from 'styled-components';
import { useSocket } from '../../../../context/socketContext';
import Box from '../../../../components/common/Box';
import StepButton from '../../../../components/StepButton';
import ExtensionModal from '../../AcceptJob/steps/ExtensionModal';
// import PinModal from '../../AcceptJob/steps/PinModal';
// import AcceptJob from 'pages/Customer/AcceptJob';
import DialInOutModal from '../../AcceptJob/steps/DialInOutModal';
import { useUser } from '../../../../context/useContext';
import mixpanel from 'mixpanel-browser';

const { Text } = Typography;

const ConfirmTechMatch = ({ setCurrentStep, invited, stopScreenShare,setExtension, dialInRef, enableComputerAudio, disableComputerAudio ,setInvitation, setInvitedNumber, remoteDesktopRef, inviteRef}) => {
  const history = useHistory();
  const { jobId } = useParams();
  const {user} = useUser();
  // console.log(">>>>>>.user",user)
  const { socket } = useSocket();
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  // const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  // const [openSecondModal, setopenSecondModal] = useState(false);
  // const [openFirstModal, setopenFirstModal] = useState(false);
  const [isDialInOutModalOpen, setIsDialInOutModalOpen] = useState(false);

  useEffect(() => {
    socket.emit('join', jobId);
    socket.on('match-confirmed', isMatched => {
      if (isMatched) {
        setCurrentStep(1);
      } else {
        history.replace('/dashboard');
      }
    });

    socket.on("start-remote-desktop",(result)=>{
      if(jobId === result.id){
        if(user.userType  === 'technician'){
           // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Technician - Invite to call button',{'JobId':jobId});
            // mixpanel code//

        }else{
            // mixpanel code//
            mixpanel.identify(user.email);
            mixpanel.track('Customer -  Invite to call button',{'JobId':jobId});
            // mixpanel code//
        }
      
        window.open('https://remotedesktop.google.com/support', 'Generate Code', "height=600,width=800");
      }

    })
  }, [history, jobId, setCurrentStep, socket]);

  /*const endPinModal = () => {
    setIsPinModalOpen(false);
  };*/

  /*const startChromeExtension = () => {
    socket.emit('dial-number', { id: jobId });
    setIsExtensionModalOpen(true);
  }*/

  const endChromeExtension = () => {
    setIsExtensionModalOpen(false);
    // setIsPinModalOpen(true);
    // setopenFirstModal(true);
  }
  const onSubmit = pinCode => {
    setInvitation(true)
    console.log(">>>>hy")
    // setIsPinModalOpen(false);
  }

  const openRemoteDesktopInstallWindow = () => {
    try{
      
      // console.log('heloooooooooooooooooo thereeee>>>>>>>>>>>>>')
      if(user.userType  === 'technician'){
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - Start remote desktop',{'JobId':jobId});
        // mixpanel code//

      }else{
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Customer - Start remote desktop',{'JobId':jobId});
        // mixpanel code//
      }

      socket.emit("remote-desktop-triggered",jobId)

      // stopScreenShare()
    
    }
    catch{
      console.log("functions not found")
    }


  };

  const openDialInModal = () => {
    if(user.userType  === 'technician'){
       // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Technician - Invite to call button',{'JobId':jobId});
        // mixpanel code//

      }else{
        // mixpanel code//
        mixpanel.identify(user.email);
        mixpanel.track('Customer -  Invite to call button',{'JobId':jobId});
        // mixpanel code//
      }
      setIsDialInOutModalOpen(true);
  };
  const closeDialInModal = () => {
    setIsDialInOutModalOpen(false);
  };
  return (
    <div>
     {/* <h2>Let&apos;s confirm your tech can resolve your issue</h2>
      <div>Please demonstrate the issue you are trying to resolve</div>
      <br />
      <h2>Waiting for tech Input....</h2>*/}
    
      {
        invited && (
          <Box marginTop={30} className="d-none">
            <h3>&nbsp;</h3>
            <StyledButton ref={remoteDesktopRef} onClick={openRemoteDesktopInstallWindow} title="If necessary, you can offer your technician the ability to control your desktop.">Start remote desktop session</StyledButton>
            <Text className="text-below">* Please note: Remote desktop requires software to be downloaded and installed to your computer and may require guidance from the technician to start a session. </Text>
          </Box>
        )
      }
      <ExtensionModal
        onClose={endChromeExtension}
        isOpen={isExtensionModalOpen}
      />
     {/* <PinModal
        onClose={endPinModal}
        isOpen={isPinModalOpen}
        onSubmit={onSubmit}
        openSecondModal={openSecondModal}
        openFirstModal={openFirstModal}
        setopenSecondModal={setopenSecondModal}
        setopenFirstModal={setopenFirstModal}
      />*/}

       <Box marginTop={30} className="d-none">
          <StyledButton onClick={openDialInModal} ref={dialInRef} title="" className="call_options">Invite to call</StyledButton>
        </Box> 
      <DialInOutModal
        onClose={closeDialInModal}
        isOpen={isDialInOutModalOpen}
        enableComputerAudio={enableComputerAudio}
        disableComputerAudio={disableComputerAudio}
        onSubmit = {onSubmit}
        setInvitation = {setInvitation}
        setInvitedNumber = {setInvitedNumber}
        JobId={jobId}
        setExtension = {setExtension}
        setIsDialInOutModalOpen = {setIsDialInOutModalOpen}

      />
    </div>
  );
};


/*const ProgressStyled = styled(Progress)`
  .ant-progress-success-bg,
  .ant-progress-bg {
    background-color: #464646;
  }
  .ant-progress-text {
    color: white !important;
  }
`;*/

const StyledButton = styled(StepButton)`
  margin-top: 15px;
  margin-bottom: 15px;
  margin-left:0px !important;
  span {
    white-space: break-spaces;
    margin-left: 15px;
  }
`;

export default memo(ConfirmTechMatch);
