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
  const [placeholderQuery, setPlaceholderQuery] = useState(""); // Stores the query as a placeholder

  const handleSearch = (query) => {
    setLoading(true);
    setAnswerData(null);
    setPlaceholderQuery(query); // Set the last query as the placeholder

    axios
      .post("/query", { query })
      .then((response) => {
        setAnswerData(response.data.answer);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching answer:", error);
        setLoading(false);
      });
  };

  const handleTrendingSelect = (query) => {
    handleSearch(query);
  };

  return (
    <div className='d-flex flex-column min-vh-100 text-white'>
      <Header />
      <Container className='flex-grow-1 d-flex flex-column align-items-center justify-content-center'>
        {!answerData && (
          <>
            <SearchBar onSearch={handleSearch} placeholder={placeholderQuery} />
            <TrendingSearches onSelect={handleTrendingSelect} />
          </>
        )}
        {loading && <LoadingSpinner />}
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
