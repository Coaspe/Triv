import { FaRegFolderOpen } from "react-icons/fa";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <FaRegFolderOpen className="w-16 h-16 mb-4 animate-bounce-twice" />
      <h3 className="mb-2 text-lg font-medium">No data available</h3>
    </div>
  );
};

export default EmptyState;
