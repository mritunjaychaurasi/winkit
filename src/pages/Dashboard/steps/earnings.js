import React, { useEffect, useState, useRef, createRef } from "react";
import { Table, Pagination } from "antd";
import { Row, Col } from "react-bootstrap";
import { Select, DatePicker } from "antd";
// import Styled from 'styled-components';
import { useAuth } from "../../../context/authContext";
import { useServices } from "../../../context/ServiceContext";
// import LeftSidebar from '../../../components/Sidebar/LeftSidebar';
// import RightSidebar from '../../../components/Sidebar/RightSidebar';
// import TopBar from '../components/TopBar';
// import { TabsHeader } from "../components/Tabs";
// import { DashboardTab, DashboardTabPane } from '../../../components/Dashboard/Tabs';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import Loader from "../../../components/Loader";
import { useEarningDetails } from "../../../context/earningDetailsContext";
// import {useGetEarningDetails} from '../../../context/earningDetailsContext';
import ReactToPrint from "react-to-print";
import mixpanel from "mixpanel-browser";
import Invoice from "../../../components/Result/invoice.js";
import { useJob } from "../../../context/jobContext";
import * as EarningDetailsApi from "../../../api/earningDetails.api";

const { Option } = Select;
/*const transactionTypeOptions = [
	<Option key={'all'} value={'all'}>All</Option>,
	<Option key={'credit'} value={'Credit Card'}>Credit Card</Option>,
	<Option key={'debit'} value={'Debit Card'}>Debit Card</Option>
]*/

