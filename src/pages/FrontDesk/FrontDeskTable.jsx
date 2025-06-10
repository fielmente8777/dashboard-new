import { DayPilot, DayPilotScheduler } from "daypilot-pro-react";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/DataContext";
import Zoom from "./FrontDeskZoom";
import { BASE_URL } from "../../data/constant";

const Scheduler = () => {
  const { RoomsData, fetchRoomsData, fetchBookingData, bookingData } =
    useContext(AuthContext);
  const [ApiCallCounter, setApiCallCounter] = useState(0);

  const Add_Maintainance_to_db = async (start, end, message, roomnumber) => {
    try {
      const response = await fetch(`${BASE_URL}/frontdesk/add-maintenance`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          hId: localStorage.getItem("hid"),
          roomNumber: roomnumber,
          Message: message,
          start: start,
          end: end,
        }),
      });

      const json = await response.json();
      if (json.status) {
        setApiCallCounter((prevCounter) => prevCounter + 1);
        fetchRoomsData();
        fetchBookingData();
      }
    } catch {
      alert("Some Problem update token");
    }
  };

  const EditMaintainance = async (
    oldstart,
    oldend,
    oldroom,
    newstart,
    newend,
    newroom,
    message
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/frontdesk/update-maintenance`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          hId: localStorage.getItem("hid"),
          oldroomNumber: oldroom,
          Message: message,
          oldstart: oldstart,
          oldend: oldend,
          newroomNumber: newroom,
          newstart: newstart,
          newend: newend,
        }),
      });

      const json = await response.json();
      if (json.status) {
        setApiCallCounter((prevCounter) => prevCounter + 1);
        fetchRoomsData();
        fetchBookingData();
      }
    } catch {
      alert("Some Problem update token");
    }
  };

  const EditBookingRoomOccupancy = async (
    oldstart,
    oldend,
    oldroom,
    newstart,
    newend,
    newroom,
    bookingid
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/frontdesk/update-booking`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          hId: localStorage.getItem("hid"),
          bookingId: bookingid,
          oldroomNumber: oldroom,
          newroomNumber: newroom,
          oldstart: oldstart,
          newstart: newstart,
          oldend: oldend,
          newend: newend,
        }),
      });

      const json = await response.json();
      if (json.status) {
        setApiCallCounter((prevCounter) => prevCounter + 1);
        fetchRoomsData();
        fetchBookingData();
      }
    } catch {
      alert("Some Problem update token");
    }
  };

  const DeleteMaintainance = async (startdate, enddate, message, room) => {
    try {
      const response = await fetch(`${BASE_URL}/frontdesk/delete-maintenance`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, /",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          hId: localStorage.getItem("hid"),
          roomNumber: room,
          Message: message,
          start: startdate,
          end: enddate,
        }),
      });

      const json = await response.json();
      if (json.status) {
        setApiCallCounter((prevCounter) => prevCounter + 1);
        fetchRoomsData();
        fetchBookingData();
      }
    } catch {
      alert("Some Problem update token");
    }
  };

  const [config, setConfig] = useState({
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    days: 30,
    scale: "Day",
    timeHeaders: [{ groupBy: "Month" }, { groupBy: "Day", format: "d" }],
    cellWidthSpec: "Auto",
    cellWidth: 50,
    durationBarVisible: false,
    treeEnabled: true,
    rowHeaderColumns: [{ name: "Room Name" }],
    onEventMoved: (args) => {
      const oldeditdate = new Date(args.e.cache.start);
      const oldeditend = new Date(args.e.cache.end);
      oldeditend.setDate(oldeditend.getDate() + 1);

      const formatoldeditdate = oldeditdate.toISOString().split("T")[0];
      const formatoldeditend = oldeditend.toISOString().split("T")[0];
      const oldeditresource = args.e.cache.resource;
      const message = args.e.cache.text;

      const neweditdate = new Date(args.newStart);
      const neweditend = new Date(args.newEnd);
      neweditend.setDate(neweditend.getDate() + 1);

      const formatneweditdate = neweditdate.toISOString().split("T")[0];
      const formatneweditend = neweditend.toISOString().split("T")[0];
      const neweditresource = args.newResource;

      const bookingid = args.e.data.nodeid;

      if (args.e.cache.type == "rooms") {
        EditMaintainance(
          formatoldeditdate,
          formatoldeditend,
          oldeditresource,
          formatneweditdate,
          formatneweditend,
          neweditresource,
          message
        );
      } else {
        EditBookingRoomOccupancy(
          formatoldeditdate,
          formatoldeditend,
          oldeditresource,
          formatneweditdate,
          formatneweditend,
          neweditresource,
          bookingid
        );
      }

      getScheduler().message("Event moved: " + args.e.data.text);
    },
    // onEventResized: args => {
    //     console.log("Event resized: ", args.e.data.id, args.newStart, args.newEnd);
    //     getScheduler().message("Event resized: " + args.e.data.text);
    // },
    onTimeRangeSelected: (args) => {
      DayPilot.Modal.prompt("Message", "Event").then((modal) => {
        getScheduler().clearSelection();
        if (!modal.result) {
          return;
        }
        const startDate = new Date(args.start);
        const endDate = new Date(args.end);

        // Format dates in "yyyy-mm-dd" format
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        Add_Maintainance_to_db(
          formattedStartDate,
          formattedEndDate,
          modal.result,
          args.resource
        );
      });
    },
    onBeforeEventRender: (args) => {
      if (!args.data.backColor) {
        args.data.backColor = "#93c47d";
      }
      args.data.borderColor = "darker";
      args.data.fontColor = "white";

      args.data.areas = [];
      if (args.data.locked) {
        args.data.areas.push({
          right: 4,
          top: 8,
          height: 18,
          width: 18,
          symbol: "icons/daypilot.svg#padlock",
          fontColor: "white",
        });
      } else if (args.data.plus) {
        args.data.areas.push({
          right: 4,
          top: 8,
          height: 18,
          width: 18,
          symbol: "icons/daypilot.svg#plus-4",
          fontColor: "white",
        });
      }
    },
    onEventClick: (args) => {
      // Handle click event on the node
      DayPilot.Modal.confirm("Do you want to delete").then((modal) => {
        getScheduler().clearSelection();
        if (!modal.result) {
          alert("No");
          return;
        }
        const startDate = new Date(args.e.data.start);
        const endDate = new Date(args.e.data.end);

        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        if (args.e.data.type === "rooms") {
          DeleteMaintainance(
            formattedStartDate,
            formattedEndDate,
            args.e.data.text,
            args.e.data.resource
          );
        } else {
          alert(args.e.data.nodeid);
        }

        // Add_Maintainance_to_db(formattedStartDate,formattedEndDate,modal.result,args.resource)
      });
    },
  });

  const schedulerRef = useRef();

  const getScheduler = () => schedulerRef.current.control;

  const zoomChange = (args) => {
    switch (args.level) {
      case "month":
        setConfig({
          ...config,
          startDate: DayPilot.Date.today().firstDayOfMonth(),
          days: DayPilot.Date.today().daysInMonth(),
          scale: "Day",
        });
        break;
      case "week":
        setConfig({
          ...config,
          startDate: DayPilot.Date.today().firstDayOfWeek(),
          days: 7,
          scale: "Day",
        });
        break;
      default:
        throw new Error("Invalid zoom level");
    }
  };

  const cellWidthChange = (ev) => {
    const checked = ev.target.checked;
    setConfig((prevConfig) => ({
      ...prevConfig,
      cellWidthSpec: checked ? "Auto" : "Fixed",
    }));
  };
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const resource = [];
  const event = [];
  let eventIdCounter = 1;

  RoomsData?.map((room) => {
    let data = {
      name: room.roomName,
      id: "G2",
      expanded: true,
      children: [],
    };

    for (let i in room.roomNumbers) {
      let child = {
        name: `${room.roomNumbers[i]}`,
        id: `${room.roomNumbers[i]}`, // This converts 0 to 'A', 1 to 'B', and so on
      };
      data.children.push(child);
    }

    for (let b in room.inMaintanance) {
      let e = {
        id: eventIdCounter++,
        type: "rooms",
        text: `${room.inMaintanance[b].Message}`,
        start: `${room.inMaintanance[b].start}`,
        end: `${room.inMaintanance[b].end}`,
        resource: `${room.inMaintanance[b].roomNumber}`,
        backColor: "#FF0000",
      };
      event.push(e);
    }

    resource.push(data);
  });

  const loadData = (args) => {
    const resources = resource;

    const events = event;

    getScheduler().update({
      resources,
      events,
    });
  };

  useEffect(() => {
    fetchBookingData();
    loadData();
  }, [ApiCallCounter, RoomsData]);

  useEffect(() => {
    fetchRoomsData();
    if (bookingData) {
      bookingData?.Details?.map((book) => {
        book.roomNumbers.map((num) => {
          let e = {
            id: eventIdCounter++,
            type: "bookings",
            nodeid: `${book.bookingId}`,
            text: `${book.guestInfo.guestName}`,
            start: `${book.checkIn}`,
            end: `${book.checkOut}`,
            resource: `${num}`,
            backColor: `${
              book.payment.Status === "SUCCESS"
                ? "#146618"
                : book.payment.Status === "REFUND"
                ? "#02CCFE"
                : "#3263b3"
            }`,
          };
          event.push(e);
        });
      });
    }
  }, []);

  return (
    <div>
      <div className="toolbar">
        <Zoom onChange={(args) => zoomChange(args)} />
        <button
          className="btn b-0"
          onClick={(ev) => getScheduler().message("Welcome!")}
        >
          Welcome!
        </button>
        <span className="btn toolbar-item">
          <label>
            <input
              type="checkbox"
              checked={config.cellWidthSpec === "Auto"}
              onChange={(ev) => cellWidthChange(ev)}
            />{" "}
            Auto width
          </label>
        </span>
      </div>
      <DayPilotScheduler {...config} ref={schedulerRef} />
    </div>
  );
};

export default Scheduler;
