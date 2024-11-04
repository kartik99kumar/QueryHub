import React from "react";
import { Spinner } from "react-bootstrap";

function LoadingSpinner({ message }) {
  return (
    <div className='d-flex justify-content-center mt-4'>
      <Spinner animation='border' variant='light' role='status' />
      {message && <p className='mt-2'>{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
