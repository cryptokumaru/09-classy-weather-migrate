import { useState } from "react";

export default function App() {
  const [location, setLocation] = useState("Lisbon");

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Input location={location} />
    </div>
  );
}

function Input({ location }) {
  return (
    <div>
      <input type="text" placeholder="enter location" value={location}></input>
    </div>
  );
}
