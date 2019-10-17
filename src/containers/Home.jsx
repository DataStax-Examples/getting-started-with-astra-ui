import React from 'react';
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

const drawerWidth = 240;
const pageSize = 25;

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
  const [readingsPageStates, setReadingsPageStates] = React.useState({ temperature: "", pressure: "", location: "", speed: "" });
  const [openAddJourneyDialog, setOpenAddJourneyDialog] = React.useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(false);

  //fetch the spacecraft
  React.useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    const result = await axios(
      'https://localhost:5001/api/spacecraft',
    );
    setSpacecraft(result.data);
  }

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleAddJourneyDialog = () => {
    setOpenAddJourneyDialog(!openAddJourneyDialog);
  }


  const toggleSnackbar = () => {
    setOpenSnackbar(!openSnackbar);
  };

  const sendSnackbarMessage = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  }

  const fetchJourneyReadings = (spacecraftName, journeyId) => {
    async function fetchData(readingsPageStates, readings) {
      axios.all([
        axios.get('https://localhost:5001/api/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/temperature?pagesize=' + pageSize + readingsPageStates.temperature),
        axios.get('https://localhost:5001/api/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/pressure?pagesize=' + pageSize + readingsPageStates.pressure),
        axios.get('https://localhost:5001/api/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/location?pagesize=' + pageSize + readingsPageStates.location),
        axios.get('https://localhost:5001/api/spacecraft/' + spacecraftName + '/' + journeyId + '/instruments/speed?pagesize=' + pageSize + readingsPageStates.speed)
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
          console.log("fetching more data")
        } else {
          console.log("All data fetched")
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

  const launchNewJourney = async (spacecraftName, summary) => {
    var data = JSON.stringify(summary);
    const result = await axios.post(
      'https://localhost:5001/api/spacecraft/' + spacecraftName,
      JSON.stringify(summary),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    fetchJourneys();
  }


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
          <Typography variant="h6" noWrap style={{ paddingLeft: theme.spacing(2) }}>
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
          fetchJourney={fetchJourneyReadings} />
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader}>
        </div>
        <TripContainer data={journeyReadings} sendMessage={sendSnackbarMessage} />
      </main>
      <AddJourneyDialog open={openAddJourneyDialog} handleClose={toggleAddJourneyDialog} launchJourney={launchNewJourney} />
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={toggleSnackbar}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{snackbarMessage}</span>}
      />
    </div>
  );
}