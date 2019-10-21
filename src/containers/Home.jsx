import React from 'react';
require('dotenv').config()
import clsx from 'clsx';
import axios from 'axios';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Snackbar from '@material-ui/core/Snackbar';
import Journeys from './Journeys';
import TripContainer from './TripContainer';
import AddJourneyDialog from './AddJourneyDialog';
import logo from '../assets/logo-white.svg'
import CredentialsDialog from './CredentialsDialog'
import SnackbarContentWrapper from './SnackbarContentWrapper';
import LaunchDialog from './LaunchDialog';

const drawerWidth = 240;
const pageSize = 25;
const writeBatchSize = 100;
const baseAddress = process.env.BASE_ADDRESS;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: "#0C153A"
  },
  appBarShift: {
    width: `calc(100% - #{drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [spacecraft, setSpacecraft] = React.useState([]);
  const [journeyReadings, setJourneyReadings] = React.useState({});
  const [openAddJourneyDialog, setOpenAddJourneyDialog] = React.useState(false);
  const [openAddCreds, setOpenAddCreds] = React.useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(false);
  const [snackbarClass, setSnackbarClass] = React.useState("info");
  const [currentReadMessage, setCurrentReadMessage] = React.useState("Waiting for next launch");
  const [currentWriteMessage, setCurrentWriteMessage] = React.useState("Waiting for next launch");
  const [openLaunchDialog, setOpenLaunchDialog] = React.useState(false);
  const [autoPlay, setAutoPlay] = React.useState(false);

  //fetch the spacecraft
  React.useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    const result = await axios(
      baseAddress + '/credentials',
    ).then((res) => {
      fetchJourneys();
    }
    ).catch((err) => {
      setOpenAddCreds(true);
    });
  }

  const fetchJourneys = async () => {
    const result = await axios(
      baseAddress + '/spacecraft',
    );
    setSpacecraft(result.data);
  }

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleAddJourneyDialog = () => {
    if (!openAddJourneyDialog) {
      setOpen(false);
    }
    setOpenAddJourneyDialog(!openAddJourneyDialog);
  }

  const toggleAddCredsDialog = () => {
    if (!openAddCreds) {
      setOpen(false);
    }
    setOpenAddCreds(!openAddCreds);
  }

  const toggleLaunchDialog = () => {
    setAutoPlay(openLaunchDialog);
    setOpenLaunchDialog(!openLaunchDialog);
  }

  const toggleSnackbar = () => {
    setOpenSnackbar(!openSnackbar);
  };

  const sendSnackbarMessage = (message, msgType) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
    setSnackbarClass(msgType || "info");
  }

  const fetchJourneyReadings = (spacecraftName, journeyId) => {
    async function fetchData(readingsPageStates, readings) {
      axios.all([
        axios.get(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/temperature?pagesize=' + pageSize + readingsPageStates.temperature),
        axios.get(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/pressure?pagesize=' + pageSize + readingsPageStates.pressure),
        axios.get(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/location?pagesize=' + pageSize + readingsPageStates.location),
        axios.get(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/speed?pagesize=' + pageSize + readingsPageStates.speed)
      ]).then(responseArr => {
        //Concatenate all the results to the existing array
        readings.temperature.push(...responseArr[0].data.data);
        readings.pressure.push(...responseArr[1].data.data);
        readings.location.push(...responseArr[2].data.data);
        readings.speed.push(...responseArr[3].data.data);
        setJourneyReadings(readings);
        //Store the page states for the next loop through
        readingsPageStates = {
          temperature: "&pagestate=" + encodeURIComponent(responseArr[0].data.pageState),
          pressure: "&pagestate=" + encodeURIComponent(responseArr[1].data.pageState),
          location: "&pagestate=" + encodeURIComponent(responseArr[2].data.pageState),
          speed: "&pagestate=" + encodeURIComponent(responseArr[3].data.pageState)
        };
        //If we are not at the end then fetch more data
        if (responseArr[0].data.data && responseArr[0].data.data.length > 0) {
          fetchData(readingsPageStates, readings);
          setCurrentReadMessage("Reading rows " + readings.temperature.length);
        } else {
          setCurrentReadMessage("All rows read for this launch");
        }
      });
    }
    fetchData({
      temperature: "",
      pressure: "",
      location: "",
      speed: ""
    },
      {
        temperature: [],
        pressure: [],
        location: [],
        speed: []
      });
  }

  const sendJourneyReadings = async (index, spacecraftName, journeyId, temperature, pressure, speed, location) => {
    if (index < 1000) {
      axios.all([
        axios.post(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/temperature', temperature.slice(index, writeBatchSize + index)),
        axios.post(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/pressure', pressure.slice(index, writeBatchSize + index)),
        axios.post(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/location', location.slice(index, writeBatchSize + index)),
        axios.post(baseAddress + '/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/speed', speed.slice(index, writeBatchSize + index))
      ]).then(responseArr => {
        setCurrentWriteMessage("Writing records " + index + " of " + temperature.length);
        sendJourneyReadings(index + writeBatchSize, spacecraftName, journeyId, temperature, pressure, speed, location)

        if (index === writeBatchSize * 4) {
          fetchJourneyReadings(spacecraftName, journeyId);
        }
      });
    } else {
      setCurrentWriteMessage("All rows have been written for this launch");
    }
  }

  const launchNewJourney = async (spacecraftName, summary) => {
    setOpenLaunchDialog(true);
    const result = await axios.post(
      baseAddress + '/spacecraft/' + spacecraftName,
      JSON.stringify(summary || ""),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(res => {
      var journeyId = res.data;
      var now = Date.now();
      var i = 0;
      var temperature = []; //create 1000 random samples with values between 69 and 71
      for (i = 0; i < 1000; i++) {
        temperature.push({
          spacecraft_name: spacecraftName,
          journey_id: journeyId,
          temperature: 69 + (Math.random() * 2),
          reading_time: new Date(now + (i * 1000)),
          temperature_unit: "fahrenheit"
        })
      }
      var pressure = []; //create 1000 random samples with values between 99 and 101
      for (i = 0; i < 1000; i++) {
        pressure.push({
          spacecraft_name: spacecraftName,
          journey_id: journeyId,
          pressure: 99 + (Math.random() * 2),
          reading_time: new Date(now + (i * 1000)),
          pressure_unit: "kPa"
        })
      }
      var speed = []; //30
      for (i = 0; i < 1000; i++) {
        speed.push({
          spacecraft_name: spacecraftName,
          journey_id: journeyId,
          speed: 30000 + (Math.random() * 5000),
          reading_time: new Date(now + (i * 1000)),
          speed_unit: "km/h"
        })
      }
      var location = [];
      for (i = 0; i < 1000; i++) {
        location.push({
          spacecraft_name: spacecraftName,
          journey_id: journeyId,
          location: {
            x_coordinate: 12000 + (i * 3),
            y_coordinate: 12000 + (i * 3),
            z_coordinate: 12000 + (i * 3)
          },
          reading_time: new Date(now + (i * 1000)),
          location_unit: "km,km,km"
        })
      }
      //Now save this off 50 at a time
      sendJourneyReadings(0, spacecraftName, journeyId, temperature, pressure, speed, location);
    });
    fetchJourneys();
  }

  const testNewCreds = async (pkg) => {
    const result = await axios.post(
      baseAddress + '/credentials/test?username=' + pkg.username + "&password=" + pkg.password + "&keyspace=" + pkg.keyspace,
      pkg.secureConnectBundle,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    ).then((res) => {
      sendSnackbarMessage("Test Successful", "success");
    }
    ).catch((err) => {
      sendSnackbarMessage(err.response.data, "error");
    });
  };

  const addNewCreds = async (pkg) => {
    const result = await axios.post(
      baseAddress + '/credentials?username=' + pkg.username + "&password=" + pkg.password + "&keyspace=" + pkg.keyspace,
      pkg.secureConnectBundle,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    ).then((res) => {
      sendSnackbarMessage("Database Credentials Saved", "success");
      fetchJourneys();
      toggleAddCredsDialog();
    }
    ).catch((err) => {
      sendSnackbarMessage(err.response.data, "error");
    });
  };


  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <img
            src={logo}
            alt="DataStax Logo"
            height="36px"
            width="174px" />
          <Typography variant="h3" noWrap style={{ paddingLeft: theme.spacing(2) }}>
            Getting Started with Apollo
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={toggleDrawer}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <Journeys onClose={toggleDrawer}
          onAddJourneyClick={toggleAddJourneyDialog}
          spacecraft={spacecraft}
          fetchJourney={fetchJourneyReadings}
          onAddCreds={toggleAddCredsDialog}
        />
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader}>
        </div>
        <TripContainer
          data={journeyReadings}
          sendMessage={sendSnackbarMessage}
          currentWriteMessage={currentWriteMessage}
          currentReadMessage={currentReadMessage}
          autoPlay={autoPlay}
        />
      </main>
      <AddJourneyDialog open={openAddJourneyDialog} handleClose={toggleAddJourneyDialog} launchJourney={launchNewJourney} />
      <CredentialsDialog open={openAddCreds} handleClose={toggleAddCredsDialog} handleTest={testNewCreds} handleSave={addNewCreds} />
      <LaunchDialog open={openLaunchDialog} handleClose={toggleLaunchDialog} />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={toggleSnackbar}
      >
        <SnackbarContentWrapper
          onClose={toggleSnackbar}
          variant={snackbarClass}
          message={snackbarMessage}
        />
      </Snackbar>
    </div>
  );
}