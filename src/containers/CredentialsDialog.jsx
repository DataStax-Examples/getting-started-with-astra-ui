import React, { useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import { DropzoneArea } from 'material-ui-dropzone'

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
}));

export default function CredentialsDialog(props) {
    const classes = useStyles();
    const [userName, setUserName] = useState(null);
    const [password, setPassword] = useState(null);
    const [keyspace, setKeyspace] = useState(null);
    const [files, setFiles] = useState(null);
    const [fileContent, setFileContent] = useState(null);

    function updateFiles(files) {
        setFiles(files)
        if (files && files.length > 0) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var contents = event.target.result;
                setFileContent(contents);
            };

            reader.onerror = function (event) {
                console.error("File could not be read! Code " + event.target.error.code);
            };

            reader.readAsArrayBuffer(files[0]);
        } else {
            //reset file contents when deleted
            setFileContent(null);
        }
    }
    function updateUserName(target) {
        setUserName(target.currentTarget.value);
    }

    function updatePassword(target) {
        setPassword(target.currentTarget.value);
    }

    function updateKeyspace(target) {
        setKeyspace(target.currentTarget.value);
    }

    function testConnection() {
        props.handleTest({ username: userName, password: password, keyspace: keyspace, secureConnectBundle: files[0] });
    }

    function saveConnection() {
        props.handleSave({ username: userName, password: password, keyspace: keyspace, secureConnectBundle: files[0] });
    }

    const saveEnabled = password && userName && keyspace && files;

    return (
        <div>
            <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Connect to your Apollo Database</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the following information to connect to your Apollo instance
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="userName"
                        label="Database User Name"
                        type="text"
                        fullWidth
                        required
                        onChange={updateUserName}
                    />
                    <TextField
                        margin="dense"
                        id="password"
                        label="Database Password"
                        type="password"
                        fullWidth
                        required
                        onChange={updatePassword}
                    />
                    <TextField
                        margin="dense"
                        id="keyspace"
                        label="Keyspace"
                        type="keyspace"
                        fullWidth
                        required
                        onChange={updateKeyspace}
                    />
                    <DialogContentText>
                        Choose your Secure Connect Bundle:*
                            <DropzoneArea
                            acceptedFiles={["application/zip"]}
                            filesLimit={1}
                            dropzoneText="Drag and Drop your Secure Connect Bundle here or click to choose"
                            onChange={updateFiles}
                            showFileNames={true}
                            showPreviews={true}
                            showPreviewsInDropzone={false}
                            showAlerts={false}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button disabled={!saveEnabled} onClick={testConnection} color="primary">
                        Test Connection
          </Button>
                    <Button disabled={!saveEnabled} variant="contained" onClick={saveConnection} color="primary">
                        Save
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
};