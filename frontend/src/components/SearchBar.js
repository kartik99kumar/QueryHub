import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";

function SearchBar({ onSearch, placeholder }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== "") {
      onSearch(query);
      setQuery("");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className='search-bar-container'>
      <InputGroup>
        <Form.Control
          type='text'
          placeholder={placeholder || "Ask me anything..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant='primary' type='submit'>
          Search
        </Button>
      </InputGroup>
    </Form>
  );
}

export default SearchBar;
