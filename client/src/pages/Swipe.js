import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import arrowLeft from "../assets/images/arrow-left.png";
import arrowRight from "../assets/images/arrow-right.png";
import "./Dashboard.css";

import { useNavigate } from "react-router-dom";

function Swipe(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamToShow, setTeamToShow] = useState(null);
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
    setContainsRequired(() => {
      if (!props.team || !props.team.users) return false;
      if (props.team.users.length === 1) {
        const user = props.auth.user;
        const profile = user?.profile && user.profile[0];
        return (
          user &&
          user.name?.length !== 0 &&
          profile &&
          profile.intro?.length !== 0 &&
          profile.skills?.length !== 0 &&
          profile.experience?.length !== 0 &&
          profile.competitiveness?.length !== 0
        );
      }
      const profile = props.team?.profile;
      return (
        profile &&
        profile.name?.length !== 0 &&
        profile.bio?.length !== 0 &&
        profile.skills?.length !== 0 &&
        profile.wantedSkills?.length !== 0 &&
        profile.competitiveness?.length !== 0
      );
    });
  }, [props.team, props.auth]);

  useEffect(() => {
    async function findTeam() {
      const res = await axios.get(
        process.env.REACT_APP_API_URL +
          "/api/teams/teamsToSwipe/" +
          props.auth.userID.id
      );
      setTeamToShow(res.data[0] ?? null);
      setLoading(false);
    }

    if (containsRequired && props.auth?.userID?.id) {
      setLoading(true);
      findTeam();
    }
  }, [containsRequired, props.auth]);

  async function getTeamToShow() {
    const res = await axios.get(
      process.env.REACT_APP_API_URL +
        "/api/teams/teamsToSwipe/" +
        props.auth.userID.id,
      {
        params: {
          idealSize: idealSize,
        },
      }
    );
    setTeamToShow(res.data[0] ?? null);
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
        props.setTeam((prev) => ({
          ...prev,
          swipeList: [...prev.swipeList, teamToShow._id],
        }));
        if (decision === "accept-committed") {
          navigate("/chat");
        } else {
          setTimeout(() => {
            getTeamToShow();
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
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  navigate: PropTypes.func,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
  team: PropTypes.object,
  setTeam: PropTypes.func,
};

export default Swipe;
