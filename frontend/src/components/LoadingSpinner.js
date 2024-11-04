import React from "react";
import { Spinner } from "react-bootstrap";

function LoadingSpinner({ message }) {
  return (
    <>
      <Spinner animation='border' variant='light' role='status' />
      {message && <p className='mt-2'>{message}</p>}
    </>
  );
}

export default LoadingSpinner;
