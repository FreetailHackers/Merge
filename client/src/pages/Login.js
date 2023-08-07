import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (props.auth.userID) {
      navigate("/dashboard");
    }
  }, [props, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
    };
    //checking database to see if credentials exist
    props.loginUser(userData, setErrors);
  };

  const onRegister = (e) => {
    navigate("/register");
  };

  return (
    <section id="login">
      <div className="container">
        <form id="fields">
          <div className="logo" />
          <hr />
          <label htmlFor="email">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            //error={errors.email}
            id="email"
            type="email"
            placeholder="foo@bar.edu"
          />
          <span className="error">
            {errors.email}
            {errors.emailnotfound}
          </span>
          <label htmlFor="password">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            //error={errors.password}
            id="password"
            type="password"
            placeholder="Password (at least 8 characters)"
          />
          <span className="error">
            {errors.password}
            {errors.passwordincorrect}
          </span>

          <button onClick={onSubmit} className="action" type="submit">
            Login
          </button>
          <span className="error">{errors.status}</span>
          <button onClick={onRegister} className="action" type="submit">
            Register
          </button>
        </form>
        <div className="about">
          <h4>
            Merge is a team-matching and real-time chat app made with ❤️ by
            Freetail Hackers.
          </h4>
          <p>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://freetailhackers.com/"
            >
              <strong>Freetail Hackers</strong>
            </a>{" "}
            is an organization centered at the University of Texas at Austin
            that specializes in hosting hackathons.
          </p>
          <p>
            We host two hackathons every year - our spring hackathon (
            <a
              rel="noreferrer"
              target="_blank"
              href="https://freetailhackers.com/hack-the-future/"
            >
              Hack the Future 2023
            </a>
            !) , and our flagship event,{" "}
            <a rel="noreferrer" target="_blank" href="https://hacktx.com/">
              <strong>HackTX</strong>
            </a>{" "}
            , in the fall.
          </p>
          <p>We hope to see you at one of our events!</p>
        </div>
      </div>
    </section>
  );
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

export default Login;
