import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextInput, NativeSelect, MultiSelect } from "@mantine/core";
import PropTypes from "prop-types";
import SkillSelector from "../SkillSelector";
import Collapsible from "./Collapsible";
import { UserToParagraph } from "./UserToParagraph";
import { Pagination } from "./Pagination";
import { useNavigate } from "react-router-dom";
import { roles } from "../../data/roles";
import { useOutletContext } from "react-router-dom";

function UserList(props) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [competitiveness, setCompetitiveness] = useState("");
  const [skillFilter, setSkillFilter] = useState([]);
  const [roleFilter, setRoleFilter] = useState([]);
  const navigate = useNavigate();
  const socket = useOutletContext();

  useEffect(() => {
    async function getUsersFromAPI() {
      try {
        const queryParamters = {
          pageSize: props.pageSize,
          page,
          filters: {
            ...(nameFilter && { name: nameFilter }),
            ...(skillFilter?.length > 0 && { skills: skillFilter }),
            ...(roleFilter?.length > 0 && { roles: roleFilter }),
            ...(competitiveness?.length > 0 && { competitiveness }),
          },
        };
        const res = await axios.get(
          process.env.REACT_APP_API_URL + "/api/users/list",
          {
            params: queryParamters,
          }
        );
        if (res.data) {
          setUsers(
            res.data.list.map((user) => ({
              _id: user._id,
              name: user.name,
              ...user.profile,
              reachable: user.reachable,
            }))
          );
          setPages(res.data.pages ?? 0);
        }
      } catch (err) {
        console.log(err);
      }
    }
    getUsersFromAPI();
  }, [
    nameFilter,
    skillFilter,
    competitiveness,
    roleFilter,
    page,
    props.pageSize,
  ]);

  async function messageUser(userID) {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chats/new`, {
        otherUsers: [userID],
      });
      navigate("/chat");
    } catch (err) {
      console.error(err);
    }
  }

  async function block(user) {
    await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/" + user + "/block"
    );

    socket.emit("block-users", { users: [user] });
  }

  async function unblock(user) {
    await axios.post(
      process.env.REACT_APP_API_URL + "/api/users/" + user + "/unblock"
    );

    socket.emit("unblock-users", { users: [user] });
  }

  return (
    <div className="flexColumn fsCenter">
      <h3 className="headerTitle">User Database</h3>
      <div className="flexRow filterList">
        <TextInput
          label="Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={() => setNameFilter(nameInput)}
          className="question"
        />
        <SkillSelector
          setSkills={(value) => setSkillFilter(value)}
          skills={skillFilter}
          optional={true}
        />
        <NativeSelect
          label="Competitveness"
          data={[
            { value: "", label: "Any" },
            { value: "learn", label: "Here to learn and have fun" },
            { value: "win", label: "Here to win" },
          ]}
          value={competitiveness}
          onChange={(value) => setCompetitiveness(value.target.value)}
          className="question"
        />
        <MultiSelect
          data={roles}
          label="Roles"
          placeholder="Frontend, Backend, Full Stack, etc."
          value={roleFilter}
          onChange={(value) => setRoleFilter(value)}
          className="question"
        />
      </div>

      {users.map((user, index) => (
        <Collapsible key={index} title={user.name} oddIndex={index % 2 !== 0}>
          {user._id !== props.userID &&
            user.reachable &&
            !props.blockList.includes(user._id) && (
              <button
                className="chat-button"
                onClick={() => messageUser(user._id)}
              >
                Message
              </button>
            )}
          {user._id !== props.userID && (
            <button
              className="chat-button"
              onClick={async () => {
                if (props.blockList.includes(user._id)) {
                  await unblock(user._id);
                } else {
                  await block(user._id);
                }
                props.flipBlockedStatus(user._id);
              }}
            >
              {props.blockList.includes(user._id) ? "Unblock" : "Block"}
            </button>
          )}
          <UserToParagraph
            user={user}
            hideKeys={["_id", "profilePictureUrl"]}
            blocked={props.blockList.includes(user._id)}
          />
        </Collapsible>
      ))}
      <Pagination page={page} setPage={setPage} pages={pages} />
    </div>
  );
}

UserList.propTypes = {
  userID: PropTypes.string.isRequired,
  blockList: PropTypes.array,
  flipBlockedStatus: PropTypes.func,
  pageSize: PropTypes.number,
};

export default UserList;
