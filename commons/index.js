import handleError from "./handleError.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import mongoose from "mongoose";
import moment from "moment";
const FACE_RECO_URL = "https://cham-cong.cognitiveservices.azure.com/face/v1.0";
const formatDayWork = "YYYY-MM-DD";

const getUserIdInToken = (req) => {
  const authorization = req.header("Authorization");
  const tokenArray = authorization.split(" ");
  const token = tokenArray[1];
  const decodedToken = jwt.verify(token, config.JWT_SECRET);
  return decodedToken;
};

const getDiffTime = (date1, date2 = new Date()) => {
  // date full
  let diff = moment
    .utc(moment(date2, "HH:mm:ss").diff(date1))
    .format("HH:mm:ss");
  return diff;
};

const setTimeToDate = (time, date = new Date()) => {
  // date: format ISOString, exam: 2020-11-06T10:18:33.145Z
  // time: HH:mm:ss
  console.log(time);
  let pieces = time.split(":");
  let hour = 0,
    minute = 0,
    second = 0;
  if (pieces.length === 3) {
    hour = parseInt(pieces[0], 10);
    minute = parseInt(pieces[1], 10);
    second = parseInt(pieces[2], 10);
  }
  date.setSeconds(second);
  date.setMinutes(minute);
  date.setHours(hour);
  return date;
};

const rangeTimeDate = (date1, date2) => {
  return new Date(date1).getTime() - new Date(date2).getTime();
};

const isBeforeDate = (date1, date2) => {
  let check = rangeTimeDate(date1, date2);
  return check < 0;
};
const subDateToTime = (date1, date2, hasAbs = true) => {
  if (hasAbs) {
    return Math.abs(rangeTimeDate(date1, date2));
  }
  return rangeTimeDate(date1, date2);
};

const getDurationToMinutes = (date1, date2, hasAbs = true, round = true) => {
  let diff = subDateToTime(date1, date2, hasAbs);
  let minutes = moment.duration(diff).asMinutes();

  if (round) {
    return Math.round(minutes);
  }
  return minutes;
};

const lookUp = (localField, from, foreignField, as) => {
  return {
    $lookup: {
      localField,
      from,
      foreignField,
      as: as || localField,
    },
  };
};

const groupBy = (_id = null) => {
  return {
    $group: {
      _id: _id,
      count: { $sum: 1 },
      results: { $push: "$$ROOT" },
    },
  };
};
const getPageSize = (page, size) => {
  return [{ $skip: page * size }, { $limit: parseInt(size) }];
};

const getDetailDate = (date) => {
  return {
    day: parseInt(moment(date).format("D"), 10),
    month: parseInt(moment(date).format("M"), 10),
    year: parseInt(moment(date).format("YYYY"), 10),
  };
};
const isNumeric = (str) => {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
};

function distance1(lat1, lon1, lat2, lon2, unit = "K") {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    console.log({ dist });
    return dist;
  }
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function distance2(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = degToRad(lat2 - lat1); // degToRad below
  var dLon = degToRad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km

  // round distance
  // d = Number(d.toFixed(1));
  console.log({ d });
  return d;
}

const commons = {
  FACE_RECO_URL,
  formatDayWork,
  handleError,
  getUserIdInToken,
  getDiffTime,
  setTimeToDate,
  subDateToTime,
  getDurationToMinutes,
  isBeforeDate,
  rangeTimeDate,
  lookUp,
  groupBy,
  getPageSize,
  getDetailDate,
  isNumeric,
  distance1,
  distance2,
};
export default commons;
