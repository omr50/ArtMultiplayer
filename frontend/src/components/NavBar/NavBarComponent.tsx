import React, { useEffect, useRef, useState } from 'react';
// import tripLogo from '../../images/tripLogo.png'
// import { useNavigate } from "react-router-dom"
// import LoginComponent from '../loginComponent/LoginComponent'
import { Button, Col, Container, Nav, NavDropdown, Navbar, Row } from 'react-bootstrap';
import './NavbarStyles.css'
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
// import { useAuth } from '../auth/AuthContext';
// import LoginOptions from '../loginComponent/subComponents/LoginOptionsComponent';

interface ChildProp {
  changeComp: (newComp: React.ReactNode, type: String) => void
  closeorOpenForm: () => void;
  formIsOpen: boolean;
}

const NavigationBar: React.FC<ChildProp>= (props) => {
  const { theme, toggleTheme }= useTheme();
  const navigate = useNavigate()
  // const authContext = useAuth()
  const [token, setToken] = useState()
  const intervalRef = useRef<NodeJS.Timer>()
  // const navigate = useNavigate();

  const overlayStyles: React.CSSProperties = {
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'width': '100%',
    'height': '100%',
    'backgroundColor': 'rgba(0, 0, 0, 0.25)', // Adjust the opacity (0.5 in this case) to control transparency
    'zIndex': 1000, // Set a higher z-index to ensure it appears above other elements
  };


  return (
    <div>
      {props.formIsOpen && <div style={overlayStyles} onClick={props.closeorOpenForm}/>}
      {/* {props.formIsOpen && <LoginComponent closeForm={props.closeorOpenForm}/>} */}
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className='nav-head'>
        <Container>
          <img src="data:image/png;base64,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"></img>          <span className='nav-bar-title' onClick={()=> {navigate('/')}}>Quick Art</span>
        {/* <Navbar.Brand href="#home" className="d-flex justify-content-left m-2 svg-NavLogo"><img src={tripLogo} alt="Trip Advisor Logo" className="svg-home-logo" /> </Navbar.Brand> */}
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
          </Nav>
          <span className='right-sided-links'>
          <Nav>
          <Nav.Link href="#features" className='nav-link-style'>              
            &#xa0;leaderboard
          </Nav.Link>
          <Nav.Link href="#pricing" className='nav-link-style'>
            &#xa0;signup
          </Nav.Link>
          <Nav.Link className='nav-link-style'>
            &#xa0;login
          </Nav.Link>
          <Nav.Link className='theme' onClick={toggleTheme}>
              <span>
                {theme === 'light' && <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABH0lEQVR4nO3VTytEURgH4CeUEgtLhuzkY1iaBQvJF2CF1BSfwkrsKCv2UnwUWVj4t5ZRFmJGp46SzMy9457bLOat3+7ennvf3nNe+tWDNYnxMsEKTnGLobLQVdTRxF5ZaA2NiIYslPWnjR9oM7Y8aU3g+RcaMpwaPvsDDRlLfWTeW8CzKeHdFmjy4bpsAx+khO/awPcYTAW/tYFD1lLB9Q7wY6rpvukAN+McFN7yqwxwyD4GioS3MsIh50W2fRofOfAnrBfV+uMc8HcecIgq5jCKEcxgEfNZ4EqG6c6Tl7h4MlU1Z8tbJazWlbwt38bnP9Dw7oYua6nLtod9vqyAVXmUsfXhmZN4OgqrKWzGm+sar/FuD8vjAjvxI/vVW/UFABDWXHcFkVQAAAAASUVORK5CYII="/>}
                {theme === 'dark' && <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABYUlEQVR4nO2X0UrDMBiFv147vdnais8iqHsBmfgqIt7p9jK9U+ZbFOcEFX2LafV2RgJHCGM1yxadQg/8UOj5z3+SJn9SaPDPYRSNgR9BChRAtsInyKRhtYJRSPwByJcwkCvXSCsYKXAvgWdgJyA3c3KfgG2WRA48SqgEEokPgDHwrrgF+jKdiGuUWzd7QSZKYBc4Bipn6mfjFTgSt4xR/AuJin+o0CWwB2wo9oErvZsCPeVEQ+aM/OQb3qk4L0AnpoGBM3IfhuJexDRwJ1E77T4ciGsXZjDMnLB403NrAY1NcSuPZpCBKsDAlrMjgg3UYaxEu9p96Io7IiL6ErVbzYdrcc9jGkg1pUZbrQ5n4kyAdkwDiTrcVAWGWu0tRdcZueUcxmxEudOKe2oyda14ouLRWnE+5zDqqMmMtD3tDrnRN2/HPIzSmSP114/j4i9cSIp1XskWQXMtN+v+MWnAqvgES5eaf5COkWwAAAAASUVORK5CYII="/>}
              </span>
              {/* {authContext.isAuthenticated ? <img style={{borderRadius: '50%', width: '50%', minWidth: '50px', maxWidth: '60px'}} src='https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/e7/3d/default-avatar-2020-55.jpg?w=100&h=-1&s=1'/> : <Button className="signin-button-user-password end" onClick={props.closeorOpenForm}>Sign in</Button>} */}
            </Nav.Link>
          </Nav>
          </span>

        </Navbar.Collapse>
        </Container>
    </Navbar>
</div>
  );
}

export default NavigationBar;