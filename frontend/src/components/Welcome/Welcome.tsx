import React, { useState, useEffect, useRef  } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import "./WelcomeStyles.css"
import Image from './stickfigure.png'

function WelcomeComponent() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0)
  const [pageWidth, setPageWidth] = useState(window.innerWidth);
  const [left, setLeft] = useState(true)
  const [right, setRight] = useState(true)
  const [scrolled, setScrolled] = useState(0)
  const [suggestedHotels, setSuggestedHotels] = useState([])
  const [search, setSearch] = useState('')
  const [hotelResult, setHotelResult] = useState([])
  const [regionResult, setRegionResult] = useState<string>('')
  const [searchStyles, setSearchStyles] = useState({})
  const [clicked, setClicked] = useState(false)


  useEffect(() => {
    const handleResize = () => {
      setPageWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(()=> {
    if (containerRef.current){
      if (scroll > containerRef.current.scrollWidth - containerRef.current.clientWidth)
        setScroll(containerRef.current.scrollWidth - containerRef.current.clientWidth)
      }
  }, [pageWidth])

  useEffect(()=> {
    console.log(scrolled)
    if (containerRef.current){

      // if page width is smaller than the scroll left then set it back

      if (scroll >= containerRef.current.scrollWidth - containerRef.current.clientWidth){
        setScroll(containerRef.current.scrollWidth - containerRef.current.clientWidth)
        containerRef.current.scrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth
        setRight(false)
      }
      else {
        containerRef.current.scrollLeft = scroll;
        setRight(true)
      }

      if (scroll <= 0){
        setScroll(0)
        containerRef.current.scrollLeft = 0
        setLeft(false)
      }
      else {
        containerRef.current.scrollLeft = scroll;
        setLeft(true)
      }
    }
    console.log("Scroll Left: ", containerRef.current?.scrollLeft)
  }, [scrolled, pageWidth])


  const container = containerRef.current;
  console.log(container)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      setScroll(0);
      setLeft(false);
      setRight(true);
    }
  }, []);

  const scrollToLeft = () => {
    const scrollAmount = 200; // Adjust the scroll distance as needed
    if (containerRef.current != null) {
      setScrolled(scrolled+1)
      // containerRef.current.scrollLeft -= scrollAmount;
      setScroll(containerRef.current.scrollLeft - 200)
  }
  };

  const scrollToRight = () => {
    if (containerRef.current) {
      setScrolled(scrolled+1)

      const scrollAmount = 200; // Adjust the scroll distance as needed
      // containerRef.current.scrollLeft += scrollAmount;
      setScroll(containerRef.current.scrollLeft + 200)
    }
  };

  return (
    <div>
    {clicked && <div className="page-white" onClick={(e)=>{setClicked(false)}}></div>}
    <div className="whole-page">
    <div className="home-page" ref={containerRef}>

</div>
    <div className="search-container">
      <div className="img-container">
        <img className='home-search-img' src={Image}></img>
        <div className="play-multiplayer-text">Race against other players!</div>
        <Button className="play-multiplayer-button" onClick={()=>{navigate('/multiplayer')}}>Play Now</Button>
        {/* <form>
          <input placeholder="Where to?" style={searchStyles} className="search-bar" onClick={()=>{setClicked(true)}}></input>
          <svg viewBox="0 0 24 24" width="1em" height="1em" className="search-svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.74 3.75a5.99 5.99 0 100 11.98 5.99 5.99 0 000-11.98zM2.25 9.74a7.49 7.49 0 1113.3 4.728l5.44 5.442-1.06 1.06-5.44-5.439A7.49 7.49 0 012.25 9.74z"></path></svg>
        </form> */}
      </div>
      </div>
      </div>
      </div>
  )
}

export default WelcomeComponent;