const sortOptions = [
  <Option key={"asc"} value="asc">
    Earnings: Low to high
  </Option>,
  <Option key={"desc"} value="desc">
    Earnings: High to low
  </Option>,
];
let DATE_OPTIONS = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
let initialLoad = true;
const EarningsTech = ({ setcurrentStep, setjobId, setType }) => {
  const { user, refetch } = useAuth();

  const { totalTimeSeconds, totalEarnings } = useServices();
  const { job, fetchJob } = useJob();

  // let tech = user.technician;
  const { RangePicker } = DatePicker;
  const [allEarnings, setAllEarnings] = useState([]);
  const [allEarningsWithoutFilters, setAllEarningsWithoutFilters] = useState(
    []
  );
  const [showLoader, setShowLoader] = useState(true);
  const { earningDetailsList } = useEarningDetails();
  // const {getEarning} = useGetEarningDetails();
  const [transactionSelected, settransactionSelected] = useState("All");
  const [selectedSort, setselectedSort] = useState("");
  let invoiceRefs = useRef();
  let dateFilterRef = useRef();
  const [fromDate, setFromDate] = useState(null);
  const [chargeData, setChargeData] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [transactionTypeOptions, setTransactionTypeOptions] = useState([]);
  const [jobDataToPrint, setJobDataToPrint] = useState({});

  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [selectedFilterDate, setSelectedFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(10);
  const [mainFilters, setMainFilters] = useState({});
  const [theDefDates, setMainDates] = useState([]);
  const [technician, setTechnicianData] = useState(null);
  let transactionTypeRef = useRef();
  let sortDataRef = useRef();

  // console.log(totalTime,">>totoalTIne>>")
  /*useEffect(()=>{

		// setAllEarnings(jobsData);
		setShowLoader(false);

	},[jobsData])*/
  if (user) {
    DATE_OPTIONS["timeZone"] = user.timezone;
  }
  const filter_date = (dates) => {
    setMainDates(dates);
    if (dates != null) {
      if (dates[0] != null && dates[1] != null) {
        setShowLoader(true);

        const start_date = moment(dates[0]).format("YYYY-MM-DD");
        const end_date = moment(dates[1]).format("YYYY-MM-DD");
        const from_dt = `${start_date} 00:00:00`;
        const to_dt = `${end_date} 23:59:59`;
        setFromDate(from_dt);
        setToDate(to_dt);
      }
    } else {
      setFromDate(null);
      setToDate(null);
    }
  };
  const handlePagination = async (page, pageSize) => {
    setShowLoader(true);
    setCurrentPage(page);
    let filters = { ...mainFilters };
    filters.page = page;
    filters.pageSize = pageSize;
    filters.technician_user_id = user.id;
    let detailsList = await earningDetailsList(filters);
    setTotalData(detailsList.totalCount);
    commissionCalculator(detailsList);
  };
  const runFilters = async () => {
    let filters = {};
    filters["technician_user_id"] = user.id;
    if (transactionSelected !== "All" && transactionSelected !== "") {
      filters.transaction_type = transactionSelected;
    }
    filters["page"] = 1;
    filters["pageSize"] = 10;
    if (fromDate != null && toDate != null) {
      filters["createdAt"] = { $gte: fromDate, $lte: toDate };
    }
    setMainFilters(filters);

    let detailsList = await earningDetailsList(filters);
    setTotalData(detailsList.totalCount);
    commissionCalculator(detailsList);
    setShowLoader(false);
  };
  useEffect(() => {
    if (!initialLoad) {
      setShowLoader(true);
      runFilters();
    }
    initialLoad = false;
    //
  }, [transactionSelected, toDate, fromDate]);
  const commissionCalculator = (detailsList) => {
    if (detailsList.data && detailsList.data) {
      invoiceRefs = detailsList.data.map(() => createRef());
      let tempBillDetails = [...detailsList.data];
      // console.log("tempBIllDeatils :::: ",'working')
      for (var k in tempBillDetails) {
        let total_amount = tempBillDetails[k].total_amount;
        // console.log("total_amount>>>>>>", total_amount);
        tempBillDetails[k].commision =
          total_amount > 0
            ? "$" +
              parseFloat(
                (total_amount * parseFloat(tempBillDetails[k].commision)) / 100
              ).toFixed(2) +
              ` (${tempBillDetails[k].commision}%)`
            : "$0.00";
      }
      const unique_transaction_type = [
        ...new Set(tempBillDetails.map((item) => item.transaction_type)),
      ];
      console.log("tempBillDetails :: ",tempBillDetails)
      setAllEarnings(tempBillDetails);
      setAllEarningsWithoutFilters(tempBillDetails);
      // console.log("unique_transaction_type",unique_transaction_type)
      setTimeout(function () {
        setTransactionTypeOptions(unique_transaction_type);
        setShowLoader(false);
      }, 1000);
    } else {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    (async () => {
      refetch();
      let detailsList = await earningDetailsList({
        technician_user_id: user.id,
        page: 1,
        pageSize: 10,
      });
      setTotalData(detailsList.totalCount);
      if (detailsList.data && detailsList.data) {
        invoiceRefs = detailsList.data.map(() => createRef());
        let tempBillDetails = [...detailsList.data];
        for (var k in tempBillDetails) {
          let total_amount = tempBillDetails[k].total_amount;
          tempBillDetails[k].commision =
            total_amount > 0
              ? "$" +
                parseFloat(
                  (total_amount * parseFloat(tempBillDetails[k].commision)) /
                    100
                ).toFixed(2) +
                ` (${tempBillDetails[k].commision}%)`
              : "$0.00";
        }
        const unique_transaction_type = [
          ...new Set(tempBillDetails.map((item) => item.transaction_type)),
        ];
        console.log("tempBillDetails :: ",tempBillDetails)
        setAllEarnings(tempBillDetails);
        setAllEarningsWithoutFilters(tempBillDetails);
        // console.log("unique_transaction_type",unique_transaction_type)
        setTimeout(function () {
          setTransactionTypeOptions(unique_transaction_type);
          setShowLoader(false);
        }, 1000);
      } else {
        setShowLoader(false);
      }
    })();
  }, []);

  const sortData = (val) => {
    let tempArr = [...allEarnings];
    setselectedSort(val);
    // console.log("allEarnings",allEarnings)
    // console.log("val",val)
    if (val === "asc") {
      tempArr.sort(function (a, b) {
        return a.amount_earned - b.amount_earned;
      });
    } else {
      tempArr.sort(function (a, b) {
        return b.amount_earned - a.amount_earned;
      });
    }
    // console.log("tempArr ::: ",tempArr)
    setAllEarnings(tempArr);
  };

  /*const filterData=(val,type)=>{
		console.log("e,type",val,type)
		settransactionSelected(val)
		let condition = ""
		let tempArr = [...allEarningsWithoutFilters];
		if(val == "all"){
			// console.log("tempArr")
			setAllEarnings(tempArr)
			return
		}
		// console.log("tempArr before::: ",tempArr)
		if(type == 'transaction_type'){
			tempArr = tempArr.filter(obj => {
			  	return obj.transaction_type === val
			})
		}
		console.log("tempArr ::: ",tempArr)
			setShowLoader(false);
			setAllEarnings(tempArr)
	}*/
  const filterData = (val, type) => {
    setShowLoader(true);
    let tempArr = [];
    if (type === "transaction_type") {
      settransactionSelected(val);
      let earningsData = allEarningsWithoutFilters;

      let filterDate = "";
      if (selectedFilterDate !== "") {
        filterDate = new Date(selectedFilterDate);
        filterDate = filterDate.setHours(0, 0, 0, 0);
      }

      if (val === "All") {
        setSelectedTransactionType("");
        if (filterDate) {
          filterByDateInit(filterDate);
        } else {
          setAllEarnings([...allEarningsWithoutFilters]);
          setShowLoader(false);
        }
      } else {
        setSelectedTransactionType(val);

        earningsData.map((b, i) => {
          if (b.transaction_type === val) {
            if (filterDate) {
              let d = new Date(b.createdAt);
              d = d.setHours(0, 0, 0, 0);
              if (filterDate === d) {
                tempArr.push(b);
              }
            } else {
              tempArr.push(b);
            }
          }
          if (i + 1 === earningsData.length) {
            setAllEarnings(tempArr);
            setShowLoader(false);
          }
          return true;
        });
      }
    }
  };

  const hms_convert = (t) => {
    if (t) {
      let d = Number(t);
      let h = Math.floor(d / 3600);
      let m = Math.floor((d % 3600) / 60);
      let s = Math.floor((d % 3600) % 60);
      let hFormat = h <= 9 ? "0" + h : h;
      let mFormat = m <= 9 ? "0" + m : m;
      let sFormat = s <= 9 ? "0" + s : s;
      let hDisplay = h > 0 ? hFormat + ":" : "00:";
      let mDisplay = m > 0 ? mFormat + ":" : "00:";
      let sDisplay = s > 0 ? sFormat : "00";
      return hDisplay + mDisplay + sDisplay;
    } else {
      return "00:00:00";
    }
  };

  /*const filterByDate = (e) => {
    	if(e.target.value){
    		
	    	if(allEarningsWithoutFilters.length > 0){
	    		let tempData = []
	    		let nowDate = new Date(e.target.value);
	    		nowDate = nowDate.setHours(0,0,0,0)
	    		
	    		allEarningsWithoutFilters.map((b,i)=>{
	    			let d = new Date(b.createdAt)
	    			d = d.setHours(0,0,0,0)
	    			if(nowDate == d){
	    				tempData.push(b)
	    			}
	    			if(i+1 == allEarningsWithoutFilters.length){
	    				setAllEarnings(tempData)
	    			}
	    		})
	    	}
    	}else{
    		setAllEarnings(allEarningsWithoutFilters)
    	}
    }*/
  /*const filterByDate = (e) => {
    	if(e.target.value){
    		filterByDateInit(e.target.value)
    	}else{
    		setSelectedFilterDate('')
    		setAllEarnings(allEarningsWithoutFilters)
    	}
    }*/
  const filterByDateInit = (d) => {
    setShowLoader(true);
    setSelectedFilterDate(d);
    if (allEarningsWithoutFilters.length > 0) {
      let tempData = [];
      let nowDate = new Date(d);
      nowDate = nowDate.setHours(0, 0, 0, 0);

      allEarningsWithoutFilters.map((b, i) => {
        let d = new Date(b.createdAt);
        d = d.setHours(0, 0, 0, 0);
        if (nowDate === d) {
          if (selectedTransactionType && selectedTransactionType !== "") {
            if (b.transaction_type === selectedTransactionType) {
              tempData.push(b);
            }
          } else {
            tempData.push(b);
          }
        }
        if (i + 1 === allEarningsWithoutFilters.length) {
          setAllEarnings(tempData);
          setShowLoader(false);
        }
        return true;
      });
    } else {
      setShowLoader(false);
    }
  };

  const handleFilterClear = () => {
    setMainDates([null, null]);
    if (dateFilterRef.current != undefined) {
      dateFilterRef.current.value = ["", ""];
    }
    let tempArr = [...allEarningsWithoutFilters];
    setselectedSort("");

    settransactionSelected("All");
    setAllEarnings(tempArr);
    // console.log(transactionTypeRef.current,".......");
  };

  // const filterByDate = (e)=>{
  // 	console.log("evenet value ::: ",e.currentTarget.value)
  // 	let userDate = e.currentTarget.value
  // 	let dateSortedArr = [...allEarnings]
  // 	dateSortedArr.sort((a)=>{
  // 		let jobDateObj = new Date(a.createdAt)
  // 		let jobMonth = jobDateObj.getMonth()
  // 		let jobDate = jobDateObj.getDate()
  // 		let jobYear  = jobDateObj.getYear()
  // 		let dateStr = `${jobYear}-${jobDate}-${jobMonth}`
  // 		if(userDate == dateStr ){
  // 			return a
  // 		}

  // 	})
  // 	let datesForSortedArr = dateSortedArr.map(item=>new Date(item.createdAt))
  // 	console.log("userDate :::: ",new Date(userDate).getDate())
  // 	console.log("datesForSortedArr:::: ",datesForSortedArr)
  // 	setAllEarnings(dateSortedArr)
  // }
  const push_to_job_detail = (e) => {
    // console.log("push_to_job_detail>>>>>>>>>")
    const jobId = e.currentTarget.name;
    // fetchJob(jobId)
    setjobId(jobId);
    setType("details");
    mixpanel.identify(user.email);
    if (user.userType === "technician") {
      mixpanel.track("Technician  - Job details", { JobId: jobId });
    } else {
      mixpanel.track("Customer - Job details", { JobId: jobId });
    }
    setcurrentStep(6);
  };

  // Author : Utkarsh Dixit
  // Purpose : To set job related data
  // prameters : An object containing job data such as job id
  // response : function set all the data related to job in job variable
  const getDataToPrint = async (d) => {
    // console.log("d>>>>>>>>>>>>>>>>>>>>>>>>", d);
    if (d) {
      let retrieve_charge = await EarningDetailsApi.getEarningDetails(d);
      //   console.log("Earnings details " + JSON.stringify(retrieve_charge));
      setChargeData(retrieve_charge);
      await fetchJob(retrieve_charge.job_id);
      // setJobDataToPrint(job)
    }
  };

  useEffect(() => {
    if (job) {
      //   console.log("jobData", job);
      setJobDataToPrint(job);
    }
  }, [job]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      // width: '20%',
      render: (text) => (
        <span> {new Date(text).toLocaleTimeString("en-US", DATE_OPTIONS)}</span>
      ),
    },
    {
      title: "Trans. Type",
      dataIndex: "transaction_type",
      // width: '15%'
    },
    {
      title: "Status",
      dataIndex: "transaction_status",
      // width: '30%',
      render: (text) => (
        <span>{text && text === "Processing" ? text + "..." : text}</span>
      ),
    },
    //Author : Utkarsh
    // Purpose : Commented the code for company commision and amount
    // {
    //     title: 'Amount',
    //     dataIndex: 'total_amount',
    //     // width: '30%',
    //     render: text => (
    //         <span>
    //             {(text ? '$'+text : '$0.00')}
    //         </span>
    //     ),
    // },
    // {
    //     title: 'Commission (%)',
    //     dataIndex: 'commision',
    //     // width: '30%',
    //     render: text => (
    //         <span className = "red-text font-weight-bold">
    //             {(text ? text : '$0.00')}
    //         </span>
    //     ),
    // },
    {
      title: "Amount Earned",
      dataIndex: "amount_earned",
      // width: '30%',
      render: (text) => (
        user?.technician?.tag !== 'employed' ?
        <span className="green-text font-weight-bold">
          {text ? "$" + parseFloat(text).toFixed(2) : "$0.00"}
        </span>:
        <span className="red-text font-weight-bold">
        NA
        </span>
      ),
    },
    {
      title: "Invoice",
      dataIndex: "id",
      // width: '30%',
      render: (text) => (
        user?.technician?.tag !== 'employed' ?
        <div className="invoice-download-btn">
          <ReactToPrint
            trigger={() => <FontAwesomeIcon icon={faDownload} />}
            content={() => invoiceRefs.current}
            onBeforeGetContent={(e) => getDataToPrint(text)}
          />
          <div style={{ display: "none" }}>
            <ComponentRef text={text} ref={invoiceRefs} />
          </div>
        </div>:
        <span className="red-text font-weight-bold">
        NA
        </span>
      ),
    },
    {
      title: "Action",
      dataIndex: "job_id",
      // width: '30%',
      render: (text) => (
        <span>
          <button
            className="btn app-btn app-btn-super-small normal-font"
            onClick={push_to_job_detail}
            name={text && text.id ? text.id : text}
          >
            <span></span>View job
          </button>
        </span>
      ),
    },
  ];

  const ComponentRef = React.forwardRef((props, ref) => {
    return (
      <div ref={ref}>
        <Invoice chargeData={chargeData} job={job} />
      </div>
    );
  });

  return (
    <>
      <Col xs="12" className="">
        <Loader
          height="100%"
          className={showLoader ? "loader-outer" : "d-none"}
        />
        <Col xs="12" className="pt-5 pb-3">
          <h1 className="large-heading">My Earnings</h1>
        </Col>

        <Col xs="12" className="">
          <Col xs="12" className="py-3 div-highlighter">
            <Row>
              <Col md="4" className="pl-5">
                <span className="d-block label-total-name">
                  Current Balance
                </span>
                <span
                  className="d-block label-total-value"
                  title="Coming Soon..."
                >
                  $0.00
                </span>
              </Col>
              <Col md="4" className="pl-5 div-highlighter-border">
                <span className="d-block label-total-name">
                  Total Amount Earned
                </span>
                {user?.technician?.tag !== 'employed' ? 
                <span className="d-block label-total-value">
                  ${totalEarnings != null ? totalEarnings : 0}
                </span> : 
                <span className="d-block label-total-value">
                NA
                </span>}
              </Col>
              <Col md="4" className="pl-5">
                <span className="d-block label-total-name">
                  Total Amount of Time
                </span>
                <span className="d-block label-total-value">
                  {hms_convert(totalTimeSeconds)}
                </span>
              </Col>
            </Row>
          </Col>
        </Col>

        <Col md="12" className="filters-outer py-4 mt-2 earning-filters">
          <Row>
            <Col md="3">
              <label className="label-name">Transaction Date</label>
              <RangePicker
                ref={dateFilterRef}
                onCalendarChange={filter_date}
                value={theDefDates}
                className="form-control bottom-border-only"
              />
            </Col>
            <Col md="3">
              <label className="label-name">Transactions Type</label>
              <Select
                ref={transactionTypeRef}
                style={{ width: "100%" }}
                value={transactionSelected}
                placeholder="Transactions Type"
                onChange={(e) => {
                  filterData(e, "transaction_type");
                }}
                className="form-control bottom-border-only filter-element"
              >
                <Select.Option key={"All"} value={"All"}>
                  All
                </Select.Option>
                {transactionTypeOptions.map((t) => {
                  return (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  );
                })}
              </Select>
            </Col>
            <Col md="1"></Col>
            <Col md="3" className="float-right">
              <label className="label-name">Sort By</label>
              <Select
                ref={sortDataRef}
                style={{ width: "100%" }}
                placeholder="Sort By"
                onChange={sortData}
                value={selectedSort}
                className="form-control bottom-border-only filter-element"
              >
                {sortOptions}
              </Select>
            </Col>
            <Col md="2" className="float-right text-right">
              <label className="label-name"> &nbsp; </label>
              <br />
              <button
                onClick={handleFilterClear}
                className="btn app-btn app-btn-super-small"
              >
                <span />
                Clear
              </button>
            </Col>
          </Row>
        </Col>

        <Col md="12" className="py-4 mt-1 table-responsive">
          <Col xs="12" className="table-structure-outer table-responsive p-0">
            <Col
              xs="12"
              className="ant-table-structure-outer table-responsive p-0"
            >
              <div className="highlight-background"></div>
              <Table
                bordered={false}
                pagination={false}
                columns={columns}
                dataSource={allEarnings}
                className="earnings-table"
              />
              {totalData !== 0 && (
                <Pagination
                  style={{ float: "right", ",marginRight": "40px" }}
                  current={currentPage}
                  onChange={handlePagination}
                  total={totalData}
                />
              )}
            </Col>
          </Col>
        </Col>
      </Col>
    </>
  );
};
export default EarningsTech;
