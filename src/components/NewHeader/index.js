import React from 'react';
import styled from 'styled-components';
// import { useHistory } from 'react-router-dom';
import { Col, Row } from 'antd';
// import { DownOutlined } from '@ant-design/icons';
// import * as DOM from 'react-router-dom';
// import { IconContext } from 'react-icons';
// import { AiOutlineLogout } from 'react-icons/ai';

//import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom'

// import userPlaceholder from '../../assets/images/user_placeholder.png';
// import { useAuth } from '../../context/authContext';
// import { useUser } from '../../context/useContext';
// import Box from '../common/Box';

export default function Header({ link, display = false,linked_logo = true }) {
  // console.log('Header>>>>>>>>>',linked_logo)

  // const { logout } = useAuth();
  // const { user } = useUser();
  // const profileLink = (user && user.userType === 'customer') ? '/customer/profile' : '/technician/profile';
  // const history = useHistory();

  /*const Logout = useCallback(() => {
    Modal.confirm({
      title: 'Logout Now?',
      okText: 'Logout',
      cancelText: 'Cancel',
      onOk() {
        logout();
      },
    });
  }, [logout]);*/

  /*const menu = (
    <Menu>
      <Menu.Item key="0">
        <a href='/dashboard'>Dashboard</a>
      </Menu.Item>
      <Menu.Divider />
      {user && user.userType === 'technician' &&      
        <Menu.Item key="0">
          <a href={profileLink}>View Profile</a>
        </Menu.Item>
      }
      {user && user.userType === 'technician' &&    
        <Menu.Divider />
      }
      <Menu.Item key="1">
        <a onClick={Logout}>Logout</a>
      </Menu.Item>
    </Menu>
  );*/

  const handleLogoLink = (e) => {
    // history.push(link)
    if(link){
      window.localStorage.removeItem('CurrentStep')
      window.location.href = link;
    }else{
      window.location.href = '/dashboard';
    }
  }

  return (
    <Row align="middle" style={{ width: '100%', height: 'auto', marginTop: "20px", display:'flex' ,justifyContent:"center" }}>

      <Col align="center" md={6} xs={12}>
        { linked_logo &&  
          <Link to={() => false} onClick={handleLogoLink}>
            <Image className='geeker-logo' src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" />
          </Link>
        }

        { ! linked_logo &&  <Link to={() => false} style={{'cursor':'unset'}}> <Image className='geeker-logo' src="https://winkit-software-images.s3.amazonaws.com/geeker_logo.png" alt="tetch" /></Link>}
       </Col>
    </Row>
  );
}

const Image = styled.img`
  margin-top:2%;
  @media screen and (max-width: 763px) {
    width: 100%;
  }
`;
