import { useFindPeopleQuery } from "@/redux/api/authApi.js";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "../ui/avatar.jsx";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Skeleton } from "../ui/skeleton.jsx";
import { UserMinus2Icon, UserPlus2 } from "lucide-react";
import { socket } from "@/socket.js";
import { useSelector } from "react-redux";

const SearchPeople = () => {
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data, isSuccess, isLoading, refetch } = useFindPeopleQuery({
    name: debouncedSearch,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="w-full">
      <form className="mt-10 w-4/5 mx-auto flex flex-col items-center justify-center gap-y-3">
        <input
          type="text"
          placeholder="Search People (Name or Username)"
          className="bg-transparent border p-4 rounded-lg outline-none w-full"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </form>

      {isLoading && <div className="text-center mt-4">Loading...</div>}

      {isSuccess && data?.people?.length > 0 ? (
        <div className="mt-6 w-4/5 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.people.map((person) => (
            <div
              key={person._id}
              className="border p-4 rounded-lg shadow-md flex items-center gap-x-4 w-fit"
            >
              <Avatar className="cursor-pointer h-20 w-20">
                <AvatarImage src={person.avatar} loading="lazy" />
                <AvatarFallback>
                  <Skeleton className="h-16 w-16 rounded-full" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0">
                <h3 className="font-semibold text-lg">{person.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  @{person.username}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  {person.about}
                </p>
              </div>
              {person.requests.includes(user._id) ? (
                <div
                  className="text-gray-500 dark:text-gray-400"
                  onClick={() => {
                    //INFO: Unsend friend request functionality
                    socket.emit("unsend_request", {
                      receiver: person._id,
                      sender: user._id,
                    });
                    refetch();
                  }}
                >
                  <UserMinus2Icon size={24} className="cursor-pointer" />
                </div>
              ) : (
                <button
                  className="text-gray-500 dark:text-gray-400"
                  onClick={() => {
                    //INFO: Add friend functionality
                    socket.emit("friend_request", {
                      receiver: person._id,
                      sender: user._id,
                    });
                    refetch();
                  }}
                >
                  <UserPlus2 size={24} className="cursor-pointer" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        debouncedSearch &&
        !isLoading && (
          <p className="text-center mt-4 text-gray-500">No users found</p>
        )
      )}
    </div>
  );
};

export default SearchPeople;
