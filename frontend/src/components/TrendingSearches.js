import React, { useEffect, useState } from "react";
import { Row, ListGroup } from "react-bootstrap";
import axios from "axios";

function TrendingSearches({ onSelect }) {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_ENDPOINT}/trending`)
      .then((response) => {
        setTrending(response.data || []);
      })
      .catch((error) => {
        setTrending([]);
      });
  }, []);

  return (
    <div className='mt-4'>
      <ListGroup>
        <Row>
          {(Array.isArray(trending) ? trending.slice(0, 4) : []).map(
            (item, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => onSelect(item.query, item.response)}
                className='trending-item d-flex justify-content-center align-items-center text-center'>
                {item.query}
              </ListGroup.Item>
            )
          )}
        </Row>
      </ListGroup>
    </div>
  );
}

export default TrendingSearches;
