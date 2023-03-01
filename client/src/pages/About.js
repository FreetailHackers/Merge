import React, { Component } from "react";

import "./About.css";
import groupPhoto from "../assets/images/group-photo.jpg";

class About extends Component {
  render() {
    return (
      <div className="about-page">
        <h1>About</h1>
        <p>
          Proudly brought to you by{" "}
          <a href="https://freetailhackers.com/">
            <strong>Freetail Hackers</strong>
          </a>
          , Merge is the <strong>first</strong> real-time chat app of its kind
          for use in hackathons. It was first thought of in 2021 as a fun way to
          handle team matching and an alternative to people attempting to reach
          out in public channels in hopes of finding other people wanting a
          team. After lots of work, it has evolved into a fully fledged chat app
          taking inspiration from some uh, other popular apps centered around
          connecting people together.
        </p>
        <br />
        <h3>The Story</h3>
        <p>
          Prior to the summer of 2022, Merge had taken a backseat to many other
          projects worked on by the organization at the time. The original team
          consisted of a few previous members of Freetail, like Ben T (previous
          co-lead) and Shravan (previous Freetail member). A year later, the
          current team took over in an effort to finally complete Merge in a
          consistent effort over the next several months. At the time, the team
          consisted of <strong> five</strong> people - Pranay (current project
          lead), Daniel (current Tech Director), Adi, (current internal VP and
          previous project lead), Ayush B, Ayush P, and Ben G (beloved members
          of Freetail). In the beginning stages of the project, a large teardown
          of the original codebase commenced.
        </p>
        <p>
          We kept a large portion of the original UI, but rewrote large parts of
          the codebase. We also wrote almost all of the backend again from
          scratch and implemented the vast majority of features you see today.
          In total, the current team has devoted hundreds of hours to the
          development of Merge over the course of 7 total months of consistent
          effort to finally complete the first <strong>early access</strong>{" "}
          release for Spring 2023. Special thanks to Orion (previous Logistics
          Director) for being a fantastic resource while we (mostly Adi) worked
          with full-scale and industry level development -&gt; production
          pipelines and cloud hosting on AWS.
        </p>
        <br />
        <h3>Future Steps</h3>
        <p>
          We have big plans to continue development and eventually expand Merge
          across the country and by most major hackathons. We are extremely
          proud to be finally releasing Merge, especially because{" "}
          <strong>
            it is one of the most ambitious projects successfully completed by
            hackathon organizers in the country.
          </strong>{" "}
          We hope you enjoy using Merge as we work hard to continuously improve
          Merge and implement new features to make the user experience even
          better.
        </p>
        <i>
          From left to right: Maansi (honorary teammate), Orion, Ayush P, Ayush
          B, Pranay, Ben G, Adi, Daniel
        </i>
        <img
          src={groupPhoto}
          className="group-photo"
          alt="group photo"
          width="80%"
        />
      </div>
    );
  }
}

export default About;
