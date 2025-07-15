import FriendList from "@/components/profile/FriendList.jsx";
import RequestList from "@/components/profile/RequestList.jsx";
import SearchPeople from "@/components/profile/SearchPeople.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FriendRequestSection = () => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header for mobile */}
      <div className="xl:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold">Friends</h1>
      </div>

      <Tabs defaultValue="search" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full rounded-none h-12 flex justify-evenly py-2 border-b border-gray-200 dark:border-gray-700 bg-transparent">
          <TabsTrigger
            value="search"
            className="flex-1 text-sm md:text-base data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Search
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
          <TabsContent value="search" className="h-full overflow-y-auto">
            <SearchPeople />
          </TabsContent>
          <TabsContent value="friends" className="h-full overflow-y-auto">
            <FriendList />
          </TabsContent>
          <TabsContent value="requests" className="h-full overflow-y-auto">
            <RequestList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
export default FriendRequestSection;
