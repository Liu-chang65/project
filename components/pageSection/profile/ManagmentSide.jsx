import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import useUserIsLoggedIn from '../../../hooks/user/useUserIsLoggedIn';

const ManagmentSide = (props) => {
  const { currentBranch, pathurl } = props;
  const [currentItem, setCurrentItem] = useState('');
  const [currentSubPage, setCurrentSubPage] = useState();
  const [activeList, setActiveList] = useState([]);
  const { branchName, id: branchId } = useSelector(
    (state) => state.root.currentBranch,
  );

  const isloggedin = useUserIsLoggedIn();
  const changeTopic = (e) => {
    setCurrentItem(e.target.name);
  };

  return (
    <main className="cd-main-content">
      <section className="order">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              {isloggedin && (
                <div className="order-left">
                  <div className="user-box flex-center">
                    <span className="img-circle">
                      <img src="/images/picture/user.png" alt="" title="" />
                    </span>
                    <div className="user-right">
                      <h4 className="font-demi font-20">Ackerman</h4>
                      <p>
                        <Link href={`/${branchId}/me/basic_info`}>
                          <a>Edit</a>
                        </Link>
                      </p>
                    </div>
                  </div>
                  <div className="order-nav">
                    <ul>
                      <li className={pathurl == 'manage_order' ? 'active' : ''}>
                        <Link href={`/${branchId}/me/manage_order`}>
                          <a
                            onClick={changeTopic}
                            name="orderTrack"
                            href="#"
                            title=""
                          >
                            Order History
                          </a>
                        </Link>
                      </li>
                      <li
                        className={pathurl == 'loyalty_points' ? 'active' : ''}
                      >
                        <Link href={`/${branchId}/me/loyalty_points`}>
                          <a
                            onClick={changeTopic}
                            name="loyaltyPoints"
                            href="#"
                            title=""
                          >
                            Loyalty Points
                          </a>
                        </Link>
                      </li>
                      <li className={pathurl == 'coupon' ? 'active' : ''}>
                        <Link href={`/${branchId}/me/coupons`}>
                          <a
                            onClick={changeTopic}
                            name="coupon"
                            href="#"
                            title=""
                          >
                            Coupon
                          </a>
                        </Link>
                      </li>
                      <li className="">
                        <a
                          onClick={changeTopic}
                          name="logout"
                          href="#"
                          title=""
                        >
                          LOGOUT
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-8">{props.children}</div>
          </div>
        </div>
      </section>
      <footer />
    </main>
  );
};

export default ManagmentSide;
