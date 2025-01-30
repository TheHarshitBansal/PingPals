import EmptyChat from "../assets/EmptyChat.svg";

const HomePage = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center space-y-2">
      <img src={EmptyChat} className="w-96 h-96" />
      <h1 className="text-2xl font-bold">Welcome to PingPals</h1>
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
        Select a conversation or start a new one
      </p>
    </div>
  );
};
export default HomePage;
