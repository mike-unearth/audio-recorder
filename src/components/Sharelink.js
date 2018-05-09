import React, { Component, Fragment } from "react";
import Button from "material-ui/Button";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "material-ui/Dialog";
import AWS from "aws-sdk";
import Credentials from "../config/keys";

AWS.config.update({
  accessKeyId: Credentials.accessKeyId,
  secretAccessKey: Credentials.secretAccessKey
});

const S3_BUCKET = "upload-audio-recording";

class Sharelink extends Component {
  state = {
    open: false,
    audio: this.props.audio
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  getAudioLink = () => {
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

    console.log("aws: ", s3);
    console.log("type: ", this.state.audio);
    const type = this.state.audio.body.type;
    // Define Object
    const params = {
      Bucket: S3_BUCKET,
      Key: this.state.audio.key,
      Body: this.state.audio.body,
      ACL: "public-read",
      ContentType: type
    };
    console.log("obj: ", params);
    // Upload the file to S3 Bucket
    s3.putObject(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });

    const urlLink =
      "https://upload-audio-recording.s3.amazonaws.com/" + this.state.audio.key;

    // Get the presigned url of the audio file
    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) console.log(err);
      // Save the url into current state
      else
        this.setState(prevState => ({
          audio: {
            ...prevState.audio,
            url: urlLink
          }
        }));
    });
    // Save the url into global state
  };

  render() {
    console.log("state: ", this.state);
    return (
      <Fragment>
        <Button onClick={this.handleClickOpen} size="small" color="primary">
          Share
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Share Audio Link</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.state.audio.key}</DialogContentText>
            <br />
            <code>
              Link:{" "}
              {this.state.audio.url === "" ? (
                <Button onClick={this.getAudioLink}>Get Link</Button>
              ) : (
                <a href={this.state.audio.url} target="_blank">
                  {this.state.audio.url}
                </a>
              )}
            </code>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

export default Sharelink;
