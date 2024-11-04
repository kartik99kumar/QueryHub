import React from "react";
import { Navbar, Container } from "react-bootstrap";

function Header() {
  return (
    <Navbar variant='dark'>
      <Container>
        <Navbar.Brand href='/'>
          <h2>
            <strong>QueryHub</strong>
          </h2>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Header;
