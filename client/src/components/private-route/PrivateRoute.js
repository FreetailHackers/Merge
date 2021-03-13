import React from "react";
import { Route, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";


const Loading = () => {
  return <div>loading...</div>
}


const PrivateRoute = ({ component: Component, auth, isAuthenticated, isLoading, ...rest }) => (
  <Route
    {...rest}
    render={props => {
        console.log('d')
        if(isLoading) {
          console.log('a')
          return <Loading />;
        }
        else {
          if(isAuthenticated) {
            console.log('b')
            return <Component {...props} />;
          }
          else {
            console.log('c')
            return <Redirect to="/login" />;
          }
        }
      }
    }
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  isAuthenticated : state.auth.isAuthenticated,
  isLoading: state.auth.loading
});

export default withRouter(connect(mapStateToProps)(PrivateRoute));
