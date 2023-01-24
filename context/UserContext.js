import React, { createContext, useState } from "react";

export const UserContext = createContext();
export const UserProvider = ({ children }) => {

  const [stopData, setStopData] = useState([]);
  const [selectedStop, setSelectedStop] = useState();
  const [routeData, setRouteData] = useState();

  return (
    <UserContext.Provider
      value={{
        stopData: stopData,
        setStopData: setStopData,
        selectedStop: selectedStop,
        setSelectedStop: setSelectedStop,
        routeData: routeData,
        setRouteData: setRouteData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};