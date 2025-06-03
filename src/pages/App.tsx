import { Routes, Route } from "react-router-dom";
import Search from "./Search";
import WordList from "./WordList";


const App = () => {
return (
  <Routes>
      <Route path="/" element={<Search />} />
      <Route path="/wordlist" element={<WordList />} />
  </Routes>

  )
};

export default App;
