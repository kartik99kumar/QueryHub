import React from "react";
import { Spinner } from "react-bootstrap";

function LoadingSpinner() {
  return (
    <div className='d-flex justify-content-center mt-4'>
      <Spinner animation='border' variant='light' role='status' />
    </div>
  );
}

export default LoadingSpinner;
