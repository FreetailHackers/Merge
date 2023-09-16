import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import arrowLeft from "../assets/images/arrow-left.png";
import arrowRight from "../assets/images/arrow-right.png";

import { useNavigate } from "react-router-dom";

function Swipe(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamsToShow, setTeamsToShow] = useState([]);
  const teamToShow = teamsToShow.length > 0 && teamsToShow[0];

  const [idealSize, setIdealSize] = useState(0);
  const [containsRequired, setContainsRequired] = useState(false);
  const defaultProfileState = {
    cursorDown: false,
    mouseDownPosition: [0, 0],
    profilePosition: [0, 0],
    profileAngle: 0,
    profileSide: "neutral",
  };
  const [profileState, setProfileState] = useState({ ...defaultProfileState });

  useEffect(() => {
    async function findTeam() {
      const res = await axios.get(
        process.env.REACT_APP_API_URL +
          "/api/teams/teamsToSwipe/" +
          props.userID
      );
      if (res.data.ready) {
        setTeamsToShow(res.data.teams);
      }
      setContainsRequired(res.data.ready);
      setLoading(false);
    }

    if (props.userID) {
      setLoading(true);
      findTeam();
    }
  }, [props.userID]);

  async function getTeamToShow() {
    const res = await axios.get(
      process.env.REACT_APP_API_URL + "/api/teams/teamsToSwipe/" + props.userID,
      {
        params: {
          idealSize: idealSize,
        },
      }
    );
    setTeamsToShow(res.data.teams);
    setLoading(false);
    setProfileState((prev) => ({
      ...prev,
      profileAngle: 0,
      profileSide: "neutral",
    }));
  }

  const swipeCallback = (decision) => {
    axios
      .post(process.env.REACT_APP_API_URL + "/api/teams/swipe", {
        otherTeamID: teamToShow._id,
        decision,
      })
      .then((res) => {
        if (decision === "accept-committed") {
          navigate("/chat");
        } else {
          setTimeout(() => {
            if (teamsToShow.length === 1) {
              getTeamToShow();
            } else {
              setTeamsToShow((prev) => [...prev.slice(1)]);
              setProfileState((prev) => ({
                ...prev,
                profileAngle: 0,
                profileSide: "neutral",
              }));
            }
          }, 175);
        }
      });
  };

  const mouseDownOnArrows = (e) => {
    e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;
    switch (e.target.id) {
      case "left":
        setProfileState((prev) => ({
          ...prev,
          profileSide: "reject-committed",
          profilePosition: [0, 0],
          profileAngle: -20,
        }));
        swipeCallback("reject-committed");
        break;
      case "right":
        setProfileState((prev) => ({
          ...prev,
          profileSide: "accept-committed",
          profilePosition: [0, 0],
          profileAngle: 20,
        }));
        swipeCallback("accept-committed");
        break;
      default:
        break;
    }
  };

  const mouseDownOnProfile = (e) => {
    e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;

    setProfileState({
      cursorDown: true,
      mouseDownPosition: [e.clientX, e.clientY],
      profilePosition: [0, 0],
      profileAngle: 0,
      profileSide: "neutral",
    });
  };

  const mouseMoveOnProfile = (e) => {
    e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;

    if (profileState.cursorDown) {
      const position = [
        e.clientX - profileState.mouseDownPosition[0],
        e.clientY - profileState.mouseDownPosition[1],
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

      setProfileState((prev) => ({
        ...prev,
        profilePosition: position,
        profileAngle: angle,
        profileSide: side,
      }));
    } else {
      setProfileState((prev) => ({
        ...prev,
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: "neutral",
      }));
    }
  };

  const mouseUpOnProfile = (e) => {
    e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;
    if (profileState.profileSide === "neutral" || e.type !== "mouseup") {
      setProfileState({ ...defaultProfileState });
    } else {
      const decision = profileState.profileSide + "-committed";
      setProfileState((prev) => ({
        ...defaultProfileState,
        profileAngle: prev.profileAngle,
        profileSide: decision,
      }));
      swipeCallback(decision);
    }
  };

  return (
    <div className="flexColumn fsCenter" id="swipeContainer">
      <section id={"swipe-profile"}>
        {!props.wideScreen && (
          <div className="toggleHolder">
            <button
              className="toggleSidebar toggleCenter"
              onClick={props.flipDisplaySidebar}
            >
              ≡
            </button>
          </div>
        )}
        {loading ? (
          <center>
            <Loading />
          </center>
        ) : teamToShow ? (
          <>
            <SwipeProfile
              profile={teamToShow.profile}
              name={teamToShow.profile.name}
              userProfiles={teamToShow.profiles}
              isAlone={teamToShow.users.length === 1}
              onMouseDown={mouseDownOnProfile}
              onMouseMove={mouseMoveOnProfile}
              onMouseUp={mouseUpOnProfile}
              relativePosition={profileState.profilePosition}
              relativeAngle={profileState.profileAngle}
              borderColor={profileState.profileSide}
            />
            <div className="arrows" onClick={mouseDownOnArrows}>
              <input
                type="image"
                src={arrowLeft}
                alt="Arrow Left"
                className="arrow left"
                id="left"
              />
              <input
                type="image"
                src={arrowRight}
                alt="Arrow Right"
                className="arrow right"
                id="right"
              />
            </div>
          </>
        ) : (
          <center>
            <label>
              <p style={{ fontSize: "20px", marginTop: "15%" }}>
                {" "}
                {!containsRequired
                  ? "Please Make Sure Your Profile is Completed"
                  : "No Teams Left To Swipe"}
              </p>{" "}
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
      {containsRequired && (
        <div className="flexColumn" style={{ alignItems: "center" }}>
          <input
            type="range"
            autoComplete="off"
            value={String(idealSize)}
            onChange={(e) => setIdealSize(parseInt(e.target.value))}
            min={0}
            max={4}
            step={1}
            list="team-sizes"
          />
          <datalist id="team-sizes">
            {[...[...Array(4).keys()].map((e) => e + 1)].map((e) => (
              <option value={e} key={e} label={`${e}`} />
            ))}
          </datalist>
          <p>Searching for teams of size {idealSize > 0 ? idealSize : "any"}</p>
          <button onClick={getTeamToShow}>Refresh</button>
        </div>
      )}
    </div>
  );
}

Swipe.propTypes = {
  userID: PropTypes.string.isRequired,
  navigate: PropTypes.func,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default Swipe;
