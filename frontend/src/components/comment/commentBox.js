import React from "react";
import "normalize.css";
import axios from "axios";
import "semantic-ui-css/semantic.min.css";
import CommentForm from "./commentForm.js";
import CommentList from "./commentList.js";
import styled from "styled-components";
import { Divider } from "semantic-ui-react";

const CommentFormStyled = styled(CommentForm)`
  margin-top: 10px;
`;

var url = "http://127.0.0.1:3030/api/comment?articleID=";
const urlCheckAuth = "http://127.0.0.1:3030/api/loggedin";
const urlDeleteComment = "http://127.0.0.1:3030/api/deleteComment/";

export default class CommentBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], authenticated: false, user: "" };
    this.authenticate = this.authenticate.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    this.handleCommentDeletion = this.handleCommentDeletion.bind(this);
    this.pollInterval = null;
  }

  authenticate = () => {
    axios.defaults.withCredentials = true;
    axios(urlCheckAuth, {
      method: "get",
      withCredentials: true
    })
      .then(res => {
        console.log("CommentBox Authentication", res.data);
        if (res.data) {
          if (res.data === "No authentication") {
            this.setState({ authenticated: false, user: "" });
          } else {
            this.setState({ authenticated: true, user: res.data });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleCommentSubmit(comment) {
    if (this.state.authenticated) {
      let comments = this.state.data;
      comment.id = Date.now();
      comment.articleID = this.props.articleID;

      axios
        .post(url, comment)
        .then(res => {
          let newComments = comments.concat(res.data);
          this.setState({ data: newComments });
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  handleCommentDeletion(id) {
    if (this.state.authenticated) {
      axios.defaults.withCredentials = true;
      var urlDeleteComment2 = urlDeleteComment + id;
      axios(urlDeleteComment2, {
        method: "delete",
        withCredentials: true
      })
        .then(res => {
          let newComments = this.state.data.filter(
            comment => comment._id !== id
          );
          this.setState({ data: newComments });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  loadCommentsFromServer = () => {
    if (this.props.articleID !== undefined) {
      var url2 = url + this.props.articleID;

      axios
        .get(url2)
        .then(res => {
          if (res.status) this.setState({ data: res.data });
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  };

  componentDidMount() {
    this.authenticate();
    this.loadCommentsFromServer();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.articleID !== this.props.articleID) {
      console.log("ID:" + this.props.articleID);
      this.authenticate();
      this.loadCommentsFromServer();
    }
  }

  render() {
    return (
      <div>
        <Divider horizontal>Comments</Divider>
        <CommentList
          data={this.state.data}
          user={this.state.user}
          onDeleteComment={this.handleCommentDeletion}
        />
        <br />
        {this.state.authenticated && (
          <CommentFormStyled
            onCommentSubmit={this.handleCommentSubmit}
            user={this.state.user}
          />
        )}
      </div>
    );
  }
}
