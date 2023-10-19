/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const Onboarding = (props) => {
  const [isWelcomeVisible, setWelcomeVisible] = useState(false);
  const welcomeRef = useRef(null);

  const [isLearnVisible, setLearnVisible] = useState(false);
  const learnRef = useRef(null);

  const [isLoginVisible, setLoginVisible] = useState(false);
  const loginRef = useRef(null);

  const [userFirstTime, setUserFirstTime] = useState(false);
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

    const currentWelcomeRefValue = welcomeRef.current;
    const currentLearnRefValue = learnRef.current;
    const currentLoginRefValue = loginRef.current;

    if (currentWelcomeRefValue) {
      observerWelcome.observe(currentWelcomeRefValue);
    }
    if (currentLearnRefValue) {
      observerLearn.observe(currentLearnRefValue);
    }
    if (currentLoginRefValue) {
      observerLogin.observe(currentLoginRefValue);
    }

    // Clean up the observers when the component unmounts
    return () => {
      if (currentWelcomeRefValue) {
        observerWelcome.unobserve(currentWelcomeRefValue);
      }
      if (currentLearnRefValue) {
        observerLearn.unobserve(currentLearnRefValue);
      }
      if (currentLoginRefValue) {
        observerLogin.unobserve(currentLoginRefValue);
      }
    };
  }, [welcomeRef, learnRef, loginRef]);

  function setFirstTimeVisitCookie() {
    const cookieName = "firstTimeVisit";
    const oneYearInSeconds = 31536000; // 1 year in seconds

    // Check if the 'firstTimeVisit' cookie exists
    if (
      document.cookie
        .split(";")
        .some((item) => item.trim().startsWith(`${cookieName}=`))
    ) {
      setUserFirstTime(false);
    } else {
      // Set the 'firstTimeVisit' cookie
      const expirationDate = new Date();
      expirationDate.setTime(
        expirationDate.getTime() + oneYearInSeconds * 1000
      );
      document.cookie = `${cookieName}=true; expires=${expirationDate.toUTCString()}; path=/`;
      setUserFirstTime(true);
    }
  }

  document.addEventListener("DOMContentLoaded", setFirstTimeVisitCookie);

  return (
    <div className="onboarding-pages">
      {userFirstTime && (
        <>
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
                Freetail Hackers is an organization centered at The University
                of Texas at Austin that specializes in hosting hackathons.
              </p>
              <p>We hope to see you at one of our events!</p>
            </div>
          </section>
          <div className="dot-nav">
            <div className={isWelcomeVisible ? "on-dot" : "dot"} />
            <div className={isLearnVisible ? "on-dot" : "dot"} />
            <div className={isLoginVisible ? "on-dot" : "dot"} />
          </div>{" "}
        </>
      )}
      <section id="log-in">
        <div className="log-in" ref={loginRef}>
          {props.login}
        </div>
      </section>
    </div>
  );
};

Onboarding.propTypes = {
  login: PropTypes.element.isRequired,
};

export default Onboarding;
