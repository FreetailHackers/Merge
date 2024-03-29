import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import yes from "../assets/images/yes.png";
import no from "../assets/images/no.png";
import { useOutletContext } from "react-router-dom";
import { Link } from "react-router-dom";

function Swipe(props) {
  const socket = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [teamsToShow, setTeamsToShow] = useState([]);
  const teamToShow = teamsToShow.length > 0 && teamsToShow[0];
  const capacity = process.env.REACT_APP_MAX_TEAM_SIZE - props.teamSize;
  const [idealSize, setIdealSize] = useState(0);
  const [containsRequired, setContainsRequired] = useState(false);
  const defaultProfileState = {
    cursorDown: false,
    mouseDownPosition: 0,
    profilePosition: 0,
    profileAngle: 0,
    profileSide: "neutral",
  };
  const [profileState, setProfileState] = useState({ ...defaultProfileState });

  const refreshTeams = useCallback(
    async (size) => {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teams/teamsToSwipe/${props.userID}`,
        { params: { idealSize: size } }
      );
      if (res.data.ready) {
        setTeamsToShow(res.data.teams);
      }
      setContainsRequired(res.data.ready);
      setLoading(false);
    },
    [props.userID]
  );

  useEffect(() => {
    if (
      props.userID &&
      (!teamToShow || (idealSize > 0 && teamToShow.users.length !== idealSize))
    ) {
      setLoading(true);
      refreshTeams(idealSize);
    }
  }, [props.userID, idealSize, teamToShow, refreshTeams]);

  useEffect(() => {
    if (socket) {
      socket.on("team-swiped-on", (data) =>
        setTeamsToShow((prev) => [
          ...prev.filter((e) => e._id !== data.otherTeam),
        ])
      );
      socket.on("left-swipes-cleared", refreshTeams);
    }
    return () => {
      if (socket) {
        socket.off("team-swiped-on");
        socket.off("left-swipes-cleared");
      }
    };
  }, [socket, refreshTeams]);

  const swipeCallback = (decision) => {
    axios
      .post(process.env.REACT_APP_API_URL + "/api/teams/swipe", {
        otherTeamID: teamToShow._id,
        decision,
      })
      .then((res) => {
        socket.emit("swipe-on-team", {
          yourTeam: props.teamID,
          otherTeam: teamToShow._id,
          chatID: res.data.chatID,
        });
        setTimeout(() => {
          setTeamsToShow((prev) => [...prev.slice(1)]);
          setProfileState((prev) => ({
            ...prev,
            profileAngle: 0,
            profileSide: "neutral",
          }));
        }, 175);
      });
  };

  const clearLeftSwipes = async () => {
    try {
      await axios.post(
        process.env.REACT_APP_API_URL + "/api/teams/swipe/resetLeftSwipe"
      );
      socket.emit("clear-left-swipes", { teamID: props.teamID });
      await refreshTeams(idealSize);
    } catch (error) {
      // Handle errors here
      console.error("Error:", error);
    }
  };

  const mouseDownOnArrows = (e) => {
    e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;
    switch (e.target.id) {
      case "left":
        setProfileState((prev) => ({
          ...prev,
          profileSide: "reject-committed",
          profilePosition: 0,
          profileAngle: -20,
        }));
        swipeCallback("reject-committed");
        break;
      case "right":
        setProfileState((prev) => ({
          ...prev,
          profileSide: "accept-committed",
          profilePosition: 0,
          profileAngle: 20,
        }));
        swipeCallback("accept-committed");
        break;
      default:
        break;
    }
  };

  const mouseDownOnProfile = (e, isMobile) => {
    if (!isMobile) e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;
    const x = isMobile ? e.touches[0].pageX : e.clientX;
    //const y = isMobile ? e.touches[0].pageY : e.clientY;

    setProfileState({
      cursorDown: true,
      mouseDownPosition: x,
      profilePosition: 0,
      profileAngle: 0,
      profileSide: "neutral",
    });
  };

  const mouseMoveOnProfile = (e, isMobile) => {
    if (!isMobile) e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;

    const x = isMobile ? e.touches[0].pageX : e.clientX;
    // const y = isMobile ? e.touches[0].pageY : e.clientY;

    if (profileState.cursorDown) {
      const position = x - profileState.mouseDownPosition;

      const rotateAmount = 4;
      const angle =
        (Math.sqrt(Math.abs(position / rotateAmount) + 9) - 3) *
        Math.sign(position) *
        rotateAmount;

      const positionProportionalToScreen = position / window.innerWidth;
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
        profilePosition: 0,
        profileAngle: 0,
        profileSide: "neutral",
      }));
    }
  };

  const mouseUpOnProfile = (e) => {
    //if (props.wideScreen) e.preventDefault();
    if (profileState.profileSide.indexOf("committed") !== -1) return;
    if (
      profileState.profileSide === "neutral" ||
      (e.type !== "mouseup" && e.type !== "touchend")
    ) {
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
    <div id="swipeContainer">
      <section id={"swipe-profile-holder"}>
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
              mobile={!props.wideScreen}
            />
            <div className="arrows" onClick={mouseDownOnArrows}>
              <input
                type="image"
                src={no}
                alt="Arrow Left"
                className="arrow left"
                id="left"
              />
              <input
                type="image"
                src={yes}
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
                {capacity === 0
                  ? "Team is Full"
                  : !containsRequired
                  ? "Please Make Sure Your "
                  : "No Teams Left To Swipe"}
                {capacity > 0 && !containsRequired && (
                  <Link
                    to="/edit"
                    style={{
                      textDecoration: "none",
                      color: "var(--secondary)",
                    }}
                  >
                    <b>Profile</b>
                  </Link>
                )}
                {capacity > 0 && !containsRequired && " Is Completed"}
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
      {containsRequired && capacity > 0 && (
        <div id="ts-container">
          <input
            type="range"
            autoComplete="off"
            value={String(idealSize)}
            onChange={(e) => setIdealSize(parseInt(e.target.value))}
            min={0}
            max={capacity}
            step={1}
            list="team-sizes"
          />
          {
            <datalist id="team-sizes">
              {[...[...Array(capacity).keys()].map((e) => e + 1)].map((e) => (
                <option value={e} key={e} label={`${e}`} />
              ))}
            </datalist>
          }
          <p>
            Searching for teams of size{" "}
            <strong>{idealSize > 0 ? idealSize : "any"}</strong>
          </p>
          <div className="flexRow">
            <button
              onClick={() => refreshTeams(idealSize)}
              className="refreshBtn"
            >
              Refresh
            </button>
            <button onClick={clearLeftSwipes} className="refreshBtn">
              Clear Left Swipes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Swipe.propTypes = {
  userID: PropTypes.string.isRequired,
  wideScreen: PropTypes.bool,
  teamSize: PropTypes.number.isRequired,
  teamID: PropTypes.string.isRequired,
};

export default Swipe;
