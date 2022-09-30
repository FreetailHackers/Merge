import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";
import { setDefaultUserData } from "../utils/setDefaultUserData";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import arrowLeft from "../assets/images/arrow-left.png";
import arrowRight from "../assets/images/arrow-right.png";
// import { addListener } from "process";

class Swipe extends Component {
  getUserToShow = (callback) => {
    var queryParamters = {
      start: 0,
      limit: 0,
      filters: {
        // _id: this.props.userID.id,
      },
    };
    this.setState({ loadingUserToShow: true }, async () => {
      //getting my swipeList
      let myswipeList = null;
      let myswipeReady = false;
      await axios
        .get(process.env.REACT_APP_API_URL + "/api/users/list", {
          params: {
            start: 0,
            limit: 0,
            filters: {
              _id: this.props.auth.userID.id,
            },
          },
        })
        .then((res) => {
          myswipeList = res.data[0].swipeList;
          if (
            res.data[0].profile[0] !== undefined &&
            "swipeReady" in res.data[0].profile[0]
          )
            myswipeReady = res.data[0].profile[0].swipeReady;
        });
      if (!myswipeReady) {
        this.setState({
          usersLeft: false,
          loadingUserToShow: false,
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
                temp._id !== this.props.auth.userID.id
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
                  userToShow: setDefaultUserData({
                    name: res.data[i].name,
                    school: data.school,
                    major: data.major,
                    classStanding: data.class,
                    skills: data.skills,
                    experienceLevel: data.experience,
                    intro: data.intro,
                    profilePictureUrl: data.profilePictureUrl,
                    github: data.github,
                    linkedin: data.linkedin,
                    portfolio: data.portfolio,
                    _id: res.data[i]._id,
                  }),
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
      userToShow: {},
      cursorDown: false,
      mouseDownPosition: [0, 0],
      profilePosition: [0, 0],
      profileAngle: 0,
      profileSide: "neutral",
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
          () => {
            axios
              .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
                auth: this.props.auth,
                otherUser: this.state.userToShow,
                decision: this.state.profileSide,
              })
              .then((res) => {});
            setTimeout(() => {
              this.getUserToShow(() => {
                this.setState({
                  profileAngle: 0,
                  profileSide: "neutral",
                });
              });
            }, 350);
          }
        );
        break;
      case "right":
        this.setState(
          {
            profileSide: "accept-committed",
            profilePosition: [0, 0],
            profileAngle: 20,
          },
          () => {
            axios
              .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
                auth: this.props.auth,
                otherUser: this.state.userToShow,
                decision: this.state.profileSide,
              })
              .then((res) => {});
            setTimeout(() => {
              this.getUserToShow(() => {
                this.setState({
                  profileAngle: 0,
                  profileSide: "neutral",
                });
              });
            }, 350);
          }
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
          () => {
            axios
              .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
                auth: this.props.auth,
                otherUser: this.state.userToShow,
                decision: this.state.profileSide,
              })
              .then((res) => {});
            setTimeout(() => {
              this.getUserToShow(() => {
                this.setState({
                  cursorDown: false,
                  profileAngle: 0,
                  profileSide: "neutral",
                });
              });
            }, 350);
          }
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
          () => {
            axios
              .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
                auth: this.props.auth,
                otherUser: this.state.userToShow,
                decision: this.state.profileSide,
              })
              .then((res) => {});
            setTimeout(() => {
              this.getUserToShow(() => {
                this.setState({
                  cursorDown: false,
                  profileAngle: 0,
                  profileSide: "neutral",
                });
              });
            }, 350);
          }
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
        () => {
          axios
            .post(process.env.REACT_APP_API_URL + "/api/users/swipe", {
              auth: this.props.auth,
              otherUser: this.state.userToShow,
              decision: this.state.profileSide,
            })
            .then((res) => {});

          setTimeout(() => {
            this.getUserToShow(() => {
              this.setState({
                profileSide: "neutral",
              });
            });
          }, 700);
        }
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
          <SwipeProfile
            name={this.state.userToShow.name}
            school={this.state.userToShow.school}
            intro={this.state.userToShow.intro}
            profilePictureUrl={this.state.userToShow.profilePictureUrl}
            github={this.state.userToShow.github}
            linkedin={this.state.userToShow.linkedin}
            portfolio={this.state.userToShow.portfolio}
            onMouseDown={this.mouseDownOnProfile}
            relativePosition={this.state.profilePosition}
            relativeAngle={this.state.profileAngle}
            borderColor={this.state.profileSide}
          />
        ) : (
          <center>
            <label>
              <font size="+20"> No Users Left to Swipe</font>{" "}
            </label>
          </center>
        )}

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
            alt="Arror Right"
            className="arrow right"
            id="right"
            onClick={this.click}
          />
        </div>
      </section>
    );
  }
}

Swipe.propTypes = {
  auth: PropTypes.object.isRequired,
  userID: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  user: state.auth.user,
});

export default connect(mapStateToProps)(Swipe);
