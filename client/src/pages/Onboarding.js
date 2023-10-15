import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const Onboarding = (props) => {
  const [isWelcomeVisible, setWelcomeVisible] = useState(false);
  const welcomeRef = useRef(null);

  const [isLearnVisible, setLearnVisible] = useState(false);
  const learnRef = useRef(null);

  const [isLoginVisible, setLoginVisible] = useState(false);
  const loginRef = useRef(null);

  // for dot navigation bar to show what section user is one
  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: "0px",
      threshold: 0.5, // Trigger when 50% of the element is in the viewport
    };

    const observerWelcome = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWelcomeVisible(true);
      } else {
        setWelcomeVisible(false);
      }
    }, options);

    const observerLearn = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLearnVisible(true);
      } else {
        setLearnVisible(false);
      }
    }, options);

    const observerLogin = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoginVisible(true);
      } else {
        setLoginVisible(false);
      }
    }, options);

    if (welcomeRef.current) {
      observerWelcome.observe(welcomeRef.current);
    }
    if (learnRef.current) {
      observerLearn.observe(learnRef.current);
    }
    if (loginRef.current) {
      observerLogin.observe(loginRef.current);
    }

    // Clean up the observers when the component unmounts
    return () => {
      if (welcomeRef.current) {
        observerWelcome.unobserve(welcomeRef.current);
      }
      if (learnRef.current) {
        observerLearn.unobserve(learnRef.current);
      }
      if (loginRef.current) {
        observerLogin.unobserve(loginRef.current);
      }
    };
  }, [welcomeRef, learnRef, loginRef]);

  return (
    <div className="onboarding-pages">
      <section id="welcome">
        <div className="welcome" ref={welcomeRef}>
          <h3>Welcome to Merge!</h3>
          <div
            className="logo white"
            style={{ height: "150px", width: "250px" }}
          />
          <p>
            Merge is a team-matching and real-time chat app made with ♡ by
            Freetail Hackers.
          </p>
          <p>Swipe left to continue.</p>
        </div>
      </section>
      <section id="learn-more">
        <div className="learn-more" ref={learnRef}>
          <h3>Learn More.</h3>
          <div
            className="logo white"
            style={{ height: "150px", width: "250px" }}
          />
          <p>
            Freetail Hackers is an organization centered at The University of
            Texas at Austin that specealizes in hosting hackathons.
          </p>
          <p>We hope to see you at one of our events!</p>
        </div>
      </section>
      <section id="log-in">
        <div className="log-in" ref={loginRef}>
          {props.login}
        </div>
      </section>
      <div className="dot-nav">
        <div className={isWelcomeVisible ? "on-dot" : "dot"} />
        <div className={isLearnVisible ? "on-dot" : "dot"} />
        <div className={isLoginVisible ? "on-dot" : "dot"} />
      </div>
    </div>
  );
};

Onboarding.propTypes = {
  login: PropTypes.element.isRequired,
};

export default Onboarding;
