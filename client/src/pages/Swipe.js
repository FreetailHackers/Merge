import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import arrowLeft from "../assets/images/arrow-left.png";
import arrowRight from "../assets/images/arrow-right.png";
import "./Dashboard.css";

function Swipe(props) {
  const [loadingUserToShow, setLoadingUserToShow] = useState(true);
  const [usersLeft, setUsersLeft] = useState(true);
  const [swipeReady, setSwipeReady] = useState(true);
  const [cursorDown, setCursorDown] = useState(false);
  const [userToShow, setUserToShow] = useState({});
  const [mouseDownPosition, setMouseDownPosition] = useState([0, 0]);
  const [profilePosition, setProfilePosition] = useState([0, 0]);
  const [profileAngle, setProfileAngle] = useState(0);
  const [profileSide, setProfileSide] = useState("neutral");
  //const [blockList, setBlockList] = useState([])

  const navigate = useNavigate();

  useEffect(() => {
    document.body.addEventListener("mouseup", mouseUpOnProfile);
    document.body.addEventListener("mouseleave", mouseUpOnProfile);
    document.body.addEventListener("mousemove", mouseMoveOnProfile);
    document.body.addEventListener("keydown", keyDown);
    document
      .getElementById("swipe-profile")
      .addEventListener("click", mouseDown);

    return () => {
      document.body.removeEventListener("mouseup", mouseUpOnProfile);
      document.body.removeEventListener(
        "mouseleave",
        mouseUpOnProfile.bind(this)
      );
      document.body.removeEventListener("mousemove", mouseMoveOnProfile);
      document.body.removeEventListener("keydown", keyDown);
      document.body.removeEventListener("click", mouseDown);
    };
  }, []);

  function containsRequired(data) {
    let userProfile = data.profile[0];
    return (
      data.name?.length !== 0 &&
      userProfile.intro?.length !== 0 &&
      userProfile.skills?.length !== 0 &&
      userProfile.experience?.length !== 0 &&
      userProfile.competitiveness?.length !== 0
    );
  }

  async function loadUserToShow() {
    //getting my swipeList
    let myswipeList = null;
    let myswipeReady = false;
    let myBlockList = null;
    let queryParamters = {
      start: 0,
      limit: 0,
      id: props.userID.id,
      filters: {},
    };
    await axios
      .get(process.env.REACT_APP_API_URL + "/api/users/list", {
        params: {
          start: 0,
          limit: 0,
          id: props.auth.userID.id,
          filters: {
            _id: props.auth.userID.id,
          },
        },
      })
      .then((res) => {
        myswipeList = res.data[0].swipeList;
        myBlockList = res.data[0].blockList;
        if (
          res.data[0].profile[0] !== undefined &&
          "swipeReady" in res.data[0].profile[0]
        )
          myswipeReady = res.data[0].profile[0].swipeReady;
        setSwipeReady(myswipeReady);
      });
    if (!myswipeReady) {
      setUsersLeft(false);
      setLoadingUserToShow(false);
      setSwipeReady(false);
    } else {
      axios
        .get(process.env.REACT_APP_API_URL + "/api/users/list", {
          params: queryParamters,
        })
        .then((res) => {
          let foundSomeone = false;
          let i = 0;
          while (i < res.data.length) {
            let temp = res.data[i];
            if (
              !myswipeList.includes(temp._id) &&
              !myBlockList.includes(temp._id) &&
              temp._id !== props.auth.userID.id &&
              !temp.blockList.includes(props.auth.userID.id) &&
              containsRequired(temp)
            ) {
              foundSomeone = true;
              break;
            }
            i++;
          }
          if (foundSomeone) {
            var data = res.data[i].profile[0];
            setUserToShow({
              name: res.data[i].name,
              school: data.school,
              major: data.major,
              classStanding: data.class,
              skills: data.skills,
              experienceLevel: data.experience,
              intro: data.intro,
              // profilePictureUrl: data.profilePictureUrl,
              github: data.github,
              linkedin: data.linkedin,
              portfolio: data.portfolio,
              _id: res.data[i]._id,
            });
          } else {
            setUsersLeft(false);
          }
          setLoadingUserToShow(false);
        });
    }
  }

  useEffect(() => {
    async function loadFunc() {
      await loadUserToShow();
    }
    if (loadingUserToShow) {
      loadFunc();
    }
  }, [loadingUserToShow]);

  useEffect(() => {
    if (profileSide.endsWith("committed")) {
      swipeCallback();
    } else if (profileSide === "neutral") {
      setLoadingUserToShow(true);
    }
  }, [profileSide]);

  function swipeCallback() {
    const timeout = profileAngle === 0 ? 700 : 350;
    axios
      .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
        auth: props.auth,
        id: props.userID.id,
        otherUser: userToShow,
        decision: profileSide,
      })
      .then((res) => {
        if (profileSide === "accept-committed") {
          props.setSwipedUser(userToShow._id);
          // set an App.js state variable to data
          navigate("/chat");
        }
      });
    setTimeout(() => {
      if (profileAngle !== 0) {
        setProfileAngle(0);
      }
      setProfileSide("neutral");
    }, timeout);
  }

  const mouseDown = (e) => {
    e.preventDefault();
    if (profileSide.indexOf("committed") !== -1) return;
    switch (e.target.id) {
      case "left":
        setProfileAngle(-20);
        setProfilePosition([0, 0]);
        setProfileSide("reject-committed");
        // swipeCallback("mouseDown")
        break;
      case "right":
        setProfileAngle(20);
        setProfilePosition([0, 0]);
        setProfileSide("accept-committed");
        // swipeCallback("mouseDown")
        break;
      default:
        break;
    }
  };

  const keyDown = (e) => {
    e.preventDefault();
    if (profileSide.indexOf("committed") !== -1) return;

    switch (e.code) {
      case "ArrowLeft":
        setProfileAngle(-20);
        setProfilePosition([0, 0]);
        setCursorDown(false);
        setProfileSide("reject-committed");
        // swipeCallback("keyDown")
        break;
      case "ArrowRight":
        setProfileAngle(20);
        setProfilePosition([0, 0]);
        setCursorDown(false);
        setProfileSide("accept-committed");
        // swipeCallback("keyDown")
        break;
      default:
        break;
    }
  };

  /*const buttonClick = (e) => {
    e.preventDefault();
    if (profileSide.indexOf("committed") !== -1) return;
  };*/

  const mouseDownOnProfile = (e) => {
    e.preventDefault();
    if (profileSide.indexOf("committed") !== -1) return;

    setCursorDown(true);
    setMouseDownPosition([e.clientX, e.clientY]);
    setProfilePosition([0, 0]);
    setProfileAngle(0);
    setProfileSide("neutral");
  };

  const mouseUpOnProfile = (e) => {
    e.preventDefault();
    if (profileSide.indexOf("committed") !== -1) return;

    setProfileAngle(0);
    setMouseDownPosition([0, 0]);
    setProfilePosition([0, 0]);
    setCursorDown(false);

    if (profileSide === "neutral" || e.type !== "mouseup") {
      setProfileSide("neutral");
    } else {
      setProfileSide(profileSide + "-committed");
      // swipeCallback("mouseUp", 700)
    }
  };

  const mouseMoveOnProfile = (e) => {
    e.preventDefault();
    if (profileSide.indexOf("committed") !== -1) return;

    if (cursorDown) {
      const position = [
        e.clientX - mouseDownPosition[0],
        e.clientY - mouseDownPosition[1],
      ];

      const rotateAmount = 4;
      const angle =
        (Math.sqrt(Math.abs(position[0] / rotateAmount) + 9) - 3) *
        Math.sign(position[0]) *
        rotateAmount;

      const positionProportionalToScreen = position[0] / window.innerWidth;
      const commitThreshold = 0.1;
      const side =
        positionProportionalToScreen < -commitThreshold
          ? "reject"
          : positionProportionalToScreen > commitThreshold
          ? "accept"
          : "neutral";

      setProfilePosition(position);
      setProfileAngle(angle);
      setProfileSide(side);
    } else {
      setProfilePosition([0, 0]);
      setProfileAngle(0);
      setProfileSide("neutral");
    }
  };

  return (
    <section id={"swipe-profile"}>
      {loadingUserToShow ? (
        <center>
          <Loading />
        </center>
      ) : usersLeft ? (
        <>
          <SwipeProfile
            name={userToShow.name}
            school={userToShow.school}
            intro={userToShow.intro}
            // profilePictureUrl={userToShow.profilePictureUrl}
            github={userToShow.github}
            linkedin={userToShow.linkedin}
            portfolio={userToShow.portfolio}
            onMouseDown={mouseDownOnProfile}
            relativePosition={profilePosition}
            relativeAngle={profileAngle}
            borderColor={profileSide}
          />
          <div className="arrows">
            <input
              type="image"
              src={arrowLeft}
              alt="Arrow Left"
              className="arrow left"
              id="left"
              /*onClick={click}*/
            />
            <input
              type="image"
              src={arrowRight}
              alt="Arrow Right"
              className="arrow right"
              id="right"
              /*onClick={click}*/
            />
          </div>
        </>
      ) : !swipeReady ? (
        <center>
          <label>
            <p style={{ fontSize: "20px", marginTop: "15%" }}>
              {" "}
              Please Make Sure Your Profile is Completed
            </p>{" "}
          </label>
          <div className="team-image">
            <div className="background" />
            <div className="main" />
            <div className="primary" />
            <div className="secondary" />
          </div>
        </center>
      ) : (
        <center>
          <label>
            <p style={{ fontSize: "20px", marginTop: "15%" }}>
              {" "}
              No Users Left To Swipe
            </p>
          </label>
          <div className="team-image">
            <div className="background" />
            <div className="main" />
            <div className="primary" />
            <div className="secondary" />
          </div>
        </center>
      )}
    </section>
  );
}

Swipe.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object,
  userID: PropTypes.object.isRequired,
  setSwipedUser: PropTypes.func,
};

export default Swipe;
