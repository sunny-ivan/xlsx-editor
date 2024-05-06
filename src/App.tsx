import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import GlobalProvider from "./provider";
import Bottom from "./components/bottom";

function App() {
  return (
    <React.StrictMode>
      <GlobalProvider>
        <RouterProvider router={router} />
        <Bottom />
      </GlobalProvider>
    </React.StrictMode>
  );
}

export default App;
