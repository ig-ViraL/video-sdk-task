const env = "local";

const config = {
  local: {
    baseURL: "http://localhost:3000/",
  },
};

export default config[env];
