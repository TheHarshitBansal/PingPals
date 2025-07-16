import FriendList from "@/components/profile/FriendList.jsx";
import RequestList from "@/components/profile/RequestList.jsx";
import SearchPeople from "@/components/profile/SearchPeople.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Explore = () => {
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-xl md:text-2xl font-bold">Explore & Connect</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Discover new people and manage your connections
        </p>
      </div>

      <Tabs
        defaultValue="search"
        className="w-full flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-full rounded-none h-12 flex justify-evenly py-2 border-b border-gray-200 dark:border-gray-700 bg-transparent flex-shrink-0">
          <TabsTrigger
            value="search"
            className="flex-1 text-sm md:text-base data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="friends"
            className="flex-1 text-sm md:text-base data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="flex-1 text-sm md:text-base data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Requests
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden">
          <TabsContent
            value="search"
            className="h-full overflow-y-auto p-0 m-0"
          >
            <SearchPeople />
          </TabsContent>
          <TabsContent
            value="friends"
            className="h-full overflow-y-auto p-0 m-0"
          >
            <FriendList />
          </TabsContent>
          <TabsContent
            value="requests"
            className="h-full overflow-y-auto p-0 m-0"
          >
            <RequestList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Explore;
