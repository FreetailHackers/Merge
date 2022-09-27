import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";
import { setDefaultUserData } from "../utils/setDefaultUserData";

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";
import arrowLeft from "../assets/images/arrow-left.png";
import arrowRight from "../assets/images/arrow-right.png";

class Swipe extends Component {
  getUserToShow = (callback) => {
    var queryParamters = {
      start: 0,
      limit: 0,
      filters: {
        // _id: this.props.userID.id,
      },
    };
    this.setState({ loadingUserToShow: true }, () => {
      axios
        .get(process.env.REACT_APP_API_URL + "/api/users/list", {
          params: queryParamters,
        })
        .then((res) => {
          var data = res.data[0].profile[0];
          this.setState(
            {
              userToShow: setDefaultUserData({
                name: res.data[0].name,
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
              }),
              loadingUserToShow: false,
            },
            () => {
              if (callback) callback();
            }
          );
        });
    });
  };

  constructor() {
    super();
    this.state = {
      loadingUserToShow: true,
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
              .post(process.env.REACT_APP_API_URL + "swipe/", {
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
              .post(process.env.REACT_APP_API_URL + "swipe/", {
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
              .post(process.env.REACT_APP_API_URL + "swipe/", {
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
              .post(process.env.REACT_APP_API_URL + "swipe/", {
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
            .post(process.env.REACT_APP_API_URL + "swipe/", {
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
        ) : (
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
        )}
        <div className="arrows">
          <input
            type="image"
            src={arrowLeft}
            className="arrow left"
            id="left"
            onClick={this.click}
            alt="arrow pointing left"
          />
          <input
            type="image"
            src={arrowRight}
            className="arrow right"
            id="right"
            alt="arrow pointing right"
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
