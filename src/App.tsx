import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import GlobalProvider from "./provider";

function App() {
  return (
    <React.StrictMode>
      <GlobalProvider>
        <RouterProvider router={router} />
      </GlobalProvider>
    </React.StrictMode>
  );
}

export default App;
