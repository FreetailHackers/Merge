import React from "react";

import groupPhoto from "../assets/images/group-photo.jpg";
import PropTypes from "prop-types";

function About(props) {
  return (
    <div className="about-page">
      <h1>About</h1>
      <p>
        Proudly brought to you by{" "}
        <a href="https://freetailhackers.com/">
          <strong>Freetail Hackers</strong>
        </a>
        , Merge is the <strong>first</strong> real-time team-matching app of its
        kind for use in hackathons. It was first thought of in 2021 as a fun
        alternative to people attempting to reach out in public channels in
        hopes of finding other people wanting a team. The original development
        team consisted of a few members of Freetail, like Ben T (previous
        co-lead) and Shravan.
      </p>
      <p>
        Prior to the summer of 2022, Merge had taken a backseat to many other
        projects worked on by the organization at the time. Some code was lost
        that summer but several new members were onboarded. The team from Summer
        2022 through Hack the Future in February 2023 consisted of six people -
        Pranay, Daniel, Adi, Ayush B, Ayush P, and Ben G. Much time was spent
        developing a working chat feature with Socket.io. Additionally, Adi and
        Orion Reynolds (previous Logistics Director) worked hard to set up a
        professional, industry-level development -&gt; production pipeline and
        cloud hosting on AWS.
      </p>
      <p>
        Merge was first released at Hack the Future in Spring 2023, to fairly
        poor reception. At the time it was not mobile-responsive, and did very
        little for its users other than allowing them to chat with each other.
        Much of today&#39;s codebase was either written or rewritten since then.
      </p>
      <p>
        The codebase has been rewritten several times, with each new set of
        developers building off of and improving the work done by past ones.
        Much of design of the original UI remains as of September 2023, though
        class components have been replaced with function components and many
        new features have been added. In conclusion, many people have devoted
        hundreds of hours to the development of Merge over the past 2 years. We
        hope you enjoy using this app as we work hard to continuously improve it
        and make the user experience even better!
      </p>
      <br />
      <h3>Project Leads</h3>
      <ul>
        <li>Spring 2022 - Fall 2022: Aditya Agrawal</li>
        <li>Spring 2023: Pranay Gosar</li>
        <li>Fall 2023: Ben Gordon</li>
      </ul>
      <br />
      <i>
        Current and former developers (Spring &#39;23) - From left to right:
        Maansi, Orion, Ayush P, Ayush B, Pranay, Ben G, Adi, Daniel
      </i>
      <img
        src={groupPhoto}
        className="group-photo"
        alt="group pic"
        width="80%"
      />
      <div id="mobile-nav-space" style={{ height: "17vw" }} />
    </div>
  );
}

About.propTypes = {
  wideScreen: PropTypes.bool,
};

export default About;
