// App.js
import React, { useState } from "react";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import TrendingSearches from "./components/TrendingSearches";
import AnswerBox from "./components/AnswerBox";
import LoadingSpinner from "./components/LoadingSpinner";
import axios from "axios";
import "./App.css";

function App() {
  const [answerData, setAnswerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placeholderQuery, setPlaceholderQuery] = useState("");

  const handleSearch = (query) => {
    setLoading(true);
    setAnswerData(null);
    setPlaceholderQuery(query);

    axios
      .post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/query`, { query })
      .then((response) => {
        setAnswerData(response.data.answer);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const handleTrendingSelect = (query, response) => {
    setPlaceholderQuery(query);
    if (response) {
      setAnswerData(response);
    } else {
      handleSearch(query);
    }
  };

  return (
    <div className='d-flex flex-column min-vh-100 text-white'>
      <Header />
      <Container className='flex-grow-1 d-flex flex-column align-items-center justify-content-center'>
        {/* if no answer data then default page with trending queries */}
        {!loading && !answerData && (
          <>
            <SearchBar onSearch={handleSearch} placeholder={placeholderQuery} />
            <TrendingSearches onSelect={handleTrendingSelect} />
          </>
        )}
        {loading && (
          <>
            <SearchBar onSearch={handleSearch} placeholder={placeholderQuery} />
            <LoadingSpinner message='Generating Response' />
          </>
        )}
        {answerData && (
          <>
            <div className='w-100 mt-3'>
              <SearchBar
                onSearch={handleSearch}
                placeholder={placeholderQuery}
              />
            </div>
            <AnswerBox answerData={answerData} />
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default App;
