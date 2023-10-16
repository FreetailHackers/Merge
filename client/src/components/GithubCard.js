import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function GithubCard(props) {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const { username, change } = props;

  useEffect(() => {
    if (change) {
      axios
        .get(process.env.REACT_APP_API_URL + "/api/users/github/user", {
          params: { username },
        })
        .then((res) => {
          if (res.data.message?.startsWith("API")) {
            setProfileData({ login: `${props.username}` });
          } else {
            setProfileData(res.data);
          }
          setLoading(false);
        });
    }
  }, [username, change]);

  return (
    <div className="github-card">
      {loading ? (
        "loading"
      ) : (
        <a
          href={`https://github.com/${profileData.login}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {profileData?.avatar_url && (
            <img src={profileData.avatar_url} className="githubImage" alt="" />
          )}
          <div style={{ flexGrow: 2 }}>
            <h5>{profileData.login}</h5>
            <p>{profileData.bio}</p>
            <p className="ligher">
              {profileData.followers} Followers • {profileData.following}{" "}
              Following • {profileData.public_repos} Repos
            </p>
          </div>
          <div className="githubLogo">github</div>
        </a>
      )}
    </div>
  );
}

GithubCard.propTypes = {
  username: PropTypes.string.isRequired,
  change: PropTypes.bool.isRequired,
};

export default GithubCard;
