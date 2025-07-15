import EmptyChat from "../assets/EmptyChat.svg";

const HomePage = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center space-y-2 px-4 sm:px-6">
      <img
        src={EmptyChat}
        className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
      />
      <h1 className="text-xl sm:text-2xl font-bold text-center">
        Welcome to PingPals
      </h1>
      <p className="text-base sm:text-lg font-medium text-gray-500 dark:text-gray-400 text-center">
        Select a conversation or start a new one
      </p>
    </div>
  );
};
export default HomePage;
