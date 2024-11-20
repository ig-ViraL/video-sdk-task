import PropTypes from "prop-types";

const LoaderWithMessage = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 border-t-4 mb-4"></div>
      <span className="text-lg text-white font-semibold">{message}</span>
    </div>
  );
};

LoaderWithMessage.propTypes = {
  message: PropTypes.string,
};

export default LoaderWithMessage;
