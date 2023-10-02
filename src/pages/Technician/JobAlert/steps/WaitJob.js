import React, { useEffect,useState } from 'react';
import styled from 'styled-components';
import { Row,Col, Progress } from 'antd';
import {Button} from 'react-bootstrap';
import { useHistory } from 'react-router';
import { useSocket } from '../../../../context/socketContext';
import Loader from '../../../../components/Loader';
import { useUser } from '../../../../context/useContext';
// import {useNotifications} from '../../../../context/notificationContext';
import * as WebSocket from '../../../../api/webSocket.api';
import * as JobApi from '../../../../api/job.api';
import mixpanel from 'mixpanel-browser';
import { openNotificationWithIcon,get_or_set_cookie } from '../../../../utils';
let progress = 0
function WaitJob({ jobId, abc, setStep,webSocketId,handleStartCall }) {
  const { socket } = useSocket();
  const history = useHistory();
  const { user }   = useUser();
  const [notify,setNotifyTimes] = useState(0)
  const [percent,setPercent] = useState(0)
  const [jobEnded,setJobEnded] = useState(false)
  const [isLoading,setIsloading] = useState(true)
  // useEffect(()=>{
  //   const res =  JobApi.retrieveJob(jobId);
  //   console.log(res)
  //   try{
  //     res.then((result)=>{
  //     console.log(result)
  //     if(result.technician.id != user.technician.id)
  //     {
  //     console.log(user.technician,">>>>>>>>>>>")
  //     openNotificationWithIcon("info",'Info',"Job has been already taken")
  //         // history.push("/")
  //     }
  //     })
  //   }
  //   catch(err){
  //     history.push("/")
  //   }
    
    
    
  //   },[])


  const counter = ()=>{
    if(progress === 100){
      progress = 0
    }
    progress = progress +1
    setPercent(progress)
  }

  useEffect(()=>{
    socket.emit("join",jobId)
    setTimeout(()=>{
      setIsloading(false)
    },8000)
     let timer = setInterval(counter,1000)
     setTimeout(()=>{
      setJobEnded(true)
      clearInterval(counter)
    },1800000)
   // 1800000
  },[])

 const callApi = async(data_to_send)=>{
    try{
          let webRes =  await WebSocket.technician_polling(data_to_send)
          if (webRes.meetingStarted && webRes.technician_id === user.technician.id && webRes.job_id === jobId){
            clearInterval(counter)
            get_or_set_cookie(user)
            window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
          }
        }
        catch(Err){
          console.log("api error ")
        }
    
 }



  useEffect(()=>{

    

    if(percent === 100 && !jobEnded){

       let data_to_send = {
          "job_id" :jobId,
          "socket_id":webSocketId
        }
        callApi(data_to_send)
      setTimeout(()=>{
        progress = 0
        setPercent(0)
        setNotifyTimes(notify + 1)
        openNotificationWithIcon("info","Sending Alert",`Notifying client to start the meeting for ${notify +1} time`)
      },1000)
      
    }

  },[percent])
  useEffect(() => {
    socket.emit('join', jobId);
      socket.on('accept-job', (job) => {

        console.log("accept-job socket received on technician side to change the page to meeting")
        if(job.technician && user ){
          try {
                 WebSocket.updateSocket(job['web_socket_id'],{'hitFromTechnicianSide':true})
                
              }
          catch(err) {
              console.log('accept-job error in Waitjob page>>>',err)
          }


          const res =  JobApi.retrieveJob(jobId);
          res.then((data)=>{
            if(data.technician.user.id === user.id){
                clearInterval(counter)
                get_or_set_cookie(user)
                window.location.href =  process.env.REACT_APP_MEETING_PAGE+`/meeting/technician/${jobId}`
            }
          })
        }
       
      });
      if(user){
        mixpanel.track('Technician - On Waiting For Client Confirmation Page ', { 'Email': user.email });
      }
  }, [jobId, setStep, socket, history, user]);

  return (

    <Container span={15}>
    <Loader height="100%" className={(isLoading ? "loader-outer" : "d-none")}  />
      <StepContainer>
        <NewJobContainer>
          <Div>
            <Row span={24} style={{ marginBottom: '30px' }}>
              <AlertTileBox>
                <Title>Waiting for client confirmation</Title>
              </AlertTileBox>
            </Row>
            <Row span={24}>
              <ProgressStyled percent={percent} showInfo={false} />
            </Row>
          </Div>
          <Col xs={24} md={24} lg={24} xl={12} style={{ marginTop: 10 ,float:"right"}}>
              <ButtonContainer style={{ marginTop: 0 }} className="new-job-btn" >
                  <button onClick={handleStartCall} type="button" class="btn app-btn  btn btn-primary">Start Call</button>
              </ButtonContainer>
            </Col>
        </NewJobContainer>
      </StepContainer>
    </Container>
  );
}

const Div = styled.div`
  width: 100%;
`;
const AlertTileBox = styled.div`
    width:100%;
    display: flex;
    position: relative;
    img{
        position: absolute;
        left: 0;
        top: -3px;
        padding:4px 4px 4px 0px;
    }
}
`;
const Title = styled.p`
  margin-bottom: 0.5em;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 22px;
  line-height: 1.4;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NewJobContainer = styled.div`
  background: #fff;
  margin: 80px 0;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 90px 70px;
  box-shadow: 0px 15px 50px 0px #d5d5d566;
  flex: 1;
  @media screen and (max-width: 763px) {
  padding: 40px 20px;
  }
`;

const StepContainer = styled.div`
  width: 60%;
  height: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media screen and (max-width: 991px) {
    width: 80%;
  }
  @media screen and (max-width: 763px) {
    width: 100%;
  }
`;

const ProgressStyled = styled(Progress)`
  .ant-progress-success-bg,
  .ant-progress-bg {
    background-color: #60E1E2;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  @media (max-width: 1366px) {
    justify-content: space-between;
  }
  @media screen and (max-width: 763px) {
    flex-direction:column;
  }
`;

export default WaitJob;
