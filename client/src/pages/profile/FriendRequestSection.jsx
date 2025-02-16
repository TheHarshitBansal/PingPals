import SearchPeople from "@/components/profile/SearchPeople.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FriendRequestSection = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="w-full rounded-sm h-10 flex justify-evenly py-6">
          <TabsTrigger value="search" className="w-full text-lg">
            Search
          </TabsTrigger>
          <TabsTrigger value="friends" className="w-full text-lg">
            Friends
          </TabsTrigger>
          <TabsTrigger value="requests" className="w-full text-lg">
            Requests
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <SearchPeople />
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};
export default FriendRequestSection;
