import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import axios from "axios";
import { setDefaultUserData } from '../utils/setDefaultUserData';

import Loading from "../components/Loading";
import SwipeProfile from "../components/SwipeProfile";

class Swipe extends Component {
  getUserToShow = (callback) => {
    this.setState({ loadingUserToShow: true }, () => {
      axios.get(process.env.REACT_APP_API_URL + "user/").then((res) => {
        this.setState({
          userToShow: setDefaultUserData({
            name: res.data.name,
            school: res.data.school,
            major: res.data.major,
            classStanding: res.data.classStanding,
            skills: res.data.skills,
            experienceLevel: res.data.experienceLevel,
            intro: res.data.intro,
            profilePictureUrl: res.data.profilePictureUrl,
            github: res.data.github,
            linkedin: res.data.linkedin,
            portfolio: res.data.portfolio
          }),
          loadingUserToShow: false
        }, () => {
          if (callback) callback();
        });
      });
    });
  }
    
  constructor () {
    super();
    this.state = {
      loadingUserToShow: true,
      userToShow: {},
      cursorDown: false,
      mouseDownPosition: [0, 0],
      profilePosition: [0, 0],
      profileAngle: 0,
      profileSide: 'neutral'
    }
  }

  componentDidMount () {
    this.getUserToShow();
    document.body.addEventListener('mouseup', this.mouseUpOnProfile);
    document.body.addEventListener('mouseleave', this.mouseUpOnProfile);
    document.body.addEventListener('mousemove', this.mouseMoveOnProfile);
    document.body.addEventListener('keydown', this.keyDown);
  }

  componentWillUnmount () {
    document.body.removeEventListener('mouseup', this.mouseUpOnProfile);
    document.body.removeEventListener('mouseleave', this.mouseUpOnProfile.bind(this));
    document.body.removeEventListener('mousemove', this.mouseMoveOnProfile);
    document.body.removeEventListener('keydown', this.keyDown);
  }

  checkKey = (e) => {
    e = e || window.event;
    // left key press
    if (e.keyCode === '37') {
      this.setState({
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: 'reject'
      });
    } 
    // right key press
    else if (e.keyCode === '39') {
      this.setState({
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: 'accept'
      });
    }
  }

  keyDown = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf('committed') !== -1) return;
    switch (e.code) {
      case "ArrowLeft":
          this.setState({
            profileSide: 'reject-committed',
            cursorDown: false,
            profilePosition: [0, 0],
            profileAngle: -20,
          }, () => {
            axios.post(process.env.REACT_APP_API_URL + "swipe/", {
              auth: this.props.auth,
              otherUser: this.state.userToShow,
              decision: this.state.profileSide
            }).then(res => {});
            setTimeout(() => {
              this.getUserToShow(() => {
                this.setState({
                  cursorDown: false,
                  profileAngle: 0,
                  profileSide: 'neutral'
                })
              });
            }, 350)
          });
          break;
      case "ArrowRight":
        this.setState({
          profileSide: 'accept-committed',
          cursorDown: false,
          profilePosition: [0, 0],
          profileAngle: 20,
        }, () => {
          axios.post(process.env.REACT_APP_API_URL + "swipe/", {
            auth: this.props.auth,
            otherUser: this.state.userToShow,
            decision: this.state.profileSide
          }).then(res => {});
          setTimeout(() => {
            this.getUserToShow(() => {
              this.setState({
                cursorDown: false,
                profileAngle: 0,
                profileSide: 'neutral'
              })
            });
          }, 350)
        });
          break;
    }
  }


  mouseDownOnProfile = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf('committed') !== -1) return;

    this.setState({
      cursorDown: true,
      mouseDownPosition: [e.clientX, e.clientY],
      profilePosition: [0, 0],
      profileAngle: 0,
      profileSide: 'neutral'
    });
  }

  mouseUpOnProfile = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf('committed') !== -1) return;

    if (this.state.profileSide === 'neutral' || e.type !== 'mouseup') {
      this.setState({
        cursorDown: false,
        mouseDownPosition: [0, 0],
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: 'neutral'
      });
    } else {
      this.setState({
        profileSide: this.state.profileSide + '-committed',
        cursorDown: false,
        mouseDownPosition: [0, 0],
        profilePosition: [0, 0],
        profileAngle: 0,
      }, () => {
        axios.post(process.env.REACT_APP_API_URL + "swipe/", {
          auth: this.props.auth,
          otherUser: this.state.userToShow,
          decision: this.state.profileSide
        }).then(res => {
          
        });

        setTimeout(() => {
          this.getUserToShow(() => {
            this.setState({
              profileSide: 'neutral'
            })
          });
        }, 700)
      });
    }
  }

  mouseMoveOnProfile = (e) => {
    e.preventDefault();
    if (this.state.profileSide.indexOf('committed') !== -1) return;

    if (this.state.cursorDown) {
      const position = [
        e.clientX - this.state.mouseDownPosition[0],
        e.clientY - this.state.mouseDownPosition[1]
      ]
      
      const rotateAmount = 4;
      const angle = (Math.sqrt(Math.abs(position[0] / rotateAmount) + 9) - 3) * Math.sign(position[0]) * rotateAmount;
      
      const positionProportionalToScreen = position[0] / window.innerWidth;
      const commitThreshold = 0.1
      const side = positionProportionalToScreen < -commitThreshold 
                   ? 'reject' : 
                   positionProportionalToScreen > commitThreshold 
                   ? 'accept' 
                   : 'neutral';

      this.setState({
        profilePosition: position,
        profileAngle: angle,
        profileSide: side
      });
    } else {
      this.setState({
        profilePosition: [0, 0],
        profileAngle: 0,
        profileSide: 'neutral'
      })
    }
  }

  render () {
    return (
      <section>
        {
          this.state.loadingUserToShow
          ? <center><Loading /></center>
          : <SwipeProfile 
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
        }
      </section>
    );
  }
}

Swipe.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  user: state.auth.user,
});

export default connect(
  mapStateToProps
)(Swipe);
