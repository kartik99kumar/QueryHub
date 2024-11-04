import React from "react";
import { Card } from "react-bootstrap";

function AnswerBox({ answerData }) {
  return (
    <Card className='answer-box mt-4 text-white'>
      <Card.Body>
        <Card.Text>{answerData.answer}</Card.Text>
        {answerData.sources && (
          <>
            <Card.Title>Sources</Card.Title>
            <ul>
              {answerData.sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='source-text'>
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default AnswerBox;
