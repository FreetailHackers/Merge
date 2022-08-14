import React from "react";
import { Route, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Loading from "./Loading";

const PrivateRoute = ({
  component: Component,
  childProps,
  auth,
  isAuthenticated,
  isLoading,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      isLoading ? (
        <Loading />
      ) : isAuthenticated ? (
        <Component {...props} {...childProps} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.loading,
});

export default withRouter(connect(mapStateToProps)(PrivateRoute));
