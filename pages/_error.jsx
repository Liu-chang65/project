import React from 'react';
import { useRouter } from 'next/router';

function Error(props) {
  const { statusCode } = props;

  const router = useRouter()

  const goHome = () => {
    router.push('/');
  };

  return (
    <div className="error-page">
      <h1>
        {`${statusCode} error` || 'Something went wrong'}
      </h1>

      <button type="button" className="btn btn-yellow btn-h60 font-18 font-demi text-uppercase" onClick={goHome}>Go home</button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
