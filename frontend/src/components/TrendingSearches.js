import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import axios from "axios";

function TrendingSearches({ onSelect }) {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    axios
      .get("/trending")
      .then((response) => {
        setTrending(response.data);
      })
      .catch((error) => {
        console.error("Unable to retrieve trending searches", error);
      });
  }, []);

  return (
    <div>
      <ListGroup className='mt-4'>
        {trending.slice(0, 5).map((item, index) => (
          <ListGroup.Item
            key={index}
            action
            onClick={() => onSelect(item.query)}
            className='trending-item  d-flex justify-content-center align-items-center text-center'>
            {item.query}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default TrendingSearches;
