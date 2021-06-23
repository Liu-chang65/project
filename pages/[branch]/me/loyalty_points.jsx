import React, { Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import _, { isNil } from 'lodash';
import Head from 'next/head';
import useUserFetchCurrentUser from '../../../hooks/user/useUserFetchCurrentUser';
import DefaultLayout from '../../../layouts/DefaultLayout';
import TheHeader from '../../../components/header/TheHeader';
import TheFooter from '../../../components/footer/TheFooter';
import usePageOnLoad from '../../../hooks/page/usePageOnLoad';
import ManagementSide from '../../../components/pageSection/profile/ManagmentSide';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn'
import axios from '../../../lib/axios';
import i18n from '../../../i18n/i18n';
import Logger from '../../../lib/logger';

const getSettings = async () => {
  try {
    const url = `/settings?mediaTypeFilters=LOGO&mediaTypeFilters=FAVI_ICON&mediaTypeFilters=MOBILE_PROFILE_IMAGE&mediaTypeFilters=MOBILE_START_SCREEN&mediaTypeFilters=MOBILE_WELCOME_SCREEN`;
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    Logger.error(error);
    return [];
  }
};

export async function getServerSideProps(context) {
  const branchId = context.params.branch;
  const settings = await getSettings();
  // get brach
  const { branches } = settings;
  const currentBranch = branches.filter(
    (branch) => branch.id.toString() === branchId
  )[0];

  return {
    props: {
      settings,
      currentBranch
    },
  };
}

export default function Index(props) {
  const { currentBranch } = props
  useUserFetchCurrentUser();
  usePageOnLoad(props);

  const isloggedin = useUserIsLoggedIn()
  const router = useRouter()

  useEffect(() => {
    if (!isloggedin) {
      router.push("/")
    }
  }, [])

  return (
    <>
      <Head>
        <title>Loyalty Points</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      { isloggedin &&
        <>

          <DefaultLayout>
            <TheHeader />
            <ManagementSide currentBranch={currentBranch} pathurl="loyalty_points">
              <section>
                <div className="order-right">
                  <div className="search-order flex-center-between">
                    <div className="left-vox">
                      <span className="font-20 font-demi">REWARDS</span>
                    </div>
                  </div>
                  <div className="order-ul order-ul-reward">
                    <ul className="font-demi font-16">
                      <li>
                        <span>You have:</span>
                        <span className="text-yellow">0 Point</span>
                      </li>
                      <li />
                      <li className="flex-center-between">
                        <span>Converted Point:</span>
                        <span className="text-yellow">0.00</span>
                      </li>
                      <li className="flex-center-between">
                        <span>Total Point Rewarded:</span>
                        <span className="text-yellow">0.00</span>
                      </li>
                      <li className="flex-center-between">
                        <span>Standard:</span>
                        <span>NewBee</span>
                      </li>
                      <li className="flex-center-between">
                        <span>Expired Date</span>
                        <span>Unlimited</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="order-right mgt-30">
                  <form className="search-order flex-center-between">
                    <div className="left-vox">
                      <span className="font-20 font-demi">REWARDS</span>
                      <div className="rank-note font-16 font-medium">You Ranked 11Th Place</div>
                    </div>
                    <div className="search-item">
                      <div className="select-box relative">
                        <select className="baris-blank">
                          <option>Today</option>
                          <option>All 1</option>
                          <option>All 2</option>
                        </select>
                        <span className="arrow-abs ti-angle-down" />
                      </div>
                    </div>
                  </form>
                  <div className="order-table order-table-center table-responsive-md">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">No.</th>
                          <th scope="col">Top Rank</th>
                          <th scope="col">Standard</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>01</th>
                          <td>
                            <div className="flex-center user-flex">
                              <a href="" title="" className="img-circle"><img src="/images/picture/user.png" alt="" title="" /> </a>
                              <h4 className="font-16 font-medium"><a href="" title="">Ackerman</a> </h4>
                            </div>
                          </td>
                          <td>Gold Member</td>
                          <td>100 Points</td>
                        </tr>
                        <tr>
                          <th>02</th>
                          <td>
                            <div className="flex-center user-flex">
                              <a href="" title="" className="img-circle"><img src="/images/picture/user.png" alt="" title="" /> </a>
                              <h4 className="font-16 font-medium"><a href="" title="">Levi</a> </h4>
                            </div>
                          </td>
                          <td>Gold Member</td>
                          <td>100 Points</td>
                        </tr>
                        <tr>
                          <th>03</th>
                          <td>
                            <div className="flex-center user-flex">
                              <a href="" title="" className="img-circle"><img src="/images/picture/user.png" alt="" title="" /> </a>
                              <h4 className="font-16 font-medium"><a href="" title="">Lee Lao Gia</a> </h4>
                            </div>
                          </td>
                          <td>Gold Member</td>
                          <td>100 Points</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="pagi pagi-sm">
                    <ul className="flex-center-center">
                      <li className="active"><a href="" title=""><i className="ti-angle-double-left" /> </a> </li>
                      <li className="active"><a href="" title=""><i className="ti-angle-left" /> </a> </li>
                      <li className="current"><a href="" title="">1</a> </li>
                      <li className=""><a href="" title="">2</a> </li>
                      <li className=""><a href="" title="">3</a> </li>
                      <li className=""><a href="" title="">4</a> </li>
                      <li className=""><a href="" title="">5</a> </li>
                      <li className=""><a href="" title="">...</a> </li>
                      <li className="active"><a href="" title=""><i className="ti-angle-right" /> </a> </li>
                      <li className="active"><a href="" title=""><i className="ti-angle-double-right" /> </a> </li>
                    </ul>
                  </div>
                </div>
                <div className="order-right mgt-30">
                  <div className="search-order flex-center-between">
                    <div className="left-vox">
                      <span className="font-20 font-demi">RECEIVED POINT HISTORY</span>
                    </div>
                    <a href="" title="" className="btn btn-gray btn-h50 font-16 font-demi reward-policy">Reward Policy</a>
                  </div>
                  <div className="order-table table-responsive-md">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Transaction Detail</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>09/21/2019</th>
                          <td>
                            <div className="aricl-more">Lorem ipsum dolor sit amet... <a href="" title="" className="font-demi">More</a> </div>
                          </td>
                          <td>10 Points</td>
                        </tr>
                        <tr>
                          <th>09/21/2019</th>
                          <td>
                            <div className="aricl-more">Lorem ipsum dolor sit amet... <a href="" title="" className="font-demi">More</a> </div>
                          </td>
                          <td>10 Points</td>
                        </tr>
                        <tr>
                          <th>09/21/2019</th>
                          <td>
                            <div className="aricl-more">Lorem ipsum dolor sit amet... <a href="" title="" className="font-demi">More</a> </div>
                          </td>
                          <td>10 Points</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </ManagementSide>
            <TheFooter />
          </DefaultLayout>
        </>
      }
    </>

  );
}
