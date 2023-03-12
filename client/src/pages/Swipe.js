import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import arrowLeft from "../assets/images/arrow-left.png";
import arrowRight from "../assets/images/arrow-right.png";
import "./Dashboard.css";

import { useNavigate } from "react-router-dom";

const withRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();
    return <Component navigate={navigate} {...props} />;
  };
  return Wrapper;
};

class Swipe extends Component {
  containsRequired(data) {
    let userProfile = data.profile[0];
    return (
      data.name?.length !== 0 &&
      userProfile.intro?.length !== 0 &&
      userProfile.skills?.length !== 0 &&
      userProfile.experience?.length !== 0 &&
      userProfile.competitiveness?.length !== 0
    );
  }
  getUserToShow = (callback) => {
    var queryParamters = {
      start: 0,
      limit: 0,
      id: this.props.auth.userID.id,
      filters: {},
    };
    this.setState({ loadingUserToShow: true }, async () => {
      //getting my swipeList
      let myswipeList = null;
      let myswipeReady = false;
      let myBlockList = null;
      await axios
        .get(process.env.REACT_APP_API_URL + "/api/users/list", {
          params: {
            start: 0,
            limit: 0,
            id: this.props.auth.userID.id,
            filters: {
              _id: this.props.auth.userID.id,
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
          this.state.swipeReady = myswipeReady;
        });
      if (!myswipeReady) {
        this.setState({
          usersLeft: false,
          loadingUserToShow: false,
          swipeReady: false,
        });
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
                temp._id !== this.props.auth.userID.id &&
                !temp.blockList.includes(this.props.auth.userID.id) &&
                this.containsRequired(temp)
              ) {
                foundSomeone = true;
                break;
              }
              i++;
            }
            if (foundSomeone) {
              var data = res.data[i].profile[0];
              this.setState(
                {
                  userToShow: {
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
                  },
                  loadingUserToShow: false,
                },
                () => {
                  if (callback) callback();
                }
              );
            } else {
              this.setState(
                {
                  usersLeft: false,
                  loadingUserToShow: false,
                },
                () => {
                  if (callback) callback();
                }
              );
            }
          });
      }
    });
  };

  constructor() {
    super();
    this.state = {
      loadingUserToShow: true,
      usersLeft: true,
      swipeReady: true,
      userToShow: {},
      cursorDown: false,
      mouseDownPosition: [0, 0],
      profilePosition: [0, 0],
      profileAngle: 0,
      profileSide: "neutral",
      blockList: [],
    };
  }

  componentDidMount() {
    this.getUserToShow();
    document.body.addEventListener("mouseup", this.mouseUpOnProfile);
    document.body.addEventListener("mouseleave", this.mouseUpOnProfile);
    document.body.addEventListener("mousemove", this.mouseMoveOnProfile);
    document.body.addEventListener("keydown", this.keyDown);
    document
      .getElementById("swipe-profile")
      .addEventListener("click", this.mouseDown);
  }

  componentWillUnmount() {
    document.body.removeEventListener("mouseup", this.mouseUpOnProfile);
    document.body.removeEventListener(
      "mouseleave",
      this.mouseUpOnProfile.bind(this)
    );
    document.body.removeEventListener("mousemove", this.mouseMoveOnProfile);
    document.body.removeEventListener("keydown", this.keyDown);
    document.body.removeEventListener("click", this.mouseDown);
  }

  swipeCallback = (delay, callbackState) => {
    axios
      .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
        auth: this.props.auth,
        id: this.props.auth.userID.id,
        otherUser: this.state.userToShow,
        decision: this.state.profileSide,
      })
      .then((res) => {
        if (this.state.profileSide === "accept-committed") {
          this.props.setSwipedUser(this.state.userToShow._id);
          this.props.navigate("/chat");
        }
      });
    setTimeout(() => {
      this.getUserToShow(() => {
        this.setState(callbackState);
      });
    }, delay);
  };

  mouseDown = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf("committed") !== -1) return;
    switch (e.target.id) {
      case "left":
        this.setState(
          {
            profileSide: "reject-committed",
            profilePosition: [0, 0],
            profileAngle: -20,
          },
          () =>
            this.swipeCallback(350, {
              profileAngle: 0,
              profileSide: "neutral",
            })
        );
        break;
      case "right":
        this.setState(
          {
            profileSide: "accept-committed",
            profilePosition: [0, 0],
            profileAngle: 20,
          },
          () =>
            this.swipeCallback(350, {
              profileAngle: 0,
              profileSide: "neutral",
            })
        );
        break;
      default:
        break;
    }
  };

  keyDown = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf("committed") !== -1) return;

    switch (e.code) {
      case "ArrowLeft":
        this.setState(
          {
            profileSide: "reject-committed",
            cursorDown: false,
            profilePosition: [0, 0],
            profileAngle: -20,
          },
          () =>
            this.swipeCallback(350, {
              profileAngle: 0,
              profileSide: "neutral",
            })
        );
        break;
      case "ArrowRight":
        this.setState(
          {
            profileSide: "accept-committed",
            cursorDown: false,
            profilePosition: [0, 0],
            profileAngle: 20,
          },
          () =>
            this.swipeCallback(350, {
              profileAngle: 0,
              profileSide: "neutral",
            })
        );
        break;
      default:
        break;
    }
  };

  buttonClick = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf("committed") !== -1) return;
  };

  mouseDownOnProfile = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf("committed") !== -1) return;

    this.setState({
      cursorDown: true,
      mouseDownPosition: [e.clientX, e.clientY],
      profilePosition: [0, 0],
      profileAngle: 0,
      profileSide: "neutral",
    });
  };

  mouseUpOnProfile = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf("committed") !== -1) return;

    if (this.state.profileSide === "neutral" || e.type !== "mouseup") {
      this.setState({
        cursorDown: false,
        mouseDownPosition: [0, 0],
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: "neutral",
      });
    } else {
      this.setState(
        {
          profileSide: this.state.profileSide + "-committed",
          cursorDown: false,
          mouseDownPosition: [0, 0],
          profilePosition: [0, 0],
          profileAngle: 0,
        },
        () =>
          this.swipeCallback(700, {
            profileSide: "neutral",
          })
      );
    }
  };

  mouseMoveOnProfile = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf("committed") !== -1) return;

    if (this.state.cursorDown) {
      const position = [
        e.clientX - this.state.mouseDownPosition[0],
        e.clientY - this.state.mouseDownPosition[1],
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

      this.setState({
        profilePosition: position,
        profileAngle: angle,
        profileSide: side,
      });
    } else {
      this.setState({
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: "neutral",
      });
    }
  };

  render() {
    return (
      <section id={"swipe-profile"}>
        {this.state.loadingUserToShow ? (
          <center>
            <Loading />
          </center>
        ) : this.state.usersLeft ? (
          <>
            <SwipeProfile
              name={this.state.userToShow.name}
              school={this.state.userToShow.school}
              intro={this.state.userToShow.intro}
              // profilePictureUrl={this.state.userToShow.profilePictureUrl}
              github={this.state.userToShow.github}
              linkedin={this.state.userToShow.linkedin}
              portfolio={this.state.userToShow.portfolio}
              onMouseDown={this.mouseDownOnProfile}
              relativePosition={this.state.profilePosition}
              relativeAngle={this.state.profileAngle}
              borderColor={this.state.profileSide}
            />
            <div className="arrows">
              <input
                type="image"
                src={arrowLeft}
                alt="Arrow Left"
                className="arrow left"
                id="left"
                onClick={this.click}
              />
              <input
                type="image"
                src={arrowRight}
                alt="Arrow Right"
                className="arrow right"
                id="right"
                onClick={this.click}
              />
            </div>
          </>
        ) : !this.state.swipeReady ? (
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
}

Swipe.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  setSwipedUser: PropTypes.func,
  navigate: PropTypes.func,
};

export default withRouter(Swipe);
