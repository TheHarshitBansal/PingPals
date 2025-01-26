import { useEffect, useRef, useState } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import React from "react";
import _ from "lodash";

const gif = new GiphyFetch(import.meta.env.VITE_GIPHY_API);

const Giphy = () => {
  const gridRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [gifs, setGifs] = useState([]);

  const fetchGifs = async (offset) => {
    return gif.search(value, { offset, limit: 10 });
  };

  const debouncedSearch = _.debounce(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newGifs = await fetchGifs(0);
      setGifs(newGifs.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  useEffect(() => {
    const fetchInitialGifs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const initialGifs = await fetchGifs(0);
        setGifs(initialGifs.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialGifs();
  }, []);

  return (
    <div ref={gridRef} className="w-full mt-3">
      <input
        type="text"
        placeholder="Search GIFs"
        className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full mb-2 outline-none bg-transparent text-black dark:text-white"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch();
        }}
      />

      {isLoading && (
        <p className="text-black dark:text-white">Loading GIFs...</p>
      )}
      {error && <p className="text-red-400">Failed to load GIFs : {error}</p>}

      <div
        className={`${gifs.length > 0 && "h-44"} overflow-auto no-scrollbar`}
      >
        <Grid
          width={gridRef.current?.offsetWidth}
          columns={8}
          gutter={6}
          fetchGifs={fetchGifs}
          key={value}
          data={gifs}
        />
      </div>
    </div>
  );
};

export default Giphy;
