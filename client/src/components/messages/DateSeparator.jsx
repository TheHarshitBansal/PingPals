import { Separator } from "../ui/separator.jsx";

const DateSeparator = ({ date }) => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-[50%]">
        <Separator />
      </div>
      <div className="text-gray-500 dark:text-gray-400 px-4 min-w-fit">
        {date}
      </div>
      <div className="w-[50%]">
        <Separator />
      </div>
    </div>
  );
};
export default DateSeparator;
