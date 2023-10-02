import React, { useEffect } from 'react';
import { Table } from 'antd';
import { Col, Button } from 'react-bootstrap';
// import { DownloadOutlined } from '@ant-design/icons';
import Styled from 'styled-components';
// import StepButton from '../../../components/StepButton';
import { useHistory } from 'react-router-dom';
// import $ from 'jquery';
// import moment from 'moment';
import { isMobile } from 'react-device-detect';
import mixpanel from 'mixpanel-browser';
import Box from '../../common/Box';
import StyledText from '../StyledText';
import { openNotificationWithIcon, roleStatus } from '../../../utils';
import { klaviyoTrack } from '../../../api/typeService.api';

export default function DashboardTable(props) {
  const history = useHistory();
  // console.log('props>>>>>>>>',props.user_data)

  useEffect(() => {
    setTimeout(() => {
      // var w = $(".ant-table-structure-outer .ant-table-container table").width();
      // $(".highlight-background").css('width',(w+30)+'px')
    }, 1000);
  }, []);

  const push_to_profile_setup = async (e) => {
    console.log('>>>>>>>>>>>>push_to_profile_setup ::::::: index');
    if (props.user_data) {
      mixpanel.identify(props.user_data.email);
      mixpanel.track('Customer - Post a job');
      mixpanel.people.set({
        $first_name: props.user_data.firstName,
        $last_name: props.user_data.lastName,
      });
    }
    if (window.localStorage.getItem('extraMin')) {
      window.localStorage.removeItem('extraMin');
    }
    if (window.localStorage.getItem('secs')) {
      window.localStorage.removeItem('secs');
    }

    const klaviyoData = {
      email: props.user_data.email,
      event: 'Job Post Button Click',
      properties: {
        $first_name: props.user_data.firstName,
        $last_name: props.user_data.lastName,
      },
    };
    await klaviyoTrack(klaviyoData);

    history.push('/customer/profile-setup');
  };

  const columns = [{
    title: 'Software',
    dataIndex: 'software',
    width: '20%',
    render: text => (
      <StyledText strong padding="10px 5px">
        {text}
      </StyledText>
    ),
  },
  {
    title: 'Created / Scheduled',
    dataIndex: 'date',
    width: '20%',
    render: text => (
      <span>
        {' '}
        { new Date(text).toLocaleTimeString('en-US', props.date_options) }
      </span>
    ),
  },

  {
    title: 'Status',
    dataIndex: 'stats',
    width: '15%',
    render: text => (
      <StyledText strong padding="10px 5px" className="one-liner">
        {text}
      </StyledText>
    ),
  },
  {
    title: 'Issue Description',
    dataIndex: 'issuedesc',
    width: '30%',
    render: text => (
      <p padding="10px 5px" title={text} className="issue-description">
        {(text.length > 100 ? `${text.substring(0, 100)}...` : text)}
      </p>
    ),
  },

  {
    title: 'Action',
    dataIndex: 'action',
    width: '25%',
  }];
  if (props.user_data.userType === 'technician' || props.user_data.userType === 'customer') {
    columns.splice(3, 0, {
      title: 'Customer',
      dataIndex: 'customer',
      width: '30%',
      render: text => (
        <p padding="10px 5px" title={text} className="customer">
          {(text && text.length > 100 ? `${text.substring(0, 100)}...` : text)}
        </p>
      ),
    });
  }
  if (props.user_data.userType === 'customer') {
    columns.splice(4, 0, {
      title: 'Technician',
      dataIndex: 'technician',
      width: '30%',
      render: text => (
        <p padding="10px 5px" title={text} className="customer">
          {(text && text.length > 100 ? `${text.substring(0, 100)}...` : text)}
        </p>
      ),
    });
  }

  return (
    <div>
      { props.data && props.data.length > 0 ? (
        <Col xs="12" className="ant-table-structure-outer table-responsive p-0">
          {/* <div className="highlight-background"></div> */}
          <StyledTable
            bordered={false}
            pagination={false}
            columns={columns}
            dataSource={props.data}
          />
        </Col>
      )
        : (
          <div>
            {/* props.user_data && props.user_data.userType === 'customer' && props.user_data.roles && props.user_data.roles.indexOf(roleStatus.USER) === -1 && */}
            { props.user_data && props.user_data.userType === 'customer' && (

              <Col span={24} align="middle">
                <Box>

                  <div className="divarea">
                    <p>No jobs found. Click on the button to create a new job.</p>
                    <Button key="btn-post-job" onClick={push_to_profile_setup} className="btn app-btn">
                      <span />
                      Post a Job
                    </Button>
                  </div>
                </Box>
              </Col>
            )}

            { props.user_data && props.user_data.userType === 'technician' && (

              <Col span={24} align="middle">
                <Box>
                  <div className="divarea">
                    <p>No jobs found according to your skill.</p>
                  </div>
                </Box>
              </Col>
            )}
          </div>
        )}
    </div>
  );
}
const StyledTable = Styled(Table)`
`;